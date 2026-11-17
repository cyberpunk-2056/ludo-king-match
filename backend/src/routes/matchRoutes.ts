import { Router } from "express";
import { z } from "zod";
import { query, withTransaction } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth.js";
import { Money } from "../money.js";

export const matchRoutes = Router();

function roomCode(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

async function debitStake(client: any, userId: string, stake: number, note: string) {
  const w = await client.query("select deposit, winnings from wallets where user_id = $1 for update", [userId]);
  const row = w.rows[0];
  const total = Number(row.deposit) + Number(row.winnings);
  if (stake > total + 0.001) throw new Error("INSUFFICIENT");
  const fromDeposit = Math.min(Number(row.deposit), stake);
  const fromWinnings = Money.round2(stake - fromDeposit);
  await client.query("update wallets set deposit = deposit - $1, winnings = winnings - $2 where user_id = $3",
    [fromDeposit, fromWinnings, userId]);
  await client.query("insert into transactions (user_id, type, amount, note) values ($1,'stake',$2,$3)",
    [userId, -stake, note]);
}

const createSchema = z.object({ mode: z.number().int(), stake: z.number().positive() });

// Create a match: hold the creator's stake in escrow and open a 10-minute join window.
matchRoutes.post("/matches", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid match" });
  const stake = Money.round2(parsed.data.stake);
  const deadline = new Date(Date.now() + Money.JOIN_WINDOW_MS);

  try {
    const match = await withTransaction(async (c) => {
      await debitStake(c, req.userId!, stake, "match created");
      const m = await c.query(
        `insert into matches (mode, stake, player_a, status, join_deadline)
         values ($1,$2,$3,'waiting',$4) returning *`,
        [parsed.data.mode, stake, req.userId, deadline]
      );
      return m.rows[0];
    });
    res.json(matchView(match, req.userId!));
  } catch (e: any) {
    if (e.message === "INSUFFICIENT") return res.status(400).json({ message: "Not enough balance" });
    throw e;
  }
});

// Join an open match: hold the joiner's stake and assign a shared room code.
matchRoutes.post("/matches/:id/join", requireAuth, async (req: AuthedRequest, res) => {
  const out = await withTransaction(async (c) => {
    const m = await c.query("select * from matches where id = $1 for update", [req.params.id]);
    const match = m.rows[0];
    if (!match || match.status !== "waiting") throw new Error("UNAVAILABLE");
    if (match.player_a === req.userId) throw new Error("OWN_MATCH");
    await debitStake(c, req.userId!, Number(match.stake), "match joined");
    const code = roomCode();
    await c.query("update matches set player_b = $1, status = 'live', room_code = $2 where id = $3",
      [req.userId, code, match.id]);
    const opp = await c.query("select name from users where id = $1", [match.player_a]);
    return { roomCode: code, opponent: opp.rows[0]?.name ?? "" };
  });
  res.json(out);
});

const resultSchema = z.object({ result: z.enum(["win", "lose"]), proofUrl: z.string().url().optional() });

// Report a result. When both players have reported and agree, settle automatically:
// winner gets 95% of the pot, platform keeps 5%, and the winner's referrer earns 3%.
matchRoutes.post("/matches/:id/result", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = resultSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid result" });

  const status = await withTransaction(async (c) => {
    const m = await c.query("select * from matches where id = $1 for update", [req.params.id]);
    const match = m.rows[0];
    if (!match || match.status !== "live") throw new Error("NOT_LIVE");
    if (![match.player_a, match.player_b].includes(req.userId)) throw new Error("NOT_A_PLAYER");

    await c.query(
      `insert into match_reports (match_id, user_id, result, proof_url) values ($1,$2,$3,$4)
       on conflict (match_id, user_id) do update set result = excluded.result, proof_url = excluded.proof_url`,
      [match.id, req.userId, parsed.data.result, parsed.data.proofUrl ?? null]
    );

    const reports = await c.query("select user_id, result from match_reports where match_id = $1", [match.id]);
    if (reports.rowCount < 2) return "reported"; // wait for the other player

    const byUser: Record<string, string> = {};
    for (const r of reports.rows) byUser[r.user_id] = r.result;
    const winners = Object.entries(byUser).filter(([, r]) => r === "win").map(([u]) => u);

    if (winners.length !== 1) return "disputed"; // both claim win (or both lose) -> manual review

    const winnerId = winners[0];
    await settleMatch(c, match, winnerId);
    return "settled";
  });

  res.json({ status });
});

