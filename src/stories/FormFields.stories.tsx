import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect } from 'storybook/test';
import { useState } from 'react';
import {
  Field,
  TextInput,
  NumericInput,
  TextArea,
  Select,
  Button,
  AreasChecklist,
} from '@/components/form-bits';
import type { Area } from '@/lib/store';

const meta: Meta = {
  title: 'Components/Form/Fields',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

// ─── Field ─────────────────────────────────────────────────────────────────────

export const FieldDefault: Story = {
  name: 'Field – default',
  render: () => (
    <div className="w-80">
      <Field label="Nombre del cliente">
        <TextInput placeholder="Ej. Diana Restrepo" />
      </Field>
    </div>
  ),
};

export const FieldRequired: Story = {
  name: 'Field – required',
  render: () => (
    <div className="w-80">
      <Field label="Correo electrónico" required>
        <TextInput type="email" placeholder="correo@homefort.co" />
      </Field>
    </div>
  ),
};

export const FieldWithHint: Story = {
  name: 'Field – with hint',
  render: () => (
    <div className="w-80">
      <Field label="Tipo de cliente" hint="B2B = empresa · B2C = persona natural" required>
        <Select>
          <option value="B2C">B2C — Persona natural</option>
          <option value="B2B">B2B — Empresa</option>
        </Select>
      </Field>
    </div>
  ),
};

export const FieldWithError: Story = {
  name: 'Field – with error',
  render: () => (
    <div className="w-80">
      <Field label="Correo electrónico" error="Este correo ya está registrado." required>
        <TextInput type="email" defaultValue="admin@homefort.co" />
      </Field>
    </div>
  ),
};

export const FieldWithErrorAndHint: Story = {
  name: 'Field – error overrides hint',
  render: () => (
    <div className="w-80">
      <Field
        label="Contraseña"
        hint="Mínimo 8 caracteres."
        error="La contraseña es demasiado corta."
        required
      >
        <TextInput type="password" defaultValue="abc" />
      </Field>
    </div>
  ),
};

// ─── TextInput ─────────────────────────────────────────────────────────────────

export const TextInputDefault: Story = {
  name: 'TextInput – default',
  render: () => (
    <div className="w-80">
      <TextInput placeholder="Escribe algo…" />
    </div>
  ),
};

export const TextInputWithValue: Story = {
  name: 'TextInput – with value',
  render: () => (
    <div className="w-80">
      <TextInput defaultValue="Carlos Mendoza" />
    </div>
  ),
};

export const TextInputDisabled: Story = {
  name: 'TextInput – disabled',
  render: () => (
    <div className="w-80">
      <TextInput defaultValue="Campo de solo lectura" disabled />
    </div>
  ),
};

export const TextInputTypes: Story = {
  name: 'TextInput – input types',
  render: () => (
    <div className="w-80 space-y-3">
      <Field label="Correo">
        <TextInput type="email" placeholder="correo@homefort.co" />
      </Field>
      <Field label="Contraseña">
        <TextInput type="password" placeholder="••••••••" />
      </Field>
      <Field label="Fecha">
        <TextInput type="date" />
      </Field>
    </div>
  ),
};

// ─── NumericInput ──────────────────────────────────────────────────────────────

function NumericInputWrapper({
  initialValue = 1500000,
  disabled,
  placeholder,
}: {
  initialValue?: number;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="w-80">
      <Field label="Valor unitario (COP)">
        <NumericInput
          value={value}
          onChange={setValue}
          placeholder={placeholder ?? 'Ej. 1.500.000'}
          disabled={disabled}
        />
      </Field>
      <p className="mt-1 text-xs text-muted-foreground">
        Valor actual: <span className="font-mono">{value.toLocaleString('es-CO')}</span>
      </p>
    </div>
  );
}

export const NumericInputDefault: Story = {
  name: 'NumericInput – default',
  render: () => <NumericInputWrapper />,
};

export const NumericInputZero: Story = {
  name: 'NumericInput – empty (0)',
  render: () => <NumericInputWrapper initialValue={0} placeholder="Ingresa un valor…" />,
};

export const NumericInputDisabled: Story = {
  name: 'NumericInput – disabled',
  render: () => <NumericInputWrapper disabled />,
};

// ─── TextArea ──────────────────────────────────────────────────────────────────

export const TextAreaDefault: Story = {
  name: 'TextArea – default (3 rows)',
  render: () => (
    <div className="w-80">
      <Field label="Observaciones">
        <TextArea placeholder="Describe los detalles del proyecto…" />
      </Field>
    </div>
  ),
};

export const TextAreaTall: Story = {
  name: 'TextArea – 5 rows',
  render: () => (
    <div className="w-80">
      <Field label="Especificaciones técnicas">
        <TextArea placeholder="Material, dimensiones, acabado superficial…" rows={5} />
      </Field>
    </div>
  ),
};

export const TextAreaDisabled: Story = {
  name: 'TextArea – disabled',
  render: () => (
    <div className="w-80">
      <Field label="Descripción">
        <TextArea defaultValue="Mueble de cocina en cedro con acabado natural." disabled />
      </Field>
    </div>
  ),
};

// ─── Select ────────────────────────────────────────────────────────────────────

export const SelectDefault: Story = {
  name: 'Select – default',
  render: () => (
    <div className="w-80">
      <Field label="Estado del proyecto">
        <Select>
          <option value="">Selecciona un estado</option>
          <option value="en-definicion">En definición</option>
          <option value="en-cotizacion">En cotización</option>
          <option value="aprobada">Aprobada</option>
          <option value="en-produccion">En producción</option>
        </Select>
      </Field>
    </div>
  ),
};

export const SelectWithValue: Story = {
  name: 'Select – with selected value',
  render: () => (
    <div className="w-80">
      <Field label="Área">
        <Select defaultValue="comercial">
          <option value="comercial">Comercial</option>
          <option value="compras">Compras</option>
          <option value="produccion">Producción</option>
          <option value="administrativa">Administrativa</option>
        </Select>
      </Field>
    </div>
  ),
};

export const SelectDisabled: Story = {
  name: 'Select – disabled',
  render: () => (
    <div className="w-80">
      <Field label="Área (solo lectura)">
        <Select defaultValue="comercial" disabled>
          <option value="comercial">Comercial</option>
          <option value="compras">Compras</option>
        </Select>
      </Field>
    </div>
  ),
};

// ─── Sample form ───────────────────────────────────────────────────────────────

export const SampleForm: Story = {
  name: 'Pattern — complete form',
  render: () => (
    <div className="w-full max-w-lg rounded-lg border border-border bg-surface p-5">
      <h2 className="mb-4 text-base font-semibold text-foreground">Registrar nuevo cliente</h2>
      <div className="space-y-4">
        <Field label="Nombre del cliente" required>
          <TextInput placeholder="Ej. Diana Restrepo" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tipo" hint="B2B = empresa" required>
            <Select>
              <option value="B2C">B2C — Persona natural</option>
              <option value="B2B">B2B — Empresa</option>
            </Select>
          </Field>
          <Field label="Contacto" required>
            <TextInput placeholder="correo o teléfono" />
          </Field>
        </div>
        <Field label="Valor estimado (COP)">
          <NumericInput value={0} onChange={() => {}} placeholder="Ej. 5.000.000" />
        </Field>
        <Field label="Observaciones" hint="Opcional">
          <TextArea placeholder="Notas adicionales sobre el cliente…" rows={3} />
        </Field>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="secondary" size="md">Cancelar</Button>
          <Button variant="primary" size="md">Guardar cliente</Button>
        </div>
      </div>
    </div>
  ),
};

// ─── AreasChecklist ────────────────────────────────────────────────────────────

function AreasChecklistWrapper({
  initialValue,
  disabled,
}: {
  initialValue: Area[];
  disabled?: boolean;
}) {
  const [value, setValue] = useState<Area[]>(initialValue);
  return <AreasChecklist value={value} onChange={setValue} disabled={disabled} />;
}

export const AreasChecklistDefault: Story = {
  name: 'AreasChecklist – single area',
  render: () => (
    <div className="w-80">
      <Field label="Áreas de acceso">
        <AreasChecklistWrapper initialValue={['comercial']} />
      </Field>
    </div>
  ),
};

export const AreasChecklistMultiple: Story = {
  name: 'AreasChecklist – multiple selected',
  render: () => (
    <div className="w-80">
      <AreasChecklistWrapper initialValue={['comercial', 'compras']} />
    </div>
  ),
};

export const AreasChecklistAll: Story = {
  name: 'AreasChecklist – all selected (admin)',
  render: () => (
    <div className="w-80">
      <AreasChecklistWrapper
        initialValue={['comercial', 'compras', 'produccion', 'administrativa']}
      />
    </div>
  ),
};

export const AreasChecklistDisabled: Story = {
  name: 'AreasChecklist – disabled (read-only)',
  render: () => (
    <div className="w-80">
      <AreasChecklistWrapper initialValue={['comercial', 'produccion']} disabled />
    </div>
  ),
};

export const AreasChecklistToggleInteraction: Story = {
  name: 'AreasChecklist – interaction: toggle Compras',
  render: () => (
    <div className="w-80">
      <AreasChecklistWrapper initialValue={['comercial']} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const comprasCheckbox = canvas.getByRole('checkbox', { name: /Compras/i });
    await expect(comprasCheckbox).not.toBeChecked();
    await userEvent.click(comprasCheckbox);
    await expect(comprasCheckbox).toBeChecked();
    await userEvent.click(comprasCheckbox);
    await expect(comprasCheckbox).not.toBeChecked();
  },
};

export const AreasChecklistCannotDeselectLast: Story = {
  name: 'AreasChecklist – interaction: cannot deselect last area',
  render: () => (
    <div className="w-80">
      <AreasChecklistWrapper initialValue={['compras']} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const comprasCheckbox = canvas.getByRole('checkbox', { name: /Compras/i });
    await expect(comprasCheckbox).toBeChecked();
    await userEvent.click(comprasCheckbox);
    await expect(comprasCheckbox).toBeChecked();
  },
};
