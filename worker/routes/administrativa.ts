import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, desc } from "drizzle-orm";
import {
  ordenesProduccion,
  facturas,
  pagos,
  recursosTransporte,
  ajustesCosto,
  proyectos,
  cotizaciones,
  movimientosInventario,
  materialesBase,
} from "../db/schema";
import { requireAuth, requireArea } from "../middleware/auth";
import type { Env } from "../index";

const administrativa = new Hono<{ Bindings: Env }>();

function nuevoId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Órdenes de producción ────────────────────────────────────

administrativa.get("/ordenes-produccion", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const lista = await db.select().from(ordenesProduccion).orderBy(desc(ordenesProduccion.fechaEmision));
  return c.json(lista);
});

administrativa.post("/ordenes-produccion", requireAuth, requireArea("administrativa"), async (c) => {
  const body = await c.req.json();
  if (!body.proyectoId) return c.json({ error: "proyectoId requerido" }, 400);
  if (!body.responsable) return c.json({ error: "responsable requerido" }, 400);
  const db = drizzle(c.env.DB);

  // Resolve cotizacionId from project's latest cotizacion if not provided
  let cotizacionId = body.cotizacionId;
  if (!cotizacionId) {
    const cots = await db
      .select()
      .from(cotizaciones)
      .where(eq(cotizaciones.proyectoId, body.proyectoId))
      .orderBy(desc(cotizaciones.version));
    if (!cots[0]) return c.json({ error: "El proyecto no tiene cotización" }, 400);
    cotizacionId = cots[0].id;
  }

  const todas = await db.select().from(ordenesProduccion);
  const year = new Date().getFullYear();
  const delAnio = todas.filter((o) => o.numero.startsWith(`OP-${year}-`));
  const numero = `OP-${year}-${String(delAnio.length + 1).padStart(3, "0")}`;
  const op = {
    id: nuevoId("op"),
    numero,
    proyectoId: body.proyectoId,
    cotizacionId,
    fechaEmision: new Date().toISOString().slice(0, 10),
    estado: "Emitida" as const,
    responsable: body.responsable,
    notas: body.notas ?? null,
  };
  await db.insert(ordenesProduccion).values(op);
  // Move project to "En producción"
  await db.update(proyectos).set({ estado: "En producción" }).where(eq(proyectos.id, body.proyectoId));
  return c.json(op, 201);
});

administrativa.patch("/ordenes-produccion/:id", requireAuth, requireArea("administrativa"), async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();
  const cambios: Record<string, unknown> = {};
  if (body.estado !== undefined) cambios.estado = body.estado;
  if (body.notas !== undefined) cambios.notas = body.notas;
  if (body.responsable !== undefined) cambios.responsable = body.responsable;
  await db.update(ordenesProduccion).set(cambios).where(eq(ordenesProduccion.id, id));
  const [updated] = await db.select().from(ordenesProduccion).where(eq(ordenesProduccion.id, id));
  if (!updated) return c.json({ error: "No encontrado" }, 404);
  return c.json(updated);
});

// ─── Facturas ─────────────────────────────────────────────────

administrativa.get("/facturas", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const lista = await db.select().from(facturas).orderBy(desc(facturas.fechaEmision));
  return c.json(lista);
});

