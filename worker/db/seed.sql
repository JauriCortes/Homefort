-- Seed de usuarios de desarrollo
-- Contraseñas (bcrypt $2b$12$, 12 rounds):
--   laura   → comercial123
--   carlos  → compras123
--   maria   → produccion123
--   andres  → admin123

INSERT OR IGNORE INTO usuarios (id, nombre, email, password_hash, areas, es_admin, activo, intentos_fallidos, creado_en) VALUES
  ('u_laura',
   'Laura García',
   'laura@homefort.co',
   '$2b$12$nPXfWRLDSYZb9rgVyPg2zOpvJjnp5Qd3H51vUw52ygZjNR5xDOsMu',
   '["comercial"]',
   0, 1, 0,
   '2025-01-01T00:00:00.000Z'),

  ('u_carlos',
   'Carlos Mendoza',
   'carlos@homefort.co',
   '$2b$12$lRgAZPaxqSi9UVm0iLTm0eOfyzF0r.74Tq0T5jY4hv.dVqY3GruZW',
   '["compras"]',
   0, 1, 0,
   '2025-01-01T00:00:00.000Z'),

  ('u_maria',
   'María Rodríguez',
   'maria@homefort.co',
   '$2b$12$r/BJ1Bz3I7Mc4zWntFctS.wuSzn/F5Cs3jAU.z7IhfqHR0Qw2ef6a',
   '["produccion"]',
   0, 1, 0,
   '2025-01-01T00:00:00.000Z'),

  ('u_andres',
   'Andrés Torres',
   'andres@homefort.co',
   '$2b$12$5Rt1IU0GsbrfX6YRRo11s.94fsiJbaCuMzZwIgEawVN5T9jrmsBWe',
   '["comercial","compras","produccion","administrativa"]',
   1, 1, 0,
   '2025-01-01T00:00:00.000Z');
