# Bitácora de Correcciones del Prototipo

**HF HomeFort — Sistema de Gestión de Proyectos de Carpintería**  
**Fecha de cierre:** 2026-05-16

---

## Distribución de épicas por integrante

| Integrante | Épica | HU | Carga |
|---|---|---|---|
| **Sergio** | Épica 2 — Gestión de Compras | HU-2.1 a HU-2.5 | 5 HU |
| **Zara** | Épica 4 — Producción · Épica 6 — Seguimiento | HU-4.1 a HU-4.5 | 5 HU |
| **Tatiana** | Épica 3 — Administrativa · Épica 5 — Postventa | HU-3.1 a HU-3.5 · HU-5.1 a HU-5.4 | 5 HU |
| **Jauri** | Épica 1 — Gestión Comercial · Épica 7 — Administración del Sistema | HU-1.1 a HU-1.5 · HU-7.1 a HU-7.4 | 8 HU |

---

## Épica 1 — Gestión Comercial

**Responsable:** Jauri · **HU:** 1.1 a 1.5

| Tipo | HU relacionada | Corrección / Mejora |
|---|---|---|
| Migración | HU-1.1 a HU-1.5 | Migración completa del dominio Comercial de localStorage a Hono + Cloudflare D1. Se crearon `worker/routes/comercial.ts` y `src/hooks/api/use-comercial.ts` con React Query. |
| Fix | HU-1.1 Clientes | Se prevenía guardar clientes con nombre duplicado sin mostrar error claro. Se añadió validación 409 Conflict en el backend y mensaje descriptivo en el formulario. |
| Feat | HU-1.2 Proyectos | Rediseño del formulario de proyecto con campos estructurados. Se añadió opción de eliminar proyecto y se movió el detalle a pestaña "Resumen". |
| Feat | HU-1.3 Especificaciones | Especificaciones con campos libres por sección (medidas, materiales, acabados) y versionado — cada guardado crea nueva versión sin sobrescribir la anterior. |
| Feat | HU-1.4 Cotizaciones | Tabla tipo Excel para ítems con formato de miles, cálculo automático de totales y margen. Se añadió historial de versiones de cotización. |
| Fix | HU-1.2 Proyectos | Se corrigieron permisos de botones de transición de estado (jalones): solo Comercial puede mover a "En cotización" o "Aprobada"; solo Administrativa puede generar OP. |
| Feat | HU-1.2 Proyectos | Se añadieron transiciones de reversión: "Rechazada → En cotización" y "Aprobada → En cotización" para corregir errores sin eliminar el proyecto. |
| Fix | HU-1.2 / HU-3.1 | Se eliminó el botón "Generar orden de producción" de la vista Comercial — esta acción pertenece exclusivamente a Administrativa. |
| Fix | Transversal | Al iniciar sesión, el sistema redirigía a `/` en lugar de `/comercial`. Corregido en el middleware de autenticación. |

---

## Épica 2 — Gestión de Compras

**Responsable:** Sergio · **HU:** 2.1 a 2.5

| Tipo | HU relacionada | Corrección / Mejora |
|---|---|---|
| Migración | HU-2.1 a HU-2.5 | Migración completa del dominio Compras a Hono + D1. Se creó `worker/routes/compras.ts` con endpoints para materiales, stock, proveedores, solicitudes y órdenes de compra. |
| Feat | HU-2.2 Inventario | La vista de inventario se rediseñó como tabla tipo Excel con autocomplete de materiales. Registrar una entrada crea el material automáticamente si no existe. |
| Fix | HU-2.2 Inventario | El dropdown de autocomplete quedaba tapado por otros elementos. Corregido usando `createPortal` para renderizarlo en posición fija sobre el contenido. |
| Fix | HU-2.2 Inventario | El autocomplete no mostraba sugerencias al hacer foco y usaba datos desactualizados. Se corrigió para que se abra al enfocar y consuma stock fresco de la API. |
| Feat | HU-2.2 Inventario | Edición inline de stock directamente en la fila (sin modal). Cada fila tiene su input de ajuste que confirma al perder el foco. |
| Feat | HU-2.2 Inventario | Al recibir una orden de compra, el sistema crea automáticamente movimientos de entrada en inventario por cada ítem de la orden. |
| Feat | HU-2.3 Proveedores | Se añadió edición y eliminación de proveedores con modales via portal. Al intentar eliminar un proveedor con órdenes activas, el sistema bloquea la acción con mensaje explicativo. |
| Fix | HU-2.3 Proveedores | Al eliminar un proveedor, los movimientos de inventario causaban error de FK. Se nulifican las referencias del proveedor antes de la eliminación. |
| Feat | HU-2.4 Órdenes de compra | Se añadió tabla de ítems a las órdenes de compra (descripción, cantidad, precio unitario) con formato de miles. Los ítems son texto libre. |
| Feat | HU-2.4 Órdenes de compra | Las órdenes de compra pasaron a modelo de máquina de estados: Borrador → Enviada → Recibida / Cancelada, con botones contextuales. |
| Fix | HU-2.4 Órdenes de compra | P03 (H3 — Control y libertad): Al cancelar una OC no se pedía confirmación. Se añadió diálogo de confirmación. |
| Fix | HU-2.4 Órdenes de compra | P06 (H6 — Reconocimiento): La tabla de OC no tenía filtro de búsqueda. Se añadió búsqueda por proveedor, proyecto o código. |
| Fix | HU-2.4 Órdenes de compra | P07 (H9 — Ayuda ante errores): El formulario mostraba un único error global. Se reemplazó con validaciones por campo. |
| Fix | Transversal | Todos los inputs numéricos tenían `step` por defecto causando incrementos de 0.1. Se fijó `step=1` en todos los inputs numéricos de la aplicación. |

