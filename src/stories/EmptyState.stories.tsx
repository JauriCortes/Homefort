import type { Meta, StoryObj } from '@storybook/react-vite';
import { FolderKanban, Users, Plus } from 'lucide-react';
import { EmptyState } from '@/components/ui-bits';
import { Button } from '@/components/form-bits';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'No hay órdenes',
  },
};

export const WithDescription: Story = {
  args: {
    title: 'No hay órdenes',
    description: 'Aún no se han creado órdenes de compra en el sistema.',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Sin órdenes de compra',
    description: 'Aún no se han creado órdenes de compra en el sistema.',
    icon: FolderKanban,
  },
};

export const WithIconAndAction: Story = {
  args: {
    title: 'Sin órdenes de compra',
    description: 'Crea tu primera orden para comenzar a gestionar compras.',
    icon: FolderKanban,
    action: (
      <Button variant="primary" size="md">
        <Plus className="h-4 w-4" />
        Nueva Orden
      </Button>
    ),
  },
};

export const WithAction: Story = {
  args: {
    title: 'Sin usuarios registrados',
    description: 'Agrega usuarios para que puedan acceder al sistema.',
    action: (
      <Button variant="primary" size="md">
        <Plus className="h-4 w-4" />
        Agregar usuario
      </Button>
    ),
  },
};

export const WithUsersIcon: Story = {
  args: {
    title: 'Sin usuarios registrados',
    description: 'Agrega usuarios para que puedan acceder al sistema.',
    icon: Users,
    action: (
      <Button variant="primary" size="md">
        <Plus className="h-4 w-4" />
        Agregar usuario
      </Button>
    ),
  },
};
