/**
 * Seguimiento pages — Kanban board and filterable project list.
 *
 * These stories render the full page layout with realistic mock data,
 * matching src/routes/seguimiento.index.tsx and seguimiento.lista.tsx.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { ESTADO_COLORS, type EstadoProyecto } from '@/lib/store';
import { PageHeader, EstadoBadge } from '@/components/ui-bits';
import { TextInput, Select } from '@/components/form-bits';

// ─── Types ─────────────────────────────────────────────────────────────────────

type Proyecto = {
  id: string;
  codigo: string;
  tipo: string;
  titulo?: string;
  estado: EstadoProyecto;
  clienteId: string;
  fechaSolicitud: string;
  ultimaActualizacion: string;
};

type Cliente = { id: string; nombre: string };

// ─── Mock data ─────────────────────────────────────────────────────────────────

const mockClientes: Cliente[] = [
  { id: 'c1', nombre: 'Diana Restrepo' },
  { id: 'c2', nombre: 'Constructora Andina S.A.S.' },
  { id: 'c3', nombre: 'Carlos Méndez' },
  { id: 'c4', nombre: 'Arq. Patricia López' },
];

const mockProyectos: Proyecto[] = [
  { id: 'p1', codigo: 'PY-001', tipo: 'Cocina integral', titulo: 'Cocina en cedro', estado: 'Aprobada', clienteId: 'c1', fechaSolicitud: '2026-04-01', ultimaActualizacion: '2026-05-10' },
  { id: 'p2', codigo: 'PY-002', tipo: 'Closet empotrado', estado: 'En producción', clienteId: 'c2', fechaSolicitud: '2026-03-15', ultimaActualizacion: '2026-05-08' },
  { id: 'p3', codigo: 'PY-003', tipo: 'Mueble de sala', estado: 'En cotización', clienteId: 'c3', fechaSolicitud: '2026-05-02', ultimaActualizacion: '2026-05-05' },
  { id: 'p4', codigo: 'PY-004', tipo: 'Biblioteca a medida', estado: 'En definición', clienteId: 'c4', fechaSolicitud: '2026-05-07', ultimaActualizacion: '2026-05-09' },
  { id: 'p5', codigo: 'PY-005', tipo: 'Comedor completo', estado: 'Entregado', clienteId: 'c1', fechaSolicitud: '2026-02-10', ultimaActualizacion: '2026-04-20' },
  { id: 'p6', codigo: 'PY-006', tipo: 'Oficina modular', estado: 'En producción', clienteId: 'c2', fechaSolicitud: '2026-03-20', ultimaActualizacion: '2026-05-11' },
  { id: 'p7', codigo: 'PY-007', tipo: 'Baño flotante', estado: 'Rechazada', clienteId: 'c3', fechaSolicitud: '2026-04-15', ultimaActualizacion: '2026-04-28' },
  { id: 'p8', codigo: 'PY-008', tipo: 'Terraza cubierta', estado: 'En garantía', clienteId: 'c4', fechaSolicitud: '2026-01-05', ultimaActualizacion: '2026-05-01' },
  { id: 'p9', codigo: 'PY-009', tipo: 'Cocina remodelación', estado: 'Solicitud', clienteId: 'c1', fechaSolicitud: '2026-05-14', ultimaActualizacion: '2026-05-14' },
];

// ─── Kanban Board ──────────────────────────────────────────────────────────────

const ESTADOS: EstadoProyecto[] = [
  'Solicitud', 'En definición', 'En cotización', 'Aprobada',
  'En producción', 'En garantía', 'Entregado', 'Rechazada',
];

type KanbanBoardProps = {
  proyectos: Proyecto[];
  clientes: Cliente[];
  onCardClick: (id: string) => void;
};

function KanbanBoard({ proyectos, clientes, onCardClick }: KanbanBoardProps) {
  return (
    <div>
      <PageHeader
        title="Kanban de proyectos"
        description="Vista de todos los proyectos por estado."
        crumbs={[{ label: 'Seguimiento' }, { label: 'Kanban' }]}
      />
      <div className="flex gap-3 overflow-x-auto pb-4">
        {ESTADOS.map((estado) => {
          const cols = proyectos.filter((p) => p.estado === estado);
          return (
            <div key={estado} className="min-w-[210px] shrink-0">
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
                      <div className="text-sm font-medium text-foreground">{p.codigo}</div>
                      <div className="mt-0.5 text-xs font-medium text-foreground/80">{p.tipo}</div>
                      <div className="mt-1 text-xs text-foreground">{cliente?.nombre ?? 'Cliente eliminado'}</div>
                      <div className="mt-1 text-[11px] text-muted-foreground">{p.ultimaActualizacion}</div>
                    </div>
                  );
                })}
                {cols.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border bg-surface/50 px-3 py-4 text-center text-xs text-muted-foreground">
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

// ─── Lista de Proyectos ────────────────────────────────────────────────────────

function ListaProyectos({ proyectos, clientes }: { proyectos: Proyecto[]; clientes: Cliente[] }) {
  const [q, setQ] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'' | EstadoProyecto>('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const filtrados = useMemo(() => {
    return proyectos.filter((p) => {
      if (filtroEstado && p.estado !== filtroEstado) return false;
      if (filtroCliente && p.clienteId !== filtroCliente) return false;
      if (fechaDesde && p.fechaSolicitud < fechaDesde) return false;
      if (fechaHasta && p.fechaSolicitud > fechaHasta) return false;
      if (q.trim()) {
        const t = q.trim().toLowerCase();
        const cliente = clientes.find((c) => c.id === p.clienteId);
        if (!p.codigo.toLowerCase().includes(t) && !p.tipo.toLowerCase().includes(t) && !cliente?.nombre.toLowerCase().includes(t)) return false;
      }
      return true;
    });
  }, [proyectos, clientes, q, filtroEstado, filtroCliente, fechaDesde, fechaHasta]);

  const hasFilters = q || filtroEstado || filtroCliente || fechaDesde || fechaHasta;

  return (
    <div>
      <PageHeader
        title="Lista de proyectos"
        description="Vista filtrable de todos los proyectos."
        crumbs={[{ label: 'Seguimiento' }, { label: 'Lista' }]}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por código, tipo o título" className="pl-8" />
        </div>
        <Select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as EstadoProyecto | '')} className="min-w-[180px]">
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
        </Select>
        <Select value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)} className="min-w-[180px]">
          <option value="">Todos los clientes</option>
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </Select>
        <div className="flex items-center gap-1">
          <TextInput type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="w-36" />
          <span className="text-xs text-muted-foreground">—</span>
          <TextInput type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="w-36" />
        </div>
        {hasFilters && (
          <button onClick={() => { setQ(''); setFiltroEstado(''); setFiltroCliente(''); setFechaDesde(''); setFechaHasta(''); }} className="text-xs text-muted-foreground underline hover:text-foreground">
            Limpiar filtros
          </button>
        )}
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Código</th>
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
                  <td className="px-3 py-2 font-medium text-primary hover:underline cursor-pointer">{p.codigo}</td>
                  <td className="px-3 py-2 text-muted-foreground">{cliente?.nombre ?? 'Eliminado'}</td>
                  <td className="px-3 py-2">{p.tipo}</td>
                  <td className="px-3 py-2"><EstadoBadge estado={p.estado} /></td>
                  <td className="px-3 py-2 text-muted-foreground">{p.fechaSolicitud}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.ultimaActualizacion}</td>
                </tr>
              );
            })}
            {filtrados.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-sm text-muted-foreground">Sin proyectos que coincidan con el filtro.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Pages/Seguimiento',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

// ─── Kanban stories ────────────────────────────────────────────────────────────

export const KanbanConProyectos: Story = {
  name: 'Kanban — con proyectos',
  render: () => (
    <KanbanBoard proyectos={mockProyectos} clientes={mockClientes} onCardClick={fn()} />
  ),
};

export const KanbanVacio: Story = {
  name: 'Kanban — sin proyectos (vacío)',
  render: () => <KanbanBoard proyectos={[]} clientes={mockClientes} onCardClick={fn()} />,
};

export const KanbanSoloProduccion: Story = {
  name: 'Kanban — solo "En producción" con carga',
  render: () => (
    <KanbanBoard
      proyectos={Array.from({ length: 6 }, (_, i) => ({
        id: `p${i}`,
        codigo: `PY-00${i + 1}`,
        tipo: ['Cocina', 'Closet', 'Mueble', 'Comedor', 'Biblioteca', 'Baño'][i],
        estado: 'En producción' as EstadoProyecto,
        clienteId: mockClientes[i % mockClientes.length].id,
        fechaSolicitud: '2026-04-01',
        ultimaActualizacion: '2026-05-10',
      }))}
      clientes={mockClientes}
      onCardClick={fn()}
    />
  ),
};

// ─── Lista stories ─────────────────────────────────────────────────────────────

export const ListaConProyectos: Story = {
  name: 'Lista — con proyectos',
  render: () => <ListaProyectos proyectos={mockProyectos} clientes={mockClientes} />,
};

export const ListaVacia: Story = {
  name: 'Lista — sin proyectos',
  render: () => <ListaProyectos proyectos={[]} clientes={mockClientes} />,
};

export const ListaMuchosProyectos: Story = {
  name: 'Lista — 20 proyectos (dense)',
  render: () => (
    <ListaProyectos
      proyectos={Array.from({ length: 20 }, (_, i) => ({
        id: `p${i}`,
        codigo: `PY-0${String(i + 1).padStart(2, '0')}`,
        tipo: ['Cocina', 'Closet', 'Mueble', 'Comedor', 'Biblioteca'][i % 5],
        estado: ESTADOS[i % ESTADOS.length],
        clienteId: mockClientes[i % mockClientes.length].id,
        fechaSolicitud: `2026-0${Math.floor(i / 4) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
        ultimaActualizacion: '2026-05-10',
      }))}
      clientes={mockClientes}
    />
  ),
};
