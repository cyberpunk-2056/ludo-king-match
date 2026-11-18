import { Router } from "express";
import { z } from "zod";
import { query, withTransaction } from "../db.js";
import { requireAdmin, type AuthedRequest } from "../auth.js";
import { Money } from "../money.js";
import { settleMatch } from "./matchRoutes.js";
import { sendPushToUsers } from "../push.js";

export const adminRoutes = Router();
adminRoutes.use(requireAdmin);

const n = (v: any) => Number(v ?? 0);

// ---- overview ----
adminRoutes.get("/admin/stats", async (_req, res) => {
  const [users, wallets, tx, matches] = await Promise.all([
    query("select count(*)::int as c from users"),
    query("select coalesce(sum(deposit),0) as dep, coalesce(sum(winnings),0) as win from wallets"),
    query(`select
              count(*) filter (where type='deposit' and status='pending')::int as pend_dep,
              count(*) filter (where type='withdraw' and status='pending')::int as pend_wd,
              coalesce(sum(-amount) filter (where type='withdraw' and status='approved'),0) as paid_out,
              coalesce(sum(amount) filter (where type='deposit' and status='approved'),0) as deposited
            from transactions`),
    query(`select status, count(*)::int as c from matches group by status`),
  ]);
  const m: Record<string, number> = {};
  for (const row of matches.rows) m[row.status] = row.c;
  res.json({
    users: users.rows[0].c,
    walletDeposit: n(wallets.rows[0].dep),
    walletWinnings: n(wallets.rows[0].win),
    pendingDeposits: tx.rows[0].pend_dep,
    pendingWithdrawals: tx.rows[0].pend_wd,
    paidOut: n(tx.rows[0].paid_out),
    deposited: n(tx.rows[0].deposited),
    matchesLive: m.live ?? 0,
    matchesWaiting: m.waiting ?? 0,
    matchesSettled: m.settled ?? 0,
    matchesDisputed: 0, // disputes are live matches with conflicting reports; surfaced in /admin/matches
  });
});

// ---- users ----
adminRoutes.get("/admin/users", async (req: AuthedRequest, res) => {
  const q = String(req.query.q ?? "").trim().toLowerCase();
  const rows = await query(
    `select u.id, u.name, u.phone, u.email, u.rating, u.is_admin, u.created_at,
            coalesce(w.deposit,0) as deposit, coalesce(w.winnings,0) as winnings
       from users u left join wallets w on w.user_id = u.id
      where ($1 = '' or lower(u.name) like '%'||$1||'%' or u.phone like '%'||$1||'%' or lower(coalesce(u.email,'')) like '%'||$1||'%')
      order by u.created_at desc limit 100`,
    [q]
  );
  res.json(rows.rows.map((u) => ({
    id: u.id, name: u.name, phone: u.phone, email: u.email ?? "", rating: u.rating, isAdmin: u.is_admin,
    deposit: n(u.deposit), winnings: n(u.winnings), joined: new Date(u.created_at).getTime(),
  })));
});

adminRoutes.get("/admin/users/:id", async (req, res) => {
  const u = await query("select id, name, phone, email, rating, is_admin, referral_code, created_at from users where id = $1", [req.params.id]);
  if (!u.rowCount) return res.status(404).json({ message: "User not found" });
  const [w, tx, played] = await Promise.all([
    query("select deposit, winnings from wallets where user_id = $1", [req.params.id]),
    query("select id, type, amount, note, status, extract(epoch from created_at)*1000 as created_at from transactions where user_id = $1 order by created_at desc limit 50", [req.params.id]),
    query("select count(*)::int as played, count(*) filter (where winner_id = $1)::int as wins from matches m where exists (select 1 from match_players mp where mp.match_id = m.id and mp.user_id = $1) and m.status='settled'", [req.params.id]),
  ]);
  const row = u.rows[0];
  res.json({
    id: row.id, name: row.name, phone: row.phone, email: row.email ?? "", rating: row.rating,
    isAdmin: row.is_admin, referralCode: row.referral_code, joined: new Date(row.created_at).getTime(),
    deposit: n(w.rows[0]?.deposit), winnings: n(w.rows[0]?.winnings),
    played: played.rows[0].played, wins: played.rows[0].wins,
    transactions: tx.rows.map((t) => ({ id: t.id, type: t.type, amount: n(t.amount), note: t.note ?? "", status: t.status, created_at: Number(t.created_at) })),
  });
});

