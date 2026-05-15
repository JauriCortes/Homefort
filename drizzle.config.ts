import type { Config } from "drizzle-kit";

export default {
  dialect: "sqlite",
  schema: "./worker/db/schema.ts",
  out: "./worker/db/migrations",
} satisfies Config;
