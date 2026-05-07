import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, within, userEvent, expect } from 'storybook/test';
import { Plus, Search, FolderKanban, Eye } from 'lucide-react';
import { EstadoBadge, TipoClienteBadge } from '@/components/ui-bits';
import { TextInput, Select } from '@/components/form-bits';
import type { EstadoProyecto } from '@/lib/store';

// ─── Types ────────────────────────────────────────────────────────────────────

type Proyecto = {
  id: string;
  codigo: string;
  tipo: string;
  estado: EstadoProyecto;
  clienteId: string;
  fechaSolicitud: string;
};

type Props = {
  proyectos: Proyecto[];
  clientes: Array<{ id: string; nombre: string; tipo: 'B2B' | 'B2C' }>;
  puedeEditar: boolean;
  onVerProyecto: (id: string) => void;
  onNuevoProyecto: () => void;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockClientes = [
  { id: 'c1', nombre: 'María Rodríguez', tipo: 'B2C' as const },
  { id: 'c2', nombre: 'Constructora Andina SAS', tipo: 'B2B' as const },
  { id: 'c3', nombre: 'Carlos Torres', tipo: 'B2C' as const },
];

const mockProyectos: Proyecto[] = [
  { id: 'p1', codigo: 'PROY-001', tipo: 'Cocina integral', estado: 'Aprobada' as EstadoProyecto, clienteId: 'c1', fechaSolicitud: '2026-01-10' },
  { id: 'p2', codigo: 'PROY-002', tipo: 'Closet', estado: 'En cotización' as EstadoProyecto, clienteId: 'c2', fechaSolicitud: '2026-02-05' },
  { id: 'p3', codigo: 'PROY-003', tipo: 'Sala y comedor', estado: 'En producción' as EstadoProyecto, clienteId: 'c1', fechaSolicitud: '2026-03-01' },
  { id: 'p4', codigo: 'PROY-004', tipo: 'Mueble a medida', estado: 'Solicitud' as EstadoProyecto, clienteId: 'c3', fechaSolicitud: '2026-04-10' },
  { id: 'p5', codigo: 'PROY-005', tipo: 'Cocina modular', estado: 'Entregado' as EstadoProyecto, clienteId: 'c2', fechaSolicitud: '2025-12-01' },
];

// ─── Self-contained ProyectosTable component ──────────────────────────────────

function ProyectosTable({ proyectos, clientes, puedeEditar, onVerProyecto, onNuevoProyecto }: Props) {
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');

  const lista = proyectos.filter((p) => {
    const cliente = clientes.find((c) => c.id === p.clienteId);
    const text = `${p.codigo} ${p.tipo} ${cliente?.nombre ?? ''}`.toLowerCase();
    return text.includes(q.toLowerCase()) && (estado ? p.estado === estado : true);
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:mb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-foreground md:text-2xl">Proyectos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cada proyecto avanza por un ciclo comercial: Solicitud → En definición → En cotización → Aprobada/Rechazada.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {puedeEditar ? (
            <button
              onClick={onNuevoProyecto}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Nuevo proyecto
            </button>
          ) : (
            <button
              disabled
              title="Solo Comercial puede crear proyectos"
              className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-md bg-muted px-3 text-sm font-medium text-muted-foreground"
            >
              <Plus className="h-4 w-4" /> Nuevo proyecto
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput
            placeholder="Buscar por código, cliente o tipo…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8"
            aria-label="Buscar proyectos"
          />
        </div>
        <Select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="sm:w-48"
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          <option value="Solicitud">Solicitud</option>
          <option value="En definición">En definición</option>
          <option value="En cotización">En cotización</option>
          <option value="Aprobada">Aprobada</option>
          <option value="Rechazada">Rechazada</option>
          <option value="En producción">En producción</option>
          <option value="En garantía">En garantía</option>
          <option value="Entregado">Entregado</option>
        </Select>
      </div>

      {/* Empty states */}
      {proyectos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FolderKanban className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Aún no hay proyectos</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Registra primero un cliente y luego crea su proyecto.
          </p>
          {puedeEditar && (
            <div className="mt-4">
              <button
                onClick={onNuevoProyecto}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" /> Crear proyecto
              </button>
            </div>
          )}
        </div>
      ) : lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
          <h3 className="text-base font-semibold text-foreground">Sin resultados</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            No hay proyectos que coincidan.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          {/* Desktop table */}
          <table className="hidden w-full text-sm md:table">
            <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Código</th>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Tipo</th>
                <th className="px-4 py-2 font-medium">Solicitado</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lista.map((p) => {
                const cli = clientes.find((c) => c.id === p.clienteId);
                return (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="px-4 py-2.5 font-medium">{p.codigo}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span>{cli?.nombre ?? '—'}</span>
                        {cli && <TipoClienteBadge tipo={cli.tipo} />}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">{p.tipo}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{p.fechaSolicitud}</td>
                    <td className="px-4 py-2.5">
                      <EstadoBadge estado={p.estado} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => onVerProyecto(p.id)}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" /> Detalle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile card list */}
          <ul className="divide-y divide-border md:hidden">
            {lista.map((p) => {
              const cli = clientes.find((c) => c.id === p.clienteId);
              return (
                <li key={p.id}>
                  <button
                    onClick={() => onVerProyecto(p.id)}
                    className="block w-full px-4 py-3 text-left hover:bg-muted/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{p.codigo}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {cli?.nombre ?? '—'} · {p.tipo}
                        </div>
                      </div>
                      <EstadoBadge estado={p.estado} />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Solicitado {p.fechaSolicitud}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof ProyectosTable> = {
  title: 'Comercial/ProyectosTable',
  component: ProyectosTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    onVerProyecto: fn(),
    onNuevoProyecto: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const ConProyectos: Story = {
  name: 'Con proyectos',
  args: {
    proyectos: mockProyectos,
    clientes: mockClientes,
    puedeEditar: true,
  },
};

export const SinProyectos: Story = {
  name: 'Sin proyectos (estado vacío)',
  args: {
    proyectos: [],
    clientes: mockClientes,
    puedeEditar: true,
  },
};

export const FiltradoPorEstado: Story = {
  name: 'Filtrado por estado (solo Aprobada)',
  args: {
    proyectos: mockProyectos.filter((p) => p.estado === 'Aprobada'),
    clientes: mockClientes,
    puedeEditar: true,
  },
};

// ─── Interaction test ─────────────────────────────────────────────────────────

export const TestFiltrarProyectos: Story = {
  name: 'Test: filtrar proyectos por estado',
  args: {
    proyectos: mockProyectos,
    clientes: mockClientes,
    puedeEditar: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox');
    await userEvent.selectOptions(select, 'Aprobada');
    // PROY-001 (Aprobada) should be visible
    await expect(canvas.getByText('PROY-001')).toBeInTheDocument();
    // Other states should NOT be visible
    await expect(canvas.queryByText('PROY-002')).not.toBeInTheDocument();
    await expect(canvas.queryByText('PROY-003')).not.toBeInTheDocument();
    await expect(canvas.queryByText('PROY-004')).not.toBeInTheDocument();
    await expect(canvas.queryByText('PROY-005')).not.toBeInTheDocument();
  },
};