const adjustSchema = z.object({ amount: z.number(), bucket: z.enum(["deposit", "winnings"]), note: z.string().max(140).optional() });
adminRoutes.post("/admin/users/:id/adjust", async (req, res) => {
  const parsed = adjustSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid adjustment" });
  const amount = Money.round2(parsed.data.amount);
  await withTransaction(async (c) => {
    const col = parsed.data.bucket === "deposit" ? "deposit" : "winnings";
    await c.query(`update wallets set ${col} = ${col} + $1 where user_id = $2`, [amount, req.params.id]);
    await c.query("insert into transactions (user_id, type, amount, note, status) values ($1,'adjust',$2,$3,'completed')",
      [req.params.id, amount, parsed.data.note ?? "admin adjustment"]);
  });
  res.json({ ok: true });
});

const roleSchema = z.object({ isAdmin: z.boolean() });
adminRoutes.post("/admin/users/:id/role", async (req, res) => {
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid role" });
  await query("update users set is_admin = $1 where id = $2", [parsed.data.isAdmin, req.params.id]);
  res.json({ ok: true });
});

// ---- transactions / approvals ----
adminRoutes.get("/admin/transactions", async (req, res) => {
  const status = String(req.query.status ?? "").trim();
  const type = String(req.query.type ?? "").trim();
  const rows = await query(
    `select t.id, t.type, t.amount, t.note, t.status, extract(epoch from t.created_at)*1000 as created_at,
            u.id as user_id, u.name, u.phone
       from transactions t join users u on u.id = t.user_id
      where ($1='' or t.status=$1) and ($2='' or t.type=$2)
      order by t.created_at desc limit 200`,
    [status, type]
  );
  res.json(rows.rows.map((t) => ({
    id: t.id, type: t.type, amount: n(t.amount), note: t.note ?? "", status: t.status,
    created_at: Number(t.created_at), userId: t.user_id, userName: t.name, userPhone: t.phone,
  })));
});

adminRoutes.post("/admin/transactions/:id/approve", async (req: AuthedRequest, res) => {
  const out = await withTransaction(async (c) => {
    const r = await c.query("select * from transactions where id = $1 for update", [req.params.id]);
    const tx = r.rows[0];
    if (!tx) throw Object.assign(new Error("Transaction not found"), { http: 404 });
    if (tx.status !== "pending") throw Object.assign(new Error("Already processed"), { http: 400 });
    if (tx.type === "deposit") {
      await c.query("update wallets set deposit = deposit + $1 where user_id = $2", [n(tx.amount), tx.user_id]);
    }
    // withdrawals were already deducted when requested; approving just marks them paid
    await c.query("update transactions set status = 'approved' where id = $1", [tx.id]);
    return { userId: tx.user_id, type: tx.type, amount: n(tx.amount) };
  });
  sendPushToUsers([out.userId], {
    title: out.type === "deposit" ? "Deposit approved ✅" : "Withdrawal approved ✅",
    body: out.type === "deposit"
      ? `₹${Math.abs(out.amount).toFixed(2)} has been added to your wallet.`
      : `₹${Math.abs(out.amount).toFixed(2)} is on its way to your UPI.`,
    data: { type: "txn_approved" },
  });
  res.json({ ok: true });
});

adminRoutes.post("/admin/transactions/:id/reject", async (req: AuthedRequest, res) => {
  const out = await withTransaction(async (c) => {
    const r = await c.query("select * from transactions where id = $1 for update", [req.params.id]);
    const tx = r.rows[0];
    if (!tx) throw Object.assign(new Error("Transaction not found"), { http: 404 });
    if (tx.status !== "pending") throw Object.assign(new Error("Already processed"), { http: 400 });
    if (tx.type === "withdraw") {
      // refund the held amount back to the wallet's deposit bucket
      await c.query("update wallets set deposit = deposit + $1 where user_id = $2", [Math.abs(n(tx.amount)), tx.user_id]);
    }
    await c.query("update transactions set status = 'rejected' where id = $1", [tx.id]);
    return { userId: tx.user_id, type: tx.type, amount: n(tx.amount) };
  });
  sendPushToUsers([out.userId], {
    title: out.type === "deposit" ? "Deposit declined" : "Withdrawal declined — refunded",
    body: out.type === "deposit"
      ? "Your deposit could not be verified. Please contact support."
      : `₹${Math.abs(out.amount).toFixed(2)} was returned to your wallet.`,
    data: { type: "txn_rejected" },
  });
  res.json({ ok: true });
});

