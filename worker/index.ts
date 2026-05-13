import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes } from "./routes/auth";
import { comercialRoutes } from "./routes/comercial";

export type Env = {
  DB: D1Database;
  JWT_SECRET: string;
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Env }>();

app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.get("/api/health", (c) => c.json({ ok: true, ts: Date.now() }));
app.route("/api/auth", authRoutes);
app.route("/api/comercial", comercialRoutes);

// Serve the SPA for everything that isn't an API route
app.get("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
