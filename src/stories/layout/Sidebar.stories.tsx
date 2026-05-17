/**
 * Sidebar — the persistent left-nav shell of the app.
 *
 * Mirrors the SidebarContent component defined in src/components/app-layout.tsx.
 * Stories are presentational (no hooks/router) to be usable in isolation.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import {
  LayoutDashboard,
  ListFilter,
  Users,
  FolderKanban,
  Store,
  ClipboardList,
  ShoppingCart,
  Package,
  Briefcase,
  FileText,
  DollarSign,
  Truck,
  BarChart2,
  Settings,
  Wrench,
  Shield,
  Hammer,
  LogOut,
  ChevronRight,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

type UserInfo = {
  nombre: string;
  email: string;
  areas: string[];
  esAdmin: boolean;
};

type SidebarProps = {
  navSections: NavSection[];
  currentPath: string;
  usuario: UserInfo;
  onNavigate: (to: string) => void;
  onLogout: () => void;
};

// ─── NAV structure (matches app-layout.tsx) ────────────────────────────────────

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Seguimiento',
    items: [
      { to: '/seguimiento', label: 'Kanban', icon: LayoutDashboard },
      { to: '/seguimiento/lista', label: 'Lista de proyectos', icon: ListFilter },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { to: '/comercial/clientes', label: 'Clientes', icon: Users },
      { to: '/comercial/proyectos', label: 'Proyectos', icon: FolderKanban },
    ],
  },
  {
    label: 'Compras',
    items: [
      { to: '/compras/proveedores', label: 'Proveedores', icon: Store },
      { to: '/compras/solicitudes', label: 'Solicitudes', icon: ClipboardList },
      { to: '/compras/ordenes', label: 'Órdenes de compra', icon: ShoppingCart },
      { to: '/compras/inventario', label: 'Inventario', icon: Package },
    ],
  },
  {
    label: 'Administrativa',
    items: [
      { to: '/administrativa/ordenes-produccion', label: 'Órdenes de producción', icon: Briefcase },
      { to: '/administrativa/facturas', label: 'Facturas', icon: FileText },
      { to: '/administrativa/pagos', label: 'Pagos', icon: DollarSign },
      { to: '/administrativa/transporte', label: 'Transporte', icon: Truck },
      { to: '/administrativa/costos', label: 'Costos', icon: BarChart2 },
    ],
  },
  {
    label: 'Producción',
    items: [{ to: '/produccion/ordenes', label: 'Órdenes', icon: Settings }],
  },
  {
    label: 'Postventa',
    items: [{ to: '/postventa/garantias', label: 'Garantías', icon: Wrench }],
  },
];

// ─── Presentational Sidebar component ──────────────────────────────────────────

function Sidebar({ navSections, currentPath, usuario, onNavigate, onLogout }: SidebarProps) {
  const isActive = (to: string) => {
    if (to === '/seguimiento') return currentPath === '/seguimiento';
    return currentPath.startsWith(to);
  };

  return (
    <div className="flex h-full w-60 flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Hammer className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-sidebar-foreground">HF HomeFort</div>
          <div className="text-[11px] uppercase tracking-wide text-sidebar-foreground/60">
            Gestión interna
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {navSections.map((section) => (
          <div key={section.label} className="mb-2">
            <div className="px-2 py-1.5 text-[11px] uppercase tracking-wide text-sidebar-foreground/60">
              {section.label}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.to);
                return (
                  <li key={item.to}>
                    <button
                      onClick={() => onNavigate(item.to)}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                        active
                          ? 'bg-accent text-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0 opacity-80" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Admin section */}
        {usuario.esAdmin && (
          <div className="mb-2 mt-4 border-t border-sidebar-border pt-3">
            <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] uppercase tracking-wide text-sidebar-foreground/60">
              <Shield className="h-3.5 w-3.5" />
              Administración
            </div>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => onNavigate('/admin/usuarios')}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                    currentPath.startsWith('/admin/usuarios')
                      ? 'bg-accent text-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <Users className="h-4 w-4 shrink-0 opacity-80" />
                  <span className="truncate">Usuarios</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* User card + logout */}
      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 rounded-md bg-sidebar-accent/40 px-3 py-2 text-sm">
          <div className="truncate font-medium text-sidebar-foreground">{usuario.nombre}</div>
          <div className="truncate text-xs text-sidebar-foreground/70">
            {usuario.areas.join(' · ')}
            {usuario.esAdmin && ' · Admin'}
          </div>
          <div className="truncate text-[11px] text-sidebar-foreground/50">{usuario.email}</div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-sidebar-border px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

// ─── Mock users ────────────────────────────────────────────────────────────────

const comercialUser: UserInfo = {
  nombre: 'Laura Gómez',
  email: 'laura@homefort.co',
  areas: ['Comercial'],
  esAdmin: false,
};

const adminUser: UserInfo = {
  nombre: 'Andrés Torres',
  email: 'andres@homefort.co',
  areas: ['Comercial', 'Compras', 'Producción', 'Administrativa'],
  esAdmin: true,
};

const multiAreaUser: UserInfo = {
  nombre: 'Carlos Medina',
  email: 'carlos@homefort.co',
  areas: ['Compras', 'Administrativa'],
  esAdmin: false,
};

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof Sidebar> = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    navSections: NAV_SECTIONS,
    onNavigate: fn(),
    onLogout: fn(),
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ───────────────────────────────────────────────────────────────────

export const DefaultComercial: Story = {
  name: 'Default — Comercial user, Kanban active',
  args: {
    currentPath: '/seguimiento',
    usuario: comercialUser,
  },
};

export const ComercialClientesActive: Story = {
  name: 'Comercial — /clientes active',
  args: {
    currentPath: '/comercial/clientes',
    usuario: comercialUser,
  },
};

export const ComprasActive: Story = {
  name: 'Compras — /compras/ordenes active',
  args: {
    currentPath: '/compras/ordenes',
    usuario: multiAreaUser,
  },
};

export const AdministrativaActive: Story = {
  name: 'Administrativa — /administrativa/facturas active',
  args: {
    currentPath: '/administrativa/facturas',
    usuario: { nombre: 'María Pérez', email: 'maria@homefort.co', areas: ['Administrativa'], esAdmin: false },
  },
};

export const AdminUser: Story = {
  name: 'Admin — all sections visible + admin panel',
  args: {
    currentPath: '/admin/usuarios',
    usuario: adminUser,
  },
};

export const AdminUserHomeActive: Story = {
  name: 'Admin — Seguimiento active',
  args: {
    currentPath: '/seguimiento/lista',
    usuario: adminUser,
  },
};

export const UserCard: Story = {
  name: 'User card — single area',
  args: {
    currentPath: '/comercial',
    usuario: comercialUser,
  },
};

export const UserCardMultiArea: Story = {
  name: 'User card — multiple areas',
  args: {
    currentPath: '/compras',
    usuario: multiAreaUser,
  },
};

export const UserCardAdmin: Story = {
  name: 'User card — admin with long name',
  args: {
    currentPath: '/admin/usuarios',
    usuario: adminUser,
  },
};

export const NoActiveItem: Story = {
  name: 'No active item — root path',
  args: {
    currentPath: '/',
    usuario: comercialUser,
  },
};
