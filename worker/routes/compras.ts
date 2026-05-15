import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, asc, desc } from "drizzle-orm";
import {
  materialesBase,
  proveedores,
  movimientosInventario,
  solicitudesCompra,
  ordenesCompra,
} from "../db/schema";
import { requireAuth, requireArea, type JWTPayload } from "../middleware/auth";
import type { Env } from "../index";

const compras = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

function nuevoId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

// ── Materiales ────────────────────────────────────────────────────────────────

compras.get("/materiales", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const lista = await db.select().from(materialesBase).orderBy(asc(materialesBase.nombre));
  return c.json(lista);
});

// ── Stock (materiales + cantidades calculadas) ────────────────────────────────

compras.get("/stock", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const [mats, movs] = await Promise.all([
    db.select().from(materialesBase).orderBy(asc(materialesBase.nombre)),
    db.select().from(movimientosInventario),
  ]);

  const stock = mats.map((m) => {
    let disponible = 0,
      bloqueado = 0,
      consumido = 0;
    for (const mov of movs.filter((mv) => mv.materialId === m.id)) {
      if (mov.tipo === "entrada" || mov.tipo === "ajuste") {
        disponible += mov.cantidad;
      } else if (mov.tipo === "bloqueo") {
        disponible -= mov.cantidad;
        bloqueado += mov.cantidad;
      } else if (mov.tipo === "consumo") {
        bloqueado -= mov.cantidad;
        consumido += mov.cantidad;
      }
    }
    return { ...m, disponible, bloqueado, consumido };
  });

  return c.json(stock);
});

// ── Proveedores ───────────────────────────────────────────────────────────────

compras.get("/proveedores", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const lista = await db.select().from(proveedores).orderBy(asc(proveedores.nombre));
  return c.json(lista.map((p) => ({ ...p, materialesIds: JSON.parse(p.materialesIds) })));
});

compras.post("/proveedores", requireAuth, requireArea("compras"), async (c) => {
  const body = await c.req.json();
  if (!body.nombre?.trim()) return c.json({ error: "Nombre requerido" }, 400);
  if (!body.email?.trim()) return c.json({ error: "Email requerido" }, 400);
  const db = drizzle(c.env.DB);
  const pv = {
    id: nuevoId("pv"),
    nombre: body.nombre.trim(),
    contacto: body.contacto?.trim() ?? "",
    telefono: body.telefono?.trim() ?? "",
    email: body.email.trim(),
    materialesIds: JSON.stringify(body.materialesIds ?? []),
    condicionesPago: body.condicionesPago?.trim() ?? "",
    notas: body.notas?.trim() || null,
    creadoEn: new Date().toISOString().slice(0, 10),
  };
  await db.insert(proveedores).values(pv);
  return c.json({ ...pv, materialesIds: body.materialesIds ?? [] }, 201);
});

compras.patch("/proveedores/:id", requireAuth, requireArea("compras"), async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();
  const cambios: Record<string, unknown> = {};
  if (body.nombre !== undefined) cambios.nombre = body.nombre.trim();
  if (body.contacto !== undefined) cambios.contacto = body.contacto.trim();
  if (body.telefono !== undefined) cambios.telefono = body.telefono.trim();
  if (body.email !== undefined) cambios.email = body.email.trim();
  if (body.condicionesPago !== undefined) cambios.condicionesPago = body.condicionesPago.trim();
  if (body.notas !== undefined) cambios.notas = body.notas;
  if (body.materialesIds !== undefined) cambios.materialesIds = JSON.stringify(body.materialesIds);
  await db.update(proveedores).set(cambios).where(eq(proveedores.id, id));
  const [updated] = await db.select().from(proveedores).where(eq(proveedores.id, id));
  if (!updated) return c.json({ error: "No encontrado" }, 404);
  return c.json({ ...updated, materialesIds: JSON.parse(updated.materialesIds) });
});

compras.delete("/proveedores/:id", requireAuth, requireArea("compras"), async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");
  try {
    // Bloquear si tiene órdenes de compra asociadas (FK NOT NULL)
    const [ordenRef] = await db
      .select({ id: ordenesCompra.id })
      .from(ordenesCompra)
      .where(eq(ordenesCompra.proveedorId, id))
      .limit(1);
    if (ordenRef) {
      return c.json(
        { error: "Este proveedor tiene órdenes de compra asociadas. Reasígnalas antes de eliminarlo." },
        409,
      );
    }
    // Nullificar referencia opcional en movimientos
    await db
      .update(movimientosInventario)
      .set({ proveedorId: null })
      .where(eq(movimientosInventario.proveedorId, id));
    await db.delete(proveedores).where(eq(proveedores.id, id));
    return c.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al eliminar proveedor";
    return c.json({ error: msg }, 500);
  }
});

