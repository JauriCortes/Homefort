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

### State Management (current — localStorage)

All application state lives in `src/lib/store.ts` — a single object that serializes to `localStorage`. It exposes methods (`store.login()`, `store.crearCliente()`, etc.) and an event emitter for reactivity.

`src/hooks/use-store.ts` wraps `useSyncExternalStore` with JSON-based memoization to prevent infinite loops when selectors return new array/object references. Always use `useStore(selector)` — never read `store.*` directly in components.

Key auth hooks:
- `useSesion()` — current user or null
- `useUsuarioActivo()` — throws if no session (safe inside `AppLayout`)
- `usePuedeEditar(area)` — permission check by area

### Domain Model

Five épicas, each a namespace of types exported from `src/lib/store.ts`:

- **Comercial:** `Cliente`, `Proyecto` (8 states with enforced transitions via `TRANSICIONES`), `Especificacion` (versioned), `Cotizacion`, `CambioProyecto`
- **Compras:** `MaterialBase`, `Proveedor`, `MovimientoInventario` (entrada/bloqueo/consumo/ajuste), `SolicitudCompra`, `OrdenCompra`
- **Administrativa:** `OrdenProduccion`, `Factura`, `Pago`, `RecursoTransporte`, `AjusteCosto`
- **Produccion:** `EtapaProduccion`, `EntregaProduccion`
- **Postventa:** `SolicitudGarantia`, `OrdenGarantia`

`EstadoProyecto` transitions are machine-enforced via `TRANSICIONES`. Changing estado to `"Aprobada"` auto-generates a `SolicitudCompra`.

### UI Components

Tailwind CSS v4 (OKLch color tokens in `src/styles.css`) + shadcn/ui (Radix UI primitives + CVA variants) in `src/components/ui/`.

Custom building blocks in `src/components/ui-bits.tsx`:
- `PageHeader` — breadcrumbs + title + action slot, used on every page
- `EmptyState` — icon + message + CTA for empty lists
- `ErrorBanner` / `SuccessBanner` / `InfoBanner` — section-level alerts

Form pattern: React Hook Form + Zod resolver on every form. Zod schemas are defined inline in the route file.

Toast notifications: Sonner (`toast.success` / `toast.error`), mounted in `__root.tsx`.

### Deployment

Cloudflare Workers via `@cloudflare/vite-plugin`. Config in `wrangler.jsonc`. `npm run build` outputs a Cloudflare-compatible bundle.

---

## Active Migration: Adding Backend (v1.0)

**The app is currently being migrated from localStorage to a real backend.** Do not assume the store is the final state.

Target stack: **Hono** (API on CF Worker) + **Cloudflare D1** (SQLite edge) + **Drizzle ORM**.

Structure being added:
```
worker/
  index.ts          # Hono entry point, mounts API + serves static assets
  db/
    schema.ts       # Drizzle table definitions (all ~20 models)
    migrations/     # drizzle-kit generated
  middleware/
    auth.ts         # JWT httpOnly cookie verification
  routes/
    auth.ts
    comercial.ts
    compras.ts
    administrativa.ts
    produccion.ts
    postventa.ts

src/
  lib/
    api-client.ts   # Typed fetch wrapper (to be created)
    query-client.ts # React Query singleton (to be created)
  hooks/api/        # React Query hooks per domain (to be created)
    use-auth.ts
    use-comercial.ts
    ...
```

Migration order (strangler-fig — app stays functional throughout):
1. **Phase 0** — Infrastructure (Hono stub, D1, wrangler bindings)
2. **Phase 1** — Auth (JWT cookies replace FNV-1a mock + localStorage session)
3. **Phase 2** — Comercial
4. **Phase 3** — Compras
5. **Phase 4** — Administrativa
6. **Phase 5** — Producción
7. **Phase 6** — Postventa
8. **Phase 7** — Delete `store.ts`

Auth strategy: `hf_access` cookie (30min sliding) + `hf_refresh` cookie (8h, path `/api/auth/refresh`). Both `HttpOnly; Secure; SameSite=Strict`. Bcrypt replaces the mock hash.

React Query is already installed (`@tanstack/react-query`). During migration, `useStore(selector)` calls are replaced domain-by-domain with `useQuery`/`useMutation` hooks from `src/hooks/api/`.

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
