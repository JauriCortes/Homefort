import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect } from 'storybook/test';
import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { ESTADO_COLORS, type EstadoProyecto } from '@/lib/store';
import { TextInput, Select } from '@/components/form-bits';

// ─── Types ───────────────────────────────────────────────────────────────────

type ProyectoLista = {
  id: string;
  codigo: string;
  tipo: string;
  estado: EstadoProyecto;
  clienteId: string;
  fechaSolicitud: string;
  ultimaActualizacion: string;
};

type ClienteRef = {
  id: string;
  nombre: string;
};

type Props = {
  proyectos: ProyectoLista[];
  clientes: ClienteRef[];
  initialEstado?: EstadoProyecto | '';
};

// ─── All possible states constant ────────────────────────────────────────────

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

// ─── Self-contained ProyectosListTable component ──────────────────────────────

function ProyectosListTable({ proyectos, clientes, initialEstado = '' }: Props) {
  const [q, setQ] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'' | EstadoProyecto>(initialEstado);

  const filtrados = useMemo(() => {
    return proyectos.filter((p) => {
      if (filtroEstado && p.estado !== filtroEstado) return false;
      if (q.trim()) {
        const t = q.trim().toLowerCase();
        const cliente = clientes.find((c) => c.id === p.clienteId);
        if (
          !p.codigo.toLowerCase().includes(t) &&
          !p.tipo.toLowerCase().includes(t) &&
          !cliente?.nombre.toLowerCase().includes(t)
        )
          return false;
      }
      return true;
    });
  }, [proyectos, clientes, q, filtroEstado]);

  return (
    <div className="p-4">
      <div className="mb-4 border-b border-border pb-4">
        <h1 className="text-xl font-semibold text-foreground md:text-2xl">Lista de proyectos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Vista filtrable de todos los proyectos.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por codigo, tipo o cliente"
            className="pl-8"
          />
        </div>
        <Select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as EstadoProyecto | '')}
          className="w-auto min-w-[180px]"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Codigo</th>
              <th className="px-3 py-2 font-medium">Cliente</th>
              <th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium">Estado</th>
              <th className="px-3 py-2 font-medium">Solicitud</th>
              <th className="px-3 py-2 font-medium">Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p) => {
              const cliente = clientes.find((c) => c.id === p.clienteId);
              return (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2">
                    {/* Plain <a> tag — no TanStack router Link in stories */}
                    <a
                      href={`#/seguimiento/${p.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {p.codigo}
                    </a>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {cliente?.nombre ?? 'Eliminado'}
                  </td>
                  <td className="px-3 py-2">{p.tipo}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_COLORS[p.estado]}`}
                    >
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{p.fechaSolicitud}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.ultimaActualizacion}</td>
                </tr>
              );
            })}
            {filtrados.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-sm text-muted-foreground"
                >
                  Sin proyectos que coincidan con el filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const mockClientes: ClienteRef[] = [
  { id: 'c1', nombre: 'María Rodríguez' },
  { id: 'c2', nombre: 'Carlos Torres' },
];

const mockProyectos: ProyectoLista[] = [
  { id: 'p1', codigo: 'PROY-001', tipo: 'Mueble a medida', estado: 'Solicitud', clienteId: 'c1', fechaSolicitud: '2026-04-20', ultimaActualizacion: '2026-05-01' },
  { id: 'p2', codigo: 'PROY-002', tipo: 'Closet', estado: 'En producción', clienteId: 'c2', fechaSolicitud: '2026-04-10', ultimaActualizacion: '2026-04-28' },
  { id: 'p3', codigo: 'PROY-003', tipo: 'Cocina integral', estado: 'Entregado', clienteId: 'c1', fechaSolicitud: '2026-03-15', ultimaActualizacion: '2026-04-15' },
  { id: 'p4', codigo: 'PROY-004', tipo: 'Sala', estado: 'En cotización', clienteId: 'c2', fechaSolicitud: '2026-03-01', ultimaActualizacion: '2026-04-10' },
  { id: 'p5', codigo: 'PROY-005', tipo: 'Comedor', estado: 'Aprobada', clienteId: 'c1', fechaSolicitud: '2026-02-14', ultimaActualizacion: '2026-04-05' },
];

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta: Meta<typeof ProyectosListTable> = {
  title: 'P01 / ProyectosList',
  component: ProyectosListTable,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof ProyectosListTable>;

// ─── Stories ─────────────────────────────────────────────────────────────────

export const ConDatos: Story = {
  name: 'ConDatos',
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

export const FiltroPorEstado: Story = {
  name: 'FiltroPorEstado — "En producción"',
  args: {
    proyectos: mockProyectos,
    clientes: mockClientes,
    initialEstado: 'En producción',
  },
};

// ─── Interaction test ─────────────────────────────────────────────────────────

export const TestBusquedaEnLista: Story = {
  name: 'Test / Búsqueda filtra filas',
  args: {
    proyectos: mockProyectos,
    clientes: mockClientes,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText(/buscar/i);
    await userEvent.type(input, 'PROY-002');
    // Only PROY-002 row should be visible
    await expect(canvas.getByText('PROY-002')).toBeInTheDocument();
    await expect(canvas.queryByText('PROY-001')).not.toBeInTheDocument();
  },
};
