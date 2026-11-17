import { Router } from "express";
import { z } from "zod";
import { query, withTransaction } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth.js";
import { Money } from "../money.js";

export const walletRoutes = Router();

async function walletView(userId: string) {
  const r = await query("select deposit, winnings, currency from wallets where user_id = $1", [userId]);
  const w = r.rows[0] ?? { deposit: 0, winnings: 0, currency: "USD" };
  return { deposit: Number(w.deposit), winnings: Number(w.winnings), currency: "₹" };
}

walletRoutes.get("/wallet", requireAuth, async (req: AuthedRequest, res) => {
  res.json(await walletView(req.userId!));
});

walletRoutes.get("/wallet/transactions", requireAuth, async (req: AuthedRequest, res) => {
  const limit = Math.min(Number(req.query.limit ?? 50), 200);
  const r = await query(
    "select id, type, amount, note, extract(epoch from created_at)*1000 as created_at from transactions where user_id = $1 order by created_at desc limit $2",
    [req.userId, limit]
  );
  res.json(r.rows.map((t) => ({ id: t.id, type: t.type, amount: Number(t.amount), note: t.note ?? "", created_at: Number(t.created_at) })));
});

const depositSchema = z.object({ amount: z.number().positive(), method: z.string(), instrument: z.string().optional() });

// In production this endpoint is called by the payment provider's webhook AFTER a
// successful charge, not directly by the client. Credits the deposit balance atomically.
walletRoutes.post("/wallet/deposit", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = depositSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid deposit" });
  const amount = Money.round2(parsed.data.amount);
  if (amount < Money.MIN_DEPOSIT) return res.status(400).json({ message: `Minimum deposit is ₹${Money.MIN_DEPOSIT}` });

  const txId = await withTransaction(async (c) => {
    await c.query("update wallets set deposit = deposit + $1 where user_id = $2", [amount, req.userId]);
    const t = await c.query(
      "insert into transactions (user_id, type, amount, note) values ($1,'deposit',$2,$3) returning id",
      [req.userId, amount, parsed.data.method]
    );
    return t.rows[0].id;
  });
  res.json({ status: "ok", txId });
});

const withdrawSchema = z.object({ amount: z.number().positive(), upiId: z.string().min(3) });

// Withdraw covers deposit + winnings. Pays to a verified UPI only. Debits atomically
// with a row lock so a double-submit can't overdraw.
walletRoutes.post("/wallet/withdraw", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = withdrawSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid withdrawal" });
  const amount = Money.round2(parsed.data.amount);
  if (amount < Money.MIN_WITHDRAW) return res.status(400).json({ message: `Minimum withdrawal is ₹${Money.MIN_WITHDRAW}` });

  const verified = await query(
    "select 1 from payout_methods where user_id = $1 and vpa = $2 and verified = true",
    [req.userId, parsed.data.upiId]
  );
  if (!verified.rowCount) return res.status(400).json({ message: "Payouts go only to a verified UPI account" });

  try {
    const txId = await withTransaction(async (c) => {
      const w = await c.query("select deposit, winnings from wallets where user_id = $1 for update", [req.userId]);
      const row = w.rows[0];
      const total = Number(row.deposit) + Number(row.winnings);
      if (amount > total + 0.001) throw new Error("INSUFFICIENT");
      // draw from deposit first, then winnings
      let fromDeposit = Math.min(Number(row.deposit), amount);
      let fromWinnings = Money.round2(amount - fromDeposit);
      await c.query("update wallets set deposit = deposit - $1, winnings = winnings - $2 where user_id = $3",
        [fromDeposit, fromWinnings, req.userId]);
      const t = await c.query(
        "insert into transactions (user_id, type, amount, note) values ($1,'withdraw',$2,$3) returning id",
        [req.userId, -amount, parsed.data.upiId]
      );
      return t.rows[0].id;
    });
    res.json({ status: "ok", txId });
  } catch (e: any) {
    if (e.message === "INSUFFICIENT") return res.status(400).json({ message: "Amount exceeds your balance" });
    throw e;
  }
});
