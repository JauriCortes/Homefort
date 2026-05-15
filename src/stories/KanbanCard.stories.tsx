import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ESTADO_COLORS, type EstadoProyecto } from '@/lib/store';

// Inline card component that mirrors the kanban card from seguimiento.index.tsx
function KanbanCard({ codigo, tipo, cliente, ultimaActualizacion, estado, onClick }: {
  codigo: string; tipo: string; cliente: string;
  ultimaActualizacion: string; estado: EstadoProyecto; onClick: () => void;
}) {
  return (
    <div
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50 transition-colors w-[220px]"
      onClick={onClick}
    >
      <div className="text-sm font-medium">{codigo}</div>
      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${ESTADO_COLORS[estado]}`}>{estado}</span>
      <div className="text-xs text-gray-500 mt-1">{tipo}</div>
      <div className="mt-1 text-xs text-gray-700">{cliente}</div>
      <div className="mt-1 text-[11px] text-gray-400">{ultimaActualizacion}</div>
    </div>
  );
}

const meta: Meta<typeof KanbanCard> = {
  title: 'P01 / KanbanCard',
  component: KanbanCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof KanbanCard>;

export const Solicitud: Story = {
  args: { codigo: 'PROY-001', tipo: 'Mueble a medida', cliente: 'María Rodríguez', ultimaActualizacion: '2026-05-01', estado: 'Solicitud', onClick: fn() },
};
export const EnProduccion: Story = {
  args: { codigo: 'PROY-002', tipo: 'Closet', cliente: 'Carlos Torres', ultimaActualizacion: '2026-04-28', estado: 'En producción', onClick: fn() },
};
export const Entregado: Story = {
  args: { codigo: 'PROY-003', tipo: 'Cocina integral', cliente: 'Ana López', ultimaActualizacion: '2026-04-15', estado: 'Entregado', onClick: fn() },
};
export const ClienteEliminado: Story = {
  args: { codigo: 'PROY-004', tipo: 'Sala', cliente: 'Cliente eliminado', ultimaActualizacion: '2026-03-10', estado: 'Rechazada', onClick: fn() },
};
