import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";

// ─── USUARIOS ──────────────────────────────────────────────

export const usuarios = sqliteTable(
  "usuarios",
  {
    id: text("id").primaryKey(),
    nombre: text("nombre").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    areas: text("areas").notNull().default("[]"), // JSON: Area[]
    esAdmin: integer("es_admin", { mode: "boolean" }).notNull().default(false),
    activo: integer("activo", { mode: "boolean" }).notNull().default(true),
    intentosFallidos: integer("intentos_fallidos").notNull().default(0),
    bloqueadoHasta: text("bloqueado_hasta"),
    creadoEn: text("creado_en").notNull(),
  },
  (t) => [uniqueIndex("uq_usuarios_email").on(t.email)],
);

// ─── COMERCIAL ─────────────────────────────────────────────

export const clientes = sqliteTable(
  "clientes",
  {
    id: text("id").primaryKey(),
    nombre: text("nombre").notNull(),
    contacto: text("contacto").notNull(),
    tipo: text("tipo", { enum: ["B2B", "B2C"] }).notNull(),
    empresa: text("empresa"),
    creadoEn: text("creado_en").notNull(),
  },
  (t) => [uniqueIndex("uq_clientes_contacto").on(t.contacto)],
);

export const proyectos = sqliteTable(
  "proyectos",
  {
    id: text("id").primaryKey(),
    codigo: text("codigo").notNull(),
    clienteId: text("cliente_id")
      .notNull()
      .references(() => clientes.id),
    tipo: text("tipo").notNull(),
    titulo: text("titulo").notNull().default(""),
    descripcionProyecto: text("descripcion_proyecto").notNull().default(""),
    aspectos: text("aspectos").notNull().default(""),
    caracteristicas: text("caracteristicas").notNull().default(""),
    fechaSolicitud: text("fecha_solicitud").notNull(),
    fechaEntrega: text("fecha_entrega"),
    estado: text("estado").notNull().default("Solicitud"),
    ultimaActualizacion: text("ultima_actualizacion").notNull(),
  },
  (t) => [
    uniqueIndex("uq_proyectos_codigo").on(t.codigo),
    index("idx_proyectos_cliente").on(t.clienteId),
    index("idx_proyectos_estado").on(t.estado),
  ],
);

// Arrays pequeños siempre leídos junto al proyecto → JSON columns
export const especificaciones = sqliteTable(
  "especificaciones",
  {
    id: text("id").primaryKey(),
    proyectoId: text("proyecto_id")
      .notNull()
      .references(() => proyectos.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    contenido: text("contenido").notNull().default(""),
    medidas: text("medidas").notNull().default(""),
    materiales: text("materiales").notNull().default(""),
    acabados: text("acabados").notNull().default(""),
    observaciones: text("observaciones").notNull().default(""),
    actualizadoEn: text("actualizado_en").notNull(),
    actualizadoPor: text("actualizado_por").notNull(),
  },
  (t) => [index("idx_espec_proyecto").on(t.proyectoId)],
);

export const cotizaciones = sqliteTable(
  "cotizaciones",
  {
    id: text("id").primaryKey(),
    proyectoId: text("proyecto_id")
      .notNull()
      .references(() => proyectos.id, { onDelete: "cascade" }),
    fecha: text("fecha").notNull(),
    descripcion: text("descripcion").notNull(),
    items: text("items").notNull().default("[]"), // JSON: CotizacionItem[]
    margenPct: real("margen_pct").notNull(),
    condicionesPago: text("condiciones_pago").notNull(),
    total: real("total").notNull(),
    creadaPor: text("creada_por").notNull(),
  },
  (t) => [index("idx_cotizaciones_proyecto").on(t.proyectoId)],
);

export const cambiosProyecto = sqliteTable(
  "cambios_proyecto",
  {
    id: text("id").primaryKey(),
    proyectoId: text("proyecto_id")
      .notNull()
      .references(() => proyectos.id, { onDelete: "cascade" }),
    fecha: text("fecha").notNull(),
    descripcion: text("descripcion").notNull(),
    responsable: text("responsable").notNull(),
    impactoCosto: real("impacto_costo").notNull().default(0),
    impactoDias: integer("impacto_dias").notNull().default(0),
  },
  (t) => [index("idx_cambios_proyecto").on(t.proyectoId)],
);

// ─── COMPRAS ───────────────────────────────────────────────

export const materialesBase = sqliteTable("materiales_base", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  categoria: text("categoria").notNull(),
  unidad: text("unidad").notNull(),
  costoUnitario: real("costo_unitario").notNull(),
  actualizadoEn: text("actualizado_en").notNull(),
});

