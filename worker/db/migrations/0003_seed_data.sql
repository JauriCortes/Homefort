-- ─── SEED DE DATOS ────────────────────────────────────────────────────────────
-- Migración de datos iniciales para HomeFort.
-- Usa INSERT OR IGNORE — se puede aplicar múltiples veces sin duplicar registros.

-- ─── USUARIOS ─────────────────────────────────────────────────────────────────
-- Contraseñas (bcrypt $2b$12$, 12 rounds):
--   laura   → comercial123
--   carlos  → compras123
--   maria   → produccion123
--   andres  → admin123
INSERT OR IGNORE INTO usuarios (id, nombre, email, password_hash, areas, es_admin, activo, intentos_fallidos, creado_en) VALUES
  ('u_laura',  'Laura García',    'laura@homefort.co',  '$2b$12$nPXfWRLDSYZb9rgVyPg2zOpvJjnp5Qd3H51vUw52ygZjNR5xDOsMu', '["comercial"]',                                    0, 1, 0, '2025-01-01T00:00:00.000Z'),
  ('u_carlos', 'Carlos Mendoza',  'carlos@homefort.co', '$2b$12$lRgAZPaxqSi9UVm0iLTm0eOfyzF0r.74Tq0T5jY4hv.dVqY3GruZW', '["compras"]',                                      0, 1, 0, '2025-01-01T00:00:00.000Z'),
  ('u_maria',  'María Rodríguez', 'maria@homefort.co',  '$2b$12$r/BJ1Bz3I7Mc4zWntFctS.wuSzn/F5Cs3jAU.z7IhfqHR0Qw2ef6a', '["produccion"]',                                   0, 1, 0, '2025-01-01T00:00:00.000Z'),
  ('u_andres', 'Andrés Torres',   'andres@homefort.co', '$2b$12$5Rt1IU0GsbrfX6YRRo11s.94fsiJbaCuMzZwIgEawVN5T9jrmsBWe', '["comercial","compras","produccion","administrativa"]', 1, 1, 0, '2025-01-01T00:00:00.000Z');

-- ─── CLIENTES ─────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO clientes (id, nombre, contacto, tipo, empresa, creado_en) VALUES
  ('cli_001', 'Ana Martínez Ruiz',      '3101234567', 'B2C', NULL,                       '2025-09-01T08:00:00.000Z'),
  ('cli_002', 'Diseños Modernos SAS',   '3209876543', 'B2B', 'Diseños Modernos SAS',     '2025-09-05T09:00:00.000Z'),
  ('cli_003', 'Carlos Reyes Vargas',    '3154445566', 'B2C', NULL,                       '2025-09-10T10:00:00.000Z'),
  ('cli_004', 'Constructora Andina SAS','3167778899', 'B2B', 'Constructora Andina SAS',  '2025-10-01T08:00:00.000Z');

