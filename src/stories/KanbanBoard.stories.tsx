import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, within, userEvent, expect } from 'storybook/test';
import { ESTADO_COLORS, type EstadoProyecto } from '@/lib/store';

// ─── Types ───────────────────────────────────────────────────────────────────

type ProyectoKanban = {
  id: string;
  codigo: string;
  tipo: string;
  estado: EstadoProyecto;
  clienteId: string;
  ultimaActualizacion: string;
};

type ClienteRef = {
  id: string;
  nombre: string;
};

type KanbanBoardProps = {
  proyectos: ProyectoKanban[];
  clientes: ClienteRef[];
  onCardClick: (id: string) => void;
};

// ─── Self-contained KanbanBoard component ────────────────────────────────────

const ESTADOS: EstadoProyecto[] = [
  'Solicitud',
  'En definición',
  'En cotización',
  'Aprobada',
  'Rechazada',
  'En producción',
  'En garantía',
  'Entregado',
];

function KanbanBoard({ proyectos, clientes, onCardClick }: KanbanBoardProps) {
  return (
    <div className="p-4">
      <div className="mb-4 border-b border-border pb-4">
        <h1 className="text-xl font-semibold text-foreground md:text-2xl">Kanban de proyectos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Vista de todos los proyectos por estado.</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {ESTADOS.map((estado) => {
          const cols = proyectos.filter((p) => p.estado === estado);
          return (
            <div key={estado} className="min-w-[220px] flex-shrink-0">
              <div className="mb-2 flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_COLORS[estado]}`}>
                  {estado}
                </span>
                <span className="text-xs text-muted-foreground">{cols.length}</span>
              </div>

              <div className="space-y-2">
                {cols.map((p) => {
                  const cliente = clientes.find((c) => c.id === p.clienteId);
                  return (
                    <div
                      key={p.id}
                      className="cursor-pointer rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-muted/50"
                      onClick={() => onCardClick(p.id)}
                    >
                      <div className="text-sm font-medium">{p.codigo}</div>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${ESTADO_COLORS[p.estado]}`}
                      >
                        {p.estado}
                      </span>
                      <div className="text-xs font-medium text-foreground/80">{p.tipo}</div>
                      <div className="mt-1 text-xs text-foreground">
                        {cliente?.nombre ?? 'Cliente eliminado'}
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {p.ultimaActualizacion}
                      </div>
                    </div>
                  );
                })}

                {cols.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border bg-surface px-3 py-4 text-center text-xs text-muted-foreground">
                    Sin proyectos
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const mockClientes: ClienteRef[] = [
  { id: 'c1', nombre: 'María Rodríguez' },
  { id: 'c2', nombre: 'Carlos Torres' },
];

const mockProyectos: ProyectoKanban[] = [
  { id: 'p1', codigo: 'PROY-001', tipo: 'Mueble a medida', estado: 'Solicitud', clienteId: 'c1', ultimaActualizacion: '2026-05-01' },
  { id: 'p2', codigo: 'PROY-002', tipo: 'Closet', estado: 'En producción', clienteId: 'c2', ultimaActualizacion: '2026-04-28' },
  { id: 'p3', codigo: 'PROY-003', tipo: 'Cocina integral', estado: 'Entregado', clienteId: 'c1', ultimaActualizacion: '2026-04-15' },
  { id: 'p4', codigo: 'PROY-004', tipo: 'Sala', estado: 'En cotización', clienteId: 'c2', ultimaActualizacion: '2026-04-10' },
  { id: 'p5', codigo: 'PROY-005', tipo: 'Comedor', estado: 'Aprobada', clienteId: 'c1', ultimaActualizacion: '2026-04-05' },
  { id: 'p6', codigo: 'PROY-006', tipo: 'Biblioteca', estado: 'En definición', clienteId: 'c2', ultimaActualizacion: '2026-05-03' },
];

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta: Meta<typeof KanbanBoard> = {
  title: 'P01 / KanbanBoard',
  component: KanbanBoard,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    onCardClick: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof KanbanBoard>;

// ─── Stories ─────────────────────────────────────────────────────────────────

export const ConProyectos: Story = {
  name: 'ConProyectos',
  args: {
    proyectos: mockProyectos,
    clientes: mockClientes,
  },
};

export const Vacio: Story = {
  name: 'Vacio',
  args: {
    proyectos: [],
    clientes: mockClientes,
  },
};

export const ColumnaLlena: Story = {
  name: 'ColumnaLlena — "En producción" con 5 proyectos',
  args: {
    proyectos: [
      { id: 'p1', codigo: 'PROY-001', tipo: 'Mueble a medida', estado: 'En producción', clienteId: 'c1', ultimaActualizacion: '2026-05-01' },
      { id: 'p2', codigo: 'PROY-002', tipo: 'Closet', estado: 'En producción', clienteId: 'c2', ultimaActualizacion: '2026-04-28' },
      { id: 'p3', codigo: 'PROY-003', tipo: 'Cocina integral', estado: 'En producción', clienteId: 'c1', ultimaActualizacion: '2026-04-15' },
      { id: 'p4', codigo: 'PROY-004', tipo: 'Sala', estado: 'En producción', clienteId: 'c2', ultimaActualizacion: '2026-04-10' },
      { id: 'p5', codigo: 'PROY-005', tipo: 'Comedor', estado: 'En producción', clienteId: 'c1', ultimaActualizacion: '2026-04-05' },
    ],
    clientes: mockClientes,
  },
};

// ─── Interaction test ─────────────────────────────────────────────────────────

export const TestClickCard: Story = {
  name: 'Test / Click en tarjeta dispara onCardClick',
  args: {
    proyectos: mockProyectos,
    clientes: mockClientes,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText('PROY-001');
    await userEvent.click(card);
    await expect(args.onCardClick).toHaveBeenCalledWith('p1');
  },
};
