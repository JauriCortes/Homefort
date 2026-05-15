import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, within, userEvent, expect } from 'storybook/test';
import { useState } from 'react';

function OrderStateSelect({ onConfirmCancel, onStateChange }: {
  onConfirmCancel: (id: string) => void;
  onStateChange: (id: string, state: string) => void;
}) {
  const [estado, setEstado] = useState('borrador');
  const [pending, setPending] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Estado orden OC-001:</span>
        <select
          value={estado}
          data-testid="estado-select"
          onChange={(e) => {
            if (e.target.value === 'cancelada') {
              setPending(true);
            } else {
              setEstado(e.target.value);
              onStateChange('OC-001', e.target.value);
            }
          }}
          className="rounded border border-gray-200 px-2 py-1 text-sm"
        >
          <option value="borrador">Borrador</option>
          <option value="enviada">Enviada</option>
          <option value="recibida">Recibida</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" data-testid="confirm-dialog">
          <div className="w-full max-w-sm rounded-lg border bg-white p-5 shadow-xl">
            <h2 className="text-sm font-semibold">¿Cancelar orden de compra?</h2>
            <p className="mt-2 text-sm text-gray-500">Esta acción cambiará el estado a <strong>Cancelada</strong>.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button data-testid="btn-mantener" onClick={() => setPending(false)} className="rounded border px-3 py-1.5 text-sm">Mantener estado</button>
              <button data-testid="btn-confirmar" onClick={() => { setEstado('cancelada'); setPending(false); onConfirmCancel('OC-001'); }} className="rounded bg-red-600 px-3 py-1.5 text-sm text-white">Sí, cancelar orden</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof OrderStateSelect> = {
  title: 'P03 / OrderStateConfirm',
  component: OrderStateSelect,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { onConfirmCancel: fn(), onStateChange: fn() },
};
export default meta;
type Story = StoryObj<typeof OrderStateSelect>;

export const Default: Story = { name: 'Estado inicial (borrador)' };

export const TestCancelacionConfirmada: Story = {
  name: 'Interacción: Confirmar cancelación',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByTestId('estado-select');
    await userEvent.selectOptions(select, 'cancelada');
    const dialog = canvas.getByTestId('confirm-dialog');
    await expect(dialog).toBeInTheDocument();
    const btnConfirmar = canvas.getByTestId('btn-confirmar');
    await userEvent.click(btnConfirmar);
    await expect(args.onConfirmCancel).toHaveBeenCalledWith('OC-001');
    await expect(canvas.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
  },
};

export const TestCancelacionAbortada: Story = {
  name: 'Interacción: Abortar cancelación',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByTestId('estado-select');
    await userEvent.selectOptions(select, 'cancelada');
    await expect(canvas.getByTestId('confirm-dialog')).toBeInTheDocument();
    await userEvent.click(canvas.getByTestId('btn-mantener'));
    await expect(canvas.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    await expect(args.onConfirmCancel).not.toHaveBeenCalled();
  },
};
