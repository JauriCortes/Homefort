# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server on :5173 (Vite + TanStack Start)
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier
npm run storybook    # Component explorer on :6006
```

No test runner is configured yet. Storybook uses `@storybook/addon-vitest` for component stories only.

## Architecture

**HF HomeFort** is an internal management system for a carpentry/furniture business, covering the full project lifecycle: sales → purchasing → production → delivery → warranty.

### Routing

File-based routing via TanStack Router. Route files in `src/routes/` use dot-notation for nesting (`comercial.clientes.$id.tsx` = `/comercial/clientes/:id`). The root layout is `__root.tsx`; `AppLayout` (in `src/components/app-layout.tsx`) wraps all authenticated routes and handles session guard + sidebar.

Route segments map to business domains:

| Prefix | Domain |
|---|---|
| `/seguimiento` | Kanban + project list (cross-domain view) |
| `/comercial` | Clients, projects, quotes, specs |
| `/compras` | Suppliers, materials, inventory, purchase orders |
| `/administrativa` | Production orders, invoices, payments, shipping, costs |
| `/produccion` | Production stage tracking and delivery |
| `/postventa` | Warranty requests and orders |
| `/admin` | User management (admin role only) |

### State Management — React Query (API-backed)

All application state is fetched from the backend API via React Query. The old `src/lib/store.ts` (localStorage) is **no longer used by any route** — it exists only as a source of shared types (`EstadoProyecto`, `TRANSICIONES`, `ESTADO_COLORS`, `formatCOP`, etc.) until those are extracted.

**Never use `useStore(selector)` in new code.** Use the domain hooks in `src/hooks/api/` instead.

Key auth hooks (`src/hooks/api/use-auth.ts`):
- `useMe()` — current user or null (replaces `useSesion`)
- `useLogin()` / `useLogout()` — mutations

### API Hooks by Domain

All hooks live in `src/hooks/api/` and use `@tanstack/react-query`:

| File | Key exports |
|---|---|
| `use-auth.ts` | `useMe`, `useLogin`, `useLogout` |
| `use-comercial.ts` | `useClientes`, `useCliente`, `useProyectos`, `useProyecto`, `useCrearProyecto`, `useActualizarEstadoProyecto`, `useAgregarEspecificacion`, `useAgregarCotizacion`, `useAgregarCambio` |
| `use-compras.ts` | `useMateriales`, `useStock`, `useProveedores`, `useMovimientos`, `useSolicitudesCompra`, `useOrdenesCompra` |
| `use-administrativa.ts` | `useOrdenesProduccion`, `useFacturas`, `usePagos`, `useTransportes`, `useAjustesCosto`, `useResumenCostos`, `useSaldoFactura` |
| `use-produccion.ts` | `useOrdenesProduccionList`, `useOrdenProduccion`, `useCrearEtapa`, `useActualizarEtapa`, `useRegistrarEntrega` |
| `use-postventa.ts` | `useSolicitudesGarantia`, `useSolicitudGarantia`, `useCrearSolicitudGarantia`, `useCrearOrdenGarantia`, `useActualizarOrdenGarantia` |
| `use-admin.ts` | `useUsuarios`, `useUsuario`, `useCrearUsuario`, `useActualizarUsuario`, `useCambiarPasswordAdmin`, `useDesbloquearUsuario` |

### Backend (Worker)

```
worker/
  index.ts            # Hono entry point — mounts all routes + serves SPA
  db/
    schema.ts         # Drizzle table definitions (~20 models)
    migrations/       # drizzle-kit generated
  middleware/
    auth.ts           # JWT httpOnly cookie verification + requireAuth / requireArea
  routes/
    auth.ts           # /api/auth — login, logout, refresh, me
    comercial.ts      # /api/comercial
    compras.ts        # /api/compras
    administrativa.ts # /api/administrativa
    produccion.ts     # /api/produccion
    postventa.ts      # /api/postventa
    admin.ts          # /api/admin — user CRUD (admin only)
