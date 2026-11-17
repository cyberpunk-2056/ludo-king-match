import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth.js";

export const payoutRoutes = Router();

function view(row: any) {
  return { id: row.id, vpa: row.vpa, name: row.name, verified: row.verified, is_default: row.is_default };
}

payoutRoutes.get("/payout-methods", requireAuth, async (req: AuthedRequest, res) => {
  const r = await query("select * from payout_methods where user_id = $1 order by is_default desc, created_at", [req.userId]);
  res.json(r.rows.map(view));
});

const verifySchema = z.object({ vpa: z.string().regex(/^[a-z0-9._-]{2,}@[a-z]{2,}$/i, "Invalid UPI id") });

// Verify a UPI id with the payment aggregator's "verify VPA" API, then match the
// returned name against the user's KYC name before saving. (Here: name derived as a
// placeholder — wire to Razorpay/Cashfree/Decentro verify-VPA in production.)
payoutRoutes.post("/payout-methods/verify", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Enter a valid UPI ID, like name@bank." });
  const vpa = parsed.data.vpa;

  // TODO: const { name } = await aggregator.verifyVpa(vpa); then compare to KYC name.
  const holderName = vpa.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const existing = await query("select 1 from payout_methods where user_id = $1 and lower(vpa) = lower($2)", [req.userId, vpa]);
  if (existing.rowCount) return res.status(409).json({ message: "That UPI ID is already saved." });

  const count = await query("select count(*)::int as n from payout_methods where user_id = $1", [req.userId]);
  const makeDefault = count.rows[0].n === 0;

  const r = await query(
    "insert into payout_methods (user_id, vpa, name, verified, is_default) values ($1,$2,$3,true,$4) returning *",
    [req.userId, vpa, holderName, makeDefault]
  );
  res.json(view(r.rows[0]));
});

payoutRoutes.post("/payout-methods/:id/default", requireAuth, async (req: AuthedRequest, res) => {
  await query("update payout_methods set is_default = (id = $1) where user_id = $2", [req.params.id, req.userId]);
  res.json({ status: "ok" });
});
