import { defineConfig } from "drizzle-kit";

// drizzle-kit does not load .env.local on its own (Next.js does that only at runtime).
try {
  process.loadEnvFile(".env.local");
} catch {}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  // Migrations use the direct (non-pooled) connection.
  dbCredentials: { url: process.env.DATABASE_URL },
});
