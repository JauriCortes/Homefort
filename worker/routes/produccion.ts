import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, desc } from "drizzle-orm";
import {
  ordenesProduccion,
  etapasProduccion,
  entregasProduccion,
  movimientosInventario,
  proyectos,
} from "../db/schema";
import { requireAuth, requireArea } from "../middleware/auth";
import type { Env } from "../index";

const produccion = new Hono<{ Bindings: Env }>();

function nuevoId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Órdenes ──────────────────────────────────────────────────

produccion.get("/ordenes", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const lista = await db.select().from(ordenesProduccion).orderBy(desc(ordenesProduccion.fechaEmision));
  return c.json(lista);
});

produccion.get("/ordenes/:id", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");
  const [orden] = await db.select().from(ordenesProduccion).where(eq(ordenesProduccion.id, id));
  if (!orden) return c.json({ error: "No encontrada" }, 404);

  const etapas = await db.select().from(etapasProduccion).where(eq(etapasProduccion.ordenId, id));
  const entregas = await db.select().from(entregasProduccion).where(eq(entregasProduccion.ordenId, id));

  return c.json({
    ...orden,
    etapas: etapas.map((e) => ({
      ...e,
      materiales: JSON.parse(e.materiales),
      observaciones: JSON.parse(e.observaciones),
    })),
    entregas: entregas.map((e) => ({ ...e, checklist: JSON.parse(e.checklist) })),
  });
});

// ─── Etapas ───────────────────────────────────────────────────

produccion.post("/ordenes/:id/etapas", requireAuth, requireArea("produccion"), async (c) => {
  const db = drizzle(c.env.DB);
  const ordenId = c.req.param("id");
  const body = await c.req.json();

  if (!body.nombre || !body.responsable || !body.fechaEstimada)
    return c.json({ error: "nombre, responsable y fechaEstimada son requeridos" }, 400);

  const [orden] = await db.select().from(ordenesProduccion).where(eq(ordenesProduccion.id, ordenId));
  if (!orden) return c.json({ error: "Orden no encontrada" }, 404);

  const payload = c.get("jwtPayload") as { nombre?: string } | undefined;
  const mats: { materialId: string; cantidad: number }[] = body.materiales ?? [];

  const etapa = {
    id: nuevoId("et"),
    ordenId,
    proyectoId: orden.proyectoId,
    nombre: body.nombre,
    responsable: body.responsable,
    fechaEstimada: body.fechaEstimada,
    fechaCompletada: null,
    estado: "pendiente" as const,
    materiales: JSON.stringify(mats),
    observaciones: "[]",
  };
  await db.insert(etapasProduccion).values(etapa);

  // Register bloqueo movements for assigned materials
  const hoy = new Date().toISOString().slice(0, 10);
  for (const m of mats.filter((x) => x.materialId && x.cantidad > 0)) {
    await db.insert(movimientosInventario).values({
      id: nuevoId("mov"),
      materialId: m.materialId,
      tipo: "bloqueo",
      cantidad: m.cantidad,
      fecha: hoy,
      proveedorId: null,
      proyectoId: orden.proyectoId,
      responsable: payload?.nombre ?? "Sistema",
      notas: `Bloqueado para etapa: ${body.nombre} (${etapa.id})`,
    });
  }

  return c.json({ ...etapa, materiales: mats, observaciones: [] }, 201);
});

// Complete etapa or add observation
produccion.patch("/etapas/:id", requireAuth, requireArea("produccion"), async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();
  const payload = c.get("jwtPayload") as { nombre?: string } | undefined;

  const [etapa] = await db.select().from(etapasProduccion).where(eq(etapasProduccion.id, id));
  if (!etapa) return c.json({ error: "No encontrada" }, 404);

  const materiales = JSON.parse(etapa.materiales) as { materialId: string; cantidad: number; cantidadReal?: number }[];
  const observaciones = JSON.parse(etapa.observaciones) as any[];
  const cambios: Record<string, unknown> = {};

  if (body.completar) {
    // body.cantReales: Record<materialId, number>
    const cantReales: Record<string, number> = body.cantReales ?? {};
    const hoy = new Date().toISOString().slice(0, 10);

    // Register consumo movements
    for (const m of materiales) {
      const cantReal = cantReales[m.materialId] ?? m.cantidad;
      await db.insert(movimientosInventario).values({
        id: nuevoId("mov"),
        materialId: m.materialId,
        tipo: "consumo",
        cantidad: cantReal,
        fecha: hoy,
        proveedorId: null,
        proyectoId: etapa.proyectoId,
        responsable: payload?.nombre ?? "Sistema",
        notas: body.observacion ? `Completado: ${body.observacion}` : `Consumo etapa: ${etapa.nombre}`,
      });
    }

    cambios.estado = "completada";
    cambios.fechaCompletada = hoy;
    cambios.materiales = JSON.stringify(
      materiales.map((m) => ({ ...m, cantidadReal: cantReales[m.materialId] ?? m.cantidad })),
    );

    if (body.observacion) {
      cambios.observaciones = JSON.stringify([
        ...observaciones,
        {
          fecha: hoy,
          descripcion: body.observacion,
          esRetrabajo: false,
          responsable: payload?.nombre ?? "Sistema",
        },
      ]);
    }
  }

  if (body.agregarObservacion) {
    cambios.observaciones = JSON.stringify([
      ...observaciones,
      {
        fecha: new Date().toISOString().slice(0, 10),
        descripcion: body.agregarObservacion.descripcion,
        esRetrabajo: body.agregarObservacion.esRetrabajo ?? false,
        responsable: payload?.nombre ?? "Sistema",
      },
    ]);
  }

  await db.update(etapasProduccion).set(cambios).where(eq(etapasProduccion.id, id));
  const [updated] = await db.select().from(etapasProduccion).where(eq(etapasProduccion.id, id));
  return c.json({
    ...updated,
    materiales: JSON.parse(updated!.materiales),
    observaciones: JSON.parse(updated!.observaciones),
  });
});

// ─── Entregas ─────────────────────────────────────────────────

produccion.post("/ordenes/:id/entregas", requireAuth, requireArea("produccion"), async (c) => {
  const db = drizzle(c.env.DB);
  const ordenId = c.req.param("id");
  const body = await c.req.json();
  const payload = c.get("jwtPayload") as { nombre?: string } | undefined;

  const [orden] = await db.select().from(ordenesProduccion).where(eq(ordenesProduccion.id, ordenId));
  if (!orden) return c.json({ error: "Orden no encontrada" }, 404);

  const entrega = {
    id: nuevoId("ent"),
    ordenId,
    proyectoId: orden.proyectoId,
    fecha: new Date().toISOString().slice(0, 10),
    responsable: payload?.nombre ?? "Sistema",
    checklist: JSON.stringify(body.checklist ?? {}),
    observaciones: body.observaciones ?? null,
  };
  await db.insert(entregasProduccion).values(entrega);

  // Mark orden as Finalizada and project as Entregado
  await db.update(ordenesProduccion).set({ estado: "Finalizada" }).where(eq(ordenesProduccion.id, ordenId));
  await db.update(proyectos).set({ estado: "Entregado" }).where(eq(proyectos.id, orden.proyectoId));

  return c.json({ ...entrega, checklist: body.checklist ?? {} }, 201);
});

export const produccionRoutes = produccion;
