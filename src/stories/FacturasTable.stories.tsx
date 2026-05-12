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

type Factura = {
  id: string;
  numero: string;
  clienteNombre: string;
  monto: number;
  fechaVencimiento: string;
  estado: 'Pendiente' | 'Pagada' | 'Parcialmente pagada' | 'Vencida' | 'Anulada';
};

type Props = {
  facturas: Factura[];
  puedeEditar: boolean;
  onNuevaFactura: () => void;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockFacturas: Factura[] = [
  {
    id: 'f1',
    numero: 'FAC-001',
    clienteNombre: 'María Rodríguez',
    monto: 4500000,
    fechaVencimiento: '2026-05-30',
    estado: 'Pendiente',
  },
  {
    id: 'f2',
    numero: 'FAC-002',
    clienteNombre: 'Constructora Andina',
    monto: 12000000,
    fechaVencimiento: '2026-04-15',
    estado: 'Pagada',
  },
  {
    id: 'f3',
    numero: 'FAC-003',
    clienteNombre: 'Carlos Torres',
    monto: 2800000,
    fechaVencimiento: '2026-03-01',
    estado: 'Vencida',
  },
  {
    id: 'f4',
    numero: 'FAC-004',
    clienteNombre: 'Inmobiliaria Norte',
    monto: 8500000,
    fechaVencimiento: '2026-06-15',
    estado: 'Parcialmente pagada',
  },
];

// ─── Badge helper ─────────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: Factura['estado'] }) {
  const cls =
    estado === 'Pagada'
      ? 'bg-green-100 text-green-800'
      : estado === 'Anulada'
        ? 'bg-red-100 text-red-800'
        : estado === 'Parcialmente pagada'
          ? 'bg-blue-100 text-blue-800'
          : estado === 'Vencida'
            ? 'bg-red-50 text-red-700'
            : 'bg-yellow-100 text-yellow-800';
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>{estado}</span>
  );
}

// ─── Self-contained FacturasTable component ───────────────────────────────────

function FacturasTable({ facturas, puedeEditar, onNuevaFactura }: Props) {
  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:mb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-foreground md:text-2xl">Facturas</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestión de facturas por proyecto.</p>
        </div>
        {puedeEditar && (
          <button
            onClick={onNuevaFactura}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Nueva factura
          </button>
        )}
      </div>

      {/* Content */}
      {facturas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
          <h3 className="text-base font-semibold text-foreground">Sin facturas</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Crea la primera factura desde una cotización aprobada.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Número</th>
                <th className="px-3 py-2 text-left font-medium">Cliente</th>
                <th className="px-3 py-2 text-right font-medium">Monto</th>
                <th className="px-3 py-2 text-left font-medium">Vencimiento</th>
                <th className="px-3 py-2 text-left font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f) => (
                <tr key={f.id} className="border-t border-border hover:bg-muted/40">
                  <td className="px-3 py-2 font-medium">{f.numero}</td>
                  <td className="px-3 py-2 text-muted-foreground">{f.clienteNombre}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCOP(f.monto)}</td>
                  <td className="px-3 py-2 text-muted-foreground">{f.fechaVencimiento}</td>
                  <td className="px-3 py-2">
                    <EstadoBadge estado={f.estado} />
                  </td>
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

const meta: Meta<typeof FacturasTable> = {
  title: 'Administrativa/FacturasTable',
  component: FacturasTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    onNuevaFactura: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const ConFacturas: Story = {
  name: 'Con facturas',
  args: {
    facturas: mockFacturas,
    puedeEditar: true,
  },
};

export const SinFacturas: Story = {
  name: 'Sin facturas (estado vacío)',
  args: {
    facturas: [],
    puedeEditar: true,
  },
};

export const SoloLectura: Story = {
  name: 'Solo lectura',
  args: {
    facturas: mockFacturas,
    puedeEditar: false,
  },
};

// ─── Interaction tests ────────────────────────────────────────────────────────

export const TestNuevaFacturaClick: Story = {
  name: 'Test: click Nueva factura',
  args: {
    facturas: mockFacturas,
    puedeEditar: true,
    onNuevaFactura: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: /nueva factura/i });
    await userEvent.click(btn);
    await expect(args.onNuevaFactura).toHaveBeenCalledOnce();
  },
};
