/**
 * KpiCard — metric summary card used on every area dashboard.
 *
 * Pattern from src/routes/comercial.index.tsx:
 *   rounded-lg border border-border bg-surface p-3
 *   label (text-xs text-muted-foreground) + value (text-2xl font-semibold)
 *   optional icon (top-right) and optional currency formatting
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Users, FolderKanban, Briefcase, Package, ShoppingCart,
  FileText, DollarSign, Truck, Wrench, ClipboardList, BarChart2,
} from 'lucide-react';

// ─── KpiCard component ─────────────────────────────────────────────────────────

type KpiCardProps = {
  label: string;
  value: number | string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: { direction: 'up' | 'down' | 'neutral'; label: string };
  onClick?: () => void;
};

function KpiCard({ label, value, icon: Icon, trend, onClick }: KpiCardProps) {
  return (
    <div
      className={`flex flex-col rounded-lg border border-border bg-surface p-3 transition-colors ${
        onClick ? 'cursor-pointer hover:bg-muted/40' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs">{label}</span>
        {Icon && <Icon className="h-4 w-4" />}
      </div>
      <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
      {trend && (
        <div className={`mt-1 text-xs ${
          trend.direction === 'up' ? 'text-success' :
          trend.direction === 'down' ? 'text-destructive' :
          'text-muted-foreground'
        }`}>
          {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '–'} {trend.label}
        </div>
      )}
    </div>
  );
}

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof KpiCard> = {
  title: 'Components/KpiCard',
  component: KpiCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    value: { control: 'text' },
    label: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

// ─── Single card variants ──────────────────────────────────────────────────────

export const Count: Story = {
  name: 'Count — with icon',
  args: { label: 'Clientes activos', value: 24, icon: Users },
};

export const CountClickable: Story = {
  name: 'Count — clickable',
  args: { label: 'Proyectos', value: 48, icon: FolderKanban, onClick: () => {} },
};

export const Currency: Story = {
  name: 'Currency value',
  args: { label: 'Total facturado', value: '$ 48.500.000', icon: DollarSign },
};

export const WithTrendUp: Story = {
  name: 'With trend — up',
  args: { label: 'Proyectos aprobados', value: 12, icon: Briefcase, trend: { direction: 'up', label: '+3 este mes' } },
};

export const WithTrendDown: Story = {
  name: 'With trend — down',
  args: { label: 'Solicitudes pendientes', value: 5, icon: ClipboardList, trend: { direction: 'down', label: '-2 vs semana pasada' } },
};

export const NoIcon: Story = {
  name: 'No icon',
  args: { label: 'Órdenes activas', value: 8 },
};

// ─── Dashboard grid patterns ────────────────────────────────────────────────────

export const ComercialGrid: Story = {
  name: 'Grid — Comercial dashboard',
  parameters: { layout: 'padded' },
  render: () => (
    <div className="w-full max-w-2xl">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Clientes" value={24} icon={Users} />
        <KpiCard label="Proyectos" value={48} icon={FolderKanban} />
        <KpiCard label="En cotización" value={7} icon={Briefcase} />
        <KpiCard label="Aprobadas" value={12} icon={Briefcase} />
      </div>
    </div>
  ),
};

export const ComprasGrid: Story = {
  name: 'Grid — Compras dashboard',
  parameters: { layout: 'padded' },
  render: () => (
    <div className="w-full max-w-2xl">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Materiales" value={86} icon={Package} />
        <KpiCard label="Movimientos" value={312} icon={BarChart2} />
        <KpiCard label="Solicitudes pendientes" value={5} icon={ClipboardList} />
        <KpiCard label="Órdenes de compra" value={18} icon={ShoppingCart} />
      </div>
    </div>
  ),
};

export const AdministrativaGrid: Story = {
  name: 'Grid — Administrativa dashboard',
  parameters: { layout: 'padded' },
  render: () => (
    <div className="w-full max-w-2xl">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Órdenes de producción" value={22} icon={Briefcase} />
        <KpiCard label="Facturas" value={41} icon={FileText} />
        <KpiCard label="Total facturado" value="$ 48.5M" icon={DollarSign} />
        <KpiCard label="Total recaudado" value="$ 44.1M" icon={DollarSign} />
      </div>
    </div>
  ),
};

export const PostventaGrid: Story = {
  name: 'Grid — Postventa dashboard',
  parameters: { layout: 'padded' },
  render: () => (
    <div className="w-full max-w-2xl">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Solicitudes abiertas" value={3} icon={Wrench} />
        <KpiCard label="Órdenes activas" value={2} icon={Truck} />
        <KpiCard label="Total solicitudes" value={14} icon={ClipboardList} />
        <KpiCard label="Total órdenes garantía" value={9} icon={Wrench} />
      </div>
    </div>
  ),
};
