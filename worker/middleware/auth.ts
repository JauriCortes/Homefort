import { verify } from "hono/jwt";
import { createMiddleware } from "hono/factory";
import type { Env } from "../index";

export interface JWTPayload {
  sub: string;
  nombre: string;
  areas: string[];
  esAdmin: boolean;
  iat: number;
  exp: number;
}

export const requireAuth = createMiddleware<{ Bindings: Env; Variables: { user: JWTPayload } }>(
  async (c, next) => {
    const token = getCookie(c.req.raw, "hf_access");
    if (!token) return c.json({ error: "No autenticado" }, 401);

    try {
      const payload = (await verify(token, c.env.JWT_SECRET, "HS256")) as unknown as JWTPayload;
      c.set("user", payload);
      await next();
    } catch {
      return c.json({ error: "Token inválido o expirado" }, 401);
    }
  },
);

export function requireArea(area: string) {
  return createMiddleware<{ Bindings: Env; Variables: { user: JWTPayload } }>(
    async (c, next) => {
      const user = c.get("user");
      if (!user.esAdmin && !user.areas.includes(area)) {
        return c.json({ error: "Sin permiso para esta área" }, 403);
      }
      await next();
    },
  );
}

function getCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get("Cookie") ?? "";
  return header
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}
