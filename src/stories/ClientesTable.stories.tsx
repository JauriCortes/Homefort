import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, within, userEvent, expect } from 'storybook/test';
import { Users, Plus, Search, Eye } from 'lucide-react';
import { TipoClienteBadge } from '@/components/ui-bits';
import { TextInput, Select } from '@/components/form-bits';

// ─── Types ────────────────────────────────────────────────────────────────────

type Cliente = {
  id: string;
  nombre: string;
  contacto: string;
  tipo: 'B2B' | 'B2C';
  empresa?: string;
  creadoEn: string;
};

type Props = {
  clientes: Cliente[];
  proyectos: Array<{ id: string; clienteId: string }>;
  puedeEditar: boolean;
  onVerCliente: (id: string) => void;
  onNuevoCliente: () => void;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockClientes: Cliente[] = [
  { id: 'c1', nombre: 'María Rodríguez', contacto: 'maria@example.com', tipo: 'B2C', creadoEn: '2026-01-15' },
  { id: 'c2', nombre: 'Constructora Andina SAS', contacto: 'contacto@andina.co', tipo: 'B2B', empresa: 'Constructora Andina', creadoEn: '2026-02-01' },
  { id: 'c3', nombre: 'Carlos Torres', contacto: 'carlos@gmail.com', tipo: 'B2C', creadoEn: '2026-03-10' },
  { id: 'c4', nombre: 'Inmobiliaria Norte Ltda', contacto: 'info@norte.co', tipo: 'B2B', empresa: 'Inmobiliaria Norte', creadoEn: '2026-04-05' },
];

const mockProyectos = [
  { id: 'p1', clienteId: 'c1' },
  { id: 'p2', clienteId: 'c1' },
  { id: 'p3', clienteId: 'c2' },
];

// ─── Self-contained ClientesTable component ───────────────────────────────────

function ClientesTable({ clientes, proyectos, puedeEditar, onVerCliente, onNuevoCliente }: Props) {
  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState<string>('');

  const filtrados = clientes.filter((c) => {
    const text = `${c.nombre} ${c.contacto} ${c.empresa ?? ''}`.toLowerCase();
    return text.includes(q.toLowerCase()) && (tipo ? c.tipo === tipo : true);
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:mb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-foreground md:text-2xl">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Base de clientes consultable por todas las áreas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {puedeEditar ? (
            <button
              onClick={onNuevoCliente}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Registrar cliente
            </button>
          ) : (
            <button
              disabled
              title="Solo el área comercial puede crear clientes"
              className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-md bg-muted px-3 text-sm font-medium text-muted-foreground"
            >
              <Plus className="h-4 w-4" /> Registrar cliente
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput
            placeholder="Buscar por nombre, contacto o empresa…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8"
            aria-label="Buscar clientes"
          />
        </div>
        <Select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="sm:w-40"
          aria-label="Filtrar por tipo"
        >
          <option value="">Todos los tipos</option>
          <option value="B2B">B2B</option>
          <option value="B2C">B2C</option>
        </Select>
      </div>

      {/* Empty states */}
      {clientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Aún no hay clientes registrados</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Registra el primer cliente para comenzar a crear proyectos.
          </p>
          {puedeEditar && (
            <div className="mt-4">
              <button
                onClick={onNuevoCliente}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" /> Registrar cliente
              </button>
            </div>
          )}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
          <h3 className="text-base font-semibold text-foreground">Sin resultados</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Ajusta los filtros para encontrar el cliente que buscas.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          {/* Desktop table */}
          <table className="hidden w-full text-sm md:table">
            <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Contacto</th>
                <th className="px-4 py-2 font-medium">Tipo</th>
                <th className="px-4 py-2 font-medium">Proyectos</th>
                <th className="px-4 py-2 font-medium">Registro</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtrados.map((c) => {
                const n = proyectos.filter((p) => p.clienteId === c.id).length;
                return (
                  <tr key={c.id} className="hover:bg-muted/40">
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{c.nombre}</div>
                      {c.empresa && (
                        <div className="text-xs text-muted-foreground">{c.empresa}</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-foreground">{c.contacto}</td>
                    <td className="px-4 py-2.5">
                      <TipoClienteBadge tipo={c.tipo} />
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">{n}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{c.creadoEn}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => onVerCliente(c.id)}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" /> Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile card list */}
          <ul className="divide-y divide-border md:hidden">
            {filtrados.map((c) => {
              const n = proyectos.filter((p) => p.clienteId === c.id).length;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => onVerCliente(c.id)}
                    className="block w-full px-4 py-3 text-left hover:bg-muted/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{c.nombre}</div>
                        <div className="truncate text-xs text-muted-foreground">{c.contacto}</div>
                      </div>
                      <TipoClienteBadge tipo={c.tipo} />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {n} {n === 1 ? 'proyecto' : 'proyectos'} · alta {c.creadoEn}
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

const meta: Meta<typeof ClientesTable> = {
  title: 'Comercial/ClientesTable',
  component: ClientesTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    onVerCliente: fn(),
    onNuevoCliente: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const ConClientes: Story = {
  name: 'Con clientes',
  args: {
    clientes: mockClientes,
    proyectos: mockProyectos,
    puedeEditar: true,
  },
};

export const SinClientes: Story = {
  name: 'Sin clientes (estado vacío)',
  args: {
    clientes: [],
    proyectos: [],
    puedeEditar: true,
  },
};

export const SoloLectura: Story = {
  name: 'Solo lectura',
  args: {
    clientes: mockClientes,
    proyectos: mockProyectos,
    puedeEditar: false,
  },
};

export const FiltroPorTipo: Story = {
  name: 'Filtro por tipo (solo B2B)',
  args: {
    clientes: mockClientes.filter((c) => c.tipo === 'B2B'),
    proyectos: mockProyectos,
    puedeEditar: true,
  },
};

// ─── Interaction tests ────────────────────────────────────────────────────────

export const TestFiltrarPorNombre: Story = {
  name: 'Test: filtrar por nombre',
  args: {
    clientes: mockClientes,
    proyectos: mockProyectos,
    puedeEditar: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText(/buscar por nombre/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'María');
    // María Rodríguez should be visible (appears in both desktop + mobile renders)
    await expect(canvas.getAllByText('María Rodríguez')[0]).toBeInTheDocument();
    // B2B clients should NOT be visible
    await expect(canvas.queryByText('Constructora Andina SAS')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Inmobiliaria Norte Ltda')).not.toBeInTheDocument();
  },
};

export const TestFiltrarPorTipo: Story = {
  name: 'Test: filtrar por tipo B2B',
  args: {
    clientes: mockClientes,
    proyectos: mockProyectos,
    puedeEditar: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: /filtrar por tipo/i });
    await userEvent.selectOptions(select, 'B2B');
    // B2B clients should be visible (appears in both desktop + mobile renders)
    await expect(canvas.getAllByText('Constructora Andina SAS')[0]).toBeInTheDocument();
    await expect(canvas.getAllByText('Inmobiliaria Norte Ltda')[0]).toBeInTheDocument();
    // B2C clients should NOT be visible
    await expect(canvas.queryByText('María Rodríguez')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Carlos Torres')).not.toBeInTheDocument();
  },
};

export const TestVerCliente: Story = {
  name: 'Test: ver cliente',
  args: {
    clientes: mockClientes,
    proyectos: mockProyectos,
    puedeEditar: true,
    onVerCliente: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // Click "Ver" on the first row (desktop table)
    const verButtons = canvas.getAllByRole('button', { name: /ver/i });
    await userEvent.click(verButtons[0]);
    await expect(args.onVerCliente).toHaveBeenCalledWith('c1');
  },
};
