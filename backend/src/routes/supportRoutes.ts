import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth.js";

export const supportRoutes = Router();

interface Msg { id: string; sender: string; body: string; created_at: number; }

function view(r: any): Msg {
  return { id: r.id, sender: r.sender, body: r.body, created_at: new Date(r.created_at).getTime() };
}

// A lightweight FAQ bot. Answers common questions instantly and always tells the
// player a human agent can follow up. A real support team can read the stored
// thread and reply later as sender='agent'.
function botReply(text: string): string {
  const t = text.toLowerCase();
  const has = (...k: string[]) => k.some((w) => t.includes(w));

  if (has("withdraw", "payout", "cash out", "निकासी", "withdrawl"))
    return "Withdrawals go to your KYC-verified UPI only. Minimum ₹10, and only winnings are withdrawable. Payouts usually settle within a few minutes. If one is stuck past 30 minutes, reply here with the amount and time and an agent will check it.";
  if (has("deposit", "add money", "add cash", "जमा", "top up", "payment failed", "money not"))
    return "To add money, open Wallet → Add money (minimum ₹5). If a payment was charged but your balance didn't update, send the amount and the time of the payment and an agent will reconcile it.";
  if (has("room code", "ludo king", "join the room", "code not"))
    return "The match creator pastes their Ludo King room code when creating the match. You see that code the moment you join and pay the entry fee. Open Ludo King and join that exact code to play.";
  if (has("refund", "cancel", "no opponent", "timer", "10 min"))
    return "If no one joins within the 10-minute window, the match is cancelled automatically and every joined player's entry fee is refunded to their deposit balance.";
  if (has("referral", "refer", "commission", "invite", "रेफर"))
    return "Share your referral code from Refer & earn. When a friend you referred wins a match, you earn 3% of their winnings, paid straight to your withdrawable balance.";
  if (has("win", "winner", "95", "pot", "prize"))
    return "The pot is the entry fee times the number of players. The winner gets 95% of the pot and the platform keeps 5%. Both players report the result and we verify before paying out.";
  if (has("kyc", "verify", "verification", "document"))
    return "KYC links your UPI to your name so payouts are safe. Add and verify a UPI ID under Withdraw → Pay out to. Payouts only go to a verified account.";
  if (has("hello", "hi ", "hey", "namaste", "नमस्ते") || t.trim() === "hi")
    return "Hi! I'm the Ludora support assistant. Ask me about deposits, withdrawals, room codes, refunds or referrals, or describe your issue and an agent will follow up here.";
  return "Thanks for reaching out — I've logged this for our support team and an agent will reply here shortly. Meanwhile, you can ask me about deposits, withdrawals, room codes, refunds, KYC or referrals.";
}

// Full thread for the signed-in user.
supportRoutes.get("/support/messages", requireAuth, async (req: AuthedRequest, res) => {
  const r = await query(
    "select id, sender, body, created_at from support_messages where user_id = $1 order by created_at asc limit 200",
    [req.userId]
  );
  res.json(r.rows.map(view));
});

const sendSchema = z.object({ body: z.string().trim().min(1).max(1000) });

// Post a user message; store it, generate the bot reply, store that, return both.
supportRoutes.post("/support/messages", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = sendSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Type a message" });

  const mine = await query(
    "insert into support_messages (user_id, sender, body) values ($1,'user',$2) returning id, sender, body, created_at",
    [req.userId, parsed.data.body]
  );
  const reply = await query(
    "insert into support_messages (user_id, sender, body) values ($1,'support',$2) returning id, sender, body, created_at",
    [req.userId, botReply(parsed.data.body)]
  );
  res.json([view(mine.rows[0]), view(reply.rows[0])]);
});
