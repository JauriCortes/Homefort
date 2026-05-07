import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Plus } from 'lucide-react';
import { Button } from '@/components/form-bits';
import { EmptyState } from '@/components/ui-bits';

type Proveedor = {
  id: string;
  nombre: string;
  email: string;
  condicionesPago: string;
  materiales: string[];
};

type Props = {
  proveedores: Proveedor[];
  onNuevo: () => void;
};

function ProveedoresTable({ proveedores, onNuevo }: Props) {
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:mb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <nav className="mb-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <span>Compras</span>
            <span className="mx-1">›</span>
            <span>Proveedores</span>
          </nav>
          <h1 className="truncate text-xl font-semibold text-foreground md:text-2xl">Proveedores</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onNuevo}>
            <Plus className="h-4 w-4" /> Nuevo proveedor
          </Button>
        </div>
      </div>

      {proveedores.length === 0 ? (
        <EmptyState title="Sin proveedores" description="Agrega el primer proveedor." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Nombre</th>
                <th className="px-3 py-2 text-left font-medium">Contacto</th>
                <th className="px-3 py-2 text-left font-medium">Materiales</th>
                <th className="px-3 py-2 text-left font-medium">Condiciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{p.nombre}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.email}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.materiales.join(', ')}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.condicionesPago}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const mockProveedores: Proveedor[] = [
  {
    id: 'pv1',
    nombre: 'Maderas del Norte',
    email: 'ventas@maderasnorte.co',
    condicionesPago: '30 días',
    materiales: ['Madera roble', 'Madera pino'],
  },
  {
    id: 'pv2',
    nombre: 'Herrajes & Accesorios SA',
    email: 'info@herrajes.co',
    condicionesPago: 'Contado',
    materiales: ['Bisagras', 'Jaladores'],
  },
  {
    id: 'pv3',
    nombre: 'Vidrios Premium Ltda',
    email: 'pedidos@vidriospremium.co',
    condicionesPago: '15 días',
    materiales: ['Vidrio templado'],
  },
];

const meta: Meta<typeof ProveedoresTable> = {
  title: 'Compras/ProveedoresTable',
  component: ProveedoresTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    onNuevo: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const ConProveedores: Story = {
  name: 'Con proveedores',
  args: {
    proveedores: mockProveedores,
  },
};

export const SinProveedores: Story = {
  name: 'Sin proveedores (estado vacío)',
  args: {
    proveedores: [],
  },
};
