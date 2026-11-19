import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { env } from "./env.js";
import { query } from "./db.js";

export interface AuthedRequest extends Request {
  userId?: string;
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: "30d" });
}

/** Express middleware: requires a valid Bearer token, sets req.userId. */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ message: "Not authenticated" });
  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/** Requires a valid token AND an admin account. Runs after a token check. */
export async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ message: "Not authenticated" });
  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    const r = await query("select is_admin, email from users where id = $1", [payload.sub]);
    const u = r.rows[0];
    // An account is admin if its DB flag is set OR its email is in ADMIN_EMAILS.
    // Checking the env directly means admin access works immediately on login,
    // without waiting for the startup promotion to run.
    const byEmail = u?.email && env.adminEmails.includes(String(u.email).trim().toLowerCase());
    if (!u || !(u.is_admin || byEmail)) return res.status(403).json({ message: "Admins only" });
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