administrativa.post("/facturas", requireAuth, requireArea("administrativa"), async (c) => {
  const body = await c.req.json();
  if (!body.proyectoId) return c.json({ error: "proyectoId requerido" }, 400);
  if (!body.fechaVencimiento) return c.json({ error: "fechaVencimiento requerido" }, 400);
  const db = drizzle(c.env.DB);

  // Resolve cotizacion if not provided
  let cotizacionId = body.cotizacionId;
  let monto = body.monto;
  let condicionesPago = body.condicionesPago;
  let clienteId = body.clienteId;

  if (!cotizacionId || !monto) {
    const [proy] = await db.select().from(proyectos).where(eq(proyectos.id, body.proyectoId));
    if (!proy) return c.json({ error: "Proyecto no encontrado" }, 404);
    clienteId = clienteId ?? proy.clienteId;
    const cots = await db
      .select()
      .from(cotizaciones)
      .where(eq(cotizaciones.proyectoId, body.proyectoId))
      .orderBy(desc(cotizaciones.version));
    const cot = cots[0];
    if (!cot) return c.json({ error: "El proyecto no tiene cotización" }, 400);
    cotizacionId = cotizacionId ?? cot.id;
    monto = monto ?? cot.total;
    condicionesPago = condicionesPago ?? cot.condicionesPago;
  }

  const todas = await db.select().from(facturas);
  const year = new Date().getFullYear();
  const delAnio = todas.filter((f) => f.numero.startsWith(`FV-${year}-`));
  const numero = `FV-${year}-${String(delAnio.length + 1).padStart(4, "0")}`;

  const fac = {
    id: nuevoId("fac"),
    numero,
    proyectoId: body.proyectoId,
    cotizacionId,
    clienteId,
    fechaEmision: new Date().toISOString().slice(0, 10),
    fechaVencimiento: body.fechaVencimiento,
    monto,
    condicionesPago: condicionesPago ?? "Contado",
    estado: "Pendiente" as const,
  };
  await db.insert(facturas).values(fac);
  return c.json(fac, 201);
});

administrativa.patch("/facturas/:id", requireAuth, requireArea("administrativa"), async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();
  const cambios: Record<string, unknown> = {};
  if (body.estado !== undefined) cambios.estado = body.estado;
  await db.update(facturas).set(cambios).where(eq(facturas.id, id));
  const [updated] = await db.select().from(facturas).where(eq(facturas.id, id));
  if (!updated) return c.json({ error: "No encontrado" }, 404);
  return c.json(updated);
});

// ─── Pagos ────────────────────────────────────────────────────

administrativa.get("/pagos", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const lista = await db.select().from(pagos).orderBy(desc(pagos.fecha));
  return c.json(lista);
});

administrativa.post("/pagos", requireAuth, requireArea("administrativa"), async (c) => {
  const body = await c.req.json();
  if (!body.facturaId) return c.json({ error: "facturaId requerido" }, 400);
  if (!body.monto || body.monto <= 0) return c.json({ error: "monto inválido" }, 400);
  if (!body.tipo) return c.json({ error: "tipo requerido" }, 400);
  const db = drizzle(c.env.DB);

  const [fac] = await db.select().from(facturas).where(eq(facturas.id, body.facturaId));
  if (!fac) return c.json({ error: "Factura no encontrada" }, 404);

  const pagosPrevios = await db.select().from(pagos).where(eq(pagos.facturaId, body.facturaId));
  const pagado = pagosPrevios.reduce((s, p) => s + p.monto, 0);
  const saldo = Math.max(0, fac.monto - pagado);
  if (body.monto > saldo) return c.json({ error: `Monto supera el saldo pendiente (${saldo})` }, 400);

  const pago = {
    id: nuevoId("pg"),
    facturaId: body.facturaId,
    proyectoId: fac.proyectoId,
    fecha: body.fecha ?? new Date().toISOString().slice(0, 10),
    monto: Number(body.monto),
    tipo: body.tipo,
    referencia: body.referencia ?? null,
  };
  await db.insert(pagos).values(pago);

  // Update factura estado
  const nuevoSaldo = saldo - body.monto;
  const nuevoEstado = nuevoSaldo <= 0 ? "Pagada" : "Parcialmente pagada";
  await db.update(facturas).set({ estado: nuevoEstado }).where(eq(facturas.id, body.facturaId));

  return c.json({ ...pago, facturaEstado: nuevoEstado }, 201);
});

// Saldo de una factura
administrativa.get("/facturas/:id/saldo", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");
  const [fac] = await db.select().from(facturas).where(eq(facturas.id, id));
  if (!fac) return c.json({ error: "No encontrada" }, 404);
  const pagosList = await db.select().from(pagos).where(eq(pagos.facturaId, id));
  const pagado = pagosList.reduce((s, p) => s + p.monto, 0);
  return c.json({ saldo: Math.max(0, fac.monto - pagado) });
});

// ─── Transporte ───────────────────────────────────────────────