-- ─── PROYECTOS ────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO proyectos
  (id, codigo, cliente_id, tipo, titulo, descripcion_proyecto, aspectos, caracteristicas,
   fecha_solicitud, fecha_entrega, estado, ultima_actualizacion) VALUES
  ('proy_001','HF-001','cli_001','Clóset empotrado',
   'Clóset empotrado dormitorio principal',
   'Clóset empotrado a medida para dormitorio principal de apartamento',
   'Espacio limitado, paredes irregulares','Apertura abatible, interior con cajonería',
   '2025-10-15','2026-01-20','Entregado','2026-01-20T00:00:00.000Z'),
  ('proy_002','HF-002','cli_002','Cocina integral',
   'Cocina integral modular alta gama',
   'Cocina en L con isla central para showroom de Diseños Modernos',
   'Acceso por carga, piso nivelado','Soft-close en todas las puertas, iluminación LED',
   '2025-11-20',NULL,'En producción','2026-02-10T00:00:00.000Z'),
  ('proy_003','HF-003','cli_003','Escritorio y biblioteca',
   'Escritorio y biblioteca sala de estudio',
   'Módulo de escritorio con biblioteca empotrada para home office',
   'Espacio 3.20m, techo inclinado','Tablero flotante, repisa iluminada',
   '2026-01-08',NULL,'Aprobada','2026-02-01T00:00:00.000Z'),
  ('proy_004','HF-004','cli_004','Mueble de baño flotante',
   'Mueble de baño flotante con doble lavamanos',
   'Mueble flotante baño principal proyecto Reserva del Norte',
   'Baño húmedo, 1.80m de ancho','Resistente a humedad, tablero de cuarzo',
   '2026-02-14',NULL,'En cotización','2026-03-10T00:00:00.000Z'),
  ('proy_005','HF-005','cli_001','Sala de estar modular',
   'Sala de estar con módulo TV integrado',
   'Mueble modular sala con TV 75" y almacenamiento',
   'Pared 4m, instalación eléctrica existente','Puertas corredizas, retroiluminación',
   '2026-03-01',NULL,'En definición','2026-03-01T00:00:00.000Z'),
  ('proy_006','HF-006','cli_003','Comedor extensible',
   'Comedor extensible con cajonería lateral',
   'Mesa extensible 6-10 personas con mueble cajonero a juego',
   'Comedor 4x4m, piso de madera','Mesa extensible, cajonería cierre suave',
   '2025-09-05','2025-12-10','En garantía','2026-02-20T00:00:00.000Z'),
  ('proy_007','HF-007','cli_002','Guardarropa juvenil',
   'Guardarropa habitación juvenil con escritorio integrado',
   'Proyecto cancelado por cliente antes de aprobación',
   '','','2025-12-10',NULL,'Rechazada','2025-12-22T00:00:00.000Z');

-- ─── ESPECIFICACIONES ─────────────────────────────────────────────────────────
INSERT OR IGNORE INTO especificaciones
  (id, proyecto_id, version, contenido, medidas, materiales, acabados, observaciones, actualizado_en, actualizado_por) VALUES
  ('esp_001a','proy_001',1,'',
   '2.40m alto × 1.80m ancho × 0.60m prof',
   'Tablero MDP 18mm estructura; Tablero MDF 9mm fondos; Canto PVC 1mm blanco',
   'Laca blanca mate brillante; manijas barra aluminio',
   'Revisar plomada en pared izquierda antes de instalar',
   '2025-11-01T10:00:00.000Z','Laura García'),
  ('esp_001b','proy_001',2,'',
   '2.40m alto × 1.80m ancho × 0.60m prof — 2 cajones adicionales inferiores',
   'Tablero MDP 18mm estructura; Tablero MDF 9mm fondos; Riel telescópico 45cm; Canto PVC 1mm',
   'Laca blanca mate; manijas barra aluminio 128mm',
   'Incluir tope de cajón en cajón superior derecho',
   '2025-11-15T14:30:00.000Z','Laura García'),
  ('esp_002','proy_002',1,'',
   'Módulo bajo 2.80m × 0.60m prof; Isla 1.20m × 0.80m × 0.90m alto',
   'Tablero MDP 15mm módulos bajos; MDP 18mm isla y laterales; Riel cajonera soft-close',
   'Laca gris marengo con isla en blanco; manijas barra aluminio negro',
   'Verificar instalación de gas antes de posicionar módulo esquina',
   '2025-12-01T09:00:00.000Z','Laura García'),
  ('esp_003','proy_003',1,'',
   'Escritorio 3.20m × 0.65m prof; Biblioteca 2.20m alto × 3.20m ancho',
   'Tablero MDP 15mm estructura; MDF 9mm repisas; Canto PVC roble natural',
   'Acabado vinilo roble; vidrio templado repisa central',
   'Techo inclinado: adaptar lateral izquierdo con corte diagonal',
   '2026-01-20T11:00:00.000Z','Laura García'),
  ('esp_004','proy_004',1,'',
   '1.80m ancho × 0.50m prof × 0.55m alto (flotante a 45cm del piso)',
   'Tablero MDP 18mm carcasa; MDF 9mm tablero posterior; bisagras amortiguadas',
   'Enchape wengué; tablero de cuarzo blanco',
   'Zona húmeda — aplicar sellante en todas las uniones',
   '2026-02-25T15:00:00.000Z','Laura García'),
  ('esp_005','proy_005',1,'',
   '4.00m ancho × 0.40m prof × 2.10m alto',
   'Tablero MDP 18mm estructura; MDF 9mm fondo y divisiones',
   'Laca blanco roto; retroiluminación LED cálida',
   'Dejar ducto para cables de TV y consola',
   '2026-03-05T10:00:00.000Z','Laura García'),
  ('esp_006','proy_006',1,'',
   'Mesa 1.60m cerrada / 2.40m extendida × 0.90m; Cajonero 1.20m × 0.45m × 0.85m alto',
   'Tablero MDP 18mm base y cajonero; Canto PVC 1mm nogal; Bisagra + riel telescópico',
   'Laca nogal natural; manijas gota aluminio',
   'Sistema extensión mesa con guía central de aluminio',
   '2025-09-20T09:00:00.000Z','Laura García');

