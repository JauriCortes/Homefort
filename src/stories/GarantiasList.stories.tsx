import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, within, userEvent, expect } from 'storybook/test';
import { Plus } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Garantia = {
  id: string;
  proyectoCodigo: string;
  proyectoTipo: string;
  fecha: string;
  descripcion: string;
  abiertoBy: string;
  estado: 'abierta' | 'en_proceso' | 'cerrada';
  ordenGarantiaId?: string;
};

type Props = {
  garantias: Garantia[];
  onVerGarantia: (id: string) => void;
  onNuevaGarantia: () => void;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockGarantias: Garantia[] = [
  {
    id: 'g1',
    proyectoCodigo: 'PROY-001',
    proyectoTipo: 'Cocina integral',
    fecha: '2026-05-01',
    descripcion: 'Bisagra puerta inferior suelta',
    abiertoBy: 'María Rodríguez',
    estado: 'abierta',
  },
  {
    id: 'g2',
    proyectoCodigo: 'PROY-002',
    proyectoTipo: 'Closet',
    fecha: '2026-04-15',
    descripcion: 'Riel de cajón con ruido',
    abiertoBy: 'Carlos Torres',
    estado: 'en_proceso',
    ordenGarantiaId: 'og1',
  },
  {
    id: 'g3',
    proyectoCodigo: 'PROY-003',
    proyectoTipo: 'Sala',
    fecha: '2026-03-10',
    descripcion: 'Raspón en panel lateral',
    abiertoBy: 'Ana López',
    estado: 'cerrada',
  },
];

// ─── Badge helper ─────────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: Garantia['estado'] }) {
  const cls =
    estado === 'cerrada'
      ? 'bg-green-100 text-green-800'
      : estado === 'en_proceso'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-yellow-100 text-yellow-800';
  return <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>{estado}</span>;
}

// ─── Self-contained GarantiasList component ───────────────────────────────────

function GarantiasList({ garantias, onVerGarantia, onNuevaGarantia }: Props) {
  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:mb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-foreground md:text-2xl">Garantías</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Solicitudes de garantía de clientes.
          </p>
        </div>
        <button
          onClick={onNuevaGarantia}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Nueva solicitud
        </button>
      </div>

      {/* Content */}
      {garantias.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
          <h3 className="text-base font-semibold text-foreground">Sin solicitudes de garantía</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Registra la primera solicitud de garantía de un cliente.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {garantias.map((g) => (
            <article
              key={g.id}
              role="article"
              onClick={() => onVerGarantia(g.id)}
              className="cursor-pointer rounded-lg border border-border bg-surface p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-sm">
                    {g.proyectoCodigo} — {g.proyectoTipo}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {g.fecha} · {g.descripcion}
                  </div>
                  <div className="text-xs text-muted-foreground">Abierto por: {g.abiertoBy}</div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <EstadoBadge estado={g.estado} />
                  {g.ordenGarantiaId && (
                    <span className="text-[11px] text-muted-foreground">Con orden</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof GarantiasList> = {
  title: 'Postventa/GarantiasList',
  component: GarantiasList,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    onVerGarantia: fn(),
    onNuevaGarantia: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const ConGarantias: Story = {
  name: 'Con garantías (todos los estados)',
  args: {
    garantias: mockGarantias,
  },
};

export const SinGarantias: Story = {
  name: 'Sin garantías (estado vacío)',
  args: {
    garantias: [],
  },
};

// ─── Interaction tests ────────────────────────────────────────────────────────

export const TestVerGarantia: Story = {
  name: 'Test: ver garantía',
  args: {
    garantias: mockGarantias,
    onVerGarantia: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const card = canvas.getAllByRole('article')[0];
    await userEvent.click(card);
    await expect(args.onVerGarantia).toHaveBeenCalled();
  },
};
