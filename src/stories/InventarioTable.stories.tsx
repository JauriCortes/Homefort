import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, within, userEvent, expect } from 'storybook/test';
import { Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/form-bits';

type Material = {
  id: string;
  nombre: string;
  categoria: string;
  unidad: string;
  disponible: number;
  bloqueado: number;
  consumido: number;
  costoUnitario: number;
};

type Props = {
  materiales: Material[];
  puedeEditar: boolean;
  onRegistrarEntrada: () => void;
};

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);

function InventarioTable({ materiales, puedeEditar, onRegistrarEntrada }: Props) {
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:mb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <nav className="mb-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <span>Compras</span>
            <span className="mx-1">›</span>
            <span>Inventario</span>
          </nav>
          <h1 className="truncate text-xl font-semibold text-foreground md:text-2xl">Inventario</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stock por material basado en movimientos registrados.
          </p>
        </div>
        {puedeEditar && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={onRegistrarEntrada}>
              <Plus className="h-4 w-4" /> Registrar entrada
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Material</th>
              <th className="px-3 py-2 text-left font-medium">Categoria</th>
              <th className="px-3 py-2 text-left font-medium">Unidad</th>
              <th className="px-3 py-2 text-right font-medium">Disponible</th>
              <th className="px-3 py-2 text-right font-medium">Bloqueado</th>
              <th className="px-3 py-2 text-right font-medium">Consumido</th>
              <th className="px-3 py-2 text-right font-medium">Costo unit.</th>
            </tr>
          </thead>
          <tbody>
            {materiales.map((m) => (
              <tr key={m.id} className="border-t border-border">
                <td className="px-3 py-2 font-medium">
                  <div className="flex items-center gap-1">
                    {m.disponible <= 0 && (
                      <AlertTriangle
                        className="h-3.5 w-3.5 text-warning-foreground"
                        title="Sin stock"
                      />
                    )}
                    {m.nombre}
                  </div>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{m.categoria}</td>
                <td className="px-3 py-2 text-muted-foreground">{m.unidad}</td>
                <td
                  className={`px-3 py-2 text-right tabular-nums font-medium ${
                    m.disponible <= 0 ? 'text-destructive' : 'text-success'
                  }`}
                >
                  {m.disponible}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {m.bloqueado}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {m.consumido}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{formatCOP(m.costoUnitario)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const mockMateriales: Material[] = [
  {
    id: 'm1',
    nombre: 'Madera roble 1"',
    categoria: 'Madera',
    unidad: 'm²',
    disponible: 45.5,
    bloqueado: 10,
    consumido: 120,
    costoUnitario: 85000,
  },
  {
    id: 'm2',
    nombre: 'Bisagras 35mm',
    categoria: 'Herrajes',
    unidad: 'und',
    disponible: 0,
    bloqueado: 0,
    consumido: 340,
    costoUnitario: 2500,
  },
  {
    id: 'm3',
    nombre: 'Pintura blanca',
    categoria: 'Acabados',
    unidad: 'L',
    disponible: 12,
    bloqueado: 3,
    consumido: 45,
    costoUnitario: 35000,
  },
  {
    id: 'm4',
    nombre: 'Vidrio templado 6mm',
    categoria: 'Vidrio',
    unidad: 'm²',
    disponible: 8,
    bloqueado: 2,
    consumido: 30,
    costoUnitario: 125000,
  },
];

const meta: Meta<typeof InventarioTable> = {
  title: 'Compras/InventarioTable',
  component: InventarioTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    onRegistrarEntrada: fn(),
    puedeEditar: true,
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const ConStock: Story = {
  name: 'Con stock',
  args: {
    materiales: mockMateriales.filter((m) => m.disponible > 0),
    puedeEditar: true,
  },
};

export const ConSinStock: Story = {
  name: 'Con material sin stock',
  args: {
    materiales: mockMateriales,
    puedeEditar: true,
  },
};

export const SoloLectura: Story = {
  name: 'Solo lectura (sin botón)',
  args: {
    materiales: mockMateriales,
    puedeEditar: false,
  },
};

export const TestRegistrarEntradaClick: Story = {
  name: 'Interacción: Registrar entrada',
  args: {
    materiales: mockMateriales,
    puedeEditar: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /registrar entrada/i }));
    await expect(args.onRegistrarEntrada).toHaveBeenCalled();
  },
};
