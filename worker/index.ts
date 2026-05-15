import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes } from "./routes/auth";
import { comercialRoutes } from "./routes/comercial";
import { comprasRoutes } from "./routes/compras";

export type Env = {
  DB: D1Database;
  JWT_SECRET: string;
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Env }>();

app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:5173", "https://homefort.jcortesca.workers.dev"],
    credentials: true,
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.get("/api/health", (c) => c.json({ ok: true, ts: Date.now() }));
app.route("/api/auth", authRoutes);
app.route("/api/comercial", comercialRoutes);
app.route("/api/compras", comprasRoutes);

// Serve the SPA — fallback to index.html for client-side routes
app.get("*", async (c) => {
  const res = await c.env.ASSETS.fetch(c.req.raw);
  if (res.status === 404) {
    return c.env.ASSETS.fetch(new Request(new URL("/", c.req.url).toString()));
  }
  return res;
});

export default app;
