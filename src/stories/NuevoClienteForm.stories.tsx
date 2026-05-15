import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, within, userEvent, expect } from 'storybook/test';
import { ArrowLeft } from 'lucide-react';
import { Field, TextInput, Select, Button } from '@/components/form-bits';

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  nombre: string;
  contacto: string;
  tipo: string;
  empresa?: string;
};

type Props = {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
};

// ─── Self-contained NuevoClienteForm component ────────────────────────────────

function NuevoClienteForm({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({
    nombre: '',
    contacto: '',
    tipo: 'B2C',
    empresa: '',
  });
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim()) {
      setError('El nombre del cliente es obligatorio.');
      return;
    }
    if (!form.contacto.trim()) {
      setError('El contacto es obligatorio (correo o teléfono).');
      return;
    }
    onSubmit({
      nombre: form.nombre.trim(),
      contacto: form.contacto.trim(),
      tipo: form.tipo,
      empresa: form.empresa.trim() || undefined,
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:mb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-foreground md:text-2xl">
            Registrar nuevo cliente
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Los clientes son consultables por todas las áreas. El contacto debe ser único.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <span className="mt-0.5">⚠</span>
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <Field label="Nombre del cliente" required>
          <TextInput
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej. Diana Restrepo"
            aria-label="Nombre del cliente"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Tipo de cliente"
            required
            hint="B2B = empresa · B2C = persona natural"
          >
            <Select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              aria-label="Tipo de cliente"
            >
              <option value="B2C">B2C — Persona natural</option>
              <option value="B2B">B2B — Empresa</option>
            </Select>
          </Field>

          <Field label="Contacto (correo o teléfono)" required>
            <TextInput
              value={form.contacto}
              onChange={(e) => setForm({ ...form, contacto: e.target.value })}
              placeholder="correo@dominio.com o +57 300 000 0000"
              aria-label="Contacto"
            />
          </Field>
        </div>

        {form.tipo === 'B2B' && (
          <Field label="Razón social / empresa">
            <TextInput
              value={form.empresa}
              onChange={(e) => setForm({ ...form, empresa: e.target.value })}
              placeholder="Ej. Constructora Andina S.A.S."
              aria-label="Empresa"
            />
          </Field>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
          >
            Cancelar
          </button>
          <Button type="submit">Guardar cliente</Button>
        </div>
      </form>
    </div>
  );
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof NuevoClienteForm> = {
  title: 'Comercial/NuevoClienteForm',
  component: NuevoClienteForm,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    onSubmit: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  name: 'Formulario vacío',
};

export const B2B: Story = {
  name: 'Pre-llenado B2B',
  render: (args) => {
    // Render with tipo B2B to show empresa field
    function B2BForm(props: Props) {
      const [form, setForm] = useState({
        nombre: 'Constructora Andina SAS',
        contacto: 'contacto@andina.co',
        tipo: 'B2B',
        empresa: 'Constructora Andina',
      });
      const [error, setError] = useState<string | null>(null);

      const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!form.nombre.trim()) {
          setError('El nombre del cliente es obligatorio.');
          return;
        }
        if (!form.contacto.trim()) {
          setError('El contacto es obligatorio (correo o teléfono).');
          return;
        }
        props.onSubmit({
          nombre: form.nombre.trim(),
          contacto: form.contacto.trim(),
          tipo: form.tipo,
          empresa: form.empresa.trim() || undefined,
        });
      };

      return (
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:mb-6 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold text-foreground md:text-2xl">
                Registrar nuevo cliente
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Los clientes son consultables por todas las áreas. El contacto debe ser único.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={props.onCancel}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" /> Volver
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <span className="mt-0.5">⚠</span>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4 rounded-lg border border-border bg-surface p-4">
            <Field label="Nombre del cliente" required>
              <TextInput
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej. Diana Restrepo"
                aria-label="Nombre del cliente"
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Tipo de cliente" required hint="B2B = empresa · B2C = persona natural">
                <Select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  aria-label="Tipo de cliente"
                >
                  <option value="B2C">B2C — Persona natural</option>
                  <option value="B2B">B2B — Empresa</option>
                </Select>
              </Field>

              <Field label="Contacto (correo o teléfono)" required>
                <TextInput
                  value={form.contacto}
                  onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                  placeholder="correo@dominio.com o +57 300 000 0000"
                  aria-label="Contacto"
                />
              </Field>
            </div>

            {form.tipo === 'B2B' && (
              <Field label="Razón social / empresa">
                <TextInput
                  value={form.empresa}
                  onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                  placeholder="Ej. Constructora Andina S.A.S."
                  aria-label="Empresa"
                />
              </Field>
            )}

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={props.onCancel}
                className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
              >
                Cancelar
              </button>
              <Button type="submit">Guardar cliente</Button>
            </div>
          </form>
        </div>
      );
    }
    return <B2BForm {...args} />;
  },
};

// ─── Interaction test ─────────────────────────────────────────────────────────

export const TestCrearCliente: Story = {
  name: 'Test: crear cliente',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText(/nombre del cliente/i), 'Nuevo Cliente');
    await userEvent.type(canvas.getByLabelText(/contacto/i), 'nuevo@example.com');

    await userEvent.click(canvas.getByRole('button', { name: /guardar|crear|registrar/i }));

    await expect(args.onSubmit).toHaveBeenCalled();
  },
};
