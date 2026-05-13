// src/lib/store.ts
// Store unificado HF HomeFort — persiste en localStorage

// ─── Tipos de autenticación ────────────────────────────────
export type Area = "comercial" | "compras" | "produccion" | "administrativa";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  passwordHash: string;
  areas: Area[];
  esAdmin: boolean;
  activo: boolean;
  creadoEn: string;
  intentosFallidos: number;
  bloqueadoHasta?: string;
}

export interface Sesion {
  usuarioId: string;
  iniciadaEn: string;
  ultimaActividad: string;
}

export const SESION_INACTIVIDAD_MIN = 30;
export const BLOQUEO_MIN = 15;
export const MAX_INTENTOS = 5;

export function hashPassword(plain: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < plain.length; i++) {
    h ^= plain.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return `mock$${h.toString(16).padStart(8, "0")}$${plain.length}`;
}
export function verifyPassword(plain: string, hash: string): boolean {
  return hashPassword(plain) === hash;
}

export type LoginResultado =
  | { ok: true }
  | { ok: false; motivo: "credenciales" | "bloqueado" | "inactivo"; minutosRestantes?: number };

// ─── Épica 1 — Comercial ───────────────────────────────────
export type TipoCliente = "B2B" | "B2C";

export interface Cliente {
  id: string;
  nombre: string;
  contacto: string;
  tipo: TipoCliente;
  empresa?: string;
  creadoEn: string;
}

export type EstadoProyecto =
  | "Solicitud"
  | "En definición"
  | "En cotización"
  | "Aprobada"
  | "Rechazada"
  | "En producción"
  | "En garantía"
  | "Entregado";

export const TRANSICIONES: Record<EstadoProyecto, EstadoProyecto[]> = {
  Solicitud: ["En definición"],
  "En definición": ["En cotización"],
  "En cotización": ["Aprobada", "Rechazada", "En definición"],
  Aprobada: ["En producción"],
  Rechazada: [],
  "En producción": ["Entregado"],
  "En garantía": ["Entregado"],
  Entregado: ["En garantía"],
};

export type TipoProyecto =
  | "Cocina integral"
  | "Closet"
  | "Mobiliario oficina"
  | "Puertas"
  | "Mobiliario comercial"
  | "Otro";

export interface Especificacion {
  version: number;
  contenido: string;
  medidas?: string;
  materiales?: string;
  acabados?: string;
  observaciones?: string;
  actualizadoEn: string;
  actualizadoPor: string;
}

export interface CotizacionItem {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
}

export interface Cotizacion {
  id: string;
  proyectoId: string;
  fecha: string;
  descripcion: string;
  items: CotizacionItem[];
  margenPct: number;
  condicionesPago: string;
  total: number;
  creadaPor: string;
}

export interface CambioProyecto {
  id: string;
  proyectoId: string;
  fecha: string;
  descripcion: string;
  responsable: string;
  impactoCosto: number;
  impactoDias: number;
}

export interface Proyecto {
  id: string;
  codigo: string;
  clienteId: string;
  tipo: string;
  titulo: string;
  descripcionProyecto: string;
  aspectos: string;
  caracteristicas: string;
  fechaSolicitud: string;
  fechaEntrega?: string | null;
  estado: EstadoProyecto;
  especificaciones: Especificacion[];
  cotizaciones: Cotizacion[];
  cambios: CambioProyecto[];
  ultimaActualizacion: string;
}

// ─── Épica 2 — Compras ─────────────────────────────────────
export interface MaterialBase {
  id: string;
  nombre: string;
  categoria: string;
  unidad: string;
  costoUnitario: number;
  actualizadoEn: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  materialesIds: string[];
  condicionesPago: string;
  notas?: string;
  creadoEn: string;
}

export type TipoMovimiento = "entrada" | "bloqueo" | "consumo" | "ajuste";

export interface MovimientoInventario {
  id: string;
  materialId: string;
  tipo: TipoMovimiento;
  cantidad: number;
  fecha: string;
  proveedorId?: string;
  proyectoId?: string;
  responsable: string;
  notas?: string;
}

export type EstadoSolicitudCompra = "pendiente" | "en-gestion" | "atendida";

export interface SolicitudCompra {
  id: string;
  proyectoId: string;
  fechaCreacion: string;
  estado: EstadoSolicitudCompra;
  items: { materialId: string; cantidadFaltante: number }[];
  ordenCompraId?: string;
  generadaAutomaticamente: boolean;
}

export type EstadoOrdenCompra = "borrador" | "enviada" | "recibida" | "cancelada";

export interface OrdenCompra {
  id: string;
  codigo: string;
  proyectoId: string;
  proveedorId: string;
  solicitudId?: string;
  fechaCreacion: string;
  fechaEntregaEstimada: string;
  estado: EstadoOrdenCompra;
  items: { materialId: string; cantidad: number; precioUnitario: number }[];
  notas?: string;
}

// ─── Épica 3 — Administrativa ──────────────────────────────
export type EstadoOrdenProduccion = "Emitida" | "En producción" | "Finalizada";

