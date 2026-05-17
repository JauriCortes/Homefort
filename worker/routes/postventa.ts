import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, desc } from "drizzle-orm";
import { solicitudesGarantia, ordenesGarantia, proyectos } from "../db/schema";
import { requireAuth, requireArea } from "../middleware/auth";
import type { Env } from "../index";

const postventa = new Hono<{ Bindings: Env }>();

function nuevoId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Solicitudes de garantía ──────────────────────────────────

postventa.get("/solicitudes", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const lista = await db.select().from(solicitudesGarantia).orderBy(desc(solicitudesGarantia.fecha));
  return c.json(lista);
});

postventa.get("/solicitudes/:id", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");
  const [sol] = await db.select().from(solicitudesGarantia).where(eq(solicitudesGarantia.id, id));
  if (!sol) return c.json({ error: "No encontrada" }, 404);
  let orden = null;
  if (sol.ordenGarantiaId) {
    const [og] = await db.select().from(ordenesGarantia).where(eq(ordenesGarantia.id, sol.ordenGarantiaId));
    if (og) orden = { ...og, etapas: JSON.parse(og.etapas), costos: JSON.parse(og.costos) };
  }
  return c.json({ ...sol, orden });
});

postventa.post("/solicitudes", requireAuth, requireArea("comercial"), async (c) => {
  const body = await c.req.json();
  if (!body.proyectoId) return c.json({ error: "proyectoId requerido" }, 400);
  if (!body.descripcion) return c.json({ error: "descripcion requerida" }, 400);
  const payload = c.get("jwtPayload") as { nombre?: string } | undefined;
  const db = drizzle(c.env.DB);
  const sol = {
    id: nuevoId("sg"),
    proyectoId: body.proyectoId,
    fecha: body.fecha ?? new Date().toISOString().slice(0, 10),
    descripcion: body.descripcion,
    abiertoBy: body.abiertoBy ?? payload?.nombre ?? "Sistema",
    estado: "abierta" as const,
    ordenGarantiaId: null,
  };
  await db.insert(solicitudesGarantia).values(sol);
  // Move project to "En garantía"
  await db.update(proyectos).set({ estado: "En garantía" }).where(eq(proyectos.id, body.proyectoId));
  return c.json(sol, 201);
});

postventa.patch("/solicitudes/:id", requireAuth, requireArea("comercial"), async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();
  const cambios: Record<string, unknown> = {};
  if (body.estado !== undefined) cambios.estado = body.estado;
  if (body.ordenGarantiaId !== undefined) cambios.ordenGarantiaId = body.ordenGarantiaId;
  await db.update(solicitudesGarantia).set(cambios).where(eq(solicitudesGarantia.id, id));
  const [updated] = await db.select().from(solicitudesGarantia).where(eq(solicitudesGarantia.id, id));
  if (!updated) return c.json({ error: "No encontrada" }, 404);
  return c.json(updated);
});

// ─── Órdenes de garantía ──────────────────────────────────────

postventa.post("/ordenes", requireAuth, requireArea("comercial"), async (c) => {
  const body = await c.req.json();
  if (!body.solicitudId) return c.json({ error: "solicitudId requerido" }, 400);
  const db = drizzle(c.env.DB);

  const [sol] = await db.select().from(solicitudesGarantia).where(eq(solicitudesGarantia.id, body.solicitudId));
  if (!sol) return c.json({ error: "Solicitud no encontrada" }, 404);

  const todas = await db.select().from(ordenesGarantia);
  const numero = `OG-${String(todas.length + 1).padStart(3, "0")}`;

  const og = {
    id: nuevoId("og"),
    numero,
    proyectoId: sol.proyectoId,
    solicitudId: body.solicitudId,
    fechaCreacion: new Date().toISOString().slice(0, 10),
    estado: "activa" as const,
    etapas: "[]",
    costos: "[]",
  };
  await db.insert(ordenesGarantia).values(og);

  // Link solicitud to orden and move to en_proceso
  await db
    .update(solicitudesGarantia)
    .set({ ordenGarantiaId: og.id, estado: "en_proceso" })
    .where(eq(solicitudesGarantia.id, body.solicitudId));

  return c.json({ ...og, etapas: [], costos: [] }, 201);
});

postventa.patch("/ordenes/:id", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();

  const [og] = await db.select().from(ordenesGarantia).where(eq(ordenesGarantia.id, id));
  if (!og) return c.json({ error: "No encontrada" }, 404);

  const etapas = JSON.parse(og.etapas) as any[];
  const costos = JSON.parse(og.costos) as any[];
  const cambios: Record<string, unknown> = {};

  if (body.agregarEtapa) {
    const nuevaEtapa = {
      id: nuevoId("eg"),
      ordenId: id,
      nombre: body.agregarEtapa.nombre,
      responsable: body.agregarEtapa.responsable,
      fechaEstimada: body.agregarEtapa.fechaEstimada,
      estado: "pendiente",
      observaciones: "",
    };
    cambios.etapas = JSON.stringify([...etapas, nuevaEtapa]);
  }

  if (body.completarEtapa) {
    cambios.etapas = JSON.stringify(
      etapas.map((et: any) =>
        et.id === body.completarEtapa ? { ...et, estado: "completada" } : et,
      ),
    );
  }

  if (body.agregarCosto) {
    cambios.costos = JSON.stringify([...costos, body.agregarCosto]);
  }

  if (body.estado !== undefined) {
    cambios.estado = body.estado;
    // On close: mark solicitud as closed + return project to Entregado
    if (body.estado === "completada") {
      await db
        .update(solicitudesGarantia)
        .set({ estado: "cerrada" })
        .where(eq(solicitudesGarantia.id, og.solicitudId));
      await db
        .update(proyectos)
        .set({ estado: "Entregado" })
        .where(eq(proyectos.id, og.proyectoId));
    }
  }

  await db.update(ordenesGarantia).set(cambios).where(eq(ordenesGarantia.id, id));
  const [updated] = await db.select().from(ordenesGarantia).where(eq(ordenesGarantia.id, id));
  return c.json({ ...updated, etapas: JSON.parse(updated!.etapas), costos: JSON.parse(updated!.costos) });
});

export const postventaRoutes = postventa;
