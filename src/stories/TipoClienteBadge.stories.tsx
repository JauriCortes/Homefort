import type { Meta, StoryObj } from '@storybook/react-vite';
import { TipoClienteBadge } from '@/components/ui-bits';

const meta: Meta<typeof TipoClienteBadge> = {
  title: 'Components/Badges/TipoClienteBadge',
  component: TipoClienteBadge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    tipo: {
      control: 'radio',
      options: ['B2B', 'B2C'],
      description: 'B2B = empresa, B2C = persona natural',
    },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const B2B: Story = {
  args: { tipo: 'B2B' },
};

export const B2C: Story = {
  args: { tipo: 'B2C' },
};

export const Both: Story = {
  name: 'B2B and B2C side by side',
  render: () => (
    <div className="flex items-center gap-2">
      <TipoClienteBadge tipo="B2B" />
      <TipoClienteBadge tipo="B2C" />
    </div>
  ),
};

export const InContext: Story = {
  name: 'In context — client list',
  render: () => (
    <div className="w-72 divide-y divide-border rounded-lg border border-border bg-surface">
      {[
        { name: 'Constructora Andina S.A.S.', tipo: 'B2B' as const },
        { name: 'Diana Restrepo', tipo: 'B2C' as const },
        { name: 'Inversiones López', tipo: 'B2B' as const },
        { name: 'Carlos Méndez', tipo: 'B2C' as const },
      ].map(({ name, tipo }) => (
        <div key={name} className="flex items-center justify-between px-3 py-2 text-sm">
          <span className="text-foreground">{name}</span>
          <TipoClienteBadge tipo={tipo} />
        </div>
      ))}
    </div>
  ),
};
