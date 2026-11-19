import "express-async-errors"; // makes async route rejections reach the error handler (Express 4)
import express from "express";
import bcrypt from "bcryptjs";
import cors from "cors";
import { createServer } from "node:http";
import { Server as SocketServer } from "socket.io";
import { env } from "./env.js";
import { pool } from "./db.js";
import { SCHEMA } from "./schema.js";
import { authRoutes } from "./routes/authRoutes.js";
import { meRoutes } from "./routes/meRoutes.js";
import { walletRoutes } from "./routes/walletRoutes.js";
import { payoutRoutes } from "./routes/payoutRoutes.js";
import { matchRoutes, expireMatches } from "./routes/matchRoutes.js";
import { referralRoutes } from "./routes/referralRoutes.js";
import { pushRoutes } from "./routes/pushRoutes.js";
import { supportRoutes } from "./routes/supportRoutes.js";
import { adminRoutes } from "./routes/adminRoutes.js";

const app = express();

app.use(cors({ origin: env.corsOrigins.length ? env.corsOrigins : true, credentials: true }));
app.use(express.json());

// health check (used by Render)
app.get("/api/health", (_req, res) => res.json({ ok: true, version: "crashfix-1", time: Date.now() }));

// REST API — the same endpoints the web and Android clients call
app.use("/api/auth", authRoutes);
app.use("/api", meRoutes);
app.use("/api", walletRoutes);
app.use("/api", payoutRoutes);
app.use("/api", matchRoutes);
app.use("/api", referralRoutes);
app.use("/api", pushRoutes);
app.use("/api", supportRoutes);
app.use("/api", adminRoutes);

// fallback error handler. Routes may throw an error carrying `http` (a status < 500)
// and its message is sent to the client; everything else is a generic 500.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = Number(err?.http || err?.status) || 500;
  console.error(err);
  res.status(status).json({ message: status < 500 && err?.message ? err.message : "Server error" });
});

const server = createServer(app);

// Socket.IO for realtime match/lobby updates (room code exchange, live state).
const io = new SocketServer(server, {
  cors: { origin: env.corsOrigins.length ? env.corsOrigins : true },
});
io.on("connection", (socket) => {
  socket.on("match:subscribe", (matchId: string) => socket.join(`match:${matchId}`));
  socket.on("match:unsubscribe", (matchId: string) => socket.leave(`match:${matchId}`));
});
export { io };

// Sweep expired (unfilled) matches every 30s and refund their stakes.
setInterval(() => {
  expireMatches().catch((e) => console.error("expireMatches failed:", e));
}, 30_000);

// Ensure tables exist on boot (idempotent). Logs but never prevents startup,
// so /api/health stays reachable even if the DB is briefly unavailable.
async function ensureSchema() {
  try {
    await pool.query(SCHEMA);
    if (env.adminEmails.length) {
      const promoted = await pool.query("update users set is_admin = true where lower(email) = any($1::text[]) returning email", [env.adminEmails]);
      console.log(`Admin promotion: matched ${promoted.rowCount} account(s) for ${env.adminEmails.join(", ")}`);
      // optionally (re)set the admin password so you always have known credentials
      if (env.adminPassword) {
        const hash = await bcrypt.hash(env.adminPassword, 10);
        const reset = await pool.query(
          "update users set is_admin = true, password_hash = $1 where lower(email) = any($2::text[]) returning email, phone",
          [hash, env.adminEmails]
        );
        console.log(`Admin password set for ${reset.rowCount} account(s): ${reset.rows.map((r: any) => r.email + " / " + r.phone).join(", ")}`);
      }
    }
    console.log("Schema ensured.");
  } catch (e) {
    console.error("ensureSchema failed (continuing):", e);
  }
}

ensureSchema().finally(() => {
  server.listen(env.port, () => {
    console.log(`Ludo King Maker API listening on :${env.port}`);
  });
});

// last-resort guards so an unexpected rejection logs instead of killing the process
process.on("unhandledRejection", (r) => console.error("unhandledRejection:", r));
process.on("uncaughtException", (e) => console.error("uncaughtException:", e));
