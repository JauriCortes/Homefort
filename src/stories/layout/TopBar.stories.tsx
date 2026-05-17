/**
 * TopBar — the sticky top header that appears above all pages.
 *
 * Contains:
 *  - Mobile hamburger menu (md:hidden)
 *  - Current path breadcrumb (derived from URL)
 *  - User name + areas label (hidden on mobile)
 *  - User avatar (initials circle)
 *
 * Mirrors the <header> in src/components/app-layout.tsx.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Menu } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type UserInfo = {
  nombre: string;
  areas: string[];
  esAdmin: boolean;
};

type TopBarProps = {
  pathname: string;
  usuario: UserInfo;
  onOpenMobileMenu: () => void;
};

// ─── Helper: derive breadcrumb from pathname ────────────────────────────────────

function pathLabel(pathname: string): string {
  return (
    pathname
      .split('/')
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '))
      .join(' / ') || 'Inicio'
  );
}

// ─── Helper: derive initials ───────────────────────────────────────────────────

function initials(nombre: string): string {
  return nombre
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');
}

// ─── Presentational TopBar component ───────────────────────────────────────────

function TopBar({ pathname, usuario, onOpenMobileMenu }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-surface/90 px-3 backdrop-blur md:px-6">
      {/* Mobile menu trigger */}
      <button
        onClick={onOpenMobileMenu}
        className="rounded p-1.5 hover:bg-muted md:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Path breadcrumb */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-muted-foreground">
          {pathLabel(pathname)}
        </div>
      </div>

      {/* User info + avatar */}
      <div className="hidden items-center gap-3 sm:flex">
        <div className="text-right text-xs leading-tight">
          <div className="font-medium text-foreground">{usuario.nombre}</div>
          <div className="text-muted-foreground">
            {usuario.areas.length === 1 ? 'Area ' : 'Areas '}
            {usuario.areas.join(' · ')}
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

// ─── User Avatar only ──────────────────────────────────────────────────────────

export function UserAvatar({ nombre }: { nombre: string }) {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
      {initials(nombre)}
    </div>
  );
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

const comercialUser: UserInfo = {
  nombre: 'Laura Gómez',
  areas: ['Comercial'],
  esAdmin: false,
};

const adminUser: UserInfo = {
  nombre: 'Andrés Torres',
  areas: ['Comercial', 'Compras', 'Producción', 'Administrativa'],
  esAdmin: true,
};

const produccionUser: UserInfo = {
  nombre: 'María Pérez',
  areas: ['Producción'],
  esAdmin: false,
};

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof TopBar> = {
  title: 'Layout/TopBar',
  component: TopBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light' },
  },
  args: {
    onOpenMobileMenu: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-full bg-background">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof meta>;

// ─── Path variants ─────────────────────────────────────────────────────────────

export const Seguimiento: Story = {
  name: 'Path — /seguimiento',
  args: { pathname: '/seguimiento', usuario: adminUser },
};

export const ComercialClientes: Story = {
  name: 'Path — /comercial/clientes',
  args: { pathname: '/comercial/clientes', usuario: comercialUser },
};

export const ComprasOrdenes: Story = {
  name: 'Path — /compras/ordenes',
  args: { pathname: '/compras/ordenes', usuario: { nombre: 'Carlos Medina', areas: ['Compras'], esAdmin: false } },
};

export const AdministrativaFacturas: Story = {
  name: 'Path — /administrativa/facturas',
  args: { pathname: '/administrativa/facturas', usuario: adminUser },
};

export const AdminUsuarios: Story = {
  name: 'Path — /admin/usuarios',
  args: { pathname: '/admin/usuarios', usuario: adminUser },
};

// ─── User variants ─────────────────────────────────────────────────────────────

export const SingleAreaUser: Story = {
  name: 'User — single area (Comercial)',
  args: { pathname: '/comercial/proyectos', usuario: comercialUser },
};

export const ProduccionUser: Story = {
  name: 'User — Producción area',
  args: { pathname: '/produccion/ordenes', usuario: produccionUser },
};

export const AdminFullAccess: Story = {
  name: 'User — Admin (todas las áreas + Administrador)',
  args: { pathname: '/seguimiento', usuario: adminUser },
};

export const LongName: Story = {
  name: 'User — very long name (truncation)',
  args: {
    pathname: '/comercial/clientes',
    usuario: { nombre: 'Alejandra Constanza Rodríguez Villanueva', areas: ['Comercial'], esAdmin: false },
  },
};

// ─── UserAvatar standalone ─────────────────────────────────────────────────────

const avatarMeta: Meta = {
  title: 'Layout/UserAvatar',
  parameters: { layout: 'centered' },
};

export const AvatarAndresTorres: StoryObj = {
  name: 'AT — Andrés Torres',
  render: () => <UserAvatar nombre="Andrés Torres" />,
};

export const AvatarLauraGomez: StoryObj = {
  name: 'LG — Laura Gómez',
  render: () => <UserAvatar nombre="Laura Gómez" />,
};

export const AvatarSingleName: StoryObj = {
  name: 'M — single word name',
  render: () => <UserAvatar nombre="María" />,
};

export const AvatarGrid: StoryObj = {
  name: 'Multiple avatars',
  render: () => (
    <div className="flex items-center gap-3">
      <UserAvatar nombre="Andrés Torres" />
      <UserAvatar nombre="Laura Gómez" />
      <UserAvatar nombre="Carlos Medina" />
      <UserAvatar nombre="María Pérez" />
    </div>
  ),
};
