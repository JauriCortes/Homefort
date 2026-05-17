/**
 * KanbanCard — the individual project card inside each Kanban column.
 *
 * Uses design tokens (bg-surface, border-border, text-foreground, etc.)
 * to match the production component in src/routes/seguimiento.index.tsx.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ESTADO_COLORS, type EstadoProyecto } from '@/lib/store';

function KanbanCard({
  codigo,
  tipo,
  cliente,
  ultimaActualizacion,
  estado,
  onClick,
}: {
  codigo: string;
  tipo: string;
  cliente: string;
  ultimaActualizacion: string;
  estado: EstadoProyecto;
  onClick: () => void;
}) {
  return (
    <div
      className="w-[220px] cursor-pointer rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-muted/50"
      onClick={onClick}
    >
      <div className="text-sm font-medium text-foreground">{codigo}</div>
      <span
        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${ESTADO_COLORS[estado]}`}
      >
        {estado}
      </span>
      <div className="mt-1 text-xs font-medium text-foreground/80">{tipo}</div>
      <div className="mt-1 text-xs text-foreground">{cliente}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{ultimaActualizacion}</div>
    </div>
  );
}

const meta: Meta<typeof KanbanCard> = {
  title: 'Pages/Seguimiento/KanbanCard',
  component: KanbanCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    estado: {
      control: 'select',
      options: [
        'Solicitud', 'En definición', 'En cotización', 'Aprobada',
        'En producción', 'Entregado', 'En garantía', 'Rechazada',
      ],
    },
  },
  args: { onClick: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Solicitud: Story = {
  args: { codigo: 'PY-001', tipo: 'Mueble a medida', cliente: 'Diana Restrepo', ultimaActualizacion: '2026-05-01', estado: 'Solicitud' },
};

export const EnDefinicion: Story = {
  name: 'En definición',
  args: { codigo: 'PY-004', tipo: 'Biblioteca', cliente: 'Arq. Patricia López', ultimaActualizacion: '2026-05-09', estado: 'En definición' },
};

export const EnCotizacion: Story = {
  name: 'En cotización',
  args: { codigo: 'PY-003', tipo: 'Mueble de sala', cliente: 'Carlos Méndez', ultimaActualizacion: '2026-05-05', estado: 'En cotización' },
};

export const Aprobada: Story = {
  args: { codigo: 'PY-005', tipo: 'Cocina integral', cliente: 'Diana Restrepo', ultimaActualizacion: '2026-05-10', estado: 'Aprobada' },
};

export const EnProduccion: Story = {
  name: 'En producción',
  args: { codigo: 'PY-002', tipo: 'Closet empotrado', cliente: 'Constructora Andina', ultimaActualizacion: '2026-04-28', estado: 'En producción' },
};

export const Entregado: Story = {
  args: { codigo: 'PY-006', tipo: 'Comedor completo', cliente: 'Diana Restrepo', ultimaActualizacion: '2026-04-15', estado: 'Entregado' },
};

export const EnGarantia: Story = {
  name: 'En garantía',
  args: { codigo: 'PY-008', tipo: 'Terraza cubierta', cliente: 'Arq. Patricia López', ultimaActualizacion: '2026-05-01', estado: 'En garantía' },
};

export const Rechazada: Story = {
  args: { codigo: 'PY-007', tipo: 'Baño flotante', cliente: 'Carlos Méndez', ultimaActualizacion: '2026-04-28', estado: 'Rechazada' },
};

export const ClienteEliminado: Story = {
  name: 'Cliente eliminado (fallback)',
  args: { codigo: 'PY-009', tipo: 'Sala', cliente: 'Cliente eliminado', ultimaActualizacion: '2026-03-10', estado: 'Rechazada' },
};

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      {(['Solicitud', 'En definición', 'En cotización', 'Aprobada', 'En producción', 'Entregado', 'En garantía', 'Rechazada'] as EstadoProyecto[]).map((estado) => (
        <KanbanCard
          key={estado}
          codigo={`PY-00${estado.length % 9 + 1}`}
          tipo="Cocina integral"
          cliente="Diana Restrepo"
          ultimaActualizacion="2026-05-10"
          estado={estado}
          onClick={fn()}
        />
      ))}
    </div>
  ),
};