-- ─── COTIZACIONES ─────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO cotizaciones
  (id, proyecto_id, fecha, descripcion, items, margen_pct, condiciones_pago, total, creada_por) VALUES
  ('cot_001','proy_001','2025-11-15','Cotización definitiva con cajones adicionales',
   '[{"descripcion":"Tablero MDP 18mm","cantidad":5,"precioUnitario":52000,"precioTotal":260000},{"descripcion":"Tablero MDF 9mm","cantidad":3,"precioUnitario":38000,"precioTotal":114000},{"descripcion":"Canto PVC 1mm","cantidad":30,"precioUnitario":8500,"precioTotal":255000},{"descripcion":"Bisagra cazoleta 35mm","cantidad":12,"precioUnitario":4200,"precioTotal":50400},{"descripcion":"Manija barra aluminio","cantidad":4,"precioUnitario":18000,"precioTotal":72000},{"descripcion":"Riel cajonera telescópica","cantidad":4,"precioUnitario":32000,"precioTotal":128000},{"descripcion":"Mano de obra e instalación","cantidad":1,"precioUnitario":850000,"precioTotal":850000}]',
   20,'50% anticipo, 50% contra entrega',2075280,'Laura García'),
  ('cot_002','proy_002','2025-12-15','Cotización cocina integral con isla',
   '[{"descripcion":"Tablero MDP 15mm","cantidad":10,"precioUnitario":45000,"precioTotal":450000},{"descripcion":"Tablero MDP 18mm","cantidad":8,"precioUnitario":52000,"precioTotal":416000},{"descripcion":"Riel cajonera telescópica","cantidad":8,"precioUnitario":32000,"precioTotal":256000},{"descripcion":"Manija barra aluminio","cantidad":6,"precioUnitario":18000,"precioTotal":108000},{"descripcion":"Bisagra cazoleta 35mm","cantidad":20,"precioUnitario":4200,"precioTotal":84000},{"descripcion":"Mano de obra e instalación","cantidad":1,"precioUnitario":1400000,"precioTotal":1400000}]',
   25,'40% anticipo, 30% inicio producción, 30% contra entrega',3392500,'Laura García'),
  ('cot_003','proy_003','2026-01-25','Cotización escritorio y biblioteca a medida',
   '[{"descripcion":"Tablero MDP 15mm","cantidad":40,"precioUnitario":45000,"precioTotal":1800000},{"descripcion":"Tablero MDF 9mm","cantidad":5,"precioUnitario":38000,"precioTotal":190000},{"descripcion":"Canto PVC 1mm","cantidad":50,"precioUnitario":8500,"precioTotal":425000},{"descripcion":"Bisagra cazoleta 35mm","cantidad":8,"precioUnitario":4200,"precioTotal":33600},{"descripcion":"Mano de obra e instalación","cantidad":1,"precioUnitario":700000,"precioTotal":700000}]',
   20,'50% anticipo, 50% contra entrega',3778320,'Laura García'),
  ('cot_004','proy_004','2026-03-10','Cotización mueble baño flotante',
   '[{"descripcion":"Tablero MDP 18mm","cantidad":3,"precioUnitario":52000,"precioTotal":156000},{"descripcion":"Tablero MDF 9mm","cantidad":2,"precioUnitario":38000,"precioTotal":76000},{"descripcion":"Bisagra cazoleta 35mm","cantidad":6,"precioUnitario":4200,"precioTotal":25200},{"descripcion":"Manija barra aluminio","cantidad":2,"precioUnitario":18000,"precioTotal":36000},{"descripcion":"Mano de obra e instalación","cantidad":1,"precioUnitario":550000,"precioTotal":550000}]',
   20,'50% anticipo, 50% contra entrega',1011840,'Laura García'),
  ('cot_006','proy_006','2025-09-25','Cotización comedor extensible y cajonero',
   '[{"descripcion":"Tablero MDP 18mm","cantidad":4,"precioUnitario":52000,"precioTotal":208000},{"descripcion":"Canto PVC 1mm","cantidad":15,"precioUnitario":8500,"precioTotal":127500},{"descripcion":"Bisagra cazoleta 35mm","cantidad":8,"precioUnitario":4200,"precioTotal":33600},{"descripcion":"Manija barra aluminio","cantidad":4,"precioUnitario":18000,"precioTotal":72000},{"descripcion":"Mano de obra e instalación","cantidad":1,"precioUnitario":750000,"precioTotal":750000}]',
   20,'50% anticipo, 50% contra entrega',1429320,'Laura García');