```

Auth strategy: `hf_access` cookie (30 min sliding) + `hf_refresh` cookie (8 h, path `/api/auth/refresh`). Both `HttpOnly; Secure; SameSite=Strict`. Bcrypt for password hashing.

### Domain Model

Five épicas, each a namespace of types exported from `src/lib/store.ts`:

- **Comercial:** `Cliente`, `Proyecto` (8 states with enforced transitions via `TRANSICIONES`), `Especificacion` (versioned), `Cotizacion`, `CambioProyecto`
- **Compras:** `MaterialBase`, `Proveedor`, `MovimientoInventario` (entrada/bloqueo/consumo/ajuste), `SolicitudCompra`, `OrdenCompra`
- **Administrativa:** `OrdenProduccion`, `Factura`, `Pago`, `RecursoTransporte`, `AjusteCosto`
- **Produccion:** `EtapaProduccion`, `EntregaProduccion`
- **Postventa:** `SolicitudGarantia`, `OrdenGarantia`

`EstadoProyecto` transitions are machine-enforced via `TRANSICIONES`. See the Business Domain section for who can trigger each transition.

### UI Components

Tailwind CSS v4 (OKLch color tokens in `src/styles.css`) + shadcn/ui (Radix UI primitives + CVA variants) in `src/components/ui/`.

Custom building blocks in `src/components/ui-bits.tsx`:
- `PageHeader` — breadcrumbs + title + action slot, used on every page
- `EmptyState` — icon + message + CTA for empty lists
- `ErrorBanner` / `SuccessBanner` / `InfoBanner` — section-level alerts

Form pattern: React Hook Form + Zod resolver on every form. Zod schemas are defined inline in the route file.

Toast notifications: Sonner (`toast.success` / `toast.error`), mounted in `__root.tsx`.

#### Sidebar scroll fade

`AppLayout` (`src/components/app-layout.tsx`) renders a fade gradient at the bottom of the sidebar nav when content overflows. Implementation uses:
- `IntersectionObserver` on a sentinel `<div>` at the end of the nav content
- `root: navRef.current` so intersection is measured within the nav scroll container
- Gradient color defined via `--sidebar-scroll-fade` CSS variable in `src/styles.css` (white/20% in dark mode, black/25% in light mode)
- Nav is `position: absolute; inset: 0` inside a `relative min-h-0 flex-1` wrapper to guarantee a definite height for overflow detection

### Deployment

Cloudflare Workers via `@cloudflare/vite-plugin`. Config in `wrangler.jsonc`. `npm run build` outputs a Cloudflare-compatible bundle.

---

## Business Domain — Process & Permissions

### Area responsibilities (from BPMN As-Is + Product Backlog)

| Area | Responsabilidad principal |
|---|---|
| **Comercial** | Atención al cliente, asesoría en diseño, especificaciones, cotizaciones, cambios durante ejecución, garantías |
| **Compras** | Cotización y compra de materiales, gestión de proveedores, inventario, solicitudes y órdenes de compra |
| **Administrativa** | Facturación, registro de pedidos, generación de orden de producción, seguimiento de costos, recursos de transporte |
| **Producción** | Fabricación por etapas, control de materiales consumidos, entrega e instalación |

All users can **read** everything. Each user can only **write** in their assigned area. Admins (socios) can write in all areas.

### Project lifecycle — who triggers each transition

| Transition | Triggered by | Notes |
|---|---|---|
| → **En definición** | Auto (on project creation) | Starting state for all new projects |
| En definición → **En cotización** | Comercial | Specs ready to quote |
| En cotización → **Aprobada** | Comercial | Client formally approved the project and current quote |
| En cotización → **Rechazada** | Comercial | Client rejected / project cancelled |
| Aprobada → **En producción** | **Administrativa** | Administrativa generates OrdenProduccion — this formalizes production start |
| En producción → **Entregado** | **Producción** | Delivery checklist completed |
| Entregado → **En garantía** | Comercial | Client reports a warranty issue |
| En garantía → **Entregado** | Comercial | Warranty resolved |

**Key rule (HU-3.1):** An `OrdenProduccion` can only be generated when the project is in `"Aprobada"` state. Generating it moves the project to `"En producción"`. Only Administrativa and Admin can do this.

### SolicitudCompra auto-generation (HU-2.3)

A `SolicitudCompra` is created automatically when Comercial marks a project as `"Aprobada"` if any cotización item has insufficient stock. Phase 3 (Compras) will refine the stock check.

### Cotizaciones (HU-1.4)

Each project can have multiple cotizaciones (versioned). The latest is the "vigente". Items are free-text `{ descripcion, cantidad, precioUnitario, precioTotal }`. The total is `sum(items.precioTotal) * (1 + margenPct/100)`.

### Especificaciones (HU-1.3)

Versioned free-form text. Each save creates a new version; previous versions are kept in history. The latest version is shown in the Resumen tab.

### Main pain points the system addresses (from BPMN friction map)

| Pain point | Friction | Solution |
|---|---|---|
| Especificaciones sin formato → errores en producción | 5 | Structured spec field, versioned |
| Cotización por intuición sin histórico | 5 | Structured quotes with item history + autocomplete |
| Registro manual en Excel sin integración | 4 | Centralized DB, visible to all areas |
| Cambios verbales sin trazabilidad | 4 | CambiosProyecto with date + cost + time impact |
| Comunicación por WhatsApp | 4 | State-based visibility per area |

---

## Migration Status

The localStorage → backend migration is complete for all route files. `store.ts` is kept only for shared types.

| Phase | Status | Notes |
|---|---|---|
| Phase 0 — Infrastructure | ✅ Done | Hono + D1 + Drizzle wired up |
| Phase 1 — Auth | ✅ Done | JWT cookies, bcrypt, refresh token |
| Phase 2 — Comercial | ✅ Done | Clientes, proyectos, specs, quotes, cambios |
| Phase 3 — Compras | ✅ Done | Materiales, proveedores, inventario, solicitudes, órdenes |
| Phase 4 — Administrativa | ✅ Done | Órdenes producción, facturas, pagos, transporte, costos |
| Phase 5 — Producción | ✅ Done | Etapas, entregas |
| Phase 6 — Postventa | ✅ Done | Solicitudes garantía, órdenes garantía |
| Phase 6b — Admin | ✅ Done | User CRUD via `/api/admin/usuarios` |
| Phase 7 — Delete `store.ts` | ⏳ Pending | Blocked on extracting shared types first |

**Remaining `useStore` usage:** zero route files. Only `src/lib/store.ts` itself and hooks in `src/hooks/use-store.ts` reference the store — these are safe to delete once the shared types are extracted.

---

## Dev Users (seed data)

```
laura@homefort.co   / comercial123   (Comercial)
carlos@homefort.co  / compras123     (Compras)
maria@homefort.co   / produccion123  (Producción)
andres@homefort.co  / admin123       (Admin)
```

---

## Files to gitignore (add if not present)

```
.dev.vars                    # CF Worker local secrets (JWT_SECRET etc.)
.claude/settings.local.json  # Personal Claude Code overrides
```
