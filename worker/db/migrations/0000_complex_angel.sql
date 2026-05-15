CREATE TABLE `ajustes_costo` (
	`id` text PRIMARY KEY NOT NULL,
	`proyecto_id` text NOT NULL,
	`fecha` text NOT NULL,
	`concepto` text NOT NULL,
	`monto` real NOT NULL,
	`registrado_por` text NOT NULL,
	FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_ajustes_proyecto` ON `ajustes_costo` (`proyecto_id`);--> statement-breakpoint
CREATE TABLE `cambios_proyecto` (
	`id` text PRIMARY KEY NOT NULL,
	`proyecto_id` text NOT NULL,
	`fecha` text NOT NULL,
	`descripcion` text NOT NULL,
	`responsable` text NOT NULL,
	`impacto_costo` real DEFAULT 0 NOT NULL,
	`impacto_dias` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_cambios_proyecto` ON `cambios_proyecto` (`proyecto_id`);--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`contacto` text NOT NULL,
	`tipo` text NOT NULL,
	`empresa` text,
	`creado_en` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_clientes_contacto` ON `clientes` (`contacto`);--> statement-breakpoint
CREATE TABLE `cotizaciones` (
	`id` text PRIMARY KEY NOT NULL,
	`proyecto_id` text NOT NULL,
	`fecha` text NOT NULL,
	`descripcion` text NOT NULL,
	`items` text DEFAULT '[]' NOT NULL,
	`margen_pct` real NOT NULL,
	`condiciones_pago` text NOT NULL,
	`total` real NOT NULL,
	`creada_por` text NOT NULL,
	FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_cotizaciones_proyecto` ON `cotizaciones` (`proyecto_id`);--> statement-breakpoint
CREATE TABLE `entregas_produccion` (
	`id` text PRIMARY KEY NOT NULL,
	`orden_id` text NOT NULL,
	`proyecto_id` text NOT NULL,
	`fecha` text NOT NULL,
	`responsable` text NOT NULL,
	`checklist` text DEFAULT '{}' NOT NULL,
	`observaciones` text,
	FOREIGN KEY (`orden_id`) REFERENCES `ordenes_produccion`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_entregas_orden` ON `entregas_produccion` (`orden_id`);--> statement-breakpoint
CREATE TABLE `especificaciones` (
	`id` text PRIMARY KEY NOT NULL,
	`proyecto_id` text NOT NULL,
	`version` integer NOT NULL,
	`medidas` text NOT NULL,
	`materiales` text NOT NULL,
	`acabados` text NOT NULL,
	`observaciones` text DEFAULT '' NOT NULL,
	`actualizado_en` text NOT NULL,
	`actualizado_por` text NOT NULL,
	FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_espec_proyecto` ON `especificaciones` (`proyecto_id`);--> statement-breakpoint
CREATE TABLE `etapas_produccion` (
	`id` text PRIMARY KEY NOT NULL,
	`orden_id` text NOT NULL,
	`proyecto_id` text NOT NULL,
	`nombre` text NOT NULL,
	`responsable` text NOT NULL,
	`fecha_estimada` text NOT NULL,
	`fecha_completada` text,
	`estado` text DEFAULT 'pendiente' NOT NULL,
	`materiales` text DEFAULT '[]' NOT NULL,
	`observaciones` text DEFAULT '[]' NOT NULL,
	FOREIGN KEY (`orden_id`) REFERENCES `ordenes_produccion`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_etapas_orden` ON `etapas_produccion` (`orden_id`);--> statement-breakpoint
CREATE TABLE `facturas` (
	`id` text PRIMARY KEY NOT NULL,
	`numero` text NOT NULL,
	`proyecto_id` text NOT NULL,
	`cotizacion_id` text NOT NULL,
	`cliente_id` text NOT NULL,
	`fecha_emision` text NOT NULL,
	`fecha_vencimiento` text NOT NULL,
	`monto` real NOT NULL,
	`condiciones_pago` text NOT NULL,
	`estado` text DEFAULT 'Pendiente' NOT NULL,
	FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_facturas_numero` ON `facturas` (`numero`);--> statement-breakpoint
CREATE INDEX `idx_facturas_proyecto` ON `facturas` (`proyecto_id`);--> statement-breakpoint
CREATE INDEX `idx_facturas_cliente` ON `facturas` (`cliente_id`);--> statement-breakpoint
CREATE TABLE `materiales_base` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`categoria` text NOT NULL,
	`unidad` text NOT NULL,
	`costo_unitario` real NOT NULL,
	`actualizado_en` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `movimientos_inventario` (
	`id` text PRIMARY KEY NOT NULL,
	`material_id` text NOT NULL,
	`tipo` text NOT NULL,
	`cantidad` real NOT NULL,
	`fecha` text NOT NULL,
	`proveedor_id` text,
	`proyecto_id` text,
	`responsable` text NOT NULL,
	`notas` text,
	FOREIGN KEY (`material_id`) REFERENCES `materiales_base`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_mov_material` ON `movimientos_inventario` (`material_id`);--> statement-breakpoint
CREATE INDEX `idx_mov_proyecto` ON `movimientos_inventario` (`proyecto_id`);--> statement-breakpoint
CREATE TABLE `ordenes_compra` (
	`id` text PRIMARY KEY NOT NULL,
	`codigo` text NOT NULL,
	`proyecto_id` text NOT NULL,
	`proveedor_id` text NOT NULL,
	`solicitud_id` text,
	`fecha_creacion` text NOT NULL,
	`fecha_entrega_estimada` text NOT NULL,
	`estado` text DEFAULT 'borrador' NOT NULL,
	`items` text DEFAULT '[]' NOT NULL,
	`notas` text,
	FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes_compra`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_oc_codigo` ON `ordenes_compra` (`codigo`);--> statement-breakpoint
CREATE INDEX `idx_oc_proveedor` ON `ordenes_compra` (`proveedor_id`);--> statement-breakpoint
CREATE INDEX `idx_oc_proyecto` ON `ordenes_compra` (`proyecto_id`);--> statement-breakpoint
CREATE TABLE `ordenes_garantia` (
	`id` text PRIMARY KEY NOT NULL,
	`numero` text NOT NULL,
	`proyecto_id` text NOT NULL,
	`solicitud_id` text NOT NULL,
	`fecha_creacion` text NOT NULL,
	`estado` text DEFAULT 'activa' NOT NULL,
	`etapas` text DEFAULT '[]' NOT NULL,
	`costos` text DEFAULT '[]' NOT NULL,
	FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes_garantia`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_og_numero` ON `ordenes_garantia` (`numero`);--> statement-breakpoint
CREATE INDEX `idx_og_proyecto` ON `ordenes_garantia` (`proyecto_id`);--> statement-breakpoint
CREATE TABLE `ordenes_produccion` (
	`id` text PRIMARY KEY NOT NULL,
	`numero` text NOT NULL,
	`proyecto_id` text NOT NULL,
	`cotizacion_id` text NOT NULL,
	`fecha_emision` text NOT NULL,
	`estado` text DEFAULT 'Emitida' NOT NULL,
	`responsable` text NOT NULL,
	`notas` text,
	FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_op_numero` ON `ordenes_produccion` (`numero`);--> statement-breakpoint
CREATE INDEX `idx_op_proyecto` ON `ordenes_produccion` (`proyecto_id`);--> statement-breakpoint
CREATE TABLE `pagos` (
	`id` text PRIMARY KEY NOT NULL,
	`factura_id` text NOT NULL,
	`proyecto_id` text NOT NULL,
	`fecha` text NOT NULL,
	`monto` real NOT NULL,
	`tipo` text NOT NULL,
	`referencia` text,
	FOREIGN KEY (`factura_id`) REFERENCES `facturas`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_pagos_factura` ON `pagos` (`factura_id`);--> statement-breakpoint
CREATE TABLE `proveedores` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`contacto` text NOT NULL,
	`telefono` text NOT NULL,
	`email` text NOT NULL,
	`materiales_ids` text DEFAULT '[]' NOT NULL,
	`condiciones_pago` text NOT NULL,
	`notas` text,
	`creado_en` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `proyectos` (
	`id` text PRIMARY KEY NOT NULL,
	`codigo` text NOT NULL,
	`cliente_id` text NOT NULL,
	`tipo` text NOT NULL,
	`fecha_solicitud` text NOT NULL,
	`estado` text DEFAULT 'Solicitud' NOT NULL,
	`ultima_actualizacion` text NOT NULL,
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_proyectos_codigo` ON `proyectos` (`codigo`);--> statement-breakpoint
CREATE INDEX `idx_proyectos_cliente` ON `proyectos` (`cliente_id`);--> statement-breakpoint
CREATE INDEX `idx_proyectos_estado` ON `proyectos` (`estado`);--> statement-breakpoint
CREATE TABLE `recursos_transporte` (
	`id` text PRIMARY KEY NOT NULL,
	`proyecto_id` text NOT NULL,
	`fecha_programada` text NOT NULL,
	`responsable` text NOT NULL,
	`vehiculo` text NOT NULL,
	`direccion_destino` text NOT NULL,
	`observaciones` text,
	`estado` text DEFAULT 'Programada' NOT NULL,
	FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_transporte_proyecto` ON `recursos_transporte` (`proyecto_id`);--> statement-breakpoint
CREATE TABLE `solicitudes_compra` (
	`id` text PRIMARY KEY NOT NULL,
	`proyecto_id` text NOT NULL,
	`fecha_creacion` text NOT NULL,
	`estado` text DEFAULT 'pendiente' NOT NULL,
	`items` text DEFAULT '[]' NOT NULL,
	`orden_compra_id` text,
	`generada_automaticamente` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_sc_proyecto` ON `solicitudes_compra` (`proyecto_id`);--> statement-breakpoint
CREATE TABLE `solicitudes_garantia` (
	`id` text PRIMARY KEY NOT NULL,
	`proyecto_id` text NOT NULL,
	`fecha` text NOT NULL,
	`descripcion` text NOT NULL,
	`abierto_by` text NOT NULL,
	`estado` text DEFAULT 'abierta' NOT NULL,
	`orden_garantia_id` text,
	FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_sg_proyecto` ON `solicitudes_garantia` (`proyecto_id`);--> statement-breakpoint
CREATE TABLE `usuarios` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`areas` text DEFAULT '[]' NOT NULL,
	`es_admin` integer DEFAULT false NOT NULL,
	`activo` integer DEFAULT true NOT NULL,
	`intentos_fallidos` integer DEFAULT 0 NOT NULL,
	`bloqueado_hasta` text,
	`creado_en` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_usuarios_email` ON `usuarios` (`email`);