// ---- matches & dispute resolution ----
adminRoutes.get("/admin/matches", async (req, res) => {
  const status = String(req.query.status ?? "").trim();
  const rows = await query(
    `select m.*, a.name as a_name, b.name as b_name, w.name as w_name,
            (select count(*)::int from match_players mp where mp.match_id = m.id) as players,
            (select count(*)::int from match_reports mr where mr.match_id = m.id) as reports,
            (select count(*)::int from match_reports mr where mr.match_id = m.id and mr.result='win') as win_claims
       from matches m
       left join users a on a.id = m.player_a
       left join users b on b.id = m.player_b
       left join users w on w.id = m.winner_id
      where ($1='' or m.status=$1)
      order by (case when m.status='live' and (select count(*) from match_reports mr where mr.match_id=m.id and mr.result='win')>1 then 0 else 1 end),
               m.created_at desc
      limit 100`,
    [status]
  );
  res.json(rows.rows.map((m) => ({
    id: m.id, mode: m.mode, seats: m.seats, stake: n(m.stake), pot: Money.pot(n(m.stake), m.seats),
    status: m.status, players: m.players, reports: m.reports,
    disputed: m.status === "live" && m.win_claims > 1,
    playerA: m.a_name ?? "", playerB: m.b_name ?? "", winner: m.w_name ?? "",
    roomCode: m.room_code ?? "", created_at: new Date(m.created_at).getTime(),
  })));
});

adminRoutes.get("/admin/matches/:id", async (req, res) => {
  const m = await query("select * from matches where id = $1", [req.params.id]);
  if (!m.rowCount) return res.status(404).json({ message: "Match not found" });
  const match = m.rows[0];
  const players = await query(
    `select mp.user_id, u.name, mp.stake,
            mr.result, mr.proof_url, extract(epoch from mr.created_at)*1000 as reported_at
       from match_players mp join users u on u.id = mp.user_id
       left join match_reports mr on mr.match_id = mp.match_id and mr.user_id = mp.user_id
      where mp.match_id = $1`,
    [req.params.id]
  );
  res.json({
    id: match.id, mode: match.mode, seats: match.seats, stake: n(match.stake),
    pot: Money.pot(n(match.stake), match.seats), payout: Money.winnerPayout(Money.pot(n(match.stake), match.seats)),
    status: match.status, roomCode: match.room_code ?? "", winnerId: match.winner_id,
    created_at: new Date(match.created_at).getTime(),
    players: players.rows.map((p) => ({
      userId: p.user_id, name: p.name, stake: n(p.stake),
      result: p.result ?? "", proofUrl: p.proof_url ?? "", reportedAt: p.reported_at ? Number(p.reported_at) : 0,
    })),
  });
});

const resolveSchema = z.object({ winnerId: z.string().uuid() });
adminRoutes.post("/admin/matches/:id/resolve", async (req, res) => {
  const parsed = resolveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Pick a winner" });
  const out = await withTransaction(async (c) => {
    const m = await c.query("select * from matches where id = $1 for update", [req.params.id]);
    const match = m.rows[0];
    if (!match) throw Object.assign(new Error("Match not found"), { http: 404 });
    if (match.status === "settled") throw Object.assign(new Error("Already settled"), { http: 400 });
    const isPlayer = await c.query("select 1 from match_players where match_id = $1 and user_id = $2", [match.id, parsed.data.winnerId]);
    if (!isPlayer.rowCount) throw Object.assign(new Error("Winner must be a player in the match"), { http: 400 });
    await settleMatch(c, match, parsed.data.winnerId);
    return { winnerId: parsed.data.winnerId };
  });
  sendPushToUsers([out.winnerId], { title: "Match resolved — you won! 🏆", body: "An admin reviewed the result and awarded you the pot.", data: { type: "match_won" } });
  res.json({ ok: true });
});