export const proveedores = sqliteTable("proveedores", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  contacto: text("contacto").notNull(),
  telefono: text("telefono").notNull(),
  email: text("email").notNull(),
  materialesIds: text("materiales_ids").notNull().default("[]"), // JSON
  condicionesPago: text("condiciones_pago").notNull(),
  notas: text("notas"),
  creadoEn: text("creado_en").notNull(),
});

export const movimientosInventario = sqliteTable(
  "movimientos_inventario",
  {
    id: text("id").primaryKey(),
    materialId: text("material_id")
      .notNull()
      .references(() => materialesBase.id),
    tipo: text("tipo", {
      enum: ["entrada", "bloqueo", "consumo", "ajuste"],
    }).notNull(),
    cantidad: real("cantidad").notNull(),
    fecha: text("fecha").notNull(),
    proveedorId: text("proveedor_id").references(() => proveedores.id),
    proyectoId: text("proyecto_id").references(() => proyectos.id),
    responsable: text("responsable").notNull(),
    notas: text("notas"),
  },
  (t) => [index("idx_mov_material").on(t.materialId), index("idx_mov_proyecto").on(t.proyectoId)],
);

export const solicitudesCompra = sqliteTable(
  "solicitudes_compra",
  {
    id: text("id").primaryKey(),
    proyectoId: text("proyecto_id")
      .notNull()
      .references(() => proyectos.id),
    fechaCreacion: text("fecha_creacion").notNull(),
    estado: text("estado", {
      enum: ["pendiente", "en-gestion", "atendida"],
    })
      .notNull()
      .default("pendiente"),
    items: text("items").notNull().default("[]"), // JSON: SolicitudItem[]
    ordenCompraId: text("orden_compra_id"),
    generadaAutomaticamente: integer("generada_automaticamente", {
      mode: "boolean",
    })
      .notNull()
      .default(false),
  },
  (t) => [index("idx_sc_proyecto").on(t.proyectoId)],
);

export const ordenesCompra = sqliteTable(
  "ordenes_compra",
  {
    id: text("id").primaryKey(),
    codigo: text("codigo").notNull(),
    proyectoId: text("proyecto_id")
      .notNull()
      .references(() => proyectos.id),
    proveedorId: text("proveedor_id")
      .notNull()
      .references(() => proveedores.id),
    solicitudId: text("solicitud_id").references(() => solicitudesCompra.id),
    fechaCreacion: text("fecha_creacion").notNull(),
    fechaEntregaEstimada: text("fecha_entrega_estimada").notNull(),
    estado: text("estado", {
      enum: ["borrador", "enviada", "recibida", "cancelada"],
    })
      .notNull()
      .default("borrador"),
    items: text("items").notNull().default("[]"), // JSON: OrdenCompraItem[]
    notas: text("notas"),
  },
  (t) => [
    uniqueIndex("uq_oc_codigo").on(t.codigo),
    index("idx_oc_proveedor").on(t.proveedorId),
    index("idx_oc_proyecto").on(t.proyectoId),
  ],
);

// ─── ADMINISTRATIVA ────────────────────────────────────────

