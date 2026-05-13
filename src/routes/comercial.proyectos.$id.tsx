import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Pencil,
  Plus,
  FileText,
  History,
  ListChecks,
  Receipt,
  AlertTriangle,
} from "lucide-react";
import { z } from "zod";
import { useMe } from "@/hooks/api/use-auth";
import {
  useCliente,
  useProyecto,
  useActualizarEstadoProyecto,
  useAgregarEspecificacion,
  useAgregarCotizacion,
  useAgregarCambio,
} from "@/hooks/api/use-comercial";
import {
  TRANSICIONES,
  formatCOP,
  type EstadoProyecto,
  type CotizacionItem,
  type Proyecto,
  calcularTotalCotizacion,
} from "@/lib/store";
import {
  PageHeader,
  EstadoBadge,
  TipoClienteBadge,
  EmptyState,
  ErrorBanner,
  SuccessBanner,
  ReadOnlyBanner,
  InfoBanner,
} from "@/components/ui-bits";
import { Field, TextInput, TextArea, Select, Button } from "@/components/form-bits";

const searchSchema = z.object({
  tab: z.enum(["resumen", "especificaciones", "cotizaciones", "cambios"]).optional(),
});

export const Route = createFileRoute("/comercial/proyectos/$id")({
  validateSearch: searchSchema,
  component: ProyectoDetalle,
});

function ProyectoDetalle() {
  const { id } = Route.useParams();
  const { data: proyecto, isLoading } = useProyecto(id);

  if (isLoading) return null;

  if (!proyecto) {
    return (
      <div className="mx-auto max-w-xl">
        <PageHeader title="Proyecto no encontrado" />
        <ErrorBanner>El proyecto solicitado no existe o fue eliminado.</ErrorBanner>
        <Link
          to="/comercial/proyectos"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a proyectos
        </Link>
      </div>
    );
  }

  return <ProyectoDetalleInner proyecto={proyecto} />;
}

