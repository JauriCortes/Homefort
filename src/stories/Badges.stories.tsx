import type { Meta, StoryObj } from '@storybook/react-vite';
import { EstadoBadge, TipoClienteBadge } from '@/components/ui-bits';

// ─── EstadoBadge ───────────────────────────────────────────────────────────────

const estadoMeta: Meta<typeof EstadoBadge> = {
  title: 'Components/Badges/EstadoBadge',
  component: EstadoBadge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};
export default estadoMeta;
type EstadoStory = StoryObj<typeof estadoMeta>;

export const Solicitud: EstadoStory = {
  args: { estado: 'Solicitud' },
};

export const EnDefinicion: EstadoStory = {
  name: 'En definición',
  args: { estado: 'En definición' },
};

export const EnCotizacion: EstadoStory = {
  name: 'En cotización',
  args: { estado: 'En cotización' },
};

export const Aprobada: EstadoStory = {
  args: { estado: 'Aprobada' },
};

export const Rechazada: EstadoStory = {
  args: { estado: 'Rechazada' },
};

export const AllEstados: EstadoStory = {
  name: 'All estados',
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <EstadoBadge estado="Solicitud" />
      <EstadoBadge estado="En definición" />
      <EstadoBadge estado="En cotización" />
      <EstadoBadge estado="Aprobada" />
      <EstadoBadge estado="Rechazada" />
    </div>
  ),
};

export const UnknownEstado: EstadoStory = {
  name: 'Unknown estado (fallback)',
  args: { estado: 'Otro estado' },
};

// ─── TipoClienteBadge ──────────────────────────────────────────────────────────

export const B2B: StoryObj = {
  render: () => <TipoClienteBadge tipo="B2B" />,
};

export const B2C: StoryObj = {
  render: () => <TipoClienteBadge tipo="B2C" />,
};

export const BothTipos: StoryObj = {
  name: 'B2B and B2C side by side',
  render: () => (
    <div className="flex items-center gap-2">
      <TipoClienteBadge tipo="B2B" />
      <TipoClienteBadge tipo="B2C" />
    </div>
  ),
};
