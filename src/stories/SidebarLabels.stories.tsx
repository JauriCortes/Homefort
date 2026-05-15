import type { Meta, StoryObj } from '@storybook/react-vite';

// Visual test: renders a mock sidebar item list to verify accented labels render correctly
function SidebarLabelList({ items }: { items: string[] }) {
  return (
    <nav className="w-56 rounded-lg border border-gray-200 bg-white p-3 space-y-1">
      {items.map((label) => (
        <div key={label} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
          <span className="h-4 w-4 rounded bg-gray-200" />
          <span>{label}</span>
        </div>
      ))}
    </nav>
  );
}

const meta: Meta<typeof SidebarLabelList> = {
  title: 'P02-P08 / SidebarLabels',
  component: SidebarLabelList,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof SidebarLabelList>;

export const LabelsConTildes: Story = {
  name: 'Etiquetas con tildes correctas',
  args: {
    items: [
      'Órdenes de compra',
      'Órdenes de producción',
      'Producción',
      'Administración',
      'Gestión interna',
      'Cerrar sesión',
    ],
  },
};

export const LabelsSinTildes: Story = {
  name: 'Antes (sin tildes — incorrecto)',
  args: {
    items: [
      'Ordenes de compra',
      'Ordenes produccion',
      'Produccion',
      'Administracion',
      'Gestion interna',
      'Cerrar sesion',
    ],
  },
};