-- ─── CAMBIOS DE PROYECTO ──────────────────────────────────────────────────────
INSERT OR IGNORE INTO cambios_proyecto (id, proyecto_id, fecha, descripcion, responsable, impacto_costo, impacto_dias) VALUES
  ('cam_001','proy_001','2025-11-14','Cliente solicitó 2 cajones adicionales con rieles telescópicos','Laura García',128000,3),
  ('cam_002','proy_002','2026-01-10','Cambio color módulos altos de gris a blanco para unificar con isla','Laura García',45000,1);

-- ─── MATERIALES BASE ──────────────────────────────────────────────────────────
INSERT OR IGNORE INTO materiales_base (id, nombre, categoria, unidad, costo_unitario, actualizado_en) VALUES
  ('mat_001','Tablero MDP 15mm',          'Madera',   'lámina',45000, '2025-08-01T00:00:00.000Z'),
  ('mat_002','Tablero MDP 18mm',          'Madera',   'lámina',52000, '2025-08-01T00:00:00.000Z'),
  ('mat_003','Tablero MDF 9mm',           'Madera',   'lámina',38000, '2025-08-01T00:00:00.000Z'),
  ('mat_004','Canto PVC 1mm',             'Acabados', 'metro',  8500, '2025-08-01T00:00:00.000Z'),
  ('mat_005','Riel cajonera telescópica', 'Herrajes', 'par',   32000, '2025-08-01T00:00:00.000Z'),
  ('mat_006','Bisagra cazoleta 35mm',     'Herrajes', 'und',    4200, '2025-08-01T00:00:00.000Z'),
  ('mat_007','Manija barra aluminio',     'Herrajes', 'und',   18000, '2025-08-01T00:00:00.000Z'),
  ('mat_008','Pintura laca blanca mate',  'Acabados', 'galón', 95000, '2025-08-01T00:00:00.000Z'),
  ('mat_009','Tornillo autoperforante 3.5x35','Herrajes','und',  180, '2025-08-01T00:00:00.000Z');

-- ─── PROVEEDORES ──────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO proveedores
  (id, nombre, contacto, telefono, email, materiales_ids, condiciones_pago, notas, creado_en) VALUES
  ('prov_001','Maderplast Ltda','Jorge Salamanca','6013456789','ventas@maderplast.co',
   '["mat_001","mat_002","mat_003"]','30 días crédito','Entrega en 3 días hábiles.','2025-08-15T00:00:00.000Z'),
  ('prov_002','Herrajes & Accesorios SAS','Claudia Mora','6014567890','info@herrajes.co',
   '["mat_004","mat_005","mat_006","mat_007","mat_009"]','Contado con descuento 5%',
   'Descuento en pedidos >20 rieles.','2025-08-20T00:00:00.000Z'),
  ('prov_003','Pinturas Nacionales SA','Roberto Cano','6015678901','comercial@pintunasal.co',
   '["mat_008"]','15 días crédito',NULL,'2025-09-01T00:00:00.000Z');

