import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui-bits';
import { Button } from '@/components/form-bits';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Órdenes de Compra',
  },
};

export const WithDescription: Story = {
  args: {
    title: 'Órdenes de Compra',
    description: 'Gestiona todas las órdenes de compra del sistema.',
  },
};

export const WithCrumbs: Story = {
  args: {
    title: 'Detalle de Orden',
    crumbs: [
      { label: 'Inicio' },
      { label: 'Órdenes de Compra' },
      { label: 'Detalle de Orden' },
    ],
  },
};

export const WithDescriptionAndCrumbs: Story = {
  args: {
    title: 'Detalle de Orden',
    description: 'Consulta y edita los detalles de esta orden de compra.',
    crumbs: [
      { label: 'Inicio' },
      { label: 'Órdenes de Compra' },
      { label: 'Detalle de Orden' },
    ],
  },
};

export const WithActions: Story = {
  args: {
    title: 'Órdenes de Compra',
    description: 'Gestiona todas las órdenes de compra del sistema.',
    actions: (
      <Button variant="primary" size="md">
        <Plus className="h-4 w-4" />
        Nueva Orden
      </Button>
    ),
  },
};

export const WithCrumbsAndActions: Story = {
  args: {
    title: 'Detalle de Orden',
    description: 'Consulta y edita los detalles de esta orden de compra.',
    crumbs: [
      { label: 'Inicio' },
      { label: 'Órdenes de Compra' },
      { label: 'Detalle de Orden' },
    ],
    actions: (
      <>
        <Button variant="secondary" size="md">Cancelar</Button>
        <Button variant="primary" size="md">Guardar cambios</Button>
      </>
    ),
  },
};