function ProyectoDetalleInner({ proyecto }: { proyecto: Proyecto }) {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { data: usuario } = useMe();
  const { data: cliente } = useCliente(proyecto.clienteId);
  const puedeEditar = (usuario?.esAdmin || usuario?.areas.includes("comercial")) ?? false;

  const tab = search.tab ?? "resumen";
  const setTab = (t: NonNullable<z.infer<typeof searchSchema>["tab"]>) =>
    navigate({
      to: "/comercial/proyectos/$id",
      params: { id: proyecto.id },
      search: { tab: t },
    });

  const especActual = proyecto.especificaciones[proyecto.especificaciones.length - 1];
  const tieneEspec = !!especActual?.contenido?.trim();

  return (
    <div>
      <PageHeader
        title={proyecto.titulo || proyecto.codigo}
        description={proyecto.codigo}
        crumbs={[
          { label: "Comercial", to: "/comercial" },
          { label: "Proyectos", to: "/comercial/proyectos" },
          { label: proyecto.titulo || proyecto.codigo },
        ]}
        actions={
          <Link
            to="/comercial/proyectos"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-3">
          <dl className="space-y-1.5 text-sm">
            <InfoRow label="Cliente">
              {cliente ? (
                <Link
                  to="/comercial/clientes/$id"
                  params={{ id: cliente.id }}
                  className="flex items-center gap-1.5 text-primary hover:underline"
                >
                  {cliente.nombre} <TipoClienteBadge tipo={cliente.tipo} />
                </Link>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </InfoRow>
            <InfoRow label="Solicitado">{proyecto.fechaSolicitud}</InfoRow>
            {proyecto.fechaEntrega && (
              <InfoRow label="Entrega estimada">{proyecto.fechaEntrega}</InfoRow>
            )}
            {proyecto.descripcionProyecto && (
              <InfoRow label="Descripción">
                <span className="whitespace-pre-wrap">{proyecto.descripcionProyecto}</span>
              </InfoRow>
            )}
          </dl>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Estado</span>
            <EstadoBadge estado={proyecto.estado} />
          </div>
          {puedeEditar ? (
            <CambiarEstadoSelect proyectoId={proyecto.id} estadoActual={proyecto.estado} />
          ) : (
            <p className="text-xs text-muted-foreground">Solo Comercial puede cambiar el estado.</p>
          )}
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
            <span>{proyecto.especificaciones.length} espec.</span>
            <span>{proyecto.cotizaciones.length} cotiz.</span>
            <span>{proyecto.cambios.length} cambios</span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
        <TabBtn active={tab === "resumen"} onClick={() => setTab("resumen")} icon={FileText}>
          Resumen
        </TabBtn>
        <TabBtn
          active={tab === "especificaciones"}
          onClick={() => setTab("especificaciones")}
          icon={ListChecks}
        >
          Especificaciones
          {!tieneEspec && (
            <span
              className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-warning/30 text-[10px] text-warning-foreground"
              title="Faltan especificaciones para producción"
            >
              !
            </span>
          )}
        </TabBtn>
        <TabBtn
          active={tab === "cotizaciones"}
          onClick={() => setTab("cotizaciones")}
          icon={Receipt}
        >
          Cotizaciones
        </TabBtn>
        <TabBtn active={tab === "cambios"} onClick={() => setTab("cambios")} icon={History}>
          Cambios
        </TabBtn>
      </div>

      {!puedeEditar && <ReadOnlyBanner area="Comercial" />}

      {tab === "resumen" && <ResumenTab proyecto={proyecto} />}
      {tab === "especificaciones" && (
        <EspecificacionesTab proyectoId={proyecto.id} puedeEditar={puedeEditar} />
      )}
      {tab === "cotizaciones" && (
        <CotizacionesTab proyectoId={proyecto.id} puedeEditar={puedeEditar} />
      )}
      {tab === "cambios" && <CambiosTab proyectoId={proyecto.id} puedeEditar={puedeEditar} />}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <dt className="w-28 shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-accent text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function CambiarEstadoSelect({
  proyectoId,
  estadoActual,
}: {
  proyectoId: string;
  estadoActual: EstadoProyecto;
}) {
  const actualizarEstado = useActualizarEstadoProyecto(proyectoId);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const opciones = TRANSICIONES[estadoActual] ?? [];

  if (opciones.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">El proyecto está en un estado final.</div>
    );
  }

  return (
    <div>
      <label className="text-xs text-muted-foreground">Cambiar a:</label>
      <div className="mt-1 flex gap-1.5">
        <Select
          className="h-8 py-1 text-xs"
          defaultValue=""
          disabled={actualizarEstado.isPending}
          onChange={(e) => {
            const next = e.target.value as EstadoProyecto;
            if (!next) return;
            actualizarEstado.mutate(next, {
              onSuccess: () => {
                setOk(`Estado actualizado a "${next}".`);
                setError(null);
                setTimeout(() => setOk(null), 2500);
                e.target.value = "";
              },
              onError: () => setError("No se pudo cambiar el estado."),
            });
          }}
        >
          <option value="">Selecciona…</option>
          {opciones.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      </div>
      {ok && <div className="mt-1 text-xs text-success">{ok}</div>}
      {error && <div className="mt-1 text-xs text-destructive">{error}</div>}
    </div>
  );
}

/* ---------------- Resumen ---------------- */

function ResumenTab({ proyecto }: { proyecto: Proyecto }) {
  const especActual = proyecto.especificaciones[proyecto.especificaciones.length - 1];
  const ultimaCot = proyecto.cotizaciones[proyecto.cotizaciones.length - 1];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {(proyecto.aspectos || proyecto.caracteristicas) && (
        <div className="rounded-lg border border-border bg-surface p-4 md:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {proyecto.aspectos && (
              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Aspectos
                </h4>
                <p className="whitespace-pre-wrap text-sm">{proyecto.aspectos}</p>
              </div>
            )}
            {proyecto.caracteristicas && (
              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Características específicas
                </h4>
                <p className="whitespace-pre-wrap text-sm">{proyecto.caracteristicas}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-surface p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <ListChecks className="h-4 w-4" /> Especificación actual
        </h3>
        {especActual?.contenido ? (
          <p className="whitespace-pre-wrap text-sm">{especActual.contenido}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Sin especificaciones aún.</p>
        )}
        {especActual && (
          <p className="mt-2 text-xs text-muted-foreground">
            v{especActual.version} · {especActual.actualizadoEn} · {especActual.actualizadoPor}
          </p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Receipt className="h-4 w-4" /> Última cotización
        </h3>
        {ultimaCot ? (
          <div className="text-sm">
            <div className="text-lg font-semibold tabular-nums">{formatCOP(ultimaCot.total)}</div>
            <div className="text-xs text-muted-foreground">
              {ultimaCot.fecha} · margen {ultimaCot.margenPct}%
            </div>
            <div className="mt-1 text-xs">{ultimaCot.condicionesPago}</div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sin cotizaciones registradas.</p>
        )}
      </div>
    </div>
  );
}

/* ---------------- Especificaciones ---------------- */

function EspecificacionesTab({
  proyectoId,
  puedeEditar,
}: {
  proyectoId: string;
  puedeEditar: boolean;
}) {
  const { data: proyecto } = useProyecto(proyectoId);
  const { data: usuario } = useMe();
  const agregarEspecificacion = useAgregarEspecificacion(proyectoId);
  const ultima = proyecto?.especificaciones[proyecto.especificaciones.length - 1];
  const [editing, setEditing] = useState(false);
  const [contenido, setContenido] = useState(ultima?.contenido ?? "");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  if (!proyecto) return null;

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);
    if (!puedeEditar) return setError("No tienes permisos.");
    if (!contenido.trim()) return setError("Escribe las especificaciones del proyecto.");
    agregarEspecificacion.mutate(
      { contenido: contenido.trim(), actualizadoPor: usuario?.nombre ?? "—" },
      {
        onSuccess: () => {
          setOk(
            ultima
              ? "Nueva versión de especificación guardada."
              : "Especificación inicial guardada.",
          );
          setEditing(false);
        },
        onError: () => setError("No se pudo guardar la especificación."),
      },
    );
  };

  return (
    <div>
      {error && <ErrorBanner>{error}</ErrorBanner>}
      {ok && <SuccessBanner>{ok}</SuccessBanner>}

      {!ultima && !editing && (
        <EmptyState
          icon={FileText}
          title="Sin especificaciones técnicas"
          description="Describe las medidas, materiales, acabados y cualquier detalle técnico del proyecto."
          action={
            puedeEditar ? (
              <Button onClick={() => setEditing(true)}>
                <Plus className="h-4 w-4" /> Registrar especificaciones
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">Sin permisos para registrar.</span>
            )
          }
        />
      )}

      {ultima && !editing && (
        <div className="rounded-lg border border-border bg-surface">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold">Versión actual (v{ultima.version})</h3>
              <p className="text-xs text-muted-foreground">
                Actualizada el {ultima.actualizadoEn} por {ultima.actualizadoPor}
              </p>
            </div>
            {puedeEditar ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setContenido(ultima.contenido);
                  setEditing(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" /> Nueva versión
              </Button>
            ) : (
              <button
                disabled
                className="inline-flex h-8 cursor-not-allowed items-center gap-1.5 rounded-md bg-muted px-3 text-xs font-medium text-muted-foreground"
              >
                <Pencil className="h-3.5 w-3.5" /> Nueva versión
              </button>
            )}
          </header>
          <div className="p-4">
            <p className="whitespace-pre-wrap text-sm">{ultima.contenido}</p>
          </div>
        </div>
      )}

      {editing && (
        <form
          onSubmit={guardar}
          className="space-y-4 rounded-lg border border-border bg-surface p-4"
        >
          <InfoBanner>
            Los cambios crean una nueva versión. La especificación anterior queda en el historial.
          </InfoBanner>
          <Field label="Especificaciones" required>
            <TextArea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Describe medidas, materiales, acabados, herrajes y cualquier detalle técnico necesario para producción…"
              rows={10}
            />
          </Field>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={agregarEspecificacion.isPending}>
              {agregarEspecificacion.isPending ? "Guardando…" : "Guardar versión"}
            </Button>
          </div>
        </form>
      )}

      {proyecto.especificaciones.length > 1 && (
        <div className="mt-6 rounded-lg border border-border bg-surface">
          <header className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">Historial de versiones</h3>
          </header>
          <ul className="divide-y divide-border">
            {[...proyecto.especificaciones]
              .slice(0, -1)
              .reverse()
              .map((e) => (
                <li key={e.version} className="px-4 py-3 text-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium">Versión {e.version}</span>
                    <span className="text-xs text-muted-foreground">
                      {e.actualizadoEn} · {e.actualizadoPor}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-xs text-muted-foreground">{e.contenido}</p>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------------- Cotizaciones ---------------- */

function crearItemVacio(): CotizacionItem {
  return { descripcion: "", cantidad: 1, precioUnitario: 0, precioTotal: 0 };
}

function CotizacionesTab({
  proyectoId,
  puedeEditar,
}: {
  proyectoId: string;
  puedeEditar: boolean;
}) {
  const { data: proyecto } = useProyecto(proyectoId);
  const { data: usuario } = useMe();
  const agregarCotizacion = useAgregarCotizacion(proyectoId);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    margenPct: 25,
    condicionesPago: "50% anticipo, 50% contra entrega",
    items: [crearItemVacio()] as CotizacionItem[],
  });
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const subtotal = useMemo(
    () => form.items.reduce((s, it) => s + (it.precioTotal || 0), 0),
    [form.items],
  );
  const total = useMemo(
    () => calcularTotalCotizacion(form.items, form.margenPct),
    [form.items, form.margenPct],
  );

  if (!proyecto) return null;

  const setItem = (i: number, patch: Partial<CotizacionItem>) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, idx) => {
        if (idx !== i) return it;
        const updated = { ...it, ...patch };
        // Auto-recalculate precioTotal unless it was directly set
        if ("cantidad" in patch || "precioUnitario" in patch) {
          updated.precioTotal = Math.round((updated.cantidad || 0) * (updated.precioUnitario || 0));
        }
        return updated;
      }),
    }));
  };
  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, crearItemVacio()] }));
  const removeItem = (i: number) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);
    if (!puedeEditar) return setError("No tienes permisos.");
    if (form.items.length === 0 || form.items.every((i) => !i.descripcion.trim())) {
      return setError("Agrega al menos un ítem con descripción.");
    }
    agregarCotizacion.mutate(
      {
        items: form.items.filter((i) => i.descripcion.trim()),
        margenPct: form.margenPct,
        condicionesPago: form.condicionesPago,
        total,
        creadaPor: usuario?.nombre ?? "—",
      },
      {
        onSuccess: () => {
          setOk("Cotización guardada.");
          setCreating(false);
          setForm({
            margenPct: 25,
            condicionesPago: "50% anticipo, 50% contra entrega",
            items: [crearItemVacio()],
          });
        },
        onError: () => setError("No se pudo guardar la cotización."),
      },
    );
  };

  return (
    <div>
      {error && <ErrorBanner>{error}</ErrorBanner>}
      {ok && <SuccessBanner>{ok}</SuccessBanner>}

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Historial de cotizaciones ({proyecto.cotizaciones.length})
        </h3>
        {puedeEditar ? (
          <Button size="sm" onClick={() => setCreating((v) => !v)}>
            <Plus className="h-3.5 w-3.5" />
            {creating ? "Cancelar" : "Nueva cotización"}
          </Button>
        ) : (
          <button
            disabled
            className="inline-flex h-8 cursor-not-allowed items-center gap-1.5 rounded-md bg-muted px-3 text-xs font-medium text-muted-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Nueva cotización
          </button>
        )}
      </div>

      {creating && (
        <form
          onSubmit={guardar}
          className="mb-4 space-y-4 rounded-lg border border-border bg-surface p-4"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 pr-2 font-medium">Ítem</th>
                  <th className="w-24 pb-2 pr-2 font-medium">Cantidad</th>
                  <th className="w-32 pb-2 pr-2 font-medium">Precio unitario</th>
                  <th className="w-32 pb-2 pr-2 font-medium">Precio total</th>
                  <th className="w-8 pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {form.items.map((it, i) => (
                  <tr key={i}>
                    <td className="py-1.5 pr-2">
                      <TextInput
                        value={it.descripcion}
                        onChange={(e) => setItem(i, { descripcion: e.target.value })}
                        placeholder="Descripción del ítem…"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <TextInput
                        type="number"
                        min={0}
                        step="0.01"
                        value={it.cantidad || ""}
                        onChange={(e) => setItem(i, { cantidad: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <TextInput
                        type="number"
                        min={0}
                        value={it.precioUnitario || ""}
                        onChange={(e) => setItem(i, { precioUnitario: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <TextInput
                        type="number"
                        min={0}
                        value={it.precioTotal || ""}
                        onChange={(e) => setItem(i, { precioTotal: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </td>
                    <td className="py-1.5">
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        className="px-1 text-muted-foreground hover:text-destructive"
                        title="Quitar ítem"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={addItem}
              className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar ítem
            </button>
          </div>

          <div className="rounded-md bg-surface-2 px-3 py-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCOP(subtotal)}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Margen de ganancia (%)" required>
              <TextInput
                type="number"
                min={0}
                value={form.margenPct}
                onChange={(e) => setForm({ ...form, margenPct: Number(e.target.value) })}
              />
            </Field>
            <Field label="Condiciones de pago" required>
              <TextInput
                value={form.condicionesPago}
                onChange={(e) => setForm({ ...form, condicionesPago: e.target.value })}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between rounded-md bg-surface-2 px-3 py-2">
            <span className="text-sm text-muted-foreground">Total (con margen)</span>
            <span className="text-lg font-semibold tabular-nums">{formatCOP(total)}</span>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={agregarCotizacion.isPending}>
              {agregarCotizacion.isPending ? "Guardando…" : "Guardar cotización"}
            </Button>
          </div>
        </form>
      )}

      {proyecto.cotizaciones.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Sin cotizaciones"
          description="Crea la primera cotización del proyecto."
        />
      ) : (
        <ul className="space-y-3">
          {[...proyecto.cotizaciones].reverse().map((c, idx) => (
            <li key={c.id} className="rounded-lg border border-border bg-surface">
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div>
                  <div className="text-sm font-semibold">
                    Cotización #{proyecto.cotizaciones.length - idx} ·{" "}
                    <span className="font-normal text-muted-foreground">{c.fecha}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Creada por {c.creadaPor}</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-semibold tabular-nums">{formatCOP(c.total)}</div>
                  <div className="text-xs text-muted-foreground">margen {c.margenPct}%</div>
                </div>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr className="border-b border-border">
                      <th className="px-4 py-2 font-medium">Ítem</th>
                      <th className="px-4 py-2 font-medium tabular-nums">Cantidad</th>
                      <th className="px-4 py-2 font-medium tabular-nums">Precio unitario</th>
                      <th className="px-4 py-2 font-medium tabular-nums">Precio total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {c.items.map((it, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2">{it.descripcion}</td>
                        <td className="px-4 py-2 tabular-nums">{it.cantidad ?? "—"}</td>
                        <td className="px-4 py-2 tabular-nums">
                          {it.precioUnitario != null ? formatCOP(it.precioUnitario) : "—"}
                        </td>
                        <td className="px-4 py-2 tabular-nums">
                          {it.precioTotal != null ? formatCOP(it.precioTotal) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-border bg-surface-2 px-4 py-2 text-xs text-muted-foreground">
                Condiciones: {c.condicionesPago}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------- Cambios ---------------- */

function CambiosTab({ proyectoId, puedeEditar }: { proyectoId: string; puedeEditar: boolean }) {
  const { data: proyecto } = useProyecto(proyectoId);
  const { data: usuario } = useMe();
  const agregarCambio = useAgregarCambio(proyectoId);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    descripcion: "",
    impactoCosto: 0,
    impactoDias: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  if (!proyecto) return null;

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);
    if (!puedeEditar) return setError("No tienes permisos.");
    if (!form.descripcion.trim()) return setError("Describe el cambio solicitado.");
    agregarCambio.mutate(
      {
        descripcion: form.descripcion.trim(),
        responsable: usuario?.nombre ?? "—",
        impactoCosto: Number(form.impactoCosto) || 0,
        impactoDias: Number(form.impactoDias) || 0,
      },
      {
        onSuccess: () => {
          setOk("Cambio registrado y visible para todas las áreas.");
          setForm({ descripcion: "", impactoCosto: 0, impactoDias: 0 });
          setAdding(false);
        },
        onError: () => setError("No se pudo registrar el cambio."),
      },
    );
  };

  return (
    <div>
      {error && <ErrorBanner>{error}</ErrorBanner>}
      {ok && <SuccessBanner>{ok}</SuccessBanner>}

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Cambios durante la ejecución</h3>
        {puedeEditar ? (
          <Button size="sm" onClick={() => setAdding((v) => !v)}>
            <Plus className="h-3.5 w-3.5" />
            {adding ? "Cancelar" : "Registrar cambio"}
          </Button>
        ) : (
          <button
            disabled
            className="inline-flex h-8 cursor-not-allowed items-center gap-1.5 rounded-md bg-muted px-3 text-xs font-medium text-muted-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Registrar cambio
          </button>
        )}
      </div>

      {adding && (
        <form
          onSubmit={guardar}
          className="mb-4 space-y-4 rounded-lg border border-border bg-surface p-4"
        >
          <InfoBanner>
            El cambio se agrega al historial sin sobrescribir la especificación original.
          </InfoBanner>
          <Field label="Descripción del cambio" required>
            <TextArea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Ej. Cliente solicita cambiar tono de melamina"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Impacto en costo (COP)" hint="Usa 0 si no aplica.">
              <TextInput
                type="number"
                value={form.impactoCosto}
                onChange={(e) => setForm({ ...form, impactoCosto: Number(e.target.value) })}
              />
            </Field>
            <Field label="Impacto en tiempo (días)" hint="Usa 0 si no aplica.">
              <TextInput
                type="number"
                value={form.impactoDias}
                onChange={(e) => setForm({ ...form, impactoDias: Number(e.target.value) })}
              />
            </Field>
          </div>
          <div className="text-xs text-muted-foreground">
            Responsable: <b>{usuario?.nombre ?? "—"}</b> · Fecha: hoy
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setAdding(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={agregarCambio.isPending}>
              {agregarCambio.isPending ? "Guardando…" : "Guardar cambio"}
            </Button>
          </div>
        </form>
      )}

      {proyecto.cambios.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Sin cambios registrados"
          description="Cuando el cliente o producción solicite ajustes, regístralos aquí para mantener trazabilidad."
        />
      ) : (
        <ol className="relative space-y-3 border-l border-border pl-4">
          {[...proyecto.cambios].reverse().map((c) => (
            <li key={c.id} className="relative">
              <span className="absolute -left-[19px] top-2 h-2.5 w-2.5 rounded-full bg-accent" />
              <div className="rounded-lg border border-border bg-surface p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{c.descripcion}</div>
                  <div className="text-xs text-muted-foreground">{c.fecha}</div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Responsable: {c.responsable}
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  <span className="rounded bg-surface-2 px-2 py-0.5">
                    Costo: <b className="tabular-nums">{formatCOP(c.impactoCosto)}</b>
                  </span>
                  <span className="rounded bg-surface-2 px-2 py-0.5">
                    Tiempo: <b>{c.impactoDias} días</b>
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
