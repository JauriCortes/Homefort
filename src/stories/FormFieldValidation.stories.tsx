import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect } from 'storybook/test';
import { useState } from 'react';
import { Field, TextInput, Select, Button } from '@/components/form-bits';

function OrderForm({ onSubmit }: { onSubmit: (data: Record<string, string>) => void }) {
  const [form, setForm] = useState({ proyectoId: '', proveedorId: '', fecha: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.proyectoId) errs.proyectoId = 'Selecciona un proyecto.';
    if (!form.proveedorId) errs.proveedorId = 'Selecciona un proveedor.';
    if (!form.fecha) errs.fecha = 'Ingresa la fecha de entrega estimada.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="w-80 space-y-4 rounded-lg border border-gray-200 p-4">
      <Field label="Proyecto" required error={errors.proyectoId}>
        <Select data-testid="select-proyecto" value={form.proyectoId} onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}>
          <option value="">Selecciona...</option>
          <option value="p1">PROY-001</option>
        </Select>
      </Field>
      <Field label="Proveedor" required error={errors.proveedorId}>
        <Select data-testid="select-proveedor" value={form.proveedorId} onChange={(e) => setForm({ ...form, proveedorId: e.target.value })}>
          <option value="">Selecciona...</option>
          <option value="pv1">Proveedor A</option>
        </Select>
      </Field>
      <Field label="Fecha entrega estimada" required error={errors.fecha}>
        <TextInput data-testid="input-fecha" type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
      </Field>
      <Button type="submit" data-testid="btn-submit" className="w-full">Crear orden</Button>
    </form>
  );
}

const meta: Meta<typeof OrderForm> = {
  title: 'P07 / FormFieldValidation',
  component: OrderForm,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof OrderForm>;

export const Default: Story = { args: { onSubmit: () => {} } };

export const TestErroresPorCampo: Story = {
  name: 'Interacción: Errores por campo al enviar vacío',
  args: { onSubmit: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('btn-submit'));
    await expect(canvas.getByText('Selecciona un proyecto.')).toBeInTheDocument();
    await expect(canvas.getByText('Selecciona un proveedor.')).toBeInTheDocument();
    await expect(canvas.getByText('Ingresa la fecha de entrega estimada.')).toBeInTheDocument();
  },
};

export const TestEnvioExitoso: Story = {
  name: 'Interacción: Formulario válido se envía',
  args: { onSubmit: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByTestId('select-proyecto'), 'p1');
    await userEvent.selectOptions(canvas.getByTestId('select-proveedor'), 'pv1');
    await userEvent.type(canvas.getByTestId('input-fecha'), '2026-06-01');
    await userEvent.click(canvas.getByTestId('btn-submit'));
    await expect(canvas.queryByText('Selecciona un proyecto.')).not.toBeInTheDocument();
  },
};
