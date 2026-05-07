import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect } from 'storybook/test';
import { useState } from 'react';

type Orden = { codigo: string; proyecto: string; proveedor: string; estado: string };

const mockOrdenes: Orden[] = [
  { codigo: 'OC-001', proyecto: 'PROY-001', proveedor: 'Maderas del Norte', estado: 'borrador' },
  { codigo: 'OC-002', proyecto: 'PROY-002', proveedor: 'Herrajes SA', estado: 'enviada' },
  { codigo: 'OC-003', proyecto: 'PROY-003', proveedor: 'Maderas del Norte', estado: 'recibida' },
];

function SearchableOrderTable({ ordenes }: { ordenes: Orden[] }) {
  const [q, setQ] = useState('');
  const filtered = ordenes.filter((o) =>
    !q || o.codigo.toLowerCase().includes(q.toLowerCase()) || o.proyecto.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="w-[560px] space-y-3">
      <input
        data-testid="search-input"
        type="search"
        placeholder="Buscar por código de orden o proyecto…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:outline-none"
      />
      {filtered.length === 0 ? (
        <p data-testid="empty-state" className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-sm text-gray-400">
          {q ? `No hay órdenes que coincidan con "${q}".` : 'Sin órdenes de compra.'}
        </p>
      ) : (
        <table className="w-full rounded-lg border border-gray-200 text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2 text-left">Código</th>
              <th className="px-3 py-2 text-left">Proyecto</th>
              <th className="px-3 py-2 text-left">Proveedor</th>
              <th className="px-3 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.codigo} data-testid={`row-${o.codigo}`} className="border-t border-gray-100">
                <td className="px-3 py-2 font-medium">{o.codigo}</td>
                <td className="px-3 py-2 text-gray-500">{o.proyecto}</td>
                <td className="px-3 py-2 text-gray-500">{o.proveedor}</td>
                <td className="px-3 py-2">{o.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const meta: Meta<typeof SearchableOrderTable> = {
  title: 'P06 / SearchableTable',
  component: SearchableOrderTable,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof SearchableOrderTable>;

export const Default: Story = { args: { ordenes: mockOrdenes } };

export const TestBusquedaPorCodigo: Story = {
  name: 'Interacción: Filtrar por código',
  args: { ordenes: mockOrdenes },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByTestId('search-input'), 'OC-002');
    await expect(canvas.getByTestId('row-OC-002')).toBeInTheDocument();
    await expect(canvas.queryByTestId('row-OC-001')).not.toBeInTheDocument();
    await expect(canvas.queryByTestId('row-OC-003')).not.toBeInTheDocument();
  },
};

export const TestBusquedaSinResultados: Story = {
  name: 'Interacción: Sin resultados',
  args: { ordenes: mockOrdenes },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByTestId('search-input'), 'PROY-999');
    await expect(canvas.getByTestId('empty-state')).toBeInTheDocument();
  },
};
