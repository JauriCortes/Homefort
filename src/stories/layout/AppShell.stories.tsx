/**
 * AppShell — the complete application chrome.
 *
 * Shows Sidebar + TopBar + main content area together, as they appear
 * when a user is logged in and navigating any page.
 *
 * These stories use static mock data (no hooks/router) so the layout
 * can be reviewed and documented independently of page content.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  LayoutDashboard, ListFilter, Users, FolderKanban, Store,
  ClipboardList, ShoppingCart, Package, Briefcase, FileText,
  DollarSign, Truck, BarChart2, Settings, Wrench, Shield,
  Hammer, LogOut, Menu, Plus, ArrowRight,
} from 'lucide-react';
import { EstadoBadge, TipoClienteBadge } from '@/components/ui-bits';

// ─── Shared sidebar + header (extracted for reuse in stories) ──────────────────

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };
type NavSection = { label: string; items: NavItem[] };
type User = { nombre: string; email: string; areas: string[]; esAdmin: boolean };

const NAV_SECTIONS: NavSection[] = [
  { label: 'Seguimiento', items: [
    { to: '/seguimiento', label: 'Kanban', icon: LayoutDashboard },
    { to: '/seguimiento/lista', label: 'Lista de proyectos', icon: ListFilter },
  ]},
  { label: 'Comercial', items: [
    { to: '/comercial/clientes', label: 'Clientes', icon: Users },
    { to: '/comercial/proyectos', label: 'Proyectos', icon: FolderKanban },
  ]},
  { label: 'Compras', items: [
    { to: '/compras/proveedores', label: 'Proveedores', icon: Store },
    { to: '/compras/solicitudes', label: 'Solicitudes', icon: ClipboardList },
    { to: '/compras/ordenes', label: 'Órdenes de compra', icon: ShoppingCart },
    { to: '/compras/inventario', label: 'Inventario', icon: Package },
  ]},
  { label: 'Administrativa', items: [
    { to: '/administrativa/ordenes-produccion', label: 'Órdenes de producción', icon: Briefcase },
    { to: '/administrativa/facturas', label: 'Facturas', icon: FileText },
    { to: '/administrativa/pagos', label: 'Pagos', icon: DollarSign },
    { to: '/administrativa/transporte', label: 'Transporte', icon: Truck },
    { to: '/administrativa/costos', label: 'Costos', icon: BarChart2 },
  ]},
  { label: 'Producción', items: [
    { to: '/produccion/ordenes', label: 'Órdenes', icon: Settings },
  ]},
  { label: 'Postventa', items: [
    { to: '/postventa/garantias', label: 'Garantías', icon: Wrench },
  ]},
];

function initials(nombre: string) {
  return nombre.split(' ').map((p) => p[0]).slice(0, 2).join('');
}

function pathLabel(pathname: string) {
  return pathname.split('/').filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '))
    .join(' / ') || 'Inicio';
}

function SidebarNav({ currentPath, usuario }: { currentPath: string; usuario: User }) {
  const isActive = (to: string) =>
    to === '/seguimiento' ? currentPath === '/seguimiento' : currentPath.startsWith(to);

  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      {/* Brand */}
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Hammer className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-sidebar-foreground">HF HomeFort</div>
          <div className="text-[11px] uppercase tracking-wide text-sidebar-foreground/60">Gestión interna</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-2">
            <div className="px-2 py-1.5 text-[11px] uppercase tracking-wide text-sidebar-foreground/60">
              {section.label}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <div className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors cursor-default ${
                    isActive(item.to)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}>
                    <item.icon className="h-4 w-4 shrink-0 opacity-80" />
                    <span className="truncate">{item.label}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {usuario.esAdmin && (
          <div className="mb-2 mt-4 border-t border-sidebar-border pt-3">
            <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] uppercase tracking-wide text-sidebar-foreground/60">
              <Shield className="h-3.5 w-3.5" /> Administración
            </div>
            <ul className="space-y-0.5">
              <li>
                <div className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-default ${
                  currentPath.startsWith('/admin/usuarios')
                    ? 'bg-accent text-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}>
                  <Users className="h-4 w-4 shrink-0 opacity-80" />
                  <span className="truncate">Usuarios</span>
                </div>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* User card */}
      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 rounded-md bg-sidebar-accent/40 px-3 py-2 text-sm">
          <div className="truncate font-medium text-sidebar-foreground">{usuario.nombre}</div>
          <div className="truncate text-xs text-sidebar-foreground/70">
            {usuario.areas.join(' · ')}{usuario.esAdmin && ' · Admin'}
          </div>
          <div className="truncate text-[11px] text-sidebar-foreground/50">{usuario.email}</div>
        </div>
        <button className="flex w-full items-center justify-center gap-2 rounded-md border border-sidebar-border px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent">
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function TopBar({ pathname, usuario }: { pathname: string; usuario: User }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-surface/90 px-3 backdrop-blur md:px-6">
      <button className="rounded p-1.5 hover:bg-muted md:hidden" aria-label="Abrir menú">
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-muted-foreground">{pathLabel(pathname)}</div>
      </div>
      <div className="hidden items-center gap-3 sm:flex">
        <div className="text-right text-xs leading-tight">
          <div className="font-medium text-foreground">{usuario.nombre}</div>
          <div className="text-muted-foreground">
            {usuario.areas.length === 1 ? 'Area ' : 'Areas '}{usuario.areas.join(' · ')}
            {usuario.esAdmin && ' · Administrador'}
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initials(usuario.nombre)}
        </div>
      </div>
    </header>
  );
}