-- ─── MOVIMIENTOS DE INVENTARIO ────────────────────────────────────────────────
-- Entradas iniciales
INSERT OR IGNORE INTO movimientos_inventario
  (id, material_id, tipo, cantidad, fecha, proveedor_id, proyecto_id, responsable, notas) VALUES
  ('mv_e01','mat_001','entrada',30,'2025-08-10','prov_001',NULL,'Carlos Mendoza','Pedido inicial temporada'),
  ('mv_e02','mat_002','entrada',40,'2025-08-10','prov_001',NULL,'Carlos Mendoza','Pedido inicial temporada'),
  ('mv_e03','mat_003','entrada',30,'2025-08-10','prov_001',NULL,'Carlos Mendoza','Pedido inicial temporada'),
  ('mv_e04','mat_004','entrada',200,'2025-08-12','prov_002',NULL,'Carlos Mendoza','Rollo 200m'),
  ('mv_e05','mat_005','entrada',30,'2025-08-12','prov_002',NULL,'Carlos Mendoza','Stock herrajes'),
  ('mv_e06','mat_006','entrada',100,'2025-08-12','prov_002',NULL,'Carlos Mendoza','Stock herrajes'),
  ('mv_e07','mat_007','entrada',20,'2025-08-12','prov_002',NULL,'Carlos Mendoza','Stock herrajes'),
  ('mv_e08','mat_008','entrada',10,'2025-08-15','prov_003',NULL,'Carlos Mendoza','Pintura inicial'),
  ('mv_e09','mat_009','entrada',500,'2025-08-12','prov_002',NULL,'Carlos Mendoza','Caja 500 und'),
  ('mv_e10','mat_001','entrada',15,'2026-02-05','prov_001',NULL,'Carlos Mendoza','OC-002 reposición');
-- Bloqueos + consumos HF-006 (ciclo completo)
INSERT OR IGNORE INTO movimientos_inventario
  (id, material_id, tipo, cantidad, fecha, proveedor_id, proyecto_id, responsable, notas) VALUES
  ('mv_b06a','mat_002','bloqueo',4, '2025-10-01',NULL,'proy_006','María Rodríguez','Etapa corte comedor'),
  ('mv_b06b','mat_004','bloqueo',15,'2025-10-01',NULL,'proy_006','María Rodríguez','Etapa corte comedor'),
  ('mv_b06c','mat_006','bloqueo',8, '2025-10-01',NULL,'proy_006','María Rodríguez','Etapa armado'),
  ('mv_b06d','mat_007','bloqueo',4, '2025-10-01',NULL,'proy_006','María Rodríguez','Etapa armado'),
  ('mv_c06a','mat_002','consumo',4, '2025-12-05',NULL,'proy_006','María Rodríguez','Cierre etapa armado'),
  ('mv_c06b','mat_004','consumo',14,'2025-12-05',NULL,'proy_006','María Rodríguez','Cierre etapa acabados'),
  ('mv_c06c','mat_006','consumo',7, '2025-12-05',NULL,'proy_006','María Rodríguez','Cierre etapa armado'),
  ('mv_c06d','mat_007','consumo',4, '2025-12-05',NULL,'proy_006','María Rodríguez','Cierre etapa armado');
-- Bloqueos + consumos HF-001 (ciclo completo)
INSERT OR IGNORE INTO movimientos_inventario
  (id, material_id, tipo, cantidad, fecha, proveedor_id, proyecto_id, responsable, notas) VALUES
  ('mv_b01a','mat_002','bloqueo',5, '2025-11-25',NULL,'proy_001','María Rodríguez','Etapa corte'),
  ('mv_b01b','mat_003','bloqueo',3, '2025-11-25',NULL,'proy_001','María Rodríguez','Etapa corte'),
  ('mv_b01c','mat_004','bloqueo',30,'2025-11-25',NULL,'proy_001','María Rodríguez','Etapa canteado'),
  ('mv_b01d','mat_005','bloqueo',4, '2025-11-25',NULL,'proy_001','María Rodríguez','Etapa cajones'),
  ('mv_b01e','mat_006','bloqueo',12,'2025-11-25',NULL,'proy_001','María Rodríguez','Etapa herrajes'),
  ('mv_b01f','mat_007','bloqueo',4, '2025-11-25',NULL,'proy_001','María Rodríguez','Etapa herrajes'),
  ('mv_c01a','mat_002','consumo',5, '2025-12-20',NULL,'proy_001','María Rodríguez','Cierre corte'),
  ('mv_c01b','mat_003','consumo',3, '2025-12-20',NULL,'proy_001','María Rodríguez','Cierre corte'),
  ('mv_c01c','mat_004','consumo',28,'2025-12-20',NULL,'proy_001','María Rodríguez','Cierre acabados'),
  ('mv_c01d','mat_005','consumo',4, '2025-12-20',NULL,'proy_001','María Rodríguez','Cierre cajones'),
  ('mv_c01e','mat_006','consumo',10,'2025-12-20',NULL,'proy_001','María Rodríguez','Cierre herrajes'),
  ('mv_c01f','mat_007','consumo',4, '2025-12-22',NULL,'proy_001','María Rodríguez','Cierre instalación');
