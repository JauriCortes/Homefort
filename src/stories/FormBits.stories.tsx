import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, within, userEvent, expect } from 'storybook/test';
import { useState } from 'react';
import {
  Field,
  TextInput,
  TextArea,
  Select,
  Button,
  AreasChecklist,
} from '@/components/form-bits';
import type { Area } from '@/lib/store';

// ─── Button ────────────────────────────────────────────────────────────────────

const buttonMeta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
    disabled: { control: 'boolean' },
  },
};
export default buttonMeta;
type ButtonStory = StoryObj<typeof buttonMeta>;

export const Primary: ButtonStory = {
  args: { variant: 'primary', size: 'md', children: 'Guardar' },
};

export const Secondary: ButtonStory = {
  args: { variant: 'secondary', size: 'md', children: 'Cancelar' },
};

export const Ghost: ButtonStory = {
  args: { variant: 'ghost', size: 'md', children: 'Ver más' },
};

export const Danger: ButtonStory = {
  args: { variant: 'danger', size: 'md', children: 'Eliminar' },
};

export const SmallPrimary: ButtonStory = {
  name: 'Primary – sm',
  args: { variant: 'primary', size: 'sm', children: 'Agregar' },
};

export const SmallSecondary: ButtonStory = {
  name: 'Secondary – sm',
  args: { variant: 'secondary', size: 'sm', children: 'Cancelar' },
};

export const SmallGhost: ButtonStory = {
  name: 'Ghost – sm',
  args: { variant: 'ghost', size: 'sm', children: 'Detalles' },
};

export const SmallDanger: ButtonStory = {
  name: 'Danger – sm',
  args: { variant: 'danger', size: 'sm', children: 'Quitar' },
};

export const Disabled: ButtonStory = {
  args: { variant: 'primary', size: 'md', children: 'Procesando…', disabled: true },
};

export const WithClickHandler: ButtonStory = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Haz clic',
    onClick: fn(),
  },
};

export const AllVariants: ButtonStory = {
  name: 'All variant + size combinations',
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="w-20 text-xs text-right text-gray-500">md:</span>
        <Button variant="primary" size="md">Primary</Button>
        <Button variant="secondary" size="md">Secondary</Button>
        <Button variant="ghost" size="md">Ghost</Button>
        <Button variant="danger" size="md">Danger</Button>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="w-20 text-xs text-right text-gray-500">sm:</span>
        <Button variant="primary" size="sm">Primary</Button>
        <Button variant="secondary" size="sm">Secondary</Button>
        <Button variant="ghost" size="sm">Ghost</Button>
        <Button variant="danger" size="sm">Danger</Button>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="w-20 text-xs text-right text-gray-500">disabled:</span>
        <Button variant="primary" size="md" disabled>Primary</Button>
        <Button variant="secondary" size="md" disabled>Secondary</Button>
        <Button variant="ghost" size="md" disabled>Ghost</Button>
        <Button variant="danger" size="md" disabled>Danger</Button>
      </div>
    </div>
  ),
};

// ─── Field ─────────────────────────────────────────────────────────────────────

export const FieldDefault: StoryObj = {
  name: 'Field – default',
  render: () => (
    <div className="w-72">
      <Field label="Nombre">
        <TextInput placeholder="Escribe un nombre…" />
      </Field>
    </div>
  ),
};

export const FieldRequired: StoryObj = {
  name: 'Field – required',
  render: () => (
    <div className="w-72">
      <Field label="Correo electrónico" required>
        <TextInput type="email" placeholder="correo@ejemplo.com" />
      </Field>
    </div>
  ),
};

export const FieldWithHint: StoryObj = {
  name: 'Field – with hint',
  render: () => (
    <div className="w-72">
      <Field label="Contraseña" hint="Mínimo 8 caracteres, una mayúscula y un número." required>
        <TextInput type="password" placeholder="••••••••" />
      </Field>
    </div>
  ),
};

export const FieldWithError: StoryObj = {
  name: 'Field – with error',
  render: () => (
    <div className="w-72">
      <Field label="Correo electrónico" error="Este correo ya está registrado." required>
        <TextInput type="email" defaultValue="admin@homefort.co" />
      </Field>
    </div>
  ),
};

// ─── TextInput ─────────────────────────────────────────────────────────────────