// ─── AppShell wrapper ──────────────────────────────────────────────────────────

function AppShell({
  currentPath,
  usuario,
  children,
}: {
  currentPath: string;
  usuario: User;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <SidebarNav currentPath={currentPath} usuario={usuario} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar pathname={currentPath} usuario={usuario} />
        <main className="flex-1 px-3 py-4 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}

// ─── Mock users ────────────────────────────────────────────────────────────────

const adminUser: User = {
  nombre: 'Andrés Torres',
  email: 'andres@homefort.co',
  areas: ['Comercial', 'Compras', 'Producción', 'Administrativa'],
  esAdmin: true,
};

const comercialUser: User = {
  nombre: 'Laura Gómez',
  email: 'laura@homefort.co',
  areas: ['Comercial'],
  esAdmin: false,
};

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Layout/AppShell',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

// ─── Stories ───────────────────────────────────────────────────────────────────

export const WithDashboard: Story = {
  name: 'Shell — Comercial dashboard',
  render: () => (
    <AppShell currentPath="/comercial" usuario={adminUser}>
      {/* Comercial Dashboard content */}
      <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:mb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <nav className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <span>Comercial</span>
          </nav>
          <h1 className="text-2xl font-semibold text-foreground">Resumen comercial</h1>
          <p className="mt-1 text-sm text-muted-foreground">Hola, Andrés. Vista general del área Comercial.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted">
            <Plus className="h-4 w-4" /> Nuevo cliente
          </button>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Nuevo proyecto
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[{ label: 'Clientes', value: 24 }, { label: 'Proyectos', value: 48 }, { label: 'En cotización', value: 7 }, { label: 'Aprobadas', value: 12 }].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-border bg-surface p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
          </div>
        ))}
      </div>
      <section className="mt-6 rounded-lg border border-border bg-surface">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Proyectos recientes</h2>
          <span className="inline-flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer">
            Ver todos <ArrowRight className="h-3 w-3" />
          </span>
        </header>
        <ul className="divide-y divide-border">
          {[
            { codigo: 'PY-001', cliente: 'Diana Restrepo', tipo: 'B2C' as const, estado: 'Aprobada', fecha: '2026-05-10' },
            { codigo: 'PY-002', cliente: 'Constructora Andina', tipo: 'B2B' as const, estado: 'En producción', fecha: '2026-05-08' },
            { codigo: 'PY-003', cliente: 'Carlos Méndez', tipo: 'B2C' as const, estado: 'En cotización', fecha: '2026-05-05' },
          ].map(({ codigo, cliente, tipo, estado, fecha }) => (
            <li key={codigo} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>{codigo}</span>
                  <TipoClienteBadge tipo={tipo} />
                </div>
                <div className="text-xs text-muted-foreground">{cliente}</div>
              </div>
              <div className="flex items-center gap-3">
                <EstadoBadge estado={estado} />
                <span className="text-xs text-muted-foreground">{fecha}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  ),
};

export const WithKanban: Story = {
  name: 'Shell — Kanban (Seguimiento)',
  render: () => (
    <AppShell currentPath="/seguimiento" usuario={adminUser}>
      <div className="mb-4 border-b border-border pb-4">
        <h1 className="text-2xl font-semibold">Kanban de proyectos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Vista de todos los proyectos por estado.</p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {['Solicitud', 'En definición', 'En cotización', 'Aprobada', 'En producción', 'Entregado', 'En garantía', 'Rechazada'].map((estado) => (
          <div key={estado} className="min-w-[200px] shrink-0">
            <div className="mb-2">
              <EstadoBadge estado={estado} />
            </div>
            <div className="space-y-2">
              {estado === 'En producción' ? (
                <>
                  <div className="rounded-lg border border-border bg-surface p-3">
                    <div className="text-sm font-medium">PY-002</div>
                    <div className="mt-1 text-xs text-muted-foreground">Closet empotrado</div>
                    <div className="mt-1 text-xs text-foreground">Carlos Torres</div>
                  </div>
                  <div className="rounded-lg border border-border bg-surface p-3">
                    <div className="text-sm font-medium">PY-007</div>
                    <div className="mt-1 text-xs text-muted-foreground">Cocina integral</div>
                    <div className="mt-1 text-xs text-foreground">Constructora Andina</div>
                  </div>
                </>
              ) : estado === 'Aprobada' ? (
                <div className="rounded-lg border border-border bg-surface p-3">
                  <div className="text-sm font-medium">PY-005</div>
                  <div className="mt-1 text-xs text-muted-foreground">Biblioteca a medida</div>
                  <div className="mt-1 text-xs text-foreground">Laura Gómez</div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-surface/50 px-3 py-4 text-center text-xs text-muted-foreground">
                  Sin proyectos
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  ),
};

export const ComercialUserView: Story = {
  name: 'Shell — Comercial user (single area)',
  render: () => (
    <AppShell currentPath="/comercial/clientes" usuario={comercialUser}>
      <div className="mb-6 border-b border-border pb-4">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="mt-1 text-sm text-muted-foreground">Base de clientes consultable por todas las áreas.</p>
      </div>
      <div className="py-12 text-center text-sm text-muted-foreground">← page content here</div>
    </AppShell>
  ),
};

export const MobileView: Story = {
  name: 'Mobile — collapsed sidebar',
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <AppShell currentPath="/comercial" usuario={comercialUser}>
      <div className="py-8 text-center text-sm text-muted-foreground">
        On mobile, the sidebar is hidden. Tap the ☰ button in the header to open it.
      </div>
    </AppShell>
  ),
};