-- Bloqueos + consumos parciales HF-002 (en producción)
INSERT OR IGNORE INTO movimientos_inventario
  (id, material_id, tipo, cantidad, fecha, proveedor_id, proyecto_id, responsable, notas) VALUES
  ('mv_b02a','mat_001','bloqueo',10,'2026-01-05',NULL,'proy_002','María Rodríguez','Etapa corte módulos'),
  ('mv_b02b','mat_002','bloqueo',8, '2026-01-05',NULL,'proy_002','María Rodríguez','Etapa corte módulos'),
  ('mv_b02c','mat_005','bloqueo',8, '2026-01-05',NULL,'proy_002','María Rodríguez','Etapa cajonería'),
  ('mv_b02d','mat_007','bloqueo',6, '2026-01-05',NULL,'proy_002','María Rodríguez','Etapa herrajes'),
  ('mv_c02a','mat_001','consumo',5, '2026-01-20',NULL,'proy_002','María Rodríguez','Cierre corte módulos bajos'),
  ('mv_c02b','mat_002','consumo',4, '2026-01-20',NULL,'proy_002','María Rodríguez','Cierre corte módulos bajos'),
  ('mv_c02c','mat_005','consumo',8, '2026-02-05',NULL,'proy_002','María Rodríguez','Cierre cajonería');

-- ─── SOLICITUDES DE COMPRA ────────────────────────────────────────────────────
INSERT OR IGNORE INTO solicitudes_compra
  (id, proyecto_id, fecha_creacion, estado, items, generada_automaticamente) VALUES
  ('sc_001','proy_003','2026-02-01','pendiente',
   '[{"materialId":"mat_001","cantidadFaltante":5}]',1);

-- ─── ÓRDENES DE COMPRA ────────────────────────────────────────────────────────
INSERT OR IGNORE INTO ordenes_compra
  (id, codigo, proyecto_id, proveedor_id, solicitud_id, fecha_creacion,
   fecha_entrega_estimada, estado, items, notas) VALUES
  ('oc_001','OC-001','proy_003','prov_001','sc_001','2026-02-03','2026-02-12','borrador',
   '[{"descripcion":"Tablero MDP 15mm","cantidad":10,"precioUnitario":45000,"precioTotal":450000}]',
   'Solicitar urgente — HF-003 en espera de material'),
  ('oc_002','OC-002',NULL,'prov_001',NULL,'2026-01-28','2026-02-05','recibida',
   '[{"descripcion":"Tablero MDP 15mm","cantidad":15,"precioUnitario":44000,"precioTotal":660000},{"descripcion":"Tablero MDP 18mm","cantidad":10,"precioUnitario":51000,"precioTotal":510000}]',
   'Pedido de reposición mensual — ya recibido en bodega');

-- ─── ÓRDENES DE PRODUCCIÓN ────────────────────────────────────────────────────
INSERT OR IGNORE INTO ordenes_produccion
  (id, numero, proyecto_id, cotizacion_id, fecha_emision, estado, responsable, notas) VALUES
  ('op_001','OP-001','proy_001','cot_001','2025-11-25','Finalizada','María Rodríguez','Orden completada y proyecto entregado'),
  ('op_002','OP-002','proy_002','cot_002','2026-01-05','En producción','María Rodríguez','Etapa 3 (instalación) en curso'),
  ('op_006','OP-006','proy_006','cot_006','2025-10-01','Finalizada','María Rodríguez','Orden completada — proyecto en garantía por falla en riel');

