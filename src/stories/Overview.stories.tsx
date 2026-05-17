/**
 * Design System Overview — kitchen sink
 *
 * Shows all reusable components together in a single scrollable canvas.
 * Each section mirrors how the components appear in production routes.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Plus,
  Trash2,
  ArrowLeft,
  Download,
  Users,
  FolderKanban,
  Briefcase,
  Package,
} from 'lucide-react';
import {
  EstadoBadge,
  TipoClienteBadge,
  ErrorBanner,
  SuccessBanner,
  InfoBanner,
  WarningBanner,
  ReadOnlyBanner,
  EmptyState,
  PageHeader,
} from '@/components/ui-bits';
import { Button, Field, TextInput, TextArea, Select } from '@/components/form-bits';

const meta: Meta = {
  title: 'Design System/Overview',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 border-b border-border pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </h2>
  );
}

// ─── Kitchen Sink ───────────────────────────────────────────────────────────────

export const KitchenSink: Story = {
  name: 'Kitchen Sink — all components',
  render: () => (
    <div className="max-w-3xl space-y-12 p-6">
      {/* ── Buttons ── */}
      <section>
        <H2>Buttons</H2>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Variants — md</p>
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
          </div>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Variants — sm</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm">
                <Plus className="h-3.5 w-3.5" />
                Agregar
              </Button>
              <Button variant="secondary" size="sm">Cancelar</Button>
              <Button variant="ghost" size="sm">Ver más</Button>
              <Button variant="danger" size="sm">Quitar</Button>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Disabled state</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="md" disabled>Procesando…</Button>
              <Button variant="danger" size="md" disabled>No permitido</Button>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Common patterns</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3">
                <span className="text-xs text-muted-foreground">Form footer:</span>
                <Button variant="secondary" size="sm">Cancelar</Button>
                <Button variant="primary" size="sm">Guardar</Button>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3">
                <span className="text-xs text-muted-foreground">Destructive confirm:</span>
                <Button variant="ghost" size="sm">Cancelar</Button>
                <Button variant="danger" size="sm">
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Badges ── */}
      <section>
        <H2>Badges</H2>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs text-muted-foreground">EstadoBadge — full project lifecycle</p>
            <div className="flex flex-wrap gap-2">
              <EstadoBadge estado="Solicitud" />
              <EstadoBadge estado="En definición" />
              <EstadoBadge estado="En cotización" />
              <EstadoBadge estado="Aprobada" />
              <EstadoBadge estado="En producción" />
              <EstadoBadge estado="Entregado" />
              <EstadoBadge estado="En garantía" />
              <EstadoBadge estado="Rechazada" />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">TipoClienteBadge</p>
            <div className="flex gap-2">
              <TipoClienteBadge tipo="B2B" />
              <TipoClienteBadge tipo="B2C" />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">In context — project list</p>
            <div className="w-full max-w-md divide-y divide-border rounded-lg border border-border bg-surface">
              {[
                { code: 'PY-001', client: 'Diana Restrepo', tipo: 'B2C' as const, estado: 'Aprobada' },
                { code: 'PY-002', client: 'Constructora Andina', tipo: 'B2B' as const, estado: 'En producción' },
                { code: 'PY-003', client: 'Carlos Méndez', tipo: 'B2C' as const, estado: 'En cotización' },
              ].map(({ code, client, tipo, estado }) => (
                <div key={code} className="flex items-center justify-between px-3 py-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{code}</span>
                    <TipoClienteBadge tipo={tipo} />
                    <span className="text-xs text-muted-foreground">{client}</span>
                  </div>
                  <EstadoBadge estado={estado} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Banners ── */}
      <section>
        <H2>Banners</H2>
        <div className="space-y-0">
          <ErrorBanner>
            <strong>Error de validación:</strong> El correo ingresado ya está registrado.
          </ErrorBanner>
          <SuccessBanner>Los cambios fueron guardados correctamente.</SuccessBanner>
          <InfoBanner>
            <strong>Información:</strong> Los cambios no se aplican hasta guardar.
          </InfoBanner>
          <WarningBanner>
            El inventario de "Cedro 2cm" está por debajo del mínimo requerido.
          </WarningBanner>
          <ReadOnlyBanner area="Compras" />
        </div>
      </section>

      {/* ── Form Elements ── */}
      <section>
        <H2>Form Elements</H2>
        <div className="rounded-lg border border-border bg-surface p-5">
          <h3 className="mb-4 text-base font-semibold text-foreground">Registrar nuevo cliente</h3>
          <div className="space-y-4">
            <Field label="Nombre del cliente" required>
              <TextInput placeholder="Ej. Diana Restrepo" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tipo" hint="B2B = empresa" required>
                <Select>
                  <option value="B2C">B2C — Persona natural</option>
                  <option value="B2B">B2B — Empresa</option>
                </Select>
              </Field>
              <Field label="Contacto" required error="El contacto es obligatorio">
                <TextInput placeholder="correo o teléfono" />
              </Field>
            </div>
            <Field label="Observaciones">
              <TextArea placeholder="Detalles del proyecto…" rows={2} />
            </Field>
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="secondary" size="md">Cancelar</Button>
              <Button variant="primary" size="md">Guardar cliente</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Page Header ── */}
      <section>
        <H2>Page Header</H2>
        <div className="rounded-lg border border-border bg-surface p-4">
          <PageHeader
            title="Clientes"
            description="Gestiona los clientes del área comercial."
            crumbs={[{ label: 'Comercial' }, { label: 'Clientes' }]}
            actions={
              <>
                <Button variant="secondary" size="sm">
                  <Download className="h-3.5 w-3.5" />
                  Exportar
                </Button>
                <Button variant="primary" size="sm">
                  <Plus className="h-3.5 w-3.5" />
                  Nuevo cliente
                </Button>
              </>
            }
          />
          <div className="text-sm text-muted-foreground">← page content would follow here</div>
        </div>
      </section>

      {/* ── Empty State ── */}
      <section>
        <H2>Empty State</H2>
        <div className="space-y-4">
          <EmptyState
            icon={Users}
            title="Sin clientes registrados"
            description="Agrega el primer cliente para comenzar a gestionar proyectos."
            action={
              <Button variant="primary" size="md">
                <Plus className="h-4 w-4" />
                Agregar cliente
              </Button>
            }
          />
        </div>
      </section>

      {/* ── KPI Cards ── */}
      <section>
        <H2>KPI Cards</H2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Clientes', value: 24, icon: Users },
            { label: 'Proyectos', value: 48, icon: FolderKanban },
            { label: 'En cotización', value: 7, icon: Briefcase },
            { label: 'En producción', value: 5, icon: Package },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-lg border border-border bg-surface p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-semibold text-foreground">{value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
                </div>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};