export const ordenesProduccion = sqliteTable(
  "ordenes_produccion",
  {
    id: text("id").primaryKey(),
    numero: text("numero").notNull(),
    proyectoId: text("proyecto_id")
      .notNull()
      .references(() => proyectos.id),
    cotizacionId: text("cotizacion_id")
      .notNull()
      .references(() => cotizaciones.id),
    fechaEmision: text("fecha_emision").notNull(),
    estado: text("estado", {
      enum: ["Emitida", "En producción", "Finalizada"],
    })
      .notNull()
      .default("Emitida"),
    responsable: text("responsable").notNull(),
    notas: text("notas"),
  },
  (t) => [uniqueIndex("uq_op_numero").on(t.numero), index("idx_op_proyecto").on(t.proyectoId)],
);

export const facturas = sqliteTable(
  "facturas",
  {
    id: text("id").primaryKey(),
    numero: text("numero").notNull(),
    proyectoId: text("proyecto_id")
      .notNull()
      .references(() => proyectos.id),
    cotizacionId: text("cotizacion_id")
      .notNull()
      .references(() => cotizaciones.id),
    clienteId: text("cliente_id")
      .notNull()
      .references(() => clientes.id),
    fechaEmision: text("fecha_emision").notNull(),
    fechaVencimiento: text("fecha_vencimiento").notNull(),
    monto: real("monto").notNull(),
    condicionesPago: text("condiciones_pago").notNull(),
    estado: text("estado", {
      enum: ["Pendiente", "Parcialmente pagada", "Pagada", "Anulada"],
    })
      .notNull()
      .default("Pendiente"),
  },
  (t) => [
    uniqueIndex("uq_facturas_numero").on(t.numero),
    index("idx_facturas_proyecto").on(t.proyectoId),
    index("idx_facturas_cliente").on(t.clienteId),
  ],
);

export const pagos = sqliteTable(
  "pagos",
  {
    id: text("id").primaryKey(),
    facturaId: text("factura_id")
      .notNull()
      .references(() => facturas.id, { onDelete: "cascade" }),
    proyectoId: text("proyecto_id")
      .notNull()
      .references(() => proyectos.id),
    fecha: text("fecha").notNull(),
    monto: real("monto").notNull(),
    tipo: text("tipo", {
      enum: ["Transferencia", "Efectivo", "Cheque", "Tarjeta"],
    }).notNull(),
    referencia: text("referencia"),
  },
  (t) => [index("idx_pagos_factura").on(t.facturaId)],
);

export const recursosTransporte = sqliteTable(
  "recursos_transporte",
  {
    id: text("id").primaryKey(),
    proyectoId: text("proyecto_id")
      .notNull()
      .references(() => proyectos.id),
    fechaProgramada: text("fecha_programada").notNull(),
    responsable: text("responsable").notNull(),
    vehiculo: text("vehiculo").notNull(),
    direccionDestino: text("direccion_destino").notNull(),
    observaciones: text("observaciones"),
    estado: text("estado", {
      enum: ["Programada", "En tránsito", "Entregada", "Cancelada"],
    })
      .notNull()
      .default("Programada"),
  },
  (t) => [index("idx_transporte_proyecto").on(t.proyectoId)],
);

export const ajustesCosto = sqliteTable(
  "ajustes_costo",
  {
    id: text("id").primaryKey(),
    proyectoId: text("proyecto_id")
      .notNull()
      .references(() => proyectos.id),
    fecha: text("fecha").notNull(),
    concepto: text("concepto").notNull(),
    monto: real("monto").notNull(),
    registradoPor: text("registrado_por").notNull(),
  },
  (t) => [index("idx_ajustes_proyecto").on(t.proyectoId)],
);

// ─── PRODUCCIÓN ────────────────────────────────────────────