administrativa.get("/transporte", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const lista = await db.select().from(recursosTransporte).orderBy(desc(recursosTransporte.fechaProgramada));
  return c.json(lista);
});

administrativa.post("/transporte", requireAuth, requireArea("administrativa"), async (c) => {
  const body = await c.req.json();
  if (!body.proyectoId || !body.fechaProgramada || !body.responsable || !body.vehiculo || !body.direccionDestino)
    return c.json({ error: "Campos obligatorios faltantes" }, 400);
  const db = drizzle(c.env.DB);
  const rt = {
    id: nuevoId("tr"),
    proyectoId: body.proyectoId,
    fechaProgramada: body.fechaProgramada,
    responsable: body.responsable,
    vehiculo: body.vehiculo,
    direccionDestino: body.direccionDestino,
    observaciones: body.observaciones ?? null,
    estado: "Programada" as const,
  };
  await db.insert(recursosTransporte).values(rt);
  return c.json(rt, 201);
});

administrativa.patch("/transporte/:id", requireAuth, requireArea("administrativa"), async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();
  const cambios: Record<string, unknown> = {};
  if (body.estado !== undefined) cambios.estado = body.estado;
  if (body.observaciones !== undefined) cambios.observaciones = body.observaciones;
  await db.update(recursosTransporte).set(cambios).where(eq(recursosTransporte.id, id));
  const [updated] = await db.select().from(recursosTransporte).where(eq(recursosTransporte.id, id));
  if (!updated) return c.json({ error: "No encontrado" }, 404);
  return c.json(updated);
});

// ─── Costos ───────────────────────────────────────────────────

administrativa.get("/costos", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const lista = await db.select().from(ajustesCosto).orderBy(desc(ajustesCosto.fecha));
  return c.json(lista);
});

administrativa.post("/costos", requireAuth, requireArea("administrativa"), async (c) => {
  const body = await c.req.json();
  if (!body.proyectoId) return c.json({ error: "proyectoId requerido" }, 400);
  if (!body.concepto) return c.json({ error: "concepto requerido" }, 400);
  if (body.monto === undefined) return c.json({ error: "monto requerido" }, 400);
  const payload = c.get("jwtPayload") as { nombre?: string } | undefined;
  const db = drizzle(c.env.DB);
  const ajuste = {
    id: nuevoId("aj"),
    proyectoId: body.proyectoId,
    fecha: body.fecha ?? new Date().toISOString().slice(0, 10),
    concepto: body.concepto,
    monto: Number(body.monto),
    registradoPor: payload?.nombre ?? "Sistema",
  };
  await db.insert(ajustesCosto).values(ajuste);
  return c.json(ajuste, 201);
});

// Resumen costos por proyecto (cotizado vs real)
administrativa.get("/costos/resumen", requireAuth, async (c) => {
  const db = drizzle(c.env.DB);

  const [proyList, cotList, ajustesList, movList, matList] = await Promise.all([
    db.select().from(proyectos),
    db.select().from(cotizaciones),
    db.select().from(ajustesCosto),
    db.select().from(movimientosInventario),
    db.select().from(materialesBase),
  ]);

  const resumen = proyList
    .filter((p) => cotList.some((c) => c.proyectoId === p.id))
    .map((p) => {
      const cots = cotList.filter((c) => c.proyectoId === p.id).sort((a, b) => b.version - a.version);
      const cotizado = cots[0]?.total ?? 0;
      const costoAjustes = ajustesList
        .filter((a) => a.proyectoId === p.id)
        .reduce((s, a) => s + a.monto, 0);
      const costoMateriales = movList
        .filter((m) => m.proyectoId === p.id && m.tipo === "consumo")
        .reduce((s, m) => {
          const mat = matList.find((x) => x.id === m.materialId);
          return s + (mat ? mat.costoUnitario * m.cantidad : 0);
        }, 0);
      return {
        proyectoId: p.id,
        codigo: p.codigo,
        estado: p.estado,
        cotizado,
        costoReal: costoAjustes + costoMateriales,
      };
    });

  return c.json(resumen);
});

export const administrativaRoutes = administrativa;