-- ─── ETAPAS DE PRODUCCIÓN ─────────────────────────────────────────────────────
INSERT OR IGNORE INTO etapas_produccion
  (id, orden_id, proyecto_id, nombre, responsable, fecha_estimada, fecha_completada,
   estado, materiales, observaciones) VALUES
  ('et_001a','op_001','proy_001','Corte y canteado de tableros','Carlos Pineda',
   '2025-11-28','2025-11-29','completada',
   '[{"materialId":"mat_002","cantidadEstimada":5,"cantidadReal":5},{"materialId":"mat_003","cantidadEstimada":3,"cantidadReal":3},{"materialId":"mat_004","cantidadEstimada":30,"cantidadReal":28}]','[]'),
  ('et_001b','op_001','proy_001','Armado y ensamble','Carlos Pineda',
   '2025-12-05','2025-12-08','completada',
   '[{"materialId":"mat_005","cantidadEstimada":4,"cantidadReal":4},{"materialId":"mat_006","cantidadEstimada":12,"cantidadReal":10}]',
   '[{"id":"obs_001","texto":"Cajón superior requirió ajuste de riel — 2 tornillos adicionales","tipo":"observacion","fecha":"2025-12-07","autor":"Carlos Pineda"}]'),
  ('et_001c','op_001','proy_001','Acabados, pintura e instalación','Carlos Pineda',
   '2025-12-15','2025-12-20','completada',
   '[{"materialId":"mat_007","cantidadEstimada":4,"cantidadReal":4}]','[]'),
  ('et_002a','op_002','proy_002','Corte módulos bajos y altos','Carlos Pineda',
   '2026-01-10','2026-01-20','completada',
   '[{"materialId":"mat_001","cantidadEstimada":10,"cantidadReal":5},{"materialId":"mat_002","cantidadEstimada":8,"cantidadReal":4}]','[]'),
  ('et_002b','op_002','proy_002','Ensamble cajonería y rieles','Carlos Pineda',
   '2026-01-25','2026-02-05','completada',
   '[{"materialId":"mat_005","cantidadEstimada":8,"cantidadReal":8}]',
   '[{"id":"obs_002","texto":"Tablero con deformación — descartado y reemplazado sin costo","tipo":"retrabajo","fecha":"2026-01-28","autor":"Carlos Pineda"}]'),
  ('et_002c','op_002','proy_002','Pintura, herrajes e instalación en sitio','Carlos Pineda',
   '2026-02-20',NULL,'en_curso',
   '[{"materialId":"mat_007","cantidadEstimada":6,"cantidadReal":null}]','[]'),
  ('et_006a','op_006','proy_006','Corte y canteado comedor','Carlos Pineda',
   '2025-10-08','2025-10-10','completada',
   '[{"materialId":"mat_002","cantidadEstimada":4,"cantidadReal":4},{"materialId":"mat_004","cantidadEstimada":15,"cantidadReal":14}]','[]'),
  ('et_006b','op_006','proy_006','Armado mesa y cajonero','Carlos Pineda',
   '2025-10-20','2025-11-05','completada',
   '[{"materialId":"mat_006","cantidadEstimada":8,"cantidadReal":7},{"materialId":"mat_007","cantidadEstimada":4,"cantidadReal":4}]','[]'),
  ('et_006c','op_006','proy_006','Acabados e instalación en sitio','Carlos Pineda',
   '2025-12-05','2025-12-08','completada','[]','[]');

-- ─── ENTREGAS DE PRODUCCIÓN ───────────────────────────────────────────────────
INSERT OR IGNORE INTO entregas_produccion
  (id, orden_id, proyecto_id, fecha, responsable, checklist, observaciones) VALUES
  ('ent_001','op_001','proy_001','2026-01-20','María Rodríguez',
   '{"itemsRevisados":true,"cantidadCorrecta":true,"acabadoAprobado":true,"clienteFirmo":true}',
   'Cliente satisfecho. Firmó acta de entrega sin observaciones.'),
  ('ent_006','op_006','proy_006','2025-12-10','María Rodríguez',
   '{"itemsRevisados":true,"cantidadCorrecta":true,"acabadoAprobado":true,"clienteFirmo":true}',
   'Entrega sin novedad. Instalación completa en comedor.');