export const etapasProduccion = sqliteTable(
  "etapas_produccion",
  {
    id: text("id").primaryKey(),
    ordenId: text("orden_id")
      .notNull()
      .references(() => ordenesProduccion.id, { onDelete: "cascade" }),
    proyectoId: text("proyecto_id")
      .notNull()
      .references(() => proyectos.id),
    nombre: text("nombre").notNull(),
    responsable: text("responsable").notNull(),
    fechaEstimada: text("fecha_estimada").notNull(),
    fechaCompletada: text("fecha_completada"),
    estado: text("estado", {
      enum: ["pendiente", "en_curso", "completada"],
    })
      .notNull()
      .default("pendiente"),
    // Arrays pequeños embebidos como JSON
    materiales: text("materiales").notNull().default("[]"),
    observaciones: text("observaciones").notNull().default("[]"),
  },
  (t) => [index("idx_etapas_orden").on(t.ordenId)],
);

export const entregasProduccion = sqliteTable(
  "entregas_produccion",
  {
    id: text("id").primaryKey(),
    ordenId: text("orden_id")
      .notNull()
      .references(() => ordenesProduccion.id),
    proyectoId: text("proyecto_id")
      .notNull()
      .references(() => proyectos.id),
    fecha: text("fecha").notNull(),
    responsable: text("responsable").notNull(),
    checklist: text("checklist").notNull().default("{}"), // JSON: ChecklistEntrega
    observaciones: text("observaciones"),
  },
  (t) => [index("idx_entregas_orden").on(t.ordenId)],
);

// ─── POSTVENTA ─────────────────────────────────────────────

export const solicitudesGarantia = sqliteTable(
  "solicitudes_garantia",
  {
    id: text("id").primaryKey(),
    proyectoId: text("proyecto_id")
      .notNull()
      .references(() => proyectos.id),
    fecha: text("fecha").notNull(),
    descripcion: text("descripcion").notNull(),
    abiertoBy: text("abierto_by").notNull(),
    estado: text("estado", {
      enum: ["abierta", "en_proceso", "cerrada"],
    })
      .notNull()
      .default("abierta"),
    ordenGarantiaId: text("orden_garantia_id"),
  },
  (t) => [index("idx_sg_proyecto").on(t.proyectoId)],
);

export const ordenesGarantia = sqliteTable(
  "ordenes_garantia",
  {
    id: text("id").primaryKey(),
    numero: text("numero").notNull(),
    proyectoId: text("proyecto_id")
      .notNull()
      .references(() => proyectos.id),
    solicitudId: text("solicitud_id")
      .notNull()
      .references(() => solicitudesGarantia.id),
    fechaCreacion: text("fecha_creacion").notNull(),
    estado: text("estado", { enum: ["activa", "completada"] })
      .notNull()
      .default("activa"),
    etapas: text("etapas").notNull().default("[]"), // JSON: EtapaGarantia[]
    costos: text("costos").notNull().default("[]"), // JSON: {concepto,monto,fecha}[]
  },
  (t) => [uniqueIndex("uq_og_numero").on(t.numero), index("idx_og_proyecto").on(t.proyectoId)],
);

// ─── Inferred types (útiles en las rutas de la API) ────────

export type InsertUsuario = typeof usuarios.$inferInsert;
export type SelectUsuario = typeof usuarios.$inferSelect;
export type InsertCliente = typeof clientes.$inferInsert;
export type SelectCliente = typeof clientes.$inferSelect;
export type InsertProyecto = typeof proyectos.$inferInsert;
export type SelectProyecto = typeof proyectos.$inferSelect;
export type InsertCotizacion = typeof cotizaciones.$inferInsert;
export type SelectCotizacion = typeof cotizaciones.$inferSelect;
export type InsertOrdenProduccion = typeof ordenesProduccion.$inferInsert;
export type SelectOrdenProduccion = typeof ordenesProduccion.$inferSelect;
export type InsertFactura = typeof facturas.$inferInsert;
export type SelectFactura = typeof facturas.$inferSelect;
