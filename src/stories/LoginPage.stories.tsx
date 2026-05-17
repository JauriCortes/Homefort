import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, within, userEvent, expect } from 'storybook/test';
import { useState } from 'react';
import { Hammer, Eye, EyeOff } from 'lucide-react';
import { Button, Field, TextInput } from '@/components/form-bits';
import { ErrorBanner, InfoBanner } from '@/components/ui-bits';

// ─── Self-contained LoginForm (no router / store dependencies) ───────────────

type LoginFormProps = {
  onSubmit: (email: string, password: string) => void;
  error?: string | null;
  loading?: boolean;
  showDemoBanner?: boolean;
};

function LoginForm({ onSubmit, error = null, loading = false, showDemoBanner = false }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Hammer className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">HF HomeFort</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inicia sesión para acceder al sistema de gestión interna.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-border bg-surface p-5 shadow-sm"
        >
          {error && <ErrorBanner>{error}</ErrorBanner>}

          <div className="flex flex-col gap-3">
            <Field label="Correo" required>
              <TextInput
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@homefort.co"
                required
              />
            </Field>

            <Field label="Contraseña" required>
              <div className="relative">
                <TextInput
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
                  aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Button type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? 'Verificando…' : 'Iniciar sesión'}
            </Button>
          </div>
        </form>

        {showDemoBanner && (
          <div className="mt-4">
            <InfoBanner>
              <div className="space-y-1 text-xs">
                <div className="font-medium">Usuarios de demostración:</div>
                <div>· laura@homefort.co / comercial123</div>
                <div>· carlos@homefort.co / compras123</div>
                <div>· maria@homefort.co / produccion123</div>
                <div>· andres@homefort.co / admin123 (Admin)</div>
              </div>
            </InfoBanner>
          </div>
        )}

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Tras 5 intentos fallidos la cuenta se bloquea 15 minutos. La sesión expira tras 30
          min de inactividad.
        </p>
      </div>
    </div>
  );
}

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta: Meta<typeof LoginForm> = {
  title: 'P01 / LoginPage',
  component: LoginForm,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    onSubmit: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof LoginForm>;

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  name: 'Default',
  args: {},
};

export const WithError: Story = {
  name: 'WithError',
  args: {
    error: 'Correo o contraseña incorrectos.',
  },
};

export const Blocked: Story = {
  name: 'Blocked',
  args: {
    error: 'Cuenta bloqueada temporalmente. Intenta de nuevo en 15 minutos.',
  },
};

export const Loading: Story = {
  name: 'Loading',
  args: {
    loading: true,
  },
};

export const WithDemoBanner: Story = {
  name: 'WithDemoBanner',
  args: {
    showDemoBanner: true,
  },
};

// ─── Interaction tests ───────────────────────────────────────────────────────

export const TestLoginVacio: Story = {
  name: 'Test / Submit vacío (campos requeridos)',
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', { name: /iniciar sesión/i });
    // Button should be enabled when fields are empty (HTML5 validation fires on submit)
    await expect(submitButton).not.toBeDisabled();
  },
};

export const TestTogglePassword: Story = {
  name: 'Test / Toggle visibilidad contraseña',
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Fill the password field first so we can inspect the type change
    const passwordInput = canvas.getByLabelText('Contraseña', { selector: 'input' });
    await userEvent.type(passwordInput, 'micontraseña');

    // Initially should be type="password"
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the eye toggle button
    const toggleBtn = canvas.getByRole('button', { name: /mostrar contraseña/i });
    await userEvent.click(toggleBtn);

    // Now the input type should be "text"
    await expect(passwordInput).toHaveAttribute('type', 'text');
  },
};
