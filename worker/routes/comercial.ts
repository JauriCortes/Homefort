import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, asc } from "drizzle-orm";
import { clientes, proyectos, especificaciones, cotizaciones, cambiosProyecto } from "../db/schema";
import { requireAuth, requireArea, type JWTPayload } from "../middleware/auth";
import type { Env } from "../index";

const comercial = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

function nuevoId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

const TRANSICIONES: Record<string, string[]> = {
  Solicitud: ["En definición"],
  "En definición": ["En cotización"],
  "En cotización": ["Aprobada", "Rechazada", "En definición"],
  Aprobada: ["En producción"],
  Rechazada: [],
  "En producción": ["Entregado"],
  "En garantía": ["Entregado"],
  Entregado: ["En garantía"],
};

async function fetchProyectoCompleto(db: ReturnType<typeof drizzle>, id: string) {
  const [proyecto] = await db.select().from(proyectos).where(eq(proyectos.id, id)).limit(1);
  if (!proyecto) return null;

  const [especs, cots, cambios] = await Promise.all([
    db
      .select()
      .from(especificaciones)
      .where(eq(especificaciones.proyectoId, id))
      .orderBy(asc(especificaciones.version)),
    db.select().from(cotizaciones).where(eq(cotizaciones.proyectoId, id)),
    db.select().from(cambiosProyecto).where(eq(cambiosProyecto.proyectoId, id)),
  ]);

  return {
    ...proyecto,
    especificaciones: especs,
    cotizaciones: cots.map((c) => ({ ...c, items: JSON.parse(c.items) })),
    cambios,
  };
}

// ── Clientes ──────────────────────────────────────────────────────────────────

comercial.get("/clientes", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const lista = await db.select().from(clientes);
  return c.json(lista);
});

comercial.post("/clientes", requireAuth, requireArea("comercial"), async (c) => {
  const { nombre, contacto, tipo, empresa } = await c.req.json<{
    nombre: string;
    contacto: string;
    tipo: string;
    empresa?: string;
  }>();
  if (!nombre?.trim() || !contacto?.trim() || !tipo) {
    return c.json({ error: "nombre, contacto y tipo son obligatorios" }, 400);
  }
  const db = drizzle(c.env.DB);
  const [existing] = await db
    .select()
    .from(clientes)
    .where(eq(clientes.contacto, contacto.trim()))
    .limit(1);
  if (existing) return c.json({ error: "Ya existe un cliente con ese contacto" }, 409);

  const nuevo = {
    id: nuevoId("c"),
    nombre: nombre.trim(),
    contacto: contacto.trim(),
    tipo: tipo as "B2B" | "B2C",
    empresa: empresa?.trim() || null,
    creadoEn: new Date().toISOString().slice(0, 10),
  };
  await db.insert(clientes).values(nuevo);
  return c.json(nuevo, 201);
});

comercial.get("/clientes/:id", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const [cliente] = await db
    .select()
    .from(clientes)
    .where(eq(clientes.id, c.req.param("id")))
    .limit(1);
  if (!cliente) return c.json({ error: "Cliente no encontrado" }, 404);
  return c.json(cliente);
});

comercial.patch("/clientes/:id", requireAuth, requireArea("comercial"), async (c) => {
  const body = await c.req.json<{
    nombre?: string;
    contacto?: string;
    tipo?: string;
    empresa?: string;
  }>();
  const db = drizzle(c.env.DB);
  const [cliente] = await db
    .select()
    .from(clientes)
    .where(eq(clientes.id, c.req.param("id")))
    .limit(1);
  if (!cliente) return c.json({ error: "Cliente no encontrado" }, 404);

  if (body.contacto && body.contacto.trim() !== cliente.contacto) {
    const [dup] = await db
      .select()
      .from(clientes)
      .where(eq(clientes.contacto, body.contacto.trim()))
      .limit(1);
    if (dup) return c.json({ error: "Ya existe otro cliente con ese contacto" }, 409);
  }

  const patch = {
    nombre: body.nombre?.trim() ?? cliente.nombre,
    contacto: body.contacto?.trim() ?? cliente.contacto,
    tipo: (body.tipo ?? cliente.tipo) as "B2B" | "B2C",
    empresa: body.empresa !== undefined ? body.empresa.trim() || null : cliente.empresa,
  };
  await db.update(clientes).set(patch).where(eq(clientes.id, cliente.id));
  return c.json({ ...cliente, ...patch });
});

