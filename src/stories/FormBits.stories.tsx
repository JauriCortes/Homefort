import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Plus, Trash2, ArrowLeft, Save, Download } from 'lucide-react';
import { Button } from '@/components/form-bits';

const meta: Meta<typeof Button> = {
  title: 'Components/Form/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
      description: 'Visual style of the button',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size of the button — md (36px) or sm (32px)',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button and blocks pointer events',
    },
    children: {
      control: 'text',
    },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

// ─── Variants ──────────────────────────────────────────────────────────────────

export const Primary: Story = {
  args: { variant: 'primary', size: 'md', children: 'Guardar cambios' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', size: 'md', children: 'Cancelar' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', size: 'md', children: 'Ver detalles' },
};

export const Danger: Story = {
  args: { variant: 'danger', size: 'md', children: 'Eliminar' },
};

// ─── Sizes ─────────────────────────────────────────────────────────────────────

export const SmallPrimary: Story = {
  name: 'Primary – sm',
  args: { variant: 'primary', size: 'sm', children: 'Agregar' },
};

export const SmallSecondary: Story = {
  name: 'Secondary – sm',
  args: { variant: 'secondary', size: 'sm', children: 'Cancelar' },
};

export const SmallGhost: Story = {
  name: 'Ghost – sm',
  args: { variant: 'ghost', size: 'sm', children: 'Detalles' },
};

export const SmallDanger: Story = {
  name: 'Danger – sm',
  args: { variant: 'danger', size: 'sm', children: 'Quitar' },
};

// ─── States ────────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: { variant: 'primary', size: 'md', children: 'Procesando…', disabled: true },
};

export const WithClickHandler: Story = {
  name: 'With click handler',
  args: { variant: 'primary', size: 'md', children: 'Haz clic aquí', onClick: fn() },
};

// ─── With Icons ────────────────────────────────────────────────────────────────

export const WithLeadingIcon: Story = {
  name: 'With leading icon',
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="primary" size="md">
        <Plus className="h-4 w-4" />
        Nuevo proyecto
      </Button>
      <Button variant="secondary" size="md">
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Button>
      <Button variant="ghost" size="md">
        <Download className="h-4 w-4" />
        Exportar
      </Button>
      <Button variant="danger" size="md">
        <Trash2 className="h-4 w-4" />
        Eliminar
      </Button>
    </div>
  ),
};

export const WithLeadingIconSm: Story = {
  name: 'With leading icon – sm',
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="primary" size="sm">
        <Plus className="h-3.5 w-3.5" />
        Nuevo
      </Button>
      <Button variant="secondary" size="sm">
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver
      </Button>
      <Button variant="ghost" size="sm">
        <Save className="h-3.5 w-3.5" />
        Guardar
      </Button>
    </div>
  ),
};

// ─── Composite views ───────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: 'All variants × sizes × states',
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-20 text-right text-xs text-muted-foreground">md:</span>
        <Button variant="primary" size="md">Primary</Button>
        <Button variant="secondary" size="md">Secondary</Button>
        <Button variant="ghost" size="md">Ghost</Button>
        <Button variant="danger" size="md">Danger</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-20 text-right text-xs text-muted-foreground">sm:</span>
        <Button variant="primary" size="sm">Primary</Button>
        <Button variant="secondary" size="sm">Secondary</Button>
        <Button variant="ghost" size="sm">Ghost</Button>
        <Button variant="danger" size="sm">Danger</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-20 text-right text-xs text-muted-foreground">disabled:</span>
        <Button variant="primary" size="md" disabled>Primary</Button>
        <Button variant="secondary" size="md" disabled>Secondary</Button>
        <Button variant="ghost" size="md" disabled>Ghost</Button>
        <Button variant="danger" size="md" disabled>Danger</Button>
      </div>
    </div>
  ),
};

export const FormFooterPattern: Story = {
  name: 'Pattern — form footer',
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex w-full max-w-lg justify-end gap-2 border-t border-border pt-4">
      <Button variant="secondary" size="md">Cancelar</Button>
      <Button variant="primary" size="md">Guardar cambios</Button>
    </div>
  ),
};

export const DestructiveConfirmPattern: Story = {
  name: 'Pattern — destructive confirm',
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex w-full max-w-xs flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <p className="text-sm text-foreground">¿Eliminar este proyecto? Esta acción no se puede deshacer.</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm">Cancelar</Button>
        <Button variant="danger" size="sm">
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar
        </Button>
      </div>
    </div>
  ),
};
