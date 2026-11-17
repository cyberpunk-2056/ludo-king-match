import { pool } from "./db.js";
import { SCHEMA } from "./schema.js";

// Applies the schema. Run with: npm run migrate
async function main() {
  console.log("Applying schema...");
  await pool.query(SCHEMA);
  console.log("Schema applied successfully.");
  await pool.end();
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