comercial.delete("/clientes/:id", requireAuth, requireArea("comercial"), async (c) => {
  const db = drizzle(c.env.DB);
  const [cliente] = await db
    .select()
    .from(clientes)
    .where(eq(clientes.id, c.req.param("id")))
    .limit(1);
  if (!cliente) return c.json({ error: "Cliente no encontrado" }, 404);

  const proyectosCliente = await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.clienteId, cliente.id));
  if (proyectosCliente.length > 0) {
    return c.json({ error: "No se puede eliminar un cliente con proyectos asociados" }, 422);
  }

  await db.delete(clientes).where(eq(clientes.id, cliente.id));
  return c.json({ ok: true });
});

// ── Proyectos ─────────────────────────────────────────────────────────────────

comercial.get("/proyectos", requireAuth, async (c) => {
  const clienteId = c.req.query("clienteId");
  const db = drizzle(c.env.DB);
  if (clienteId) {
    const lista = await db.select().from(proyectos).where(eq(proyectos.clienteId, clienteId));
    return c.json(lista);
  }
  const lista = await db.select().from(proyectos);
  return c.json(lista);
});

comercial.post("/proyectos", requireAuth, requireArea("comercial"), async (c) => {
  const {
    clienteId,
    titulo,
    descripcionProyecto,
    aspectos,
    caracteristicas,
    fechaEntrega,
    especificacionInicial,
  } = await c.req.json<{
    clienteId: string;
    titulo: string;
    descripcionProyecto?: string;
    aspectos?: string;
    caracteristicas?: string;
    fechaEntrega?: string;
    especificacionInicial?: string;
  }>();
  if (!clienteId || !titulo?.trim()) {
    return c.json({ error: "clienteId y titulo son obligatorios" }, 400);
  }
  const db = drizzle(c.env.DB);
  const [cliente] = await db.select().from(clientes).where(eq(clientes.id, clienteId)).limit(1);
  if (!cliente) return c.json({ error: "Cliente no encontrado" }, 404);

  const year = new Date().getFullYear();
  const todos = await db.select().from(proyectos);
  const n = todos.filter((p) => p.codigo.startsWith(`PRY-${year}`)).length + 1;
  const hoy = new Date().toISOString().slice(0, 10);

  const nuevo = {
    id: nuevoId("p"),
    codigo: `PRY-${year}-${String(n).padStart(3, "0")}`,
    clienteId,
    tipo: titulo.trim(),
    titulo: titulo.trim(),
    descripcionProyecto: descripcionProyecto?.trim() ?? "",
    aspectos: aspectos?.trim() ?? "",
    caracteristicas: caracteristicas?.trim() ?? "",
    fechaSolicitud: hoy,
    fechaEntrega: fechaEntrega ?? null,
    estado: "Solicitud",
    ultimaActualizacion: hoy,
  };
  await db.insert(proyectos).values(nuevo);

  let especs: (typeof especificaciones.$inferSelect)[] = [];
  if (especificacionInicial?.trim()) {
    const espec = {
      id: nuevoId("esp"),
      proyectoId: nuevo.id,
      version: 1,
      contenido: especificacionInicial.trim(),
      medidas: "",
      materiales: "",
      acabados: "",
      observaciones: "",
      actualizadoEn: hoy,
      actualizadoPor: "—",
    };
    await db.insert(especificaciones).values(espec);
    especs = [espec];
  }

  return c.json({ ...nuevo, especificaciones: especs, cotizaciones: [], cambios: [] }, 201);
});

comercial.get("/proyectos/:id", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const proyecto = await fetchProyectoCompleto(db, c.req.param("id"));
  if (!proyecto) return c.json({ error: "Proyecto no encontrado" }, 404);
  return c.json(proyecto);
});

comercial.patch("/proyectos/:id/estado", requireAuth, requireArea("comercial"), async (c) => {
  const { estado } = await c.req.json<{ estado: string }>();
  const db = drizzle(c.env.DB);
  const [proyecto] = await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.id, c.req.param("id")))
    .limit(1);
  if (!proyecto) return c.json({ error: "Proyecto no encontrado" }, 404);

  const validos = TRANSICIONES[proyecto.estado] ?? [];
  if (!validos.includes(estado)) {
    return c.json({ error: `Transición inválida: ${proyecto.estado} → ${estado}` }, 422);
  }

  const hoy = new Date().toISOString().slice(0, 10);
  await db
    .update(proyectos)
    .set({ estado, ultimaActualizacion: hoy })
    .where(eq(proyectos.id, proyecto.id));

  // TODO(Phase 3 — Compras): crear SolicitudCompra automática cuando estado === "Aprobada"

  const updated = await fetchProyectoCompleto(db, proyecto.id);
  return c.json(updated);
});

