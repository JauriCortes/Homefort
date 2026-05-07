import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, within, userEvent, expect } from 'storybook/test';
import { Plus, Shield, Search } from 'lucide-react';

// ─── Area labels (mirrors AREAS_LABEL from @/lib/store) ──────────────────────

const AREAS_LABEL: Record<string, string> = {
  comercial: 'Comercial',
  compras: 'Compras',
  produccion: 'Producción',
  administrativa: 'Administrativa',
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  areas: string[];
  esAdmin: boolean;
  activo: boolean;
  creadoEn: string;
  bloqueadoHasta?: string;
};

type Props = {
  usuarios: Usuario[];
  onGestionar: (id: string) => void;
  onNuevoUsuario: () => void;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockUsuarios: Usuario[] = [
  {
    id: 'u1',
    nombre: 'Andrés Gómez',
    email: 'andres@homefort.co',
    areas: ['comercial', 'administrativa'],
    esAdmin: true,
    activo: true,
    creadoEn: '2026-01-01',
  },
  {
    id: 'u2',
    nombre: 'Laura Sánchez',
    email: 'laura@homefort.co',
    areas: ['comercial'],
    esAdmin: false,
    activo: true,
    creadoEn: '2026-02-01',
  },
  {
    id: 'u3',
    nombre: 'Carlos Ruiz',
    email: 'carlos@homefort.co',
    areas: ['compras'],
    esAdmin: false,
    activo: false,
    creadoEn: '2026-03-01',
  },
  {
    id: 'u4',
    nombre: 'María Pérez',
    email: 'maria@homefort.co',
    areas: ['produccion'],
    esAdmin: false,
    activo: true,
    creadoEn: '2026-04-01',
    bloqueadoHasta: '2099-01-01',
  },
];

// ─── Self-contained UsuariosTable component ───────────────────────────────────

function UsuariosTable({ usuarios, onGestionar, onNuevoUsuario }: Props) {
  const [q, setQ] = useState('');

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return usuarios;
    return usuarios.filter(
      (u) => u.nombre.toLowerCase().includes(t) || u.email.toLowerCase().includes(t),
    );
  }, [usuarios, q]);

  const isBloqueado = (u: Usuario) =>
    !!u.bloqueadoHasta && new Date(u.bloqueadoHasta).getTime() > Date.now();

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:mb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-foreground md:text-2xl">
            Usuarios del sistema
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea y gestiona accesos individuales. Cada usuario solo puede editar su área.
          </p>
        </div>
        <button
          onClick={onNuevoUsuario}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Nuevo usuario
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o correo"
            className="h-9 w-full rounded-md border border-border bg-surface pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Content */}
      {usuarios.length === 0 || filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
          <h3 className="text-base font-semibold text-foreground">Sin usuarios</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {usuarios.length === 0
              ? 'Crea el primer usuario.'
              : 'Ajusta los filtros para encontrar el usuario.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          {/* Desktop table */}
          <table className="hidden w-full text-sm md:table">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Nombre</th>
                <th className="px-3 py-2 font-medium">Correo</th>
                <th className="px-3 py-2 font-medium">Área</th>
                <th className="px-3 py-2 font-medium">Estado</th>
                <th className="px-3 py-2 font-medium">Creado</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/40">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{u.nombre}</span>
                      {u.esAdmin && (
                        <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          <Shield className="h-3 w-3" /> Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{u.email}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {u.areas.map((a) => (
                        <span
                          key={a}
                          className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground"
                        >
                          {AREAS_LABEL[a] ?? a}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {u.activo ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        Inactivo
                      </span>
                    )}
                    {isBloqueado(u) && (
                      <span className="ml-1 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        Bloqueado
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{u.creadoEn}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => onGestionar(u.id)}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile list */}
          <ul className="divide-y divide-border md:hidden">
            {filtrados.map((u) => (
              <li key={u.id} className="p-3">
                <button
                  onClick={() => onGestionar(u.id)}
                  className="flex w-full flex-col gap-0.5 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{u.nombre}</span>
                    {u.activo ? (
                      <span className="text-xs text-green-700">Activo</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Inactivo</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{u.email}</span>
                  <span className="text-xs text-muted-foreground">
                    {u.areas.map((a) => AREAS_LABEL[a] ?? a).join(' · ')}
                    {u.esAdmin && ' · Admin'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof UsuariosTable> = {
  title: 'Admin/UsuariosTable',
  component: UsuariosTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    onGestionar: fn(),
    onNuevoUsuario: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const ConUsuarios: Story = {
  name: 'Con usuarios (activo admin, activo regular, inactivo, bloqueado)',
  args: {
    usuarios: mockUsuarios,
  },
};

export const SinUsuarios: Story = {
  name: 'Sin usuarios (estado vacío)',
  args: {
    usuarios: [],
  },
};

export const SoloActivos: Story = {
  name: 'Solo activos',
  args: {
    usuarios: mockUsuarios.filter((u) => u.activo),
  },
};

// ─── Interaction tests ────────────────────────────────────────────────────────

export const TestBuscarUsuario: Story = {
  name: 'Test: buscar usuario por nombre',
  args: {
    usuarios: mockUsuarios,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText(/buscar/i);
    await userEvent.type(input, 'andrés');
    // Only Andrés Gómez should be visible
    await expect(canvas.getByText('Andrés Gómez')).toBeInTheDocument();
    // Other users should not be visible
    await expect(canvas.queryByText('Laura Sánchez')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Carlos Ruiz')).not.toBeInTheDocument();
    await expect(canvas.queryByText('María Pérez')).not.toBeInTheDocument();
  },
};

export const TestGestionarClick: Story = {
  name: 'Test: click Gestionar usuario',
  args: {
    usuarios: mockUsuarios,
    onGestionar: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const btns = canvas.getAllByRole('button', { name: /gestionar/i });
    await userEvent.click(btns[0]);
    await expect(args.onGestionar).toHaveBeenCalledWith('u1');
  },
};
