import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ErrorBanner,
  SuccessBanner,
  InfoBanner,
  WarningBanner,
  ReadOnlyBanner,
} from '@/components/ui-bits';

const meta: Meta<typeof ErrorBanner> = {
  title: 'Components/Banners',
  component: ErrorBanner,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof meta>;

// ─── ErrorBanner ───────────────────────────────────────────────────────────────

export const Error: Story = {
  name: 'ErrorBanner',
  render: () => (
    <ErrorBanner>Ocurrió un error al guardar los cambios. Intenta nuevamente.</ErrorBanner>
  ),
};

export const ErrorWithDetails: Story = {
  name: 'ErrorBanner – with details',
  render: () => (
    <ErrorBanner>
      <strong>Error de validación:</strong> El campo "Nombre" es obligatorio y no puede estar vacío.
    </ErrorBanner>
  ),
};

// ─── SuccessBanner ─────────────────────────────────────────────────────────────

export const Success: Story = {
  name: 'SuccessBanner',
  render: () => (
    <SuccessBanner>Los cambios fueron guardados correctamente.</SuccessBanner>
  ),
};

export const SuccessWithDetails: Story = {
  name: 'SuccessBanner – with details',
  render: () => (
    <SuccessBanner>
      <strong>Orden creada:</strong> La orden de compra OC-2025-001 fue registrada exitosamente.
    </SuccessBanner>
  ),
};

// ─── InfoBanner ────────────────────────────────────────────────────────────────

export const Info: Story = {
  name: 'InfoBanner',
  render: () => (
    <InfoBanner>Esta sección está en modo de solo lectura.</InfoBanner>
  ),
};

export const InfoWithDetails: Story = {
  name: 'InfoBanner – with details',
  render: () => (
    <InfoBanner>
      <strong>Información:</strong> Los cambios no se aplican hasta que hagas clic en "Guardar".
    </InfoBanner>
  ),
};

// ─── WarningBanner ─────────────────────────────────────────────────────────────

export const Warning: Story = {
  name: 'WarningBanner',
  render: () => (
    <WarningBanner>Este proyecto tiene cotizaciones sin revisar.</WarningBanner>
  ),
};

export const WarningWithDetails: Story = {
  name: 'WarningBanner – with details',
  render: () => (
    <WarningBanner>
      <strong>Atención:</strong> El stock de "Cedro 2cm" es insuficiente para esta orden de producción.
    </WarningBanner>
  ),
};

// ─── ReadOnlyBanner ────────────────────────────────────────────────────────────

export const ReadOnly: Story = {
  name: 'ReadOnlyBanner – Compras',
  render: () => <ReadOnlyBanner area="Compras" />,
};

export const ReadOnlyComercial: Story = {
  name: 'ReadOnlyBanner – Comercial',
  render: () => <ReadOnlyBanner area="Comercial" />,
};

export const ReadOnlyAdministrativa: Story = {
  name: 'ReadOnlyBanner – Administrativa',
  render: () => <ReadOnlyBanner area="Administrativa" />,
};

// ─── All banners ───────────────────────────────────────────────────────────────

export const AllBanners: Story = {
  name: 'All banners — overview',
  render: () => (
    <div className="w-[520px] space-y-0">
      <ErrorBanner>Error al procesar la solicitud.</ErrorBanner>
      <SuccessBanner>Operación completada exitosamente.</SuccessBanner>
      <InfoBanner>Recuerda guardar los cambios antes de salir.</InfoBanner>
      <WarningBanner>El inventario de materiales está bajo mínimos.</WarningBanner>
      <ReadOnlyBanner area="Producción" />
    </div>
  ),
};