export const TextInputDefault: StoryObj = {
  name: 'TextInput – default',
  render: () => (
    <div className="w-72">
      <TextInput placeholder="Escribe algo…" />
    </div>
  ),
};

export const TextInputDisabled: StoryObj = {
  name: 'TextInput – disabled',
  render: () => (
    <div className="w-72">
      <TextInput placeholder="Campo deshabilitado" disabled />
    </div>
  ),
};

// ─── TextArea ──────────────────────────────────────────────────────────────────

export const TextAreaDefault: StoryObj = {
  name: 'TextArea – default',
  render: () => (
    <div className="w-72">
      <TextArea placeholder="Escribe una descripción…" />
    </div>
  ),
};

export const TextAreaCustomRows: StoryObj = {
  name: 'TextArea – 5 rows',
  render: () => (
    <div className="w-72">
      <TextArea placeholder="Observaciones adicionales…" rows={5} />
    </div>
  ),
};

// ─── Select ────────────────────────────────────────────────────────────────────

export const SelectDefault: StoryObj = {
  name: 'Select – default',
  render: () => (
    <div className="w-72">
      <Select>
        <option value="">Selecciona una opción</option>
        <option value="b2b">B2B</option>
        <option value="b2c">B2C</option>
      </Select>
    </div>
  ),
};

export const SelectDisabled: StoryObj = {
  name: 'Select – disabled',
  render: () => (
    <div className="w-72">
      <Select disabled>
        <option value="">Selecciona una opción</option>
        <option value="b2b">B2B</option>
        <option value="b2c">B2C</option>
      </Select>
    </div>
  ),
};

// ─── AreasChecklist ────────────────────────────────────────────────────────────

function AreasChecklistWrapper({ initialValue, disabled }: { initialValue: Area[]; disabled?: boolean }) {
  const [value, setValue] = useState<Area[]>(initialValue);
  return <AreasChecklist value={value} onChange={setValue} disabled={disabled} />;
}

export const AreasChecklistDefault: StoryObj = {
  name: 'AreasChecklist – default',
  render: () => (
    <div className="w-80">
      <AreasChecklistWrapper initialValue={['comercial']} />
    </div>
  ),
};

export const AreasChecklistMultiple: StoryObj = {
  name: 'AreasChecklist – multiple selected',
  render: () => (
    <div className="w-80">
      <AreasChecklistWrapper initialValue={['comercial', 'compras']} />
    </div>
  ),
};

export const AreasChecklistAllSelected: StoryObj = {
  name: 'AreasChecklist – all selected',
  render: () => (
    <div className="w-80">
      <AreasChecklistWrapper initialValue={['comercial', 'compras', 'produccion', 'administrativa']} />
    </div>
  ),
};

export const AreasChecklistDisabled: StoryObj = {
  name: 'AreasChecklist – disabled',
  render: () => (
    <div className="w-80">
      <AreasChecklistWrapper initialValue={['comercial', 'produccion']} disabled />
    </div>
  ),
};

export const AreasChecklistInteraction: StoryObj = {
  name: 'AreasChecklist – interaction test (toggle Compras)',
  render: () => (
    <div className="w-80">
      <AreasChecklistWrapper initialValue={['comercial']} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // "Compras" should initially be unchecked
    const comprasCheckbox = canvas.getByRole('checkbox', { name: /Compras/i });
    await expect(comprasCheckbox).not.toBeChecked();

    // Click to select "Compras"
    await userEvent.click(comprasCheckbox);

    // It should now be checked
    await expect(comprasCheckbox).toBeChecked();

    // Click again to deselect "Compras" (allowed because another area is still selected)
    await userEvent.click(comprasCheckbox);

    // It should be unchecked again
    await expect(comprasCheckbox).not.toBeChecked();
  },
};

export const AreasChecklistCannotDeselectLast: StoryObj = {
  name: 'AreasChecklist – cannot deselect last area',
  render: () => (
    <div className="w-80">
      <AreasChecklistWrapper initialValue={['compras']} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // "Compras" is the only selected area
    const comprasCheckbox = canvas.getByRole('checkbox', { name: /Compras/i });
    await expect(comprasCheckbox).toBeChecked();

    // Attempt to deselect it
    await userEvent.click(comprasCheckbox);

    // Should still be checked (cannot remove the last area)
    await expect(comprasCheckbox).toBeChecked();
  },
};
