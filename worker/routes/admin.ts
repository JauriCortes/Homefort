import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, ne } from "drizzle-orm";
import { hashSync } from "bcryptjs";
import { usuarios } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import type { Env } from "../index";
import type { JWTPayload } from "../middleware/auth";

const admin = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

admin.use("*", requireAuth);

admin.use("*", async (c, next) => {
  if (!c.get("user").esAdmin) return c.json({ error: "Solo administradores" }, 403);
  await next();
});

function safeUser(u: typeof usuarios.$inferSelect) {
  return {
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    areas: JSON.parse(u.areas) as string[],
    esAdmin: u.esAdmin,
    activo: u.activo,
    intentosFallidos: u.intentosFallidos,
    bloqueadoHasta: u.bloqueadoHasta,
    creadoEn: u.creadoEn,
  };
}

// GET /api/admin/usuarios
admin.get("/usuarios", async (c) => {
  const db = drizzle(c.env.DB);
  const rows = await db.select().from(usuarios).orderBy(usuarios.creadoEn);
  return c.json(rows.map(safeUser));
});

// GET /api/admin/usuarios/:id
admin.get("/usuarios/:id", async (c) => {
  const db = drizzle(c.env.DB);
  const [u] = await db.select().from(usuarios).where(eq(usuarios.id, c.req.param("id"))).limit(1);
  if (!u) return c.json({ error: "Usuario no encontrado" }, 404);
  return c.json(safeUser(u));
});

// POST /api/admin/usuarios
admin.post("/usuarios", async (c) => {
  const { nombre, email, password, areas, esAdmin } = await c.req.json<{
    nombre: string;
    email: string;
    password: string;
    areas: string[];
    esAdmin?: boolean;
  }>();

  if (!nombre?.trim() || !email?.trim() || !password || !areas?.length) {
    return c.json({ error: "Faltan campos obligatorios" }, 400);
  }

  const db = drizzle(c.env.DB);
  const [existing] = await db.select().from(usuarios).where(eq(usuarios.email, email.toLowerCase())).limit(1);
  if (existing) return c.json({ error: "Ya existe un usuario con ese correo" }, 409);

  const passwordHash = hashSync(password, 10);
  const u = {
    id: crypto.randomUUID(),
    nombre: nombre.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    areas: JSON.stringify(areas),
    esAdmin: esAdmin ?? false,
    activo: true,
    intentosFallidos: 0,
    bloqueadoHasta: null,
    creadoEn: new Date().toISOString().split("T")[0],
  };

  await db.insert(usuarios).values(u);
  return c.json(safeUser({ ...u }), 201);
});

// PATCH /api/admin/usuarios/:id
admin.patch("/usuarios/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{
    nombre?: string;
    email?: string;
    areas?: string[];
    esAdmin?: boolean;
    activo?: boolean;
  }>();

  const db = drizzle(c.env.DB);
  const [u] = await db.select().from(usuarios).where(eq(usuarios.id, id)).limit(1);
  if (!u) return c.json({ error: "Usuario no encontrado" }, 404);

  if (body.email) {
    const [dup] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, body.email.toLowerCase()))
      .limit(1);
    if (dup && dup.id !== id) return c.json({ error: "Ese correo ya está en uso" }, 409);
  }

  const patch: Partial<typeof usuarios.$inferInsert> = {};
  if (body.nombre !== undefined) patch.nombre = body.nombre.trim();
  if (body.email !== undefined) patch.email = body.email.toLowerCase().trim();
  if (body.areas !== undefined) patch.areas = JSON.stringify(body.areas);
  if (body.esAdmin !== undefined) patch.esAdmin = body.esAdmin;
  if (body.activo !== undefined) patch.activo = body.activo;

  await db.update(usuarios).set(patch).where(eq(usuarios.id, id));
  const [updated] = await db.select().from(usuarios).where(eq(usuarios.id, id)).limit(1);
  return c.json(safeUser(updated));
});

// PATCH /api/admin/usuarios/:id/password
admin.patch("/usuarios/:id/password", async (c) => {
  const id = c.req.param("id");
  const { password } = await c.req.json<{ password: string }>();
  if (!password || password.length < 6) return c.json({ error: "Mínimo 6 caracteres" }, 400);

  const db = drizzle(c.env.DB);
  const [u] = await db.select().from(usuarios).where(eq(usuarios.id, id)).limit(1);
  if (!u) return c.json({ error: "Usuario no encontrado" }, 404);

  const passwordHash = hashSync(password, 10);
  await db.update(usuarios).set({ passwordHash }).where(eq(usuarios.id, id));
  return c.json({ ok: true });
});

// POST /api/admin/usuarios/:id/desbloquear
admin.post("/usuarios/:id/desbloquear", async (c) => {
  const id = c.req.param("id");
  const db = drizzle(c.env.DB);
  await db
    .update(usuarios)
    .set({ bloqueadoHasta: null, intentosFallidos: 0 })
    .where(eq(usuarios.id, id));
  return c.json({ ok: true });
});

export { admin as adminRoutes };