---

## Épica 3 — Gestión Administrativa

**Responsable:** Tatiana · **HU:** 3.1 a 3.5

| Tipo | HU relacionada | Corrección / Mejora |
|---|---|---|
| Migración | HU-3.1 a HU-3.5 | Creación del módulo Administrativa en el backend: `worker/routes/administrativa.ts` con endpoints para OP, facturas, pagos, transporte, costos y gastos libres. |
| Feat | HU-3.1 Orden de producción | Al radicar una OP, el backend crea movimientos tipo `bloqueo` en inventario por cada ítem de la cotización que coincida por nombre en el catálogo. |
| Fix | HU-3.1 Orden de producción | Al eliminar una OP, los bloqueos de inventario no se revertían. Corregido: el `DELETE` elimina los movimientos de bloqueo asociados al proyecto. |
| Feat | HU-3.1 Orden de producción | Panel de confirmación antes de radicar: muestra materiales que pasarán a bloqueado, stock disponible antes/después (en rojo si llega a cero) e ítems sin stock. |
| Feat | HU-3.2 Facturas | Generación de facturas vinculadas a proyecto y cotización vigente, con fecha de vencimiento y condiciones de pago configurables. |
| Feat | HU-3.3 Pagos | Registro de pagos sobre facturas (Transferencia, Efectivo, Cheque, Tarjeta). El estado de la factura se actualiza automáticamente al registrar el pago total. |
| Feat | HU-3.4 Transporte | Programación de recursos de transporte con máquina de estados: Programada → En tránsito → Entregada / Cancelada. |
| Feat | HU-3.5 Costos | Vista de resumen de costos por proyecto: cotizado vs. real (materiales consumidos + ajustes). Se incluyó registro de gastos libres no asociados a proyectos. |

---

## Épica 4 — Gestión de Producción

**Responsable:** Zara · **HU:** 4.1 a 4.5

| Tipo | HU relacionada | Corrección / Mejora |
|---|---|---|
| Migración | HU-4.1 a HU-4.5 | Creación del módulo Producción en el backend: `worker/routes/produccion.ts` con endpoints para órdenes, etapas y entregas. |
| Feat | HU-4.2 Etapas | El autocomplete de materiales en etapas solo sugiere materiales bloqueados para el proyecto, en vez de todo el catálogo. Se creó el endpoint `GET /produccion/materiales-bloqueados/:proyectoId`. |
| Feat | HU-4.2 Etapas | Al marcar una etapa como "completada", el backend registra movimientos tipo `consumo` en inventario por cada material de la etapa, trazando el uso real. |
| Fix | HU-4.2 Etapas — Inventario | Bug crítico de contabilidad: al completar una etapa, el código eliminaba el bloqueo y creaba el consumo, haciendo que el stock "disponible" regresara a su valor anterior. Corrección: los bloqueos no se eliminan; el consumo convive con ellos. Al revertir una etapa, solo se eliminan los consumos. |
| Feat | HU-4.3 Entregas | Registro de entrega final con checklist. Al registrar la entrega, la OP pasa a "Finalizada" y el proyecto a "Entregado" automáticamente. |