export interface OrdenProduccion {
  id: string;
  numero: string;
  proyectoId: string;
  cotizacionId: string;
  fechaEmision: string;
  estado: EstadoOrdenProduccion;
  responsable: string;
  notas?: string;
}

export type EstadoFactura = "Pendiente" | "Parcialmente pagada" | "Pagada" | "Anulada";

export interface Factura {
  id: string;
  numero: string;
  proyectoId: string;
  cotizacionId: string;
  clienteId: string;
  fechaEmision: string;
  fechaVencimiento: string;
  monto: number;
  condicionesPago: string;
  estado: EstadoFactura;
}

export type TipoPago = "Transferencia" | "Efectivo" | "Cheque" | "Tarjeta";

export interface Pago {
  id: string;
  facturaId: string;
  proyectoId: string;
  fecha: string;
  monto: number;
  tipo: TipoPago;
  referencia?: string;
}

export type EstadoTransporte = "Programada" | "En tránsito" | "Entregada" | "Cancelada";

export interface RecursoTransporte {
  id: string;
  proyectoId: string;
  fechaProgramada: string;
  responsable: string;
  vehiculo: string;
  direccionDestino: string;
  observaciones?: string;
  estado: EstadoTransporte;
}

export interface AjusteCosto {
  id: string;
  proyectoId: string;
  fecha: string;
  concepto: string;
  monto: number;
  registradoPor: string;
}

// ─── Épica 4 — Producción ──────────────────────────────────
export type EstadoEtapa = "pendiente" | "en_curso" | "completada";

export interface MaterialEtapa {
  materialId: string;
  cantidad: number;
  cantidadReal?: number;
  observacion?: string;
}

export interface Observacion {
  fecha: string;
  descripcion: string;
  esRetrabajo: boolean;
  responsable: string;
}

export interface EtapaProduccion {
  id: string;
  ordenId: string;
  proyectoId: string;
  nombre: string;
  responsable: string;
  fechaEstimada: string;
  fechaCompletada?: string;
  estado: EstadoEtapa;
  materiales: MaterialEtapa[];
  observaciones: Observacion[];
}

export interface ChecklistEntrega {
  medidas: boolean;
  acabados: boolean;
  estadoProducto: boolean;
  documentacion: boolean;
}

export interface EntregaProduccion {
  id: string;
  ordenId: string;
  proyectoId: string;
  fecha: string;
  responsable: string;
  checklist: ChecklistEntrega;
  observaciones?: string;
}

// ─── Épica 5 — Postventa ───────────────────────────────────
export type EstadoGarantia = "abierta" | "en_proceso" | "cerrada";

export interface SolicitudGarantia {
  id: string;
  proyectoId: string;
  fecha: string;
  descripcion: string;
  abiertoBy: string;
  estado: EstadoGarantia;
  ordenGarantiaId?: string;
}

export interface EtapaGarantia {
  id: string;
  ordenId: string;
  nombre: string;
  responsable: string;
  fechaEstimada: string;
  estado: EstadoEtapa;
  observaciones: string;
}

export interface OrdenGarantia {
  id: string;
  numero: string;
  proyectoId: string;
  solicitudId: string;
  fechaCreacion: string;
  estado: "activa" | "completada";
  etapas: EtapaGarantia[];
  costos: { concepto: string; monto: number; fecha: string }[];
}

// ─── Store implementation ──────────────────────────────────

export const nuevoId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;

