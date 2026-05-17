import type { Meta, StoryObj } from '@storybook/react-vite';
import { EstadoBadge } from '@/components/ui-bits';

const meta: Meta<typeof EstadoBadge> = {
  title: 'Components/Badges/EstadoBadge',
  component: EstadoBadge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    estado: {
      control: 'select',
      options: [
        'Solicitud',
        'En definición',
        'En cotización',
        'Aprobada',
        'En producción',
        'Entregado',
        'En garantía',
        'Rechazada',
      ],
      description: 'Project lifecycle state',
    },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

// ─── Individual states (full project lifecycle) ─────────────────────────────────

export const Solicitud: Story = {
  args: { estado: 'Solicitud' },
};

export const EnDefinicion: Story = {
  name: 'En definición',
  args: { estado: 'En definición' },
};

export const EnCotizacion: Story = {
  name: 'En cotización',
  args: { estado: 'En cotización' },
};

export const Aprobada: Story = {
  args: { estado: 'Aprobada' },
};

export const EnProduccion: Story = {
  name: 'En producción',
  args: { estado: 'En producción' },
};

export const Entregado: Story = {
  args: { estado: 'Entregado' },
};

export const EnGarantia: Story = {
  name: 'En garantía',
  args: { estado: 'En garantía' },
};

export const Rechazada: Story = {
  args: { estado: 'Rechazada' },
};

export const UnknownFallback: Story = {
  name: 'Unknown estado (muted fallback)',
  args: { estado: 'Estado desconocido' },
};

// ─── Composite view ─────────────────────────────────────────────────────────────

export const FullLifecycle: Story = {
  name: 'Full lifecycle — all states',
  render: () => (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Ciclo de vida del proyecto
      </p>
      <div className="flex flex-wrap gap-2">
        <EstadoBadge estado="Solicitud" />
        <EstadoBadge estado="En definición" />
        <EstadoBadge estado="En cotización" />
        <EstadoBadge estado="Aprobada" />
        <EstadoBadge estado="En producción" />
        <EstadoBadge estado="Entregado" />
        <EstadoBadge estado="En garantía" />
        <EstadoBadge estado="Rechazada" />
      </div>
    </div>
  ),
};

export const InContext: Story = {
  name: 'In context — project list row',
  render: () => (
    <div className="w-80 divide-y divide-border rounded-lg border border-border bg-surface">
      {[
        { code: 'PY-001', client: 'Diana Restrepo', estado: 'Aprobada' },
        { code: 'PY-002', client: 'Constructora Andina', estado: 'En producción' },
        { code: 'PY-003', client: 'Carlos Méndez', estado: 'En cotización' },
        { code: 'PY-004', client: 'Arq. López', estado: 'Entregado' },
        { code: 'PY-005', client: 'Ana Gómez', estado: 'Rechazada' },
      ].map(({ code, client, estado }) => (
        <div key={code} className="flex items-center justify-between px-3 py-2 text-sm">
          <div>
            <span className="font-medium text-foreground">{code}</span>
            <span className="ml-2 text-muted-foreground">{client}</span>
          </div>
          <EstadoBadge estado={estado} />
        </div>
      ))}
    </div>
  ),
};
