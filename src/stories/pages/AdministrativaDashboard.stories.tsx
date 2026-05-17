/**
 * Administrativa Dashboard — src/routes/administrativa.index.tsx
 *
 * KPI grid: órdenes de producción, facturas, total facturado, total recaudado.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Briefcase, FileText, DollarSign } from 'lucide-react';
import { PageHeader } from '@/components/ui-bits';

function formatCOP(n: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

function KpiCard({ label, value, icon: Icon }: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs">{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

function AdministrativaDashboard({ ordenes, facturas, totalFacturado, totalPagado }: {
  ordenes: number;
  facturas: number;
  totalFacturado: number;
  totalPagado: number;
}) {
  const pendienteCobro = totalFacturado - totalPagado;
  const pctRecaudado = totalFacturado > 0 ? Math.round((totalPagado / totalFacturado) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Administrativa"
        description="Gestión financiera y operativa."
        crumbs={[{ label: 'Administrativa' }]}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Órdenes de producción" value={ordenes} icon={Briefcase} />
        <KpiCard label="Facturas emitidas" value={facturas} icon={FileText} />
        <KpiCard label="Total facturado" value={formatCOP(totalFacturado)} icon={DollarSign} />
        <KpiCard label="Total recaudado" value={formatCOP(totalPagado)} icon={DollarSign} />
      </div>

      {totalFacturado > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-surface p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Porcentaje recaudado</span>
            <span className="font-semibold text-foreground">{pctRecaudado}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-success transition-all"
              style={{ width: `${pctRecaudado}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Recaudado: {formatCOP(totalPagado)}</span>
            <span>Pendiente: {formatCOP(pendienteCobro)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const meta: Meta = {
  title: 'Pages/Administrativa/Dashboard',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

export const ConDatos: Story = {
  name: 'Con datos — 80% recaudado',
  render: () => (
    <AdministrativaDashboard
      ordenes={22}
      facturas={41}
      totalFacturado={48_500_000}
      totalPagado={38_800_000}
    />
  ),
};

export const TotalmentePagado: Story = {
  name: 'Totalmente recaudado (100%)',
  render: () => (
    <AdministrativaDashboard
      ordenes={15}
      facturas={28}
      totalFacturado={32_000_000}
      totalPagado={32_000_000}
    />
  ),
};

export const SinFacturas: Story = {
  name: 'Sin facturas emitidas',
  render: () => (
    <AdministrativaDashboard
      ordenes={3}
      facturas={0}
      totalFacturado={0}
      totalPagado={0}
    />
  ),
};

export const SistemaVacio: Story = {
  name: 'Sistema vacío',
  render: () => (
    <AdministrativaDashboard ordenes={0} facturas={0} totalFacturado={0} totalPagado={0} />
  ),
};