function lsGet<T>(key: string, def: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
}
function lsSet(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

// Datos seed iniciales (se usan solo si localStorage está vacío)
const SEED_USUARIOS: Usuario[] = [
  {
    id: "u1",
    nombre: "Laura Martínez",
    email: "laura@homefort.co",
    passwordHash: hashPassword("comercial123"),
    areas: ["comercial"],
    esAdmin: false,
    activo: true,
    creadoEn: "2025-01-10",
    intentosFallidos: 0,
  },
  {
    id: "u2",
    nombre: "Carlos Pérez",
    email: "carlos@homefort.co",
    passwordHash: hashPassword("compras123"),
    areas: ["compras"],
    esAdmin: false,
    activo: true,
    creadoEn: "2025-01-10",
    intentosFallidos: 0,
  },
  {
    id: "u3",
    nombre: "María Gómez",
    email: "maria@homefort.co",
    passwordHash: hashPassword("produccion123"),
    areas: ["produccion"],
    esAdmin: false,
    activo: true,
    creadoEn: "2025-01-10",
    intentosFallidos: 0,
  },
  {
    id: "u4",
    nombre: "Andrés Ríos",
    email: "andres@homefort.co",
    passwordHash: hashPassword("admin123"),
    areas: ["administrativa"],
    esAdmin: true,
    activo: true,
    creadoEn: "2025-01-10",
    intentosFallidos: 0,
  },
];

const SEED_CLIENTES: Cliente[] = [
  {
    id: "c1",
    nombre: "Diana Restrepo",
    contacto: "diana.restrepo@correo.com",
    tipo: "B2C",
    creadoEn: "2025-03-04",
  },
  {
    id: "c2",
    nombre: "Mauricio Vélez",
    contacto: "+57 311 555 0142",
    tipo: "B2C",
    creadoEn: "2025-03-12",
  },
  {
    id: "c3",
    nombre: "Constructora Andina S.A.S.",
    contacto: "compras@constructoraandina.co",
    tipo: "B2B",
    empresa: "Constructora Andina S.A.S.",
    creadoEn: "2025-02-20",
  },
  {
    id: "c4",
    nombre: "Hotel Bosque Verde",
    contacto: "operaciones@hotelbosqueverde.com",
    tipo: "B2B",
    empresa: "Hotel Bosque Verde",
    creadoEn: "2025-01-15",
  },
];

const SEED_MATERIALES: MaterialBase[] = [
  {
    id: "m1",
    nombre: "MDF enchapado nogal 18mm",
    categoria: "Tableros",
    unidad: "m²",
    costoUnitario: 145000,
    actualizadoEn: "2025-03-01",
  },
  {
    id: "m2",
    nombre: "Aglomerado melamínico gris 15mm",
    categoria: "Tableros",
    unidad: "m²",
    costoUnitario: 78000,
    actualizadoEn: "2025-03-01",
  },
  {
    id: "m3",
    nombre: "Aglomerado melamínico blanco 15mm",
    categoria: "Tableros",
    unidad: "m²",
    costoUnitario: 72000,
    actualizadoEn: "2025-03-01",
  },
  {
    id: "m4",
    nombre: "Granito negro absoluto",
    categoria: "Pétreos",
    unidad: "m²",
    costoUnitario: 320000,
    actualizadoEn: "2025-02-20",
  },
  {
    id: "m5",
    nombre: "Bisagra cazoleta Blum 110°",
    categoria: "Herrajes",
    unidad: "und",
    costoUnitario: 18500,
    actualizadoEn: "2025-03-10",
  },
  {
    id: "m6",
    nombre: "Corredera Blum Tandem 500mm",
    categoria: "Herrajes",
    unidad: "und",
    costoUnitario: 92000,
    actualizadoEn: "2025-03-10",
  },
  {
    id: "m7",
    nombre: "Canto PVC 2mm",
    categoria: "Cantos",
    unidad: "ml",
    costoUnitario: 3200,
    actualizadoEn: "2025-02-28",
  },
  {
    id: "m8",
    nombre: "Laca poliuretano mate",
    categoria: "Acabados",
    unidad: "kg",
    costoUnitario: 65000,
    actualizadoEn: "2025-03-05",
  },
];

const SEED_PROVEEDORES: Proveedor[] = [
  {
    id: "pv1",
    nombre: "Maderas del Norte",
    contacto: "ventas@madersdelnorte.co",
    telefono: "601 234 5678",
    email: "ventas@madersdelnorte.co",
    materialesIds: ["m1", "m2", "m3"],
    condicionesPago: "30 días",
    creadoEn: "2025-01-15",
  },
  {
    id: "pv2",
    nombre: "Blum Colombia",
    contacto: "hernando@blum.co",
    telefono: "601 345 6789",
    email: "hernando@blum.co",
    materialesIds: ["m5", "m6"],
    condicionesPago: "Contado",
    creadoEn: "2025-01-15",
  },
];

const SEED_PROYECTOS: Proyecto[] = [
  {
    id: "p1",
    codigo: "PRY-2025-001",
    clienteId: "c1",
    tipo: "Cocina integral",
    titulo: "Cocina integral apartamento 401",
    descripcionProyecto: "Cocina integral en nogal con isla central",
    aspectos: "",
    caracteristicas: "Incluir isla central de 1.20m",
    fechaSolicitud: "2025-03-04",
    estado: "En cotización",
    ultimaActualizacion: "2025-03-09",
    especificaciones: [
      {
        version: 1,
        contenido:
          "L: 3.20m x 0.60m, alto 0.90m\nMateriales: MDF enchapado nogal, granito negro\nAcabados: Laca mate, herrajes Blum\nIsla central de 1.20m",
        actualizadoEn: "2025-03-06",
        actualizadoPor: "Laura Martínez",
      },
    ],
    cotizaciones: [
      {
        id: "q1",
        proyectoId: "p1",
        fecha: "2025-03-09",
        descripcion: "Cocina integral en nogal con isla",
        items: [
          {
            descripcion: "Módulos bajos y altos",
            cantidad: 1,
            precioUnitario: 6000000,
            precioTotal: 6000000,
          },
          {
            descripcion: "Isla central",
            cantidad: 1,
            precioUnitario: 2200000,
            precioTotal: 2200000,
          },
        ],
        margenPct: 25,
        condicionesPago: "50% anticipo, 50% contra entrega",
        total: 10250000,
        creadaPor: "Laura Martínez",
      },
    ],
    cambios: [],
  },
  {
    id: "p2",
    codigo: "PRY-2025-002",
    clienteId: "c3",
    tipo: "Mobiliario oficina",
    titulo: "Mobiliario oficina Cra 11",
    descripcionProyecto: "12 puestos de trabajo modulares",
    aspectos: "Entrega en obra Cra 11 #93-46",
    caracteristicas: "Canto PVC 2mm",
    fechaSolicitud: "2025-02-22",
    estado: "Aprobada",
    ultimaActualizacion: "2025-03-01",
    especificaciones: [
      {
        version: 1,
        contenido:
          "12 puestos 1.40x0.70m\nMateriales: Aglomerado melamínico gris\nAcabados: Canto PVC 2mm\nEntrega en obra Cra 11 #93-46",
        actualizadoEn: "2025-02-25",
        actualizadoPor: "Laura Martínez",
      },
    ],
    cotizaciones: [
      {
        id: "q2",
        proyectoId: "p2",
        fecha: "2025-02-26",
        descripcion: "12 puestos de trabajo modulares",
        items: [
          {
            descripcion: "Puestos 1.40x0.70",
            cantidad: 12,
            precioUnitario: 1066666,
            precioTotal: 12799992,
          },
        ],
        margenPct: 22,
        condicionesPago: "60% anticipo, 40% entrega",
        total: 15616000,
        creadaPor: "Laura Martínez",
      },
    ],
    cambios: [
      {
        id: "ch1",
        proyectoId: "p2",
        fecha: "2025-03-01",
        descripcion: "Cambio de tono melamina a gris claro",
        responsable: "Laura Martínez",
        impactoCosto: 0,
        impactoDias: 2,
      },
    ],
  },
  {
    id: "p3",
    codigo: "PRY-2025-003",
    clienteId: "c4",
    tipo: "Puertas",
    titulo: "Puertas habitaciones",
    descripcionProyecto: "",
    aspectos: "",
    caracteristicas: "",
    fechaSolicitud: "2025-03-18",
    estado: "Solicitud",
    ultimaActualizacion: "2025-03-18",
    especificaciones: [],
    cotizaciones: [],
    cambios: [],
  },
  {
    id: "p4",
    codigo: "PRY-2025-004",
    clienteId: "c2",
    tipo: "Closet",
    titulo: "Closet cuarto principal",
    descripcionProyecto: "Closet empotrado cuarto principal",
    aspectos: "",
    caracteristicas: "",
    fechaSolicitud: "2025-01-20",
    estado: "Entregado",
    ultimaActualizacion: "2025-04-10",
    especificaciones: [
      {
        version: 1,
        contenido: "2.40x2.40m\nMateriales: MDF blanco\nAcabados: Laca satinada",
        actualizadoEn: "2025-01-25",
        actualizadoPor: "Laura Martínez",
      },
    ],
    cotizaciones: [
      {
        id: "q3",
        proyectoId: "p4",
        fecha: "2025-01-28",
        descripcion: "Closet empotrado",
        items: [
          {
            descripcion: "Cuerpo del closet",
            cantidad: 1,
            precioUnitario: 4400000,
            precioTotal: 4400000,
          },
        ],
        margenPct: 20,
        condicionesPago: "100% contra entrega",
        total: 5280000,
        creadaPor: "Laura Martínez",
      },
    ],
    cambios: [],
  },
];

type Listener = () => void;

class Store {
  private listeners = new Set<Listener>();
  private _mem: Partial<Record<string, unknown>> = {};
  private _sesionMem: { v: Sesion | null } | undefined;

  // ─── Persistencia ─────────────────────
  private load<T>(key: string, seed: T): T {
    if (key in this._mem) return this._mem[key] as T;
    const v = lsGet<T | null>(key, null);
    const result = v !== null ? v : seed;
    if (v === null) lsSet(key, seed);
    this._mem[key] = result;
    return result;
  }
  private save(key: string, val: unknown) {
    this._mem[key] = val;
    lsSet(key, val);
    this.emit();
  }

  // ─── Datos ────────────────────────────
  get usuarios(): Usuario[] {
    return this.load("hf_usuarios", SEED_USUARIOS);
  }
  set usuarios(v: Usuario[]) {
    this.save("hf_usuarios", v);
  }

  get sesion(): Sesion | null {
    if (this._sesionMem !== undefined) return this._sesionMem.v;
    const v = lsGet<Sesion | null>("hf_sesion", null);
    this._sesionMem = { v };
    return v;
  }
  set sesion(v: Sesion | null) {
    this._sesionMem = { v };
    lsSet("hf_sesion", v);
    this.emit();
  }

  get clientes(): Cliente[] {
    return this.load("hf_clientes", SEED_CLIENTES);
  }
  set clientes(v: Cliente[]) {
    this.save("hf_clientes", v);
  }

  get proyectos(): Proyecto[] {
    return this.load("hf_proyectos", SEED_PROYECTOS);
  }
  set proyectos(v: Proyecto[]) {
    this.save("hf_proyectos", v);
  }

  get materialesBase(): MaterialBase[] {
    return this.load("hf_materiales", SEED_MATERIALES);
  }
  set materialesBase(v: MaterialBase[]) {
    this.save("hf_materiales", v);
  }

  get proveedores(): Proveedor[] {
    return this.load("hf_proveedores", SEED_PROVEEDORES);
  }
  set proveedores(v: Proveedor[]) {
    this.save("hf_proveedores", v);
  }

  get movimientos(): MovimientoInventario[] {
    return this.load("hf_movimientos", []);
  }
  set movimientos(v: MovimientoInventario[]) {
    this.save("hf_movimientos", v);
  }

  get solicitudesCompra(): SolicitudCompra[] {
    return this.load("hf_solicitudes_compra", []);
  }
  set solicitudesCompra(v: SolicitudCompra[]) {
    this.save("hf_solicitudes_compra", v);
  }

  get ordenesCompra(): OrdenCompra[] {
    return this.load("hf_ordenes_compra", []);
  }
  set ordenesCompra(v: OrdenCompra[]) {
    this.save("hf_ordenes_compra", v);
  }

  get ordenesProduccion(): OrdenProduccion[] {
    return this.load("hf_ordenes_produccion", []);
  }
  set ordenesProduccion(v: OrdenProduccion[]) {
    this.save("hf_ordenes_produccion", v);
  }

  get etapas(): EtapaProduccion[] {
    return this.load("hf_etapas", []);
  }
  set etapas(v: EtapaProduccion[]) {
    this.save("hf_etapas", v);
  }

  get entregas(): EntregaProduccion[] {
    return this.load("hf_entregas", []);
  }
  set entregas(v: EntregaProduccion[]) {
    this.save("hf_entregas", v);
  }

  get facturas(): Factura[] {
    return this.load("hf_facturas", []);
  }
  set facturas(v: Factura[]) {
    this.save("hf_facturas", v);
  }

  get pagos(): Pago[] {
    return this.load("hf_pagos", []);
  }
  set pagos(v: Pago[]) {
    this.save("hf_pagos", v);
  }

  get transportes(): RecursoTransporte[] {
    return this.load("hf_transportes", []);
  }
  set transportes(v: RecursoTransporte[]) {
    this.save("hf_transportes", v);
  }

  get ajustesCosto(): AjusteCosto[] {
    return this.load("hf_ajustes_costo", []);
  }
  set ajustesCosto(v: AjusteCosto[]) {
    this.save("hf_ajustes_costo", v);
  }

  get solicitudesGarantia(): SolicitudGarantia[] {
    return this.load("hf_sol_garantia", []);
  }
  set solicitudesGarantia(v: SolicitudGarantia[]) {
    this.save("hf_sol_garantia", v);
  }

  get ordenesGarantia(): OrdenGarantia[] {
    return this.load("hf_ord_garantia", []);
  }
  set ordenesGarantia(v: OrdenGarantia[]) {
    this.save("hf_ord_garantia", v);
  }

  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }
  emit() {
    this.listeners.forEach((l) => l());
  }

  // ─── Auth ─────────────────────────────
  usuarioActivo(): Usuario | null {
    const s = this.sesion;
    if (!s) return null;
    if (Date.now() - new Date(s.ultimaActividad).getTime() > SESION_INACTIVIDAD_MIN * 60_000) {
      this.sesion = null;
      return null;
    }
    return this.usuarios.find((u) => u.id === s.usuarioId) ?? null;
  }
  registrarActividad() {
    const s = this.sesion;
    if (s) {
      s.ultimaActividad = new Date().toISOString();
      lsSet("hf_sesion", s);
      this._sesionMem = { v: s };
    }
  }
  login(email: string, password: string): LoginResultado {
    const usuarios = this.usuarios;
    const u = usuarios.find((x) => x.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (!u) return { ok: false, motivo: "credenciales" };
    if (!u.activo) return { ok: false, motivo: "inactivo" };
    if (u.bloqueadoHasta) {
      const r = new Date(u.bloqueadoHasta).getTime() - Date.now();
      if (r > 0) return { ok: false, motivo: "bloqueado", minutosRestantes: Math.ceil(r / 60_000) };
      u.bloqueadoHasta = undefined;
      u.intentosFallidos = 0;
    }
    if (!verifyPassword(password, u.passwordHash)) {
      u.intentosFallidos += 1;
      if (u.intentosFallidos >= MAX_INTENTOS) {
        u.bloqueadoHasta = new Date(Date.now() + BLOQUEO_MIN * 60_000).toISOString();
        this.usuarios = usuarios;
        return { ok: false, motivo: "bloqueado", minutosRestantes: BLOQUEO_MIN };
      }
      this.usuarios = usuarios;
      return { ok: false, motivo: "credenciales" };
    }
    u.intentosFallidos = 0;
    u.bloqueadoHasta = undefined;
    this.usuarios = usuarios;
    const ahora = new Date().toISOString();
    this.sesion = { usuarioId: u.id, iniciadaEn: ahora, ultimaActividad: ahora };
    return { ok: true };
  }
  logout() {
    this.sesion = null;
  }
  puedeEditar(area: Area) {
    const u = this.usuarioActivo();
    return !!u && (u.esAdmin || u.areas.includes(area));
  }

  // ─── Usuarios ─────────────────────────
  usuario(id: string) {
    return this.usuarios.find((u) => u.id === id);
  }
  emailUsuarioExiste(email: string, exceptoId?: string) {
    return this.usuarios.some(
      (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase() && u.id !== exceptoId,
    );
  }
  crearUsuario(data: {
    nombre: string;
    email: string;
    password: string;
    areas: Area[];
    esAdmin: boolean;
  }) {
    const u: Usuario = {
      id: nuevoId("u"),
      nombre: data.nombre.trim(),
      email: data.email.trim(),
      passwordHash: hashPassword(data.password),
      areas: [...data.areas],
      esAdmin: data.esAdmin,
      activo: true,
      creadoEn: new Date().toISOString().slice(0, 10),
      intentosFallidos: 0,
    };
    this.usuarios = [...this.usuarios, u];
    return u;
  }
  actualizarUsuario(
    id: string,
    cambios: Partial<Pick<Usuario, "nombre" | "email" | "areas" | "esAdmin" | "activo">>,
  ) {
    this.usuarios = this.usuarios.map((u) => (u.id === id ? { ...u, ...cambios } : u));
  }
  cambiarPassword(id: string, nueva: string) {
    this.usuarios = this.usuarios.map((u) =>
      u.id === id
        ? {
            ...u,
            passwordHash: hashPassword(nueva),
            intentosFallidos: 0,
            bloqueadoHasta: undefined,
          }
        : u,
    );
  }
  desbloquearUsuario(id: string) {
    this.usuarios = this.usuarios.map((u) =>
      u.id === id ? { ...u, bloqueadoHasta: undefined, intentosFallidos: 0 } : u,
    );
  }

  // ─── Clientes ─────────────────────────
  cliente(id: string) {
    return this.clientes.find((c) => c.id === id);
  }
  contactoExiste(contacto: string, exceptoId?: string) {
    return this.clientes.some(
      (c) =>
        c.contacto.trim().toLowerCase() === contacto.trim().toLowerCase() && c.id !== exceptoId,
    );
  }
  crearCliente(data: Omit<Cliente, "id" | "creadoEn">) {
    const c: Cliente = {
      ...data,
      id: nuevoId("c"),
      creadoEn: new Date().toISOString().slice(0, 10),
    };
    this.clientes = [...this.clientes, c];
    return c;
  }
  actualizarCliente(id: string, data: Partial<Omit<Cliente, "id" | "creadoEn">>) {
    this.clientes = this.clientes.map((c) => (c.id === id ? { ...c, ...data } : c));
  }

  // ─── Proyectos ────────────────────────
  proyecto(id: string) {
    return this.proyectos.find((p) => p.id === id);
  }
  proyectosDeCliente(clienteId: string) {
    return this.proyectos.filter((p) => p.clienteId === clienteId);
  }
  crearProyecto(
    data: Omit<
      Proyecto,
      | "id"
      | "codigo"
      | "especificaciones"
      | "cotizaciones"
      | "cambios"
      | "ultimaActualizacion"
      | "estado"
    >,
  ) {
    const n = this.proyectos.length + 1;
    const p: Proyecto = {
      ...data,
      id: nuevoId("p"),
      codigo: `PRY-${new Date().getFullYear()}-${String(n).padStart(3, "0")}`,
      estado: "Solicitud",
      especificaciones: [],
      cotizaciones: [],
      cambios: [],
      ultimaActualizacion: new Date().toISOString().slice(0, 10),
    };
    this.proyectos = [...this.proyectos, p];
    return p;
  }
  actualizarEstadoProyecto(id: string, estado: EstadoProyecto) {
    this.proyectos = this.proyectos.map((p) =>
      p.id === id
        ? { ...p, estado, ultimaActualizacion: new Date().toISOString().slice(0, 10) }
        : p,
    );
    // HU-2.3: generar solicitud de compra automática al aprobar
    if (estado === "Aprobada") this._generarSolicitudCompraAutomatica(id);
  }
  agregarEspecificacion(proyectoId: string, spec: Omit<Especificacion, "version">) {
    this.proyectos = this.proyectos.map((p) => {
      if (p.id !== proyectoId) return p;
      const version = (p.especificaciones.at(-1)?.version ?? 0) + 1;
      return {
        ...p,
        especificaciones: [...p.especificaciones, { ...spec, version }],
        ultimaActualizacion: new Date().toISOString().slice(0, 10),
      };
    });
  }
  agregarCotizacion(cot: Omit<Cotizacion, "id">) {
    const c: Cotizacion = { ...cot, id: nuevoId("q") };
    this.proyectos = this.proyectos.map((p) =>
      p.id === cot.proyectoId
        ? {
            ...p,
            cotizaciones: [...p.cotizaciones, c],
            ultimaActualizacion: new Date().toISOString().slice(0, 10),
          }
        : p,
    );
    return c;
  }
  agregarCambio(cambio: Omit<CambioProyecto, "id">) {
    const c: CambioProyecto = { ...cambio, id: nuevoId("ch") };
    this.proyectos = this.proyectos.map((p) =>
      p.id === cambio.proyectoId
        ? {
            ...p,
            cambios: [...p.cambios, c],
            ultimaActualizacion: new Date().toISOString().slice(0, 10),
          }
        : p,
    );
  }

  // ─── Inventario ───────────────────────
  stockMaterial(materialId: string) {
    const movs = this.movimientos.filter((m) => m.materialId === materialId);
    let disponible = 0;
    let bloqueado = 0;
    let consumido = 0;
    for (const m of movs) {
      if (m.tipo === "entrada") disponible += m.cantidad;
      else if (m.tipo === "bloqueo") {
        disponible -= m.cantidad;
        bloqueado += m.cantidad;
      } else if (m.tipo === "consumo") {
        bloqueado -= m.cantidad;
        consumido += m.cantidad;
      } else if (m.tipo === "ajuste") disponible += m.cantidad;
    }
    return {
      disponible: Math.max(0, disponible),
      bloqueado: Math.max(0, bloqueado),
      consumido: Math.max(0, consumido),
    };
  }
  registrarMovimiento(mov: Omit<MovimientoInventario, "id">) {
    const m: MovimientoInventario = { ...mov, id: nuevoId("mv") };
    this.movimientos = [...this.movimientos, m];
    return m;
  }

  // ─── HU-2.3: Solicitud automática ─────
  private _generarSolicitudCompraAutomatica(proyectoId: string) {
    const proyecto = this.proyectos.find((p) => p.id === proyectoId);
    if (!proyecto) return;
    const spec = proyecto.especificaciones.at(-1);
    if (!spec) return;
    const itemsConFalta: { materialId: string; cantidadFaltante: number }[] = [];
    if (itemsConFalta.length > 0) {
      const sol: SolicitudCompra = {
        id: nuevoId("sc"),
        proyectoId,
        fechaCreacion: new Date().toISOString().slice(0, 10),
        estado: "pendiente",
        items: itemsConFalta,
        generadaAutomaticamente: true,
      };
      this.solicitudesCompra = [...this.solicitudesCompra, sol];
    }
  }

  // ─── Proveedores ──────────────────────
  crearProveedor(data: Omit<Proveedor, "id" | "creadoEn">) {
    const p: Proveedor = {
      ...data,
      id: nuevoId("pv"),
      creadoEn: new Date().toISOString().slice(0, 10),
    };
    this.proveedores = [...this.proveedores, p];
    return p;
  }

  // ─── Órdenes de compra ────────────────
  crearOrdenCompra(data: Omit<OrdenCompra, "id" | "codigo" | "fechaCreacion" | "estado">) {
    const n = this.ordenesCompra.length + 1;
    const oc: OrdenCompra = {
      ...data,
      id: nuevoId("oc"),
      codigo: `OC-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`,
      fechaCreacion: new Date().toISOString().slice(0, 10),
      estado: "borrador",
    };
    this.ordenesCompra = [...this.ordenesCompra, oc];
    return oc;
  }
  actualizarOrdenCompra(id: string, cambios: Partial<OrdenCompra>) {
    this.ordenesCompra = this.ordenesCompra.map((o) => (o.id === id ? { ...o, ...cambios } : o));
  }

  // ─── Órdenes de producción (Épica 3) ──
  crearOrdenProduccion(data: Omit<OrdenProduccion, "id" | "numero" | "fechaEmision" | "estado">) {
    const n = this.ordenesProduccion.length + 1;
    const op: OrdenProduccion = {
      ...data,
      id: nuevoId("op"),
      numero: `OP-${new Date().getFullYear()}-${String(n).padStart(3, "0")}`,
      fechaEmision: new Date().toISOString().slice(0, 10),
      estado: "Emitida",
    };
    this.ordenesProduccion = [...this.ordenesProduccion, op];
    return op;
  }
  actualizarOrdenProduccion(id: string, cambios: Partial<OrdenProduccion>) {
    this.ordenesProduccion = this.ordenesProduccion.map((o) =>
      o.id === id ? { ...o, ...cambios } : o,
    );
  }

  // ─── Facturas ─────────────────────────
  crearFactura(data: Omit<Factura, "id" | "numero" | "estado">) {
    const n = this.facturas.length + 1;
    const f: Factura = {
      ...data,
      id: nuevoId("f"),
      numero: `FV-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`,
      estado: "Pendiente",
    };
    this.facturas = [...this.facturas, f];
    return f;
  }
  saldoFactura(facturaId: string) {
    const f = this.facturas.find((x) => x.id === facturaId);
    if (!f) return 0;
    const pagado = this.pagos
      .filter((p) => p.facturaId === facturaId)
      .reduce((s, p) => s + p.monto, 0);
    return Math.max(0, f.monto - pagado);
  }
  registrarPago(data: Omit<Pago, "id">) {
    const p: Pago = { ...data, id: nuevoId("pg") };
    this.pagos = [...this.pagos, p];
    const saldo = this.saldoFactura(data.facturaId);
    const estado: EstadoFactura = saldo <= 0 ? "Pagada" : "Parcialmente pagada";
    this.facturas = this.facturas.map((f) => (f.id === data.facturaId ? { ...f, estado } : f));
    return p;
  }

  // ─── Costos reales ────────────────────
  costoRealProyecto(proyectoId: string) {
    const materiales = this.movimientos
      .filter((m) => m.proyectoId === proyectoId && m.tipo === "consumo")
      .reduce((s, m) => {
        const mat = this.materialesBase.find((x) => x.id === m.materialId);
        return s + (mat ? mat.costoUnitario * m.cantidad : 0);
      }, 0);
    const ajustes = this.ajustesCosto
      .filter((a) => a.proyectoId === proyectoId)
      .reduce((s, a) => s + a.monto, 0);
    return materiales + ajustes;
  }

  // ─── Etapas de producción (Épica 4) ───
  crearEtapa(data: Omit<EtapaProduccion, "id" | "estado" | "observaciones" | "fechaCompletada">) {
    const e: EtapaProduccion = {
      ...data,
      id: nuevoId("et"),
      estado: "pendiente",
      observaciones: [],
    };
    this.etapas = [...this.etapas, e];
    return e;
  }
  completarEtapa(id: string, cantidadesReales?: Record<string, number>, observacion?: string) {
    const ahora = new Date().toISOString().slice(0, 10);
    let etapa: EtapaProduccion | undefined;
    this.etapas = this.etapas.map((e) => {
      if (e.id !== id) return e;
      etapa = e;
      const mats = e.materiales.map((m) => ({
        ...m,
        cantidadReal: cantidadesReales?.[m.materialId] ?? m.cantidad,
      }));
      return {
        ...e,
        estado: "completada" as EstadoEtapa,
        fechaCompletada: ahora,
        materiales: mats,
      };
    });
    if (etapa) {
      const u = this.usuarioActivo();
      for (const mat of etapa.materiales) {
        const cantReal = cantidadesReales?.[mat.materialId] ?? mat.cantidad;
        this.registrarMovimiento({
          materialId: mat.materialId,
          tipo: "consumo",
          cantidad: cantReal,
          fecha: ahora,
          proyectoId: etapa.proyectoId,
          responsable: u?.nombre ?? "Sistema",
          notas: observacion,
        });
      }
    }
  }
  agregarObservacionEtapa(id: string, obs: Observacion) {
    this.etapas = this.etapas.map((e) =>
      e.id === id ? { ...e, observaciones: [...e.observaciones, obs] } : e,
    );
  }

  // ─── Entrega (checklist HU-4.5) ───────
  registrarEntrega(data: Omit<EntregaProduccion, "id">) {
    const e: EntregaProduccion = { ...data, id: nuevoId("ent") };
    this.entregas = [...this.entregas, e];
    this.actualizarEstadoProyecto(data.proyectoId, "Entregado");
    return e;
  }

  // ─── Garantías (Épica 5) ──────────────
  crearSolicitudGarantia(data: Omit<SolicitudGarantia, "id" | "estado">) {
    const s: SolicitudGarantia = { ...data, id: nuevoId("sg"), estado: "abierta" };
    this.solicitudesGarantia = [...this.solicitudesGarantia, s];
    return s;
  }
  crearOrdenGarantia(data: { proyectoId: string; solicitudId: string }) {
    const n = this.ordenesGarantia.length + 1;
    const og: OrdenGarantia = {
      id: nuevoId("og"),
      numero: `OG-${new Date().getFullYear()}-${String(n).padStart(3, "0")}`,
      ...data,
      fechaCreacion: new Date().toISOString().slice(0, 10),
      estado: "activa",
      etapas: [],
      costos: [],
    };
    this.ordenesGarantia = [...this.ordenesGarantia, og];
    this.solicitudesGarantia = this.solicitudesGarantia.map((s) =>
      s.id === data.solicitudId
        ? { ...s, estado: "en_proceso" as EstadoGarantia, ordenGarantiaId: og.id }
        : s,
    );
    this.actualizarEstadoProyecto(data.proyectoId, "En garantía");
    return og;
  }
  completarOrdenGarantia(id: string) {
    const og = this.ordenesGarantia.find((o) => o.id === id);
    if (!og) return;
    this.ordenesGarantia = this.ordenesGarantia.map((o) =>
      o.id === id ? { ...o, estado: "completada" } : o,
    );
    this.solicitudesGarantia = this.solicitudesGarantia.map((s) =>
      s.id === og.solicitudId ? { ...s, estado: "cerrada" as EstadoGarantia } : s,
    );
    this.actualizarEstadoProyecto(og.proyectoId, "Entregado");
  }
}

export const store = new Store();

// ─── Helpers ──────────────────────────────────────────────
export function calcularTotalCotizacion(items: CotizacionItem[], margenPct: number): number {
  const sub = items.reduce((s, i) => s + (Number(i.precioTotal) || 0), 0);
  return Math.round(sub * (1 + (Number(margenPct) || 0) / 100));
}
export function formatCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n || 0);
}
export const AREAS_LABEL: Record<Area, string> = {
  comercial: "Comercial",
  compras: "Compras",
  produccion: "Producción",
  administrativa: "Administrativa",
};
export const ESTADO_COLORS: Record<EstadoProyecto, string> = {
  Solicitud: "bg-yellow-100 text-yellow-800",
  "En definición": "bg-blue-100 text-blue-800",
  "En cotización": "bg-purple-100 text-purple-800",
  Aprobada: "bg-green-100 text-green-800",
  Rechazada: "bg-red-100 text-red-800",
  "En producción": "bg-orange-100 text-orange-800",
  "En garantía": "bg-pink-100 text-pink-800",
  Entregado: "bg-emerald-100 text-emerald-800",
};
