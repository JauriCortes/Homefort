import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, within, userEvent, expect } from 'storybook/test';
import { Plus } from 'lucide-react';

// ─── Helper ───────────────────────────────────────────────────────────────────

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);

// ─── Types ────────────────────────────────────────────────────────────────────

type FilaCosto = {
  proyectoCodigo: string;
  cotizado: number;
  costoReal: number;
  desviacion: number;
};

type Props = {
  filas: FilaCosto[];
  puedeEditar: boolean;
  onAjusteManual: () => void;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockFilas: FilaCosto[] = [
  // over budget → red
  { proyectoCodigo: 'PROY-001', cotizado: 4500000, costoReal: 5100000, desviacion: 600000 },
  // under budget → green
  { proyectoCodigo: 'PROY-002', cotizado: 8000000, costoReal: 7200000, desviacion: -800000 },
  // on budget → neutral
  { proyectoCodigo: 'PROY-003', cotizado: 3000000, costoReal: 3000000, desviacion: 0 },
];

// ─── Self-contained CostosTable component ────────────────────────────────────

function CostosTable({ filas, puedeEditar, onAjusteManual }: Props) {
  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:mb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-foreground md:text-2xl">Costos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Comparativo de costos cotizados vs reales por proyecto.
          </p>
        </div>
        {puedeEditar && (
          <button
            onClick={onAjusteManual}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Ajuste manual
          </button>
        )}
      </div>

      {/* Table — always rendered (may be empty body) */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Proyecto</th>
              <th className="px-3 py-2 text-right font-medium">Cotizado</th>
              <th className="px-3 py-2 text-right font-medium">Costo real</th>
              <th className="px-3 py-2 text-right font-medium">Desviación</th>
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Sin proyectos con cotización.
                </td>
              </tr>
            ) : (
              filas.map((f) => (
                <tr key={f.proyectoCodigo} className="border-t border-border hover:bg-muted/40">
                  <td className="px-3 py-2 font-medium">{f.proyectoCodigo}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCOP(f.cotizado)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCOP(f.costoReal)}</td>
                  <td
                    className={`px-3 py-2 text-right tabular-nums font-medium ${
                      f.desviacion > 0
                        ? 'text-red-600'
                        : f.desviacion < 0
                          ? 'text-green-600'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {f.desviacion !== 0
                      ? `${f.desviacion > 0 ? '+' : ''}${formatCOP(f.desviacion)}`
                      : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof CostosTable> = {
  title: 'Administrativa/CostosTable',
  component: CostosTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    onAjusteManual: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const ConDesviaciones: Story = {
  name: 'Con desviaciones (sobre, bajo y en presupuesto)',
  args: {
    filas: mockFilas,
    puedeEditar: true,
  },
};

export const SinCotizaciones: Story = {
  name: 'Sin cotizaciones (tabla vacía)',
  args: {
    filas: [],
    puedeEditar: true,
  },
};

// ─── Interaction tests ────────────────────────────────────────────────────────

export const TestAjusteManualClick: Story = {
  name: 'Test: click Ajuste manual',
  args: {
    filas: mockFilas,
    puedeEditar: true,
    onAjusteManual: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: /ajuste manual/i });
    await userEvent.click(btn);
    await expect(args.onAjusteManual).toHaveBeenCalledOnce();
  },
};
