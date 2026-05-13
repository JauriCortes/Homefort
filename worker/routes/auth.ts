import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { compare } from "bcryptjs";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { usuarios } from "../db/schema";
import { requireAuth, type JWTPayload } from "../middleware/auth";
import type { Env } from "../index";

const auth = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

const ACCESS_TTL  = 30 * 60;       // 30 min en segundos
const REFRESH_TTL = 8 * 60 * 60;   // 8 h en segundos
const MAX_INTENTOS = 5;
const BLOQUEO_MIN  = 15;

function accessCookie(token: string) {
  return `hf_access=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${ACCESS_TTL}`;
}
function refreshCookie(token: string) {
  return `hf_refresh=${token}; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=${REFRESH_TTL}`;
}
function clearCookies() {
  return [
    "hf_access=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0",
    "hf_refresh=; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=0",
  ];
}

async function makeTokens(payload: Omit<JWTPayload, "iat" | "exp">, secret: string) {
  const now = Math.floor(Date.now() / 1000);
  const access = await sign(
    { ...payload, iat: now, exp: now + ACCESS_TTL },
    secret,
  );
  const refresh = await sign(
    { sub: payload.sub, iat: now, exp: now + REFRESH_TTL },
    secret,
  );
  return { access, refresh };
}

// POST /api/auth/login
auth.post("/login", async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>();
  if (!email || !password) return c.json({ error: "Faltan credenciales" }, 400);

  const db = drizzle(c.env.DB);
  const [usuario] = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.email, email.toLowerCase().trim()))
    .limit(1);

  if (!usuario) return c.json({ error: "Credenciales incorrectas" }, 401);
  if (!usuario.activo) return c.json({ error: "Usuario inactivo" }, 403);

  // Verificar bloqueo
  if (usuario.bloqueadoHasta) {
    const hasta = new Date(usuario.bloqueadoHasta).getTime();
    if (Date.now() < hasta) {
      const min = Math.ceil((hasta - Date.now()) / 60000);
      return c.json({ error: "Cuenta bloqueada", minutosRestantes: min }, 403);
    }
  }

  const ok = await compare(password, usuario.passwordHash);

  if (!ok) {
    const intentos = usuario.intentosFallidos + 1;
    const bloqueadoHasta =
      intentos >= MAX_INTENTOS
        ? new Date(Date.now() + BLOQUEO_MIN * 60000).toISOString()
        : null;
    await db
      .update(usuarios)
      .set({ intentosFallidos: intentos, bloqueadoHasta })
      .where(eq(usuarios.id, usuario.id));
    return c.json({ error: "Credenciales incorrectas" }, 401);
  }

  // Reset intentos
  await db
    .update(usuarios)
    .set({ intentosFallidos: 0, bloqueadoHasta: null })
    .where(eq(usuarios.id, usuario.id));

  const areas = JSON.parse(usuario.areas) as string[];
  const { access, refresh } = await makeTokens(
    { sub: usuario.id, nombre: usuario.nombre, areas, esAdmin: usuario.esAdmin },
    c.env.JWT_SECRET,
  );

  c.header("Set-Cookie", accessCookie(access));
  c.header("Set-Cookie", refreshCookie(refresh), { append: true });

  return c.json({
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      areas,
      esAdmin: usuario.esAdmin,
    },
  });
});

// POST /api/auth/logout
auth.post("/logout", (c) => {
  clearCookies().forEach((v, i) =>
    c.header("Set-Cookie", v, i > 0 ? { append: true } : undefined),
  );
  return c.json({ ok: true });
});

// POST /api/auth/refresh
auth.post("/refresh", async (c) => {
  const header = c.req.raw.headers.get("Cookie") ?? "";
  const token = header
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("hf_refresh="))
    ?.slice("hf_refresh=".length);

  if (!token) return c.json({ error: "Sin refresh token" }, 401);

  try {
    const payload = (await verify(token, c.env.JWT_SECRET, "HS256")) as unknown as { sub: string };
    const db = drizzle(c.env.DB);
    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, payload.sub))
      .limit(1);

    if (!usuario || !usuario.activo) return c.json({ error: "Usuario no válido" }, 401);

    const areas = JSON.parse(usuario.areas) as string[];
    const { access, refresh } = await makeTokens(
      { sub: usuario.id, nombre: usuario.nombre, areas, esAdmin: usuario.esAdmin },
      c.env.JWT_SECRET,
    );

    c.header("Set-Cookie", accessCookie(access));
    c.header("Set-Cookie", refreshCookie(refresh), { append: true });
    return c.json({ ok: true });
  } catch {
    return c.json({ error: "Refresh token inválido" }, 401);
  }
});

// GET /api/auth/me
auth.get("/me", requireAuth, (c) => {
  const user = c.get("user");
  return c.json({
    id: user.sub,
    nombre: user.nombre,
    areas: user.areas,
    esAdmin: user.esAdmin,
  });
});

export { auth as authRoutes };