async function settleMatch(client: any, match: any, winnerId: string) {
  const pot = Money.pot(Number(match.stake));
  const payout = Money.winnerPayout(pot);

  await client.query("update wallets set winnings = winnings + $1 where user_id = $2", [payout, winnerId]);
  await client.query("insert into transactions (user_id, type, amount, note) values ($1,'win',$2,$3)",
    [winnerId, payout, `mode ${match.mode}`]);
  await client.query("update matches set status = 'settled', winner_id = $1, settled_at = now() where id = $2",
    [winnerId, match.id]);

  // referral: pay the winner's referrer 3% of the winnings
  const ref = await client.query("select referred_by from users where id = $1", [winnerId]);
  const referrer = ref.rows[0]?.referred_by;
  if (referrer) {
    const commission = Money.referralCommission(payout);
    if (commission > 0) {
      await client.query("update wallets set winnings = winnings + $1 where user_id = $2", [commission, referrer]);
      await client.query("insert into transactions (user_id, type, amount, note) values ($1,'referral',$2,$3)",
        [referrer, commission, "referral 3%"]);
    }
  }
}

function matchView(m: any, viewerId: string) {
  return {
    id: m.id, mode: m.mode, stake: Number(m.stake),
    playerA: m.player_a, playerB: m.player_b ?? "",
    status: m.status,
    join_deadline: m.join_deadline ? new Date(m.join_deadline).getTime() : 0,
    room_code: m.room_code ?? "",
  };
}

// Lobby lists
matchRoutes.get("/matches/live", requireAuth, async (_req, res) => {
  const r = await query(
    `select m.*, a.name as a_name, b.name as b_name from matches m
       join users a on a.id = m.player_a left join users b on b.id = m.player_b
      where m.status = 'live' order by m.created_at desc limit 20`
  );
  res.json(r.rows.map((m) => ({ id: m.id, mode: m.mode, stake: Number(m.stake), playerA: m.a_name, playerB: m.b_name ?? "", status: m.status, join_deadline: 0, room_code: "" })));
});

matchRoutes.get("/matches/open", requireAuth, async (_req, res) => {
  const r = await query(
    `select m.*, a.name as a_name from matches m join users a on a.id = m.player_a
      where m.status = 'waiting' and m.join_deadline > now() order by m.created_at desc limit 20`
  );
  res.json(r.rows.map((m) => ({ id: m.id, mode: m.mode, stake: Number(m.stake), playerA: m.a_name, playerB: "", status: m.status, join_deadline: new Date(m.join_deadline).getTime(), room_code: "" })));
});

matchRoutes.get("/matches/recent", requireAuth, async (_req, res) => {
  const r = await query(
    `select m.*, w.name as w_name,
            case when m.winner_id = m.player_a then b.name else a.name end as l_name
       from matches m
       join users a on a.id = m.player_a join users b on b.id = m.player_b
       join users w on w.id = m.winner_id
      where m.status = 'settled' order by m.settled_at desc limit 10`
  );
  res.json(r.rows.map((m) => ({ id: m.id, mode: m.mode, stake: Number(m.stake), winner: m.w_name, loser: m.l_name, payout: Money.winnerPayout(Money.pot(Number(m.stake))), result: "win", opponent: m.l_name, finished_at: m.settled_at ? new Date(m.settled_at).getTime() : 0 })));
});

matchRoutes.get("/matches/history", requireAuth, async (req: AuthedRequest, res) => {
  const r = await query(
    `select m.*, case when m.winner_id = $1 then 'win' else 'lose' end as my_result,
            case when m.player_a = $1 then b.name else a.name end as opp
       from matches m
       join users a on a.id = m.player_a join users b on b.id = m.player_b
      where m.status = 'settled' and $1 in (m.player_a, m.player_b)
      order by m.settled_at desc limit 60`,
    [req.userId]
  );
  res.json(r.rows.map((m) => {
    const won = m.my_result === "win";
    return { id: m.id, mode: m.mode, stake: Number(m.stake), winner: "", loser: "", payout: won ? Money.winnerPayout(Money.pot(Number(m.stake))) : 0, result: m.my_result, opponent: m.opp, finished_at: m.settled_at ? new Date(m.settled_at).getTime() : 0 };
  }));
});

// Background sweep: refund stakes for matches whose 10-minute join window expired.
export async function expireMatches() {
  await withTransaction(async (c) => {
    const expired = await c.query("select * from matches where status = 'waiting' and join_deadline <= now() for update");
    for (const m of expired.rows) {
      await c.query("update wallets set deposit = deposit + $1 where user_id = $2", [Number(m.stake), m.player_a]);
      await c.query("insert into transactions (user_id, type, amount, note) values ($1,'refund',$2,'no opponent joined')",
        [m.player_a, Number(m.stake)]);
      await c.query("update matches set status = 'cancelled' where id = $1", [m.id]);
    }
  });
}
