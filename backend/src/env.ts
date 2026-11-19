import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  port: Number(process.env.PORT ?? 4000),
  corsOrigins: (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  // comma-separated emails that are promoted to admin on startup
  adminEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
  // optional: on startup, set the password of every ADMIN_EMAILS account to this
  // value and mark it admin (lets you set/reset known admin credentials).
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
};
