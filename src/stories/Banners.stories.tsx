import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ErrorBanner,
  SuccessBanner,
  InfoBanner,
  ReadOnlyBanner,
} from '@/components/ui-bits';

// ─── ErrorBanner ───────────────────────────────────────────────────────────────

const errorMeta: Meta<typeof ErrorBanner> = {
  title: 'Components/Banners/ErrorBanner',
  component: ErrorBanner,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default errorMeta;
type ErrorStory = StoryObj<typeof errorMeta>;

export const Error: ErrorStory = {
  render: () => (
    <ErrorBanner>Ocurrió un error al guardar los cambios. Intenta nuevamente.</ErrorBanner>
  ),
};

export const ErrorWithDetails: ErrorStory = {
  render: () => (
    <ErrorBanner>
      <strong>Error de validación:</strong> El campo "Nombre" es obligatorio y no puede estar vacío.
    </ErrorBanner>
  ),
};

// ─── SuccessBanner ─────────────────────────────────────────────────────────────

export const Success: StoryObj = {
  render: () => (
    <SuccessBanner>Los cambios fueron guardados correctamente.</SuccessBanner>
  ),
};

export const SuccessWithDetails: StoryObj = {
  render: () => (
    <SuccessBanner>
      <strong>Orden creada:</strong> La orden de compra OC-2025-001 fue registrada exitosamente.
    </SuccessBanner>
  ),
};

// ─── InfoBanner ────────────────────────────────────────────────────────────────

export const Info: StoryObj = {
  render: () => (
    <InfoBanner>Esta sección está en modo de solo lectura.</InfoBanner>
  ),
};

export const InfoWithDetails: StoryObj = {
  render: () => (
    <InfoBanner>
      <strong>Información:</strong> Los cambios no se aplican hasta que hagas clic en "Guardar".
    </InfoBanner>
  ),
};

// ─── ReadOnlyBanner ────────────────────────────────────────────────────────────

export const ReadOnly: StoryObj = {
  render: () => <ReadOnlyBanner area="Compras" />,
};

export const ReadOnlyComercial: StoryObj = {
  render: () => <ReadOnlyBanner area="Comercial" />,
};

export const ReadOnlyAdministrativa: StoryObj = {
  render: () => <ReadOnlyBanner area="Administrativa" />,
};

export const AllBanners: StoryObj = {
  name: 'All banners side by side',
  render: () => (
    <div className="flex flex-col gap-0 w-[480px]">
      <ErrorBanner>Error al procesar la solicitud.</ErrorBanner>
      <SuccessBanner>Operación completada exitosamente.</SuccessBanner>
      <InfoBanner>Recuerda guardar los cambios antes de salir.</InfoBanner>
      <ReadOnlyBanner area="Producción" />
    </div>
  ),
};