---

## Épica 5 — Postventa y Garantías

**Responsable:** Tatiana · **HU:** 5.1 a 5.4

| Tipo | HU relacionada | Corrección / Mejora |
|---|---|---|
| Migración | HU-5.1 a HU-5.4 | Creación del módulo Postventa en el backend: `worker/routes/postventa.ts` con endpoints para solicitudes y órdenes de garantía. |
| Feat | HU-5.1 Solicitudes | Las solicitudes de garantía abiertas aparecen en el panel "Pendientes por radicar" de Administrativa, permitiendo generar una orden de garantía desde el mismo flujo. |
| Feat | HU-5.2 Órdenes garantía | Órdenes de garantía con etapas y costos propios (JSON embebido), independientes del flujo de producción normal. |
| Feat | HU-5.3 Permisos | Solo Comercial y Admin pueden abrir solicitudes de garantía. Solo Producción y Admin pueden gestionar etapas de la orden y cerrar la garantía. |
| Feat | HU-5.4 Historial | Lista de garantías con filtro por estado (abierta / en_proceso / cerrada) y rango de fechas. Los costos de la orden de garantía son visibles únicamente para Administrativa y Admin. |

---

## Épica 6 — Seguimiento (Transversal)

**Responsable:** Zara

| Tipo | HU relacionada | Corrección / Mejora |
|---|---|---|
| Fix | HU-6.x Kanban | P01 (H1 — Visibilidad del estado): Las tarjetas del Kanban no mostraban el estado del proyecto. Se añadió badge de estado dentro de cada tarjeta. |
| Fix | HU-6.x Kanban | P05 (H6 — Reconocimiento): El tipo de proyecto no era visible en la tarjeta. Se mejoró la presentación para que el tipo aparezca destacado. |
| Feat | HU-6.2 Lista | Lista de proyectos con filtros combinables: estado, cliente, rango de fechas de solicitud y búsqueda por texto (código, tipo, título). Botón "Limpiar filtros" contextual. |
| Feat | HU-6.3 Ficha proyecto | La ficha de seguimiento muestra un resumen de materiales consumidos por proyecto, agrupados por material con cantidad total, a partir de los movimientos tipo `consumo`. |
| Fix | Transversal | P02 (H2 — Consistencia): Etiquetas de navegación con tildes incorrectas o faltantes en la barra lateral y encabezados. Corregido en toda la aplicación. |
| Fix | Transversal | P09 (H8 — Estética): El encabezado de cada página mostraba el título duplicado. Se reemplazó uno con la ruta de migas de pan (breadcrumb). |

---

## Épica 7 — Administración del Sistema

**Responsable:** Jauri · **HU:** 7.1 a 7.4

| Tipo | HU relacionada | Corrección / Mejora |
|---|---|---|
| Migración | HU-7.1 a HU-7.4 | Creación de `worker/routes/admin.ts` con endpoints para gestión de usuarios (CRUD, cambio de contraseña, desbloqueo) y del hook `src/hooks/api/use-admin.ts`. |
| Fix | HU-7.1 Usuarios | Bug crítico: las páginas de admin llamaban a `useUsuarioActivo()` (localStorage) cuando el sistema ya migró a sesión via API (`useMe()`). El error "useUsuarioActivo requiere sesión activa" bloqueaba el acceso. Corregido en las tres rutas afectadas. |
| Fix | HU-7.2 Crear usuario | Al crear un usuario con correo ya registrado, el servidor devolvía error genérico. Se añadió manejo del código 409 Conflict con mensaje "El correo ya está registrado". |
| Fix | HU-7.4 Seguridad | Las contraseñas se almacenaban con hash FNV-1a (mock de frontend). Se reemplazó por `bcryptjs` con factor 10 en el backend, con bloqueo de cuenta tras intentos fallidos. |
| Fix | Transversal — Auth | P04 (H4 — Consistencia): Credenciales demo visibles en login en producción. Se ocultaron condicionalmente usando la variable de entorno `MODE`. |
| Fix | Transversal — Auth | El sistema fallaba al recargar páginas en producción (SPA routing). Se corrigió la configuración de Cloudflare para servir `index.html` en rutas no encontradas. |

---

## Resumen de cambios por tipo

| Tipo | Cantidad |
|---|---|
| Migración | 7 |
| Feat | 23 |
| Fix | 21 |
| **Total** | **51** |
