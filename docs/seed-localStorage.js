/**
 * HF HomeFort — Seed de localStorage para dominios no migrados
 * Pegar en la consola del navegador DESPUÉS de iniciar sesión.
 * Cubre: Proyectos (seguimiento/kanban), Órdenes de producción,
 *        Etapas, Entregas, Facturas, Pagos, Transporte,
 *        Ajustes de costo, Garantías.
 *
 * Los IDs coinciden con los del seed D1 (seed-data.sql).
 */
(function () {
  const set = (key, val) => localStorage.setItem(key, JSON.stringify(val));

  // ── CLIENTES (necesario para seguimiento) ────────────────────────────────
  set("hf_clientes", [
    { id: "cli_001", nombre: "Ana Martínez Ruiz",       contacto: "3101234567", tipo: "B2C", empresa: null,                   creadoEn: "2025-09-01" },
    { id: "cli_002", nombre: "Diseños Modernos SAS",    contacto: "3209876543", tipo: "B2B", empresa: "Diseños Modernos SAS", creadoEn: "2025-09-05" },
    { id: "cli_003", nombre: "Carlos Reyes Vargas",     contacto: "3154445566", tipo: "B2C", empresa: null,                   creadoEn: "2025-09-10" },
    { id: "cli_004", nombre: "Constructora Andina SAS", contacto: "3167778899", tipo: "B2B", empresa: "Constructora Andina SAS", creadoEn: "2025-10-01" },
  ]);

  // ── PROYECTOS (seguimiento/kanban + referencias de producción) ───────────
  set("hf_proyectos", [
    {
      id: "proy_001", codigo: "HF-001", clienteId: "cli_001",
      tipo: "Clóset empotrado", titulo: "Clóset empotrado dormitorio principal",
      descripcionProyecto: "Clóset empotrado a medida para dormitorio principal",
      aspectos: "Espacio limitado, paredes irregulares",
      caracteristicas: "Apertura abatible, interior con cajonería",
      fechaSolicitud: "2025-10-15", fechaEntrega: "2026-01-20",
      estado: "Entregado", ultimaActualizacion: "2026-01-20",
      especificaciones: [
        { id: "esp_001a", version: 1, contenido: "", medidas: "2.40m alto × 1.80m ancho × 0.60m prof", materiales: "MDP 18mm estructura; MDF 9mm fondos; Canto PVC 1mm", acabados: "Laca blanca mate; manijas barra aluminio", observaciones: "Revisar plomada pared izquierda", actualizadoEn: "2025-11-01", actualizadoPor: "Laura García" },
        { id: "esp_001b", version: 2, contenido: "", medidas: "2.40m alto × 1.80m ancho × 0.60m prof — 2 cajones adicionales", materiales: "MDP 18mm; MDF 9mm; Riel telescópico 45cm; Canto PVC 1mm", acabados: "Laca blanca mate; manijas barra aluminio 128mm", observaciones: "Tope de cajón en cajón superior derecho", actualizadoEn: "2025-11-15", actualizadoPor: "Laura García" },
      ],
      cotizaciones: [
        { id: "cot_001", fecha: "2025-11-15", descripcion: "Cotización definitiva con cajones adicionales", items: [{ descripcion: "Tablero MDP 18mm", cantidad: 5, precioUnitario: 52000, precioTotal: 260000 }, { descripcion: "Tablero MDF 9mm", cantidad: 3, precioUnitario: 38000, precioTotal: 114000 }, { descripcion: "Canto PVC 1mm", cantidad: 30, precioUnitario: 8500, precioTotal: 255000 }, { descripcion: "Bisagra cazoleta 35mm", cantidad: 12, precioUnitario: 4200, precioTotal: 50400 }, { descripcion: "Manija barra aluminio", cantidad: 4, precioUnitario: 18000, precioTotal: 72000 }, { descripcion: "Riel cajonera telescópica", cantidad: 4, precioUnitario: 32000, precioTotal: 128000 }, { descripcion: "Mano de obra e instalación", cantidad: 1, precioUnitario: 850000, precioTotal: 850000 }], margenPct: 20, condicionesPago: "50% anticipo, 50% contra entrega", total: 2075280, creadaPor: "Laura García" },
      ],
      cambios: [{ id: "cam_001", fecha: "2025-11-14", descripcion: "Cliente solicitó 2 cajones adicionales con rieles telescópicos", responsable: "Laura García", impactoCosto: 128000, impactoDias: 3 }],
    },
    {
      id: "proy_002", codigo: "HF-002", clienteId: "cli_002",
      tipo: "Cocina integral", titulo: "Cocina integral modular alta gama",
      descripcionProyecto: "Cocina en L con isla para showroom de Diseños Modernos",
      aspectos: "Acceso por carga, piso nivelado",
      caracteristicas: "Soft-close en todas las puertas, iluminación LED",
      fechaSolicitud: "2025-11-20", fechaEntrega: null,
      estado: "En producción", ultimaActualizacion: "2026-02-10",
      especificaciones: [
        { id: "esp_002", version: 1, contenido: "", medidas: "Módulo bajo 2.80m × 0.60m; Isla 1.20m × 0.80m × 0.90m alto", materiales: "MDP 15mm módulos bajos; MDP 18mm isla; Riel soft-close", acabados: "Laca gris marengo con isla blanca; manijas negro", observaciones: "Verificar instalación de gas antes de esquina", actualizadoEn: "2025-12-01", actualizadoPor: "Laura García" },
      ],
      cotizaciones: [
        { id: "cot_002", fecha: "2025-12-15", descripcion: "Cotización cocina integral con isla", items: [{ descripcion: "Tablero MDP 15mm", cantidad: 10, precioUnitario: 45000, precioTotal: 450000 }, { descripcion: "Tablero MDP 18mm", cantidad: 8, precioUnitario: 52000, precioTotal: 416000 }, { descripcion: "Riel cajonera telescópica", cantidad: 8, precioUnitario: 32000, precioTotal: 256000 }, { descripcion: "Manija barra aluminio", cantidad: 6, precioUnitario: 18000, precioTotal: 108000 }, { descripcion: "Bisagra cazoleta 35mm", cantidad: 20, precioUnitario: 4200, precioTotal: 84000 }, { descripcion: "Mano de obra e instalación", cantidad: 1, precioUnitario: 1400000, precioTotal: 1400000 }], margenPct: 25, condicionesPago: "40% anticipo, 30% inicio, 30% entrega", total: 3392500, creadaPor: "Laura García" },
      ],
      cambios: [{ id: "cam_002", fecha: "2026-01-10", descripcion: "Cambio color módulos altos a blanco", responsable: "Laura García", impactoCosto: 45000, impactoDias: 1 }],
    },
    {
      id: "proy_003", codigo: "HF-003", clienteId: "cli_003",
      tipo: "Escritorio y biblioteca", titulo: "Escritorio y biblioteca sala de estudio",
      descripcionProyecto: "Módulo de escritorio con biblioteca empotrada para home office",
      aspectos: "Espacio 3.20m, techo inclinado",
      caracteristicas: "Tablero flotante, repisa iluminada",
      fechaSolicitud: "2026-01-08", fechaEntrega: null,
      estado: "Aprobada", ultimaActualizacion: "2026-02-01",
      especificaciones: [
        { id: "esp_003", version: 1, contenido: "", medidas: "Escritorio 3.20m × 0.65m; Biblioteca 2.20m alto × 3.20m", materiales: "MDP 15mm estructura; MDF 9mm repisas; Canto PVC roble", acabados: "Acabado vinilo roble; vidrio templado repisa central", observaciones: "Corte diagonal en lateral izquierdo por techo inclinado", actualizadoEn: "2026-01-20", actualizadoPor: "Laura García" },
      ],
      cotizaciones: [
        { id: "cot_003", fecha: "2026-01-25", descripcion: "Cotización escritorio y biblioteca a medida", items: [{ descripcion: "Tablero MDP 15mm", cantidad: 40, precioUnitario: 45000, precioTotal: 1800000 }, { descripcion: "Tablero MDF 9mm", cantidad: 5, precioUnitario: 38000, precioTotal: 190000 }, { descripcion: "Canto PVC 1mm", cantidad: 50, precioUnitario: 8500, precioTotal: 425000 }, { descripcion: "Bisagra cazoleta 35mm", cantidad: 8, precioUnitario: 4200, precioTotal: 33600 }, { descripcion: "Mano de obra e instalación", cantidad: 1, precioUnitario: 700000, precioTotal: 700000 }], margenPct: 20, condicionesPago: "50% anticipo, 50% entrega", total: 3778320, creadaPor: "Laura García" },
      ],
      cambios: [],
    },
    {
      id: "proy_004", codigo: "HF-004", clienteId: "cli_004",
      tipo: "Mueble de baño flotante", titulo: "Mueble de baño flotante con doble lavamanos",
      descripcionProyecto: "Mueble flotante para baño principal Reserva del Norte",
      aspectos: "Baño húmedo, 1.80m ancho",
      caracteristicas: "Resistente a humedad, tablero de cuarzo",
      fechaSolicitud: "2026-02-14", fechaEntrega: null,
      estado: "En cotización", ultimaActualizacion: "2026-03-10",
      especificaciones: [
        { id: "esp_004", version: 1, contenido: "", medidas: "1.80m ancho × 0.50m prof × 0.55m alto flotante a 45cm", materiales: "MDP 18mm carcasa; MDF 9mm posterior; bisagras amortiguadas", acabados: "Enchape wengué; tablero cuarzo blanco", observaciones: "Sellante en todas las uniones — zona húmeda", actualizadoEn: "2026-02-25", actualizadoPor: "Laura García" },
      ],
      cotizaciones: [
        { id: "cot_004", fecha: "2026-03-10", descripcion: "Cotización mueble baño flotante", items: [{ descripcion: "Tablero MDP 18mm", cantidad: 3, precioUnitario: 52000, precioTotal: 156000 }, { descripcion: "Tablero MDF 9mm", cantidad: 2, precioUnitario: 38000, precioTotal: 76000 }, { descripcion: "Bisagra cazoleta 35mm", cantidad: 6, precioUnitario: 4200, precioTotal: 25200 }, { descripcion: "Manija barra aluminio", cantidad: 2, precioUnitario: 18000, precioTotal: 36000 }, { descripcion: "Mano de obra e instalación", cantidad: 1, precioUnitario: 550000, precioTotal: 550000 }], margenPct: 20, condicionesPago: "50% anticipo, 50% entrega", total: 1011840, creadaPor: "Laura García" },
      ],
      cambios: [],
    },
    {
      id: "proy_005", codigo: "HF-005", clienteId: "cli_001",
      tipo: "Sala de estar modular", titulo: "Sala de estar con módulo TV integrado",
      descripcionProyecto: "Mueble modular sala con TV 75\" y almacenamiento",
      aspectos: "Pared 4m, instalación eléctrica existente",
      caracteristicas: "Puertas corredizas, retroiluminación",
      fechaSolicitud: "2026-03-01", fechaEntrega: null,
      estado: "En definición", ultimaActualizacion: "2026-03-01",
      especificaciones: [
        { id: "esp_005", version: 1, contenido: "", medidas: "4.00m ancho × 0.40m prof × 2.10m alto", materiales: "MDP 18mm estructura; MDF 9mm fondo y divisiones", acabados: "Laca blanco roto; retroiluminación LED cálida", observaciones: "Dejar ducto para cables TV y consola", actualizadoEn: "2026-03-05", actualizadoPor: "Laura García" },
      ],
      cotizaciones: [],
      cambios: [],
    },
    {
      id: "proy_006", codigo: "HF-006", clienteId: "cli_003",
      tipo: "Comedor extensible", titulo: "Comedor extensible con cajonería lateral",
      descripcionProyecto: "Mesa extensible 6-10 personas con mueble cajonero a juego",
      aspectos: "Comedor 4×4m, piso de madera",
      caracteristicas: "Mesa extensible, cajonería con cierre suave",
      fechaSolicitud: "2025-09-05", fechaEntrega: "2025-12-10",
      estado: "En garantía", ultimaActualizacion: "2026-02-20",
      especificaciones: [
        { id: "esp_006", version: 1, contenido: "", medidas: "Mesa 1.60m-2.40m × 0.90m; Cajonero 1.20m × 0.45m × 0.85m", materiales: "MDP 18mm base y cajonero; Canto PVC 1mm nogal; Bisagra + riel telescópico", acabados: "Laca nogal natural; manijas gota aluminio", observaciones: "Guía central de aluminio para extensión de mesa", actualizadoEn: "2025-09-20", actualizadoPor: "Laura García" },
      ],
      cotizaciones: [
        { id: "cot_006", fecha: "2025-09-25", descripcion: "Cotización comedor extensible y cajonero", items: [{ descripcion: "Tablero MDP 18mm", cantidad: 4, precioUnitario: 52000, precioTotal: 208000 }, { descripcion: "Canto PVC 1mm", cantidad: 15, precioUnitario: 8500, precioTotal: 127500 }, { descripcion: "Bisagra cazoleta 35mm", cantidad: 8, precioUnitario: 4200, precioTotal: 33600 }, { descripcion: "Manija barra aluminio", cantidad: 4, precioUnitario: 18000, precioTotal: 72000 }, { descripcion: "Mano de obra e instalación", cantidad: 1, precioUnitario: 750000, precioTotal: 750000 }], margenPct: 20, condicionesPago: "50% anticipo, 50% entrega", total: 1429320, creadaPor: "Laura García" },
      ],
      cambios: [],
    },
    {
      id: "proy_007", codigo: "HF-007", clienteId: "cli_002",
      tipo: "Guardarropa juvenil", titulo: "Guardarropa habitación juvenil con escritorio integrado",
      descripcionProyecto: "Proyecto cancelado por cliente antes de aprobación",
      aspectos: "", caracteristicas: "",
      fechaSolicitud: "2025-12-10", fechaEntrega: null,
      estado: "Rechazada", ultimaActualizacion: "2025-12-22",
      especificaciones: [], cotizaciones: [], cambios: [],
    },
  ]);

  // ── MATERIALES (para vistas de producción) ───────────────────────────────
  set("hf_materiales", [
    { id: "mat_001", nombre: "Tablero MDP 15mm",          categoria: "Madera",   unidad: "lámina", costoUnitario: 45000, actualizadoEn: "2025-08-01" },
    { id: "mat_002", nombre: "Tablero MDP 18mm",          categoria: "Madera",   unidad: "lámina", costoUnitario: 52000, actualizadoEn: "2025-08-01" },
    { id: "mat_003", nombre: "Tablero MDF 9mm",           categoria: "Madera",   unidad: "lámina", costoUnitario: 38000, actualizadoEn: "2025-08-01" },
    { id: "mat_004", nombre: "Canto PVC 1mm",             categoria: "Acabados", unidad: "metro",  costoUnitario: 8500,  actualizadoEn: "2025-08-01" },
    { id: "mat_005", nombre: "Riel cajonera telescópica", categoria: "Herrajes", unidad: "par",    costoUnitario: 32000, actualizadoEn: "2025-08-01" },
    { id: "mat_006", nombre: "Bisagra cazoleta 35mm",     categoria: "Herrajes", unidad: "und",    costoUnitario: 4200,  actualizadoEn: "2025-08-01" },
    { id: "mat_007", nombre: "Manija barra aluminio",     categoria: "Herrajes", unidad: "und",    costoUnitario: 18000, actualizadoEn: "2025-08-01" },
    { id: "mat_008", nombre: "Pintura laca blanca mate",  categoria: "Acabados", unidad: "galón",  costoUnitario: 95000, actualizadoEn: "2025-08-01" },
    { id: "mat_009", nombre: "Tornillo autoperforante 3.5x35", categoria: "Herrajes", unidad: "und", costoUnitario: 180, actualizadoEn: "2025-08-01" },
  ]);

  // ── MOVIMIENTOS (para cálculo de stock en seguimiento y producción) ──────
  set("hf_movimientos", [
    // Entradas iniciales
    { id: "mv_e01", materialId: "mat_001", tipo: "entrada", cantidad: 30, fecha: "2025-08-10", proveedorId: "prov_001", proyectoId: null, responsable: "Carlos Mendoza", notas: "Pedido inicial" },
    { id: "mv_e02", materialId: "mat_002", tipo: "entrada", cantidad: 40, fecha: "2025-08-10", proveedorId: "prov_001", proyectoId: null, responsable: "Carlos Mendoza", notas: "Pedido inicial" },
    { id: "mv_e03", materialId: "mat_003", tipo: "entrada", cantidad: 30, fecha: "2025-08-10", proveedorId: "prov_001", proyectoId: null, responsable: "Carlos Mendoza", notas: "Pedido inicial" },
    { id: "mv_e04", materialId: "mat_004", tipo: "entrada", cantidad: 200, fecha: "2025-08-12", proveedorId: "prov_002", proyectoId: null, responsable: "Carlos Mendoza", notas: "Rollo 200m" },
    { id: "mv_e05", materialId: "mat_005", tipo: "entrada", cantidad: 30, fecha: "2025-08-12", proveedorId: "prov_002", proyectoId: null, responsable: "Carlos Mendoza", notas: "Stock herrajes" },
    { id: "mv_e06", materialId: "mat_006", tipo: "entrada", cantidad: 100, fecha: "2025-08-12", proveedorId: "prov_002", proyectoId: null, responsable: "Carlos Mendoza", notas: "Stock herrajes" },
    { id: "mv_e07", materialId: "mat_007", tipo: "entrada", cantidad: 20, fecha: "2025-08-12", proveedorId: "prov_002", proyectoId: null, responsable: "Carlos Mendoza", notas: "Stock herrajes" },
    { id: "mv_e08", materialId: "mat_008", tipo: "entrada", cantidad: 10, fecha: "2025-08-15", proveedorId: "prov_003", proyectoId: null, responsable: "Carlos Mendoza", notas: "Pintura inicial" },
    { id: "mv_e09", materialId: "mat_009", tipo: "entrada", cantidad: 500, fecha: "2025-08-12", proveedorId: "prov_002", proyectoId: null, responsable: "Carlos Mendoza", notas: "Caja 500 und" },
    { id: "mv_e10", materialId: "mat_001", tipo: "entrada", cantidad: 15, fecha: "2026-02-05", proveedorId: "prov_001", proyectoId: null, responsable: "Carlos Mendoza", notas: "OC-002 reposición" },
    // Bloqueos y consumos HF-006
    { id: "mv_b06a", materialId: "mat_002", tipo: "bloqueo", cantidad: 4, fecha: "2025-10-01", proveedorId: null, proyectoId: "proy_006", responsable: "María Rodríguez", notas: null },
    { id: "mv_b06b", materialId: "mat_004", tipo: "bloqueo", cantidad: 15, fecha: "2025-10-01", proveedorId: null, proyectoId: "proy_006", responsable: "María Rodríguez", notas: null },
    { id: "mv_b06c", materialId: "mat_006", tipo: "bloqueo", cantidad: 8, fecha: "2025-10-01", proveedorId: null, proyectoId: "proy_006", responsable: "María Rodríguez", notas: null },
    { id: "mv_b06d", materialId: "mat_007", tipo: "bloqueo", cantidad: 4, fecha: "2025-10-01", proveedorId: null, proyectoId: "proy_006", responsable: "María Rodríguez", notas: null },
    { id: "mv_c06a", materialId: "mat_002", tipo: "consumo", cantidad: 4, fecha: "2025-12-05", proveedorId: null, proyectoId: "proy_006", responsable: "María Rodríguez", notas: null },
    { id: "mv_c06b", materialId: "mat_004", tipo: "consumo", cantidad: 14, fecha: "2025-12-05", proveedorId: null, proyectoId: "proy_006", responsable: "María Rodríguez", notas: null },
    { id: "mv_c06c", materialId: "mat_006", tipo: "consumo", cantidad: 7, fecha: "2025-12-05", proveedorId: null, proyectoId: "proy_006", responsable: "María Rodríguez", notas: null },
    { id: "mv_c06d", materialId: "mat_007", tipo: "consumo", cantidad: 4, fecha: "2025-12-05", proveedorId: null, proyectoId: "proy_006", responsable: "María Rodríguez", notas: null },
    // Bloqueos y consumos HF-001
    { id: "mv_b01a", materialId: "mat_002", tipo: "bloqueo", cantidad: 5, fecha: "2025-11-25", proveedorId: null, proyectoId: "proy_001", responsable: "María Rodríguez", notas: null },
    { id: "mv_b01b", materialId: "mat_003", tipo: "bloqueo", cantidad: 3, fecha: "2025-11-25", proveedorId: null, proyectoId: "proy_001", responsable: "María Rodríguez", notas: null },
    { id: "mv_b01c", materialId: "mat_004", tipo: "bloqueo", cantidad: 30, fecha: "2025-11-25", proveedorId: null, proyectoId: "proy_001", responsable: "María Rodríguez", notas: null },
    { id: "mv_b01d", materialId: "mat_005", tipo: "bloqueo", cantidad: 4, fecha: "2025-11-25", proveedorId: null, proyectoId: "proy_001", responsable: "María Rodríguez", notas: null },
    { id: "mv_b01e", materialId: "mat_006", tipo: "bloqueo", cantidad: 12, fecha: "2025-11-25", proveedorId: null, proyectoId: "proy_001", responsable: "María Rodríguez", notas: null },
    { id: "mv_b01f", materialId: "mat_007", tipo: "bloqueo", cantidad: 4, fecha: "2025-11-25", proveedorId: null, proyectoId: "proy_001", responsable: "María Rodríguez", notas: null },
    { id: "mv_c01a", materialId: "mat_002", tipo: "consumo", cantidad: 5, fecha: "2025-12-20", proveedorId: null, proyectoId: "proy_001", responsable: "María Rodríguez", notas: null },
    { id: "mv_c01b", materialId: "mat_003", tipo: "consumo", cantidad: 3, fecha: "2025-12-20", proveedorId: null, proyectoId: "proy_001", responsable: "María Rodríguez", notas: null },
    { id: "mv_c01c", materialId: "mat_004", tipo: "consumo", cantidad: 28, fecha: "2025-12-20", proveedorId: null, proyectoId: "proy_001", responsable: "María Rodríguez", notas: null },
    { id: "mv_c01d", materialId: "mat_005", tipo: "consumo", cantidad: 4, fecha: "2025-12-20", proveedorId: null, proyectoId: "proy_001", responsable: "María Rodríguez", notas: null },
    { id: "mv_c01e", materialId: "mat_006", tipo: "consumo", cantidad: 10, fecha: "2025-12-20", proveedorId: null, proyectoId: "proy_001", responsable: "María Rodríguez", notas: null },
    { id: "mv_c01f", materialId: "mat_007", tipo: "consumo", cantidad: 4, fecha: "2025-12-22", proveedorId: null, proyectoId: "proy_001", responsable: "María Rodríguez", notas: null },
    // Bloqueos y consumos parciales HF-002
    { id: "mv_b02a", materialId: "mat_001", tipo: "bloqueo", cantidad: 10, fecha: "2026-01-05", proveedorId: null, proyectoId: "proy_002", responsable: "María Rodríguez", notas: null },
    { id: "mv_b02b", materialId: "mat_002", tipo: "bloqueo", cantidad: 8, fecha: "2026-01-05", proveedorId: null, proyectoId: "proy_002", responsable: "María Rodríguez", notas: null },
    { id: "mv_b02c", materialId: "mat_005", tipo: "bloqueo", cantidad: 8, fecha: "2026-01-05", proveedorId: null, proyectoId: "proy_002", responsable: "María Rodríguez", notas: null },
    { id: "mv_b02d", materialId: "mat_007", tipo: "bloqueo", cantidad: 6, fecha: "2026-01-05", proveedorId: null, proyectoId: "proy_002", responsable: "María Rodríguez", notas: null },
    { id: "mv_c02a", materialId: "mat_001", tipo: "consumo", cantidad: 5, fecha: "2026-01-20", proveedorId: null, proyectoId: "proy_002", responsable: "María Rodríguez", notas: null },
    { id: "mv_c02b", materialId: "mat_002", tipo: "consumo", cantidad: 4, fecha: "2026-01-20", proveedorId: null, proyectoId: "proy_002", responsable: "María Rodríguez", notas: null },
    { id: "mv_c02c", materialId: "mat_005", tipo: "consumo", cantidad: 8, fecha: "2026-02-05", proveedorId: null, proyectoId: "proy_002", responsable: "María Rodríguez", notas: null },
  ]);

  // ── ÓRDENES DE PRODUCCIÓN ────────────────────────────────────────────────
  set("hf_ordenes_produccion", [
    { id: "op_001", numero: "OP-001", proyectoId: "proy_001", cotizacionId: "cot_001", fechaEmision: "2025-11-25", estado: "Finalizada", responsable: "María Rodríguez", notas: "Orden completada y proyecto entregado" },
    { id: "op_002", numero: "OP-002", proyectoId: "proy_002", cotizacionId: "cot_002", fechaEmision: "2026-01-05", estado: "En producción", responsable: "María Rodríguez", notas: "Etapa 3 (instalación) en curso" },
    { id: "op_006", numero: "OP-006", proyectoId: "proy_006", cotizacionId: "cot_006", fechaEmision: "2025-10-01", estado: "Finalizada", responsable: "María Rodríguez", notas: "Orden completada — proyecto en garantía" },
  ]);

  // ── ETAPAS DE PRODUCCIÓN ─────────────────────────────────────────────────
  set("hf_etapas", [
    // HF-001 — 3 etapas completadas
    { id: "et_001a", ordenId: "op_001", proyectoId: "proy_001", nombre: "Corte y canteado de tableros", responsable: "Carlos Pineda", fechaEstimada: "2025-11-28", fechaCompletada: "2025-11-29", estado: "completada", materiales: [{ materialId: "mat_002", cantidadEstimada: 5, cantidadReal: 5 }, { materialId: "mat_003", cantidadEstimada: 3, cantidadReal: 3 }, { materialId: "mat_004", cantidadEstimada: 30, cantidadReal: 28 }], observaciones: [] },
    { id: "et_001b", ordenId: "op_001", proyectoId: "proy_001", nombre: "Armado y ensamble", responsable: "Carlos Pineda", fechaEstimada: "2025-12-05", fechaCompletada: "2025-12-08", estado: "completada", materiales: [{ materialId: "mat_005", cantidadEstimada: 4, cantidadReal: 4 }, { materialId: "mat_006", cantidadEstimada: 12, cantidadReal: 10 }], observaciones: [{ id: "obs_001", texto: "Cajón superior requirió ajuste de riel — 2 tornillos adicionales", tipo: "observacion", fecha: "2025-12-07", autor: "Carlos Pineda" }] },
    { id: "et_001c", ordenId: "op_001", proyectoId: "proy_001", nombre: "Acabados, pintura e instalación", responsable: "Carlos Pineda", fechaEstimada: "2025-12-15", fechaCompletada: "2025-12-20", estado: "completada", materiales: [{ materialId: "mat_007", cantidadEstimada: 4, cantidadReal: 4 }], observaciones: [] },
    // HF-002 — 2 completadas, 1 en curso
    { id: "et_002a", ordenId: "op_002", proyectoId: "proy_002", nombre: "Corte módulos bajos y altos", responsable: "Carlos Pineda", fechaEstimada: "2026-01-10", fechaCompletada: "2026-01-20", estado: "completada", materiales: [{ materialId: "mat_001", cantidadEstimada: 10, cantidadReal: 5 }, { materialId: "mat_002", cantidadEstimada: 8, cantidadReal: 4 }], observaciones: [] },
    { id: "et_002b", ordenId: "op_002", proyectoId: "proy_002", nombre: "Ensamble cajonería y rieles", responsable: "Carlos Pineda", fechaEstimada: "2026-01-25", fechaCompletada: "2026-02-05", estado: "completada", materiales: [{ materialId: "mat_005", cantidadEstimada: 8, cantidadReal: 8 }], observaciones: [{ id: "obs_002", texto: "Tablero con deformación — descartado y reemplazado sin costo adicional", tipo: "retrabajo", fecha: "2026-01-28", autor: "Carlos Pineda" }] },
    { id: "et_002c", ordenId: "op_002", proyectoId: "proy_002", nombre: "Pintura, herrajes e instalación en sitio", responsable: "Carlos Pineda", fechaEstimada: "2026-02-20", fechaCompletada: null, estado: "en_curso", materiales: [{ materialId: "mat_007", cantidadEstimada: 6, cantidadReal: null }], observaciones: [] },
    // HF-006 — todas completadas
    { id: "et_006a", ordenId: "op_006", proyectoId: "proy_006", nombre: "Corte y canteado comedor", responsable: "Carlos Pineda", fechaEstimada: "2025-10-08", fechaCompletada: "2025-10-10", estado: "completada", materiales: [{ materialId: "mat_002", cantidadEstimada: 4, cantidadReal: 4 }, { materialId: "mat_004", cantidadEstimada: 15, cantidadReal: 14 }], observaciones: [] },
    { id: "et_006b", ordenId: "op_006", proyectoId: "proy_006", nombre: "Armado mesa y cajonero", responsable: "Carlos Pineda", fechaEstimada: "2025-10-20", fechaCompletada: "2025-11-05", estado: "completada", materiales: [{ materialId: "mat_006", cantidadEstimada: 8, cantidadReal: 7 }, { materialId: "mat_007", cantidadEstimada: 4, cantidadReal: 4 }], observaciones: [] },
    { id: "et_006c", ordenId: "op_006", proyectoId: "proy_006", nombre: "Acabados e instalación en sitio", responsable: "Carlos Pineda", fechaEstimada: "2025-12-05", fechaCompletada: "2025-12-08", estado: "completada", materiales: [], observaciones: [] },
  ]);

  // ── ENTREGAS ─────────────────────────────────────────────────────────────
  set("hf_entregas", [
    { id: "ent_001", ordenId: "op_001", proyectoId: "proy_001", fecha: "2026-01-20", responsable: "María Rodríguez", checklist: { itemsRevisados: true, cantidadCorrecta: true, acabadoAprobado: true, clienteFirmo: true }, observaciones: "Cliente satisfecho. Firmó acta sin observaciones." },
    { id: "ent_006", ordenId: "op_006", proyectoId: "proy_006", fecha: "2025-12-10", responsable: "María Rodríguez", checklist: { itemsRevisados: true, cantidadCorrecta: true, acabadoAprobado: true, clienteFirmo: true }, observaciones: "Entrega sin novedad. Instalación completa en comedor." },
  ]);

  // ── FACTURAS ─────────────────────────────────────────────────────────────
  set("hf_facturas", [
    { id: "fac_001", numero: "FAC-001", proyectoId: "proy_001", cotizacionId: "cot_001", clienteId: "cli_001", fechaEmision: "2026-01-20", fechaVencimiento: "2026-02-20", monto: 2075280, condicionesPago: "50% anticipo, 50% contra entrega", estado: "Pagada" },
    { id: "fac_006", numero: "FAC-006", proyectoId: "proy_006", cotizacionId: "cot_006", clienteId: "cli_003", fechaEmision: "2025-12-10", fechaVencimiento: "2026-01-10", monto: 1429320, condicionesPago: "50% anticipo, 50% contra entrega", estado: "Pagada" },
  ]);

  // ── PAGOS ────────────────────────────────────────────────────────────────
  set("hf_pagos", [
    { id: "pag_001a", facturaId: "fac_001", proyectoId: "proy_001", fecha: "2025-11-25", monto: 1037640, tipo: "Transferencia", referencia: "TRF-20251125-001" },
    { id: "pag_001b", facturaId: "fac_001", proyectoId: "proy_001", fecha: "2026-01-20", monto: 1037640, tipo: "Transferencia", referencia: "TRF-20260120-007" },
    { id: "pag_006a", facturaId: "fac_006", proyectoId: "proy_006", fecha: "2025-10-05", monto: 714660, tipo: "Transferencia", referencia: "TRF-20251005-003" },
    { id: "pag_006b", facturaId: "fac_006", proyectoId: "proy_006", fecha: "2025-12-12", monto: 714660, tipo: "Efectivo", referencia: null },
  ]);

  // ── TRANSPORTE ───────────────────────────────────────────────────────────
  set("hf_transportes", [
    { id: "tr_001", proyectoId: "proy_001", fechaProgramada: "2026-01-20", responsable: "Carlos Pineda", vehiculo: "Camión NKR TXC-412", direccionDestino: "Cra 15 # 85-30 Apto 501 Bogotá", observaciones: "Acceso por ascensor de carga. Contactar portería.", estado: "Entregada" },
    { id: "tr_006", proyectoId: "proy_006", fechaProgramada: "2025-12-10", responsable: "Carlos Pineda", vehiculo: "Furgón Hyundai OXK-831", direccionDestino: "Calle 100 # 19-61 Casa 12 Bogotá", observaciones: "Acceso por entrada lateral del conjunto.", estado: "Entregada" },
    { id: "tr_002", proyectoId: "proy_002", fechaProgramada: "2026-03-15", responsable: "Carlos Pineda", vehiculo: "Camión NKR TXC-412", direccionDestino: "Cra 7 # 45-20 Local 3 Bogotá", observaciones: "Coordinar con Claudia Mora para acceso al showroom.", estado: "Programada" },
  ]);

  // ── AJUSTES DE COSTO ─────────────────────────────────────────────────────
  set("hf_ajustes_costo", [
    { id: "ajc_001", proyectoId: "proy_001", fecha: "2025-12-07", concepto: "Tornillos y consumibles adicionales no incluidos en cotización", monto: 25000, registradoPor: "Andrés Torres" },
    { id: "ajc_002", proyectoId: "proy_002", fecha: "2026-01-28", concepto: "Tablero MDP descartado por deformación — costo asumido por empresa", monto: 45000, registradoPor: "Andrés Torres" },
  ]);

  // ── SOLICITUDES DE GARANTÍA ──────────────────────────────────────────────
  set("hf_sol_garantia", [
    { id: "sg_001", proyectoId: "proy_006", fecha: "2026-02-15", descripcion: "El riel de la cajonería lateral presenta ruido al deslizarse y traba a la mitad del recorrido.", abiertoBy: "Laura García", estado: "en_proceso", ordenGarantiaId: "og_001" },
  ]);

  // ── ÓRDENES DE GARANTÍA ──────────────────────────────────────────────────
  set("hf_ord_garantia", [
    {
      id: "og_001", numero: "OG-001", proyectoId: "proy_006", solicitudId: "sg_001",
      fechaCreacion: "2026-02-16", estado: "activa",
      etapas: [
        { id: "eg_001", ordenId: "og_001", nombre: "Revisión y diagnóstico de cajonería", responsable: "Carlos Pineda", fechaEstimada: "2026-02-20", estado: "completada", observaciones: "Riel izquierdo con partícula atascada — limpieza y lubricación realizada" },
        { id: "eg_002", ordenId: "og_001", nombre: "Reemplazo de riel defectuoso", responsable: "Carlos Pineda", fechaEstimada: "2026-02-28", estado: "pendiente", observaciones: "" },
      ],
      costos: [
        { concepto: "Mano de obra visita diagnóstico", monto: 80000, fecha: "2026-02-20" },
        { concepto: "Riel cajonera telescópica (reemplazo)", monto: 32000, fecha: "2026-02-20" },
      ],
    },
  ]);

  // ── SOLICITUDES DE COMPRA (store también las usa) ────────────────────────
  set("hf_solicitudes_compra", [
    { id: "sc_001", proyectoId: "proy_003", fechaCreacion: "2026-02-01", estado: "pendiente", items: [{ materialId: "mat_001", cantidadFaltante: 5 }], generadaAutomaticamente: true },
  ]);

  // ── PROVEEDORES (para vistas de compras en store) ────────────────────────
  set("hf_proveedores", [
    { id: "prov_001", nombre: "Maderplast Ltda", contacto: "Jorge Salamanca", telefono: "6013456789", email: "ventas@maderplast.co", materialesIds: ["mat_001","mat_002","mat_003"], condicionesPago: "30 días crédito", notas: "Entrega en 3 días hábiles.", creadoEn: "2025-08-15" },
    { id: "prov_002", nombre: "Herrajes & Accesorios SAS", contacto: "Claudia Mora", telefono: "6014567890", email: "info@herrajes.co", materialesIds: ["mat_004","mat_005","mat_006","mat_007","mat_009"], condicionesPago: "Contado con descuento 5%", notas: "Descuento en pedidos > 20 rieles.", creadoEn: "2025-08-20" },
    { id: "prov_003", nombre: "Pinturas Nacionales SA", contacto: "Roberto Cano", telefono: "6015678901", email: "comercial@pintunasal.co", materialesIds: ["mat_008"], condicionesPago: "15 días crédito", notas: null, creadoEn: "2025-09-01" },
  ]);

  // ── ÓRDENES DE COMPRA (store) ────────────────────────────────────────────
  set("hf_ordenes_compra", [
    { id: "oc_001", codigo: "OC-001", proyectoId: "proy_003", proveedorId: "prov_001", solicitudId: "sc_001", fechaCreacion: "2026-02-03", fechaEntregaEstimada: "2026-02-12", estado: "borrador", items: [{ descripcion: "Tablero MDP 15mm", cantidad: 10, precioUnitario: 45000, precioTotal: 450000 }], notas: "Solicitar urgente — HF-003 en espera" },
    { id: "oc_002", codigo: "OC-002", proyectoId: null, proveedorId: "prov_001", solicitudId: null, fechaCreacion: "2026-01-28", fechaEntregaEstimada: "2026-02-05", estado: "recibida", items: [{ descripcion: "Tablero MDP 15mm", cantidad: 15, precioUnitario: 44000, precioTotal: 660000 }, { descripcion: "Tablero MDP 18mm", cantidad: 10, precioUnitario: 51000, precioTotal: 510000 }], notas: "Pedido reposición mensual" },
  ]);

  console.log("✅ HomeFort localStorage seed completo.");
  console.log("   7 proyectos · 4 clientes · 9 materiales · 3 proveedores");
  console.log("   3 OP · 9 etapas · 2 entregas · 2 facturas · 4 pagos");
  console.log("   3 transportes · 1 garantía · Recarga la página para ver los datos.");
})();