comercial.delete("/proyectos/:id", requireAuth, requireArea("comercial"), async (c) => {
  const db = drizzle(c.env.DB);
  const [proyecto] = await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.id, c.req.param("id")))
    .limit(1);
  if (!proyecto) return c.json({ error: "Proyecto no encontrado" }, 404);
  await db.delete(proyectos).where(eq(proyectos.id, proyecto.id));
  return c.json({ ok: true });
});

// ── Especificaciones ──────────────────────────────────────────────────────────

comercial.post(
  "/proyectos/:id/especificaciones",
  requireAuth,
  requireArea("comercial"),
  async (c) => {
    const { contenido, actualizadoPor } = await c.req.json<{
      contenido: string;
      actualizadoPor?: string;
    }>();
    if (!contenido?.trim()) {
      return c.json({ error: "contenido es obligatorio" }, 400);
    }
    const db = drizzle(c.env.DB);
    const [proyecto] = await db
      .select()
      .from(proyectos)
      .where(eq(proyectos.id, c.req.param("id")))
      .limit(1);
    if (!proyecto) return c.json({ error: "Proyecto no encontrado" }, 404);

    const especs = await db
      .select()
      .from(especificaciones)
      .where(eq(especificaciones.proyectoId, proyecto.id));

    const nueva = {
      id: nuevoId("esp"),
      proyectoId: proyecto.id,
      version: especs.length + 1,
      contenido: contenido.trim(),
      medidas: "",
      materiales: "",
      acabados: "",
      observaciones: "",
      actualizadoEn: new Date().toISOString().slice(0, 10),
      actualizadoPor: actualizadoPor ?? "—",
    };
    await db.insert(especificaciones).values(nueva);
    await db
      .update(proyectos)
      .set({ ultimaActualizacion: new Date().toISOString().slice(0, 10) })
      .where(eq(proyectos.id, proyecto.id));

    return c.json(nueva, 201);
  },
);

// ── Cotizaciones ──────────────────────────────────────────────────────────────

comercial.post("/proyectos/:id/cotizaciones", requireAuth, requireArea("comercial"), async (c) => {
  const { fecha, items, margenPct, condicionesPago, total, creadaPor } = await c.req.json<{
    fecha?: string;
    items: unknown[];
    margenPct: number;
    condicionesPago: string;
    total: number;
    creadaPor: string;
  }>();
  if (!items?.length) {
    return c.json({ error: "items es obligatorio" }, 400);
  }
  const db = drizzle(c.env.DB);
  const [proyecto] = await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.id, c.req.param("id")))
    .limit(1);
  if (!proyecto) return c.json({ error: "Proyecto no encontrado" }, 404);

  const nueva = {
    id: nuevoId("q"),
    proyectoId: proyecto.id,
    fecha: fecha ?? new Date().toISOString().slice(0, 10),
    descripcion: proyecto.titulo || proyecto.tipo,
    items: JSON.stringify(items),
    margenPct,
    condicionesPago,
    total,
    creadaPor,
  };
  await db.insert(cotizaciones).values(nueva);
  await db
    .update(proyectos)
    .set({ ultimaActualizacion: new Date().toISOString().slice(0, 10) })
    .where(eq(proyectos.id, proyecto.id));

  return c.json({ ...nueva, items }, 201);
});

// ── Cambios ───────────────────────────────────────────────────────────────────

comercial.post("/proyectos/:id/cambios", requireAuth, requireArea("comercial"), async (c) => {
  const { fecha, descripcion, responsable, impactoCosto, impactoDias } = await c.req.json<{
    fecha?: string;
    descripcion: string;
    responsable: string;
    impactoCosto?: number;
    impactoDias?: number;
  }>();
  if (!descripcion?.trim()) {
    return c.json({ error: "descripcion es obligatoria" }, 400);
  }
  const db = drizzle(c.env.DB);
  const [proyecto] = await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.id, c.req.param("id")))
    .limit(1);
  if (!proyecto) return c.json({ error: "Proyecto no encontrado" }, 404);

  const nuevo = {
    id: nuevoId("ch"),
    proyectoId: proyecto.id,
    fecha: fecha ?? new Date().toISOString().slice(0, 10),
    descripcion: descripcion.trim(),
    responsable,
    impactoCosto: Number(impactoCosto) || 0,
    impactoDias: Number(impactoDias) || 0,
  };
  await db.insert(cambiosProyecto).values(nuevo);
  await db
    .update(proyectos)
    .set({ ultimaActualizacion: new Date().toISOString().slice(0, 10) })
    .where(eq(proyectos.id, proyecto.id));

  return c.json(nuevo, 201);
});

export { comercial as comercialRoutes };
