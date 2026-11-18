import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { query, withTransaction } from "../db.js";
import { signToken, requireAuth, type AuthedRequest } from "../auth.js";

export const authRoutes = Router();

function referralCode(): string {
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LUDORA-${r}`;
}

function userView(row: any) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email ?? "",
    rating: row.rating,
    joined: new Date(row.created_at).getFullYear(),
    stats: { played: Number(row.played ?? 0), wins: Number(row.wins ?? 0), total_won: Number(row.total_won ?? 0) },
  };
}

const signupSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  password: z.string().min(4),
});

authRoutes.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid signup details" });
  const { name, phone, email, password } = parsed.data;

  const existing = await query("select id from users where phone = $1", [phone]);
  if (existing.rowCount) return res.status(409).json({ message: "Phone already registered" });

  const hash = await bcrypt.hash(password, 10);
  const user = await withTransaction(async (c) => {
    const u = await c.query(
      `insert into users (name, phone, email, password_hash, referral_code)
       values ($1,$2,$3,$4,$5) returning *`,
      [name, phone, email, hash, referralCode()]
    );
    await c.query("insert into wallets (user_id) values ($1)", [u.rows[0].id]);
    return u.rows[0];
  });

  res.json({ token: signToken(user.id), user: userView(user) });
});

// `phone` carries the identifier: it may be a phone number OR an email address,
// so admins (known by email) can sign in with either.
const loginSchema = z.object({ phone: z.string().min(1), password: z.string().min(1) });

authRoutes.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid login details" });
  const id = parsed.data.phone.trim();
  const password = parsed.data.password;

  const r = await query("select * from users where phone = $1 or lower(email) = lower($1)", [id]);
  const user = r.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: "Wrong phone/email or password" });
  }
  res.json({ token: signToken(user.id), user: userView(user) });
});

authRoutes.post("/logout", requireAuth, (_req, res) => res.json({ status: "ok" }));