// ── Movimientos de inventario ─────────────────────────────────────────────────

compras.get("/movimientos", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const lista = await db
    .select()
    .from(movimientosInventario)
    .orderBy(desc(movimientosInventario.fecha));
  return c.json(lista);
});

compras.post("/movimientos", requireAuth, requireArea("compras"), async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  if (!body.materialId) return c.json({ error: "materialId requerido" }, 400);
  if (!body.cantidad || Number(body.cantidad) <= 0)
    return c.json({ error: "Cantidad inválida" }, 400);
  const db = drizzle(c.env.DB);
  const mov = {
    id: nuevoId("mov"),
    materialId: body.materialId,
    tipo: (body.tipo ?? "entrada") as "entrada" | "bloqueo" | "consumo" | "ajuste",
    cantidad: Number(body.cantidad),
    fecha: body.fecha ?? new Date().toISOString().slice(0, 10),
    proveedorId: body.proveedorId ?? null,
    proyectoId: body.proyectoId ?? null,
    responsable: user.nombre,
    notas: body.notas ?? null,
  };
  await db.insert(movimientosInventario).values(mov);
  return c.json(mov, 201);
});

// ── Solicitudes de compra ─────────────────────────────────────────────────────

compras.get("/solicitudes", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const lista = await db
    .select()
    .from(solicitudesCompra)
    .orderBy(desc(solicitudesCompra.fechaCreacion));
  return c.json(lista.map((s) => ({ ...s, items: JSON.parse(s.items) })));
});

compras.patch("/solicitudes/:id", requireAuth, requireArea("compras"), async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();
  const cambios: Record<string, unknown> = {};
  if (body.estado !== undefined) cambios.estado = body.estado;
  if (body.ordenCompraId !== undefined) cambios.ordenCompraId = body.ordenCompraId;
  await db.update(solicitudesCompra).set(cambios).where(eq(solicitudesCompra.id, id));
  const [updated] = await db.select().from(solicitudesCompra).where(eq(solicitudesCompra.id, id));
  if (!updated) return c.json({ error: "No encontrado" }, 404);
  return c.json({ ...updated, items: JSON.parse(updated.items) });
});

// ── Órdenes de compra ─────────────────────────────────────────────────────────

compras.get("/ordenes", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const lista = await db.select().from(ordenesCompra).orderBy(desc(ordenesCompra.fechaCreacion));
  return c.json(lista.map((o) => ({ ...o, items: JSON.parse(o.items) })));
});

compras.post("/ordenes", requireAuth, requireArea("compras"), async (c) => {
  const body = await c.req.json();
  if (!body.proyectoId) return c.json({ error: "proyectoId requerido" }, 400);
  if (!body.proveedorId) return c.json({ error: "proveedorId requerido" }, 400);
  if (!body.fechaEntregaEstimada) return c.json({ error: "fechaEntregaEstimada requerida" }, 400);
  const db = drizzle(c.env.DB);
  const year = new Date().getFullYear();
  const todas = await db.select().from(ordenesCompra);
  const delAnio = todas.filter((o) => o.codigo.startsWith(`OC-${year}-`));
  const codigo = `OC-${year}-${String(delAnio.length + 1).padStart(4, "0")}`;
  const oc = {
    id: nuevoId("oc"),
    codigo,
    proyectoId: body.proyectoId,
    proveedorId: body.proveedorId,
    solicitudId: body.solicitudId ?? null,
    fechaCreacion: new Date().toISOString().slice(0, 10),
    fechaEntregaEstimada: body.fechaEntregaEstimada,
    estado: "borrador" as const,
    items: JSON.stringify(body.items ?? []),
    notas: body.notas ?? null,
  };
  await db.insert(ordenesCompra).values(oc);
  return c.json({ ...oc, items: body.items ?? [] }, 201);
});

compras.patch("/ordenes/:id", requireAuth, requireArea("compras"), async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();
  const cambios: Record<string, unknown> = {};
  if (body.estado !== undefined) cambios.estado = body.estado;
  if (body.notas !== undefined) cambios.notas = body.notas;
  if (body.fechaEntregaEstimada !== undefined)
    cambios.fechaEntregaEstimada = body.fechaEntregaEstimada;
  if (body.items !== undefined) cambios.items = JSON.stringify(body.items);
  await db.update(ordenesCompra).set(cambios).where(eq(ordenesCompra.id, id));
  const [updated] = await db.select().from(ordenesCompra).where(eq(ordenesCompra.id, id));
  if (!updated) return c.json({ error: "No encontrado" }, 404);
  return c.json({ ...updated, items: JSON.parse(updated.items) });
});

export { compras as comprasRoutes };