-- ─── FACTURAS ─────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO facturas
  (id, numero, proyecto_id, cotizacion_id, cliente_id, fecha_emision,
   fecha_vencimiento, monto, condiciones_pago, estado) VALUES
  ('fac_001','FAC-001','proy_001','cot_001','cli_001','2026-01-20','2026-02-20',
   2075280,'50% anticipo, 50% contra entrega','Pagada'),
  ('fac_006','FAC-006','proy_006','cot_006','cli_003','2025-12-10','2026-01-10',
   1429320,'50% anticipo, 50% contra entrega','Pagada');

-- ─── PAGOS ────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO pagos
  (id, factura_id, proyecto_id, fecha, monto, tipo, referencia) VALUES
  ('pag_001a','fac_001','proy_001','2025-11-25',1037640,'Transferencia','TRF-20251125-001'),
  ('pag_001b','fac_001','proy_001','2026-01-20',1037640,'Transferencia','TRF-20260120-007'),
  ('pag_006a','fac_006','proy_006','2025-10-05',714660,'Transferencia','TRF-20251005-003'),
  ('pag_006b','fac_006','proy_006','2025-12-12',714660,'Efectivo',NULL);

-- ─── RECURSOS DE TRANSPORTE ───────────────────────────────────────────────────
INSERT OR IGNORE INTO recursos_transporte
  (id, proyecto_id, fecha_programada, responsable, vehiculo,
   direccion_destino, observaciones, estado) VALUES
  ('tr_001','proy_001','2026-01-20','Carlos Pineda','Camión NKR placa TXC-412',
   'Cra 15 # 85-30 Apto 501 Bogotá','Acceso por ascensor de carga. Contactar portería.','Entregada'),
  ('tr_006','proy_006','2025-12-10','Carlos Pineda','Furgón Hyundai placa OXK-831',
   'Calle 100 # 19-61 Casa 12 Bogotá','Acceso por entrada lateral del conjunto.','Entregada'),
  ('tr_002','proy_002','2026-03-15','Carlos Pineda','Camión NKR placa TXC-412',
   'Cra 7 # 45-20 Local 3 Bogotá','Coordinar con Claudia Mora para acceso al showroom.','Programada');

-- ─── AJUSTES DE COSTO ─────────────────────────────────────────────────────────
INSERT OR IGNORE INTO ajustes_costo
  (id, proyecto_id, fecha, concepto, monto, registrado_por) VALUES
  ('ajc_001','proy_001','2025-12-07','Tornillos y consumibles adicionales no incluidos en cotización',25000,'Andrés Torres'),
  ('ajc_002','proy_002','2026-01-28','Tablero MDP descartado por deformación — costo asumido por empresa',45000,'Andrés Torres');

-- ─── SOLICITUDES DE GARANTÍA ──────────────────────────────────────────────────
INSERT OR IGNORE INTO solicitudes_garantia
  (id, proyecto_id, fecha, descripcion, abierto_by, estado, orden_garantia_id) VALUES
  ('sg_001','proy_006','2026-02-15',
   'El riel de la cajonería lateral presenta ruido al deslizarse y traba a la mitad del recorrido. Cliente solicita revisión urgente.',
   'Laura García','en_proceso','og_001');

-- ─── ÓRDENES DE GARANTÍA ──────────────────────────────────────────────────────
INSERT OR IGNORE INTO ordenes_garantia
  (id, numero, proyecto_id, solicitud_id, fecha_creacion, estado, etapas, costos) VALUES
  ('og_001','OG-001','proy_006','sg_001','2026-02-16','activa',
   '[{"id":"eg_001","ordenId":"og_001","nombre":"Revisión y diagnóstico de cajonería","responsable":"Carlos Pineda","fechaEstimada":"2026-02-20","estado":"completada","observaciones":"Riel izquierdo con partícula atascada — limpieza y lubricación realizada"},{"id":"eg_002","ordenId":"og_001","nombre":"Reemplazo de riel defectuoso","responsable":"Carlos Pineda","fechaEstimada":"2026-02-28","estado":"pendiente","observaciones":""}]',
   '[{"concepto":"Mano de obra visita diagnóstico","monto":80000,"fecha":"2026-02-20"},{"concepto":"Riel cajonera telescópica (reemplazo)","monto":32000,"fecha":"2026-02-20"}]');
