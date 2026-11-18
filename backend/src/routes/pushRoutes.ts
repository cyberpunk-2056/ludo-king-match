import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../auth.js";
import { savePushToken } from "../push.js";

export const pushRoutes = Router();

const registerSchema = z.object({
  token: z.string().min(10).max(200),
  platform: z.string().max(20).optional(),
});

// The app sends its Expo push token here after the user grants permission.
pushRoutes.post("/push/register", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid token" });
  await savePushToken(req.userId!, parsed.data.token, parsed.data.platform);
  res.json({ ok: true });
});
