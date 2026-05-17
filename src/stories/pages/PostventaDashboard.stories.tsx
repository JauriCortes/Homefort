/**
 * Postventa Dashboard — src/routes/postventa.index.tsx
 *
 * KPI grid: solicitudes abiertas, órdenes activas, total solicitudes, total órdenes.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Wrench, ClipboardList, Package } from 'lucide-react';
import { PageHeader, WarningBanner } from '@/components/ui-bits';

function KpiCard({ label, value, icon: Icon, alert }: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  alert?: boolean;
}) {
  return (
    <div className={`flex flex-col rounded-lg border p-4 ${alert && value > 0 ? 'border-warning/50 bg-warning/5' : 'border-border bg-surface'}`}>
      <div className={`flex items-center justify-between ${alert && value > 0 ? 'text-warning-foreground' : 'text-muted-foreground'}`}>
        <span className="text-xs">{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <div className={`mt-1 text-2xl font-semibold ${alert && value > 0 ? 'text-warning-foreground' : 'text-foreground'}`}>{value}</div>
    </div>
  );
}

function PostventaDashboard({ abiertas, enProceso, totalSolicitudes, totalOrdenes }: {
  abiertas: number;
  enProceso: number;
  totalSolicitudes: number;
  totalOrdenes: number;
}) {
  return (
    <div>
      <PageHeader
        title="Postventa"
        description="Gestión de garantías y solicitudes de clientes."
        crumbs={[{ label: 'Postventa' }]}
      />
      {abiertas > 0 && (
        <WarningBanner>
          <strong>{abiertas} solicitud{abiertas !== 1 ? 'es' : ''} abierta{abiertas !== 1 ? 's' : ''}</strong> sin asignar. Revisa la sección de Garantías.
        </WarningBanner>
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Solicitudes abiertas" value={abiertas} icon={Wrench} alert />
        <KpiCard label="Órdenes activas" value={enProceso} icon={Package} />
        <KpiCard label="Total solicitudes" value={totalSolicitudes} icon={ClipboardList} />
        <KpiCard label="Total órdenes garantía" value={totalOrdenes} icon={Wrench} />
      </div>
    </div>
  );
}

const meta: Meta = {
  title: 'Pages/Postventa/Dashboard',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

export const ConAlerta: Story = {
  name: 'Con solicitudes abiertas (alerta)',
  render: () => (
    <PostventaDashboard abiertas={3} enProceso={2} totalSolicitudes={14} totalOrdenes={9} />
  ),
};

export const SinAlertas: Story = {
  name: 'Sin solicitudes abiertas',
  render: () => (
    <PostventaDashboard abiertas={0} enProceso={1} totalSolicitudes={14} totalOrdenes={9} />
  ),
};

export const SistemaVacio: Story = {
  name: 'Sistema vacío',
  render: () => (
    <PostventaDashboard abiertas={0} enProceso={0} totalSolicitudes={0} totalOrdenes={0} />
  ),
};
