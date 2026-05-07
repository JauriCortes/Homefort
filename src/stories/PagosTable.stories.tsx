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

type Pago = {
  id: string;
  proyectoCodigo: string;
  facturaNumero: string;
  monto: number;
  tipo: string;
  fecha: string;
};

type Props = {
  pagos: Pago[];
  puedeEditar: boolean;
  onRegistrarPago: () => void;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockPagos: Pago[] = [
  {
    id: 'p1',
    proyectoCodigo: 'PROY-001',
    facturaNumero: 'FAC-001',
    monto: 2250000,
    tipo: 'Transferencia',
    fecha: '2026-05-02',
  },
  {
    id: 'p2',
    proyectoCodigo: 'PROY-002',
    facturaNumero: 'FAC-002',
    monto: 12000000,
    tipo: 'Cheque',
    fecha: '2026-04-10',
  },
  {
    id: 'p3',
    proyectoCodigo: 'PROY-003',
    facturaNumero: 'FAC-003',
    monto: 1400000,
    tipo: 'Efectivo',
    fecha: '2026-03-20',
  },
];

// ─── Self-contained PagosTable component ─────────────────────────────────────

function PagosTable({ pagos, puedeEditar, onRegistrarPago }: Props) {
  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:mb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-foreground md:text-2xl">Pagos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Registro de pagos recibidos por factura.</p>
        </div>
        {puedeEditar && (
          <button
            onClick={onRegistrarPago}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Registrar pago
          </button>
        )}
      </div>

      {/* Content */}
      {pagos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
          <h3 className="text-base font-semibold text-foreground">Sin pagos registrados</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Registra el primer pago.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Proyecto</th>
                <th className="px-3 py-2 text-left font-medium">Factura</th>
                <th className="px-3 py-2 text-right font-medium">Monto</th>
                <th className="px-3 py-2 text-left font-medium">Tipo</th>
                <th className="px-3 py-2 text-left font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/40">
                  <td className="px-3 py-2 text-muted-foreground">{p.proyectoCodigo}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.facturaNumero}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">{formatCOP(p.monto)}</td>
                  <td className="px-3 py-2">{p.tipo}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof PagosTable> = {
  title: 'Administrativa/PagosTable',
  component: PagosTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    onRegistrarPago: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const ConPagos: Story = {
  name: 'Con pagos',
  args: {
    pagos: mockPagos,
    puedeEditar: true,
  },
};

export const SinPagos: Story = {
  name: 'Sin pagos (estado vacío)',
  args: {
    pagos: [],
    puedeEditar: true,
  },
};

// ─── Interaction tests ────────────────────────────────────────────────────────

export const TestNuevoPagoClick: Story = {
  name: 'Test: click Registrar pago',
  args: {
    pagos: mockPagos,
    puedeEditar: true,
    onRegistrarPago: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: /registrar pago/i });
    await userEvent.click(btn);
    await expect(args.onRegistrarPago).toHaveBeenCalledOnce();
  },
};
