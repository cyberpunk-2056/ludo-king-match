import { Router } from "express";
import { query } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth.js";
import { Money } from "../money.js";

export const referralRoutes = Router();

// Referral earnings = 3% of referred friends' winnings, paid only when they win.
// Each such credit is written as a 'referral' transaction when a referred friend's
// match settles in their favor (see matchRoutes settlement).
referralRoutes.get("/referral", requireAuth, async (req: AuthedRequest, res) => {
  const me = await query("select referral_code from users where id = $1", [req.userId]);
  const code = me.rows[0]?.referral_code ?? "";

  const earnings = await query(
    "select coalesce(sum(amount),0) as total from transactions where user_id = $1 and type = 'referral'",
    [req.userId]
  );

  const friends = await query(
    `select u.name,
            coalesce(sum(t.amount) filter (where t.type = 'win'), 0) as winnings
       from users u
       left join transactions t on t.user_id = u.id
      where u.referred_by = $1
      group by u.id, u.name
      order by winnings desc`,
    [req.userId]
  );

  const friendList = friends.rows.map((f) => ({ name: f.name, winnings: Number(f.winnings) }));
  const winningsBase = friendList.reduce((s, f) => s + f.winnings, 0);

  res.json({
    code,
    earnings: Number(earnings.rows[0].total),
    winnings_base: Money.round2(winningsBase),
    friends: friendList,
  });
});
