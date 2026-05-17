# HF HomeFort

Internal management system for a carpentry/furniture business, covering the full project lifecycle: sales → purchasing → production → delivery → warranty.

## Stack

- **Frontend:** React 19 + TanStack Router (file-based) + TanStack Query + Tailwind CSS v4 + shadcn/ui
- **Backend:** Hono on Cloudflare Workers + Cloudflare D1 (SQLite edge) + Drizzle ORM
- **Auth:** JWT httpOnly cookies (`hf_access` 30 min + `hf_refresh` 8 h) + bcrypt

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

Dev credentials:

| Email | Password | Area |
|---|---|---|
| laura@homefort.co | comercial123 | Comercial |
| carlos@homefort.co | compras123 | Compras |
| maria@homefort.co | produccion123 | Producción |
| andres@homefort.co | admin123 | Admin (all areas) |

## Commands

```bash
npm run dev          # Dev server (Vite + Wrangler, port 5173)
npm run build        # Production build (Cloudflare Workers bundle)
npm run lint         # ESLint
npm run format       # Prettier
npm run storybook    # Component explorer (port 6006)
```

## Project structure

```
src/
  routes/           # File-based pages (TanStack Router)
  components/       # Shared UI (app-layout, ui-bits, form-bits, shadcn/ui)
  hooks/api/        # React Query hooks per domain
  lib/
    api-client.ts   # Typed fetch wrapper
    store.ts        # Shared types + legacy constants (being removed)
  styles.css        # Tailwind v4 tokens (OKLch color palette)

worker/
  index.ts          # Hono entry point
  db/schema.ts      # Drizzle table definitions
  middleware/auth.ts
  routes/           # API route handlers per domain
```

## Business domains

| Route prefix | Domain |
|---|---|
| `/seguimiento` | Kanban + filterable project list |
| `/comercial` | Clients, projects, quotes, specs |
| `/compras` | Suppliers, materials, inventory, purchase orders |
| `/administrativa` | Production orders, invoices, payments, transport, costs |
| `/produccion` | Production stage tracking and delivery |
| `/postventa` | Warranty requests and orders |
| `/admin` | User management (admin only) |
