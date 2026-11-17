import { Router } from "express";
import { query } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth.js";

export const meRoutes = Router();

meRoutes.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const r = await query(
    `select u.*,
            coalesce(s.played, 0) as played,
            coalesce(s.wins, 0)   as wins,
            coalesce(s.total_won, 0) as total_won
       from users u
       left join (
         select winner_id,
                count(*) filter (where status = 'settled') as wins
           from matches where winner_id = $1 group by winner_id
       ) w on w.winner_id = u.id
       left join (
         select $1::uuid as uid,
                (select count(*) from matches m
                   where m.status = 'settled' and ($1 in (m.player_a, m.player_b))) as played,
                (select count(*) from matches m where m.winner_id = $1) as wins,
                (select coalesce(sum(amount),0) from transactions where user_id = $1 and type = 'win') as total_won
       ) s on true
      where u.id = $1`,
    [req.userId]
  );
  const u = r.rows[0];
  if (!u) return res.status(404).json({ message: "Not found" });
  res.json({
    id: u.id, name: u.name, phone: u.phone, email: u.email ?? "", rating: u.rating,
    joined: new Date(u.created_at).getFullYear(),
    stats: { played: Number(u.played), wins: Number(u.wins), total_won: Number(u.total_won) },
  });
});
