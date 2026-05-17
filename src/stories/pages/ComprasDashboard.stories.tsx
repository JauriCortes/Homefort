/**
 * Compras Dashboard — src/routes/compras.index.tsx
 *
 * KPI grid: materiales, movimientos, solicitudes pendientes, órdenes de compra.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Package, BarChart2, ClipboardList, ShoppingCart } from 'lucide-react';
import { PageHeader } from '@/components/ui-bits';

function KpiCard({ label, value, icon: Icon, highlight }: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <div className={`flex flex-col rounded-lg border p-4 ${highlight ? 'border-warning/50 bg-warning/5' : 'border-border bg-surface'}`}>
      <div className={`flex items-center justify-between ${highlight ? 'text-warning-foreground' : 'text-muted-foreground'}`}>
        <span className="text-xs">{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <div className={`mt-1 text-2xl font-semibold ${highlight ? 'text-warning-foreground' : 'text-foreground'}`}>{value}</div>
    </div>
  );
}

function ComprasDashboard({ materiales, movimientos, solicitudesPendientes, ordenes }: {
  materiales: number;
  movimientos: number;
  solicitudesPendientes: number;
  ordenes: number;
}) {
  return (
    <div>
      <PageHeader
        title="Compras"
        description="Gestión de inventario, proveedores y órdenes."
        crumbs={[{ label: 'Compras' }]}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Materiales registrados" value={materiales} icon={Package} />
        <KpiCard label="Movimientos de inventario" value={movimientos} icon={BarChart2} />
        <KpiCard label="Solicitudes pendientes" value={solicitudesPendientes} icon={ClipboardList} highlight={solicitudesPendientes > 0} />
        <KpiCard label="Órdenes de compra" value={ordenes} icon={ShoppingCart} />
      </div>

      {solicitudesPendientes > 0 && (
        <div className="mt-4 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
          <strong>⚠ {solicitudesPendientes} solicitud{solicitudesPendientes !== 1 ? 'es' : ''} pendiente{solicitudesPendientes !== 1 ? 's' : ''}</strong> de atención. Revisa la sección de Solicitudes.
        </div>
      )}
    </div>
  );
}

const meta: Meta = {
  title: 'Pages/Compras/Dashboard',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

export const ConDatos: Story = {
  name: 'Con datos — solicitudes pendientes',
  render: () => <ComprasDashboard materiales={86} movimientos={312} solicitudesPendientes={5} ordenes={18} />,
};

export const SinPendientes: Story = {
  name: 'Sin solicitudes pendientes',
  render: () => <ComprasDashboard materiales={86} movimientos={312} solicitudesPendientes={0} ordenes={18} />,
};

export const SistemaVacio: Story = {
  name: 'Sistema vacío',
  render: () => <ComprasDashboard materiales={0} movimientos={0} solicitudesPendientes={0} ordenes={0} />,
};
