-- Make proyecto_id nullable on ordenes_compra
-- SQLite doesn't support ALTER COLUMN, so we recreate the table.

PRAGMA foreign_keys=OFF;
--> statement-breakpoint

CREATE TABLE ordenes_compra_new (
  id TEXT PRIMARY KEY,
  codigo TEXT NOT NULL,
  proyecto_id TEXT REFERENCES proyectos(id),
  proveedor_id TEXT NOT NULL REFERENCES proveedores(id),
  solicitud_id TEXT REFERENCES solicitudes_compra(id),
  fecha_creacion TEXT NOT NULL,
  fecha_entrega_estimada TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'borrador',
  items TEXT NOT NULL DEFAULT '[]',
  notas TEXT
);
--> statement-breakpoint

INSERT INTO ordenes_compra_new SELECT * FROM ordenes_compra;
--> statement-breakpoint

DROP TABLE ordenes_compra;
--> statement-breakpoint

ALTER TABLE ordenes_compra_new RENAME TO ordenes_compra;
--> statement-breakpoint

CREATE UNIQUE INDEX uq_oc_codigo ON ordenes_compra(codigo);
--> statement-breakpoint
CREATE INDEX idx_oc_proveedor ON ordenes_compra(proveedor_id);
--> statement-breakpoint
CREATE INDEX idx_oc_proyecto ON ordenes_compra(proyecto_id);
--> statement-breakpoint

PRAGMA foreign_keys=ON;
