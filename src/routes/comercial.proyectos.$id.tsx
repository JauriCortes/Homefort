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
  Layers,
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
import { useStore } from "@/hooks/use-store";
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
  const especComplete =
    !!especActual &&
    especActual.medidas.trim() &&
    especActual.materiales.trim() &&
    especActual.acabados.trim();

  return (
    <div>
      <PageHeader
        title={proyecto.codigo}
        description={`${proyecto.tipo} · solicitado el ${proyecto.fechaSolicitud}`}
        crumbs={[
          { label: "Comercial", to: "/comercial" },
          { label: "Proyectos", to: "/comercial/proyectos" },
          { label: proyecto.codigo },
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

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Cliente</div>
          {cliente ? (
            <Link
              to="/comercial/clientes/$id"
              params={{ id: cliente.id }}
              className="mt-1 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              {cliente.nombre} <TipoClienteBadge tipo={cliente.tipo} />
            </Link>
          ) : (
            <div className="mt-1 text-sm text-muted-foreground">Cliente eliminado</div>
          )}
          {cliente?.contacto && (
            <div className="text-xs text-muted-foreground">{cliente.contacto}</div>
          )}
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Estado</div>
          <div className="mt-1">
            <EstadoBadge estado={proyecto.estado} />
          </div>
          {puedeEditar ? (
            <CambiarEstadoSelect proyectoId={proyecto.id} estadoActual={proyecto.estado} />
          ) : (
            <div className="mt-2 text-xs text-muted-foreground">
              Solo Comercial puede cambiar el estado.
            </div>
          )}
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Resumen</div>
          <ul className="mt-1 space-y-0.5 text-sm">
            <li>{proyecto.especificaciones.length} versión(es) de especificación</li>
            <li>{proyecto.cotizaciones.length} cotización(es)</li>
            <li>{proyecto.cambios.length} cambio(s) registrados</li>
          </ul>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
        <TabBtn active={tab === "resumen"} onClick={() => setTab("resumen")} icon={Layers}>
          Resumen
        </TabBtn>
        <TabBtn
          active={tab === "especificaciones"}
          onClick={() => setTab("especificaciones")}
          icon={ListChecks}
        >
          Especificaciones
          {!especComplete && (
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

      {tab === "resumen" && (
        <ResumenTab
          ultimaEspec={especActual}
          ultimaCot={proyecto.cotizaciones[proyecto.cotizaciones.length - 1]}
          totalCambios={proyecto.cambios.length}
        />
      )}
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
      <div className="mt-2 text-xs text-muted-foreground">El proyecto está en un estado final.</div>
    );
  }

  return (
    <div className="mt-2">
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
              onError: () => {
                setError("No se pudo cambiar el estado. Intenta nuevamente.");
              },
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

function ResumenTab({
  ultimaEspec,
  ultimaCot,
  totalCambios,
}: {
  ultimaEspec?: Proyecto["especificaciones"][0];
  ultimaCot?: Proyecto["cotizaciones"][0];
  totalCambios: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-border bg-surface p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <ListChecks className="h-4 w-4" /> Última especificación
        </h3>
        {ultimaEspec ? (
          <ul className="space-y-1 text-sm">
            <li>
              <span className="text-muted-foreground">Medidas:</span> {ultimaEspec.medidas}
            </li>
            <li>
              <span className="text-muted-foreground">Materiales:</span> {ultimaEspec.materiales}
            </li>
            <li>
              <span className="text-muted-foreground">Acabados:</span> {ultimaEspec.acabados}
            </li>
            <li className="text-xs text-muted-foreground">
              Versión {ultimaEspec.version} · {ultimaEspec.actualizadoEn} ·{" "}
              {ultimaEspec.actualizadoPor}
            </li>
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Aún no hay especificaciones.</p>
        )}
      </div>
      <div className="rounded-lg border border-border bg-surface p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Receipt className="h-4 w-4" /> Última cotización
        </h3>
        {ultimaCot ? (
          <div className="text-sm">
            <div className="font-medium">{formatCOP(ultimaCot.total)}</div>
            <div className="text-xs text-muted-foreground">
              {ultimaCot.fecha} · margen {ultimaCot.margenPct}%
            </div>
            <div className="mt-1 text-xs">{ultimaCot.condicionesPago}</div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sin cotizaciones registradas.</p>
        )}
      </div>
      <div className="rounded-lg border border-border bg-surface p-4 md:col-span-2">
        <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
          <History className="h-4 w-4" /> Cambios
        </h3>
        <p className="text-sm text-muted-foreground">
          {totalCambios === 0
            ? "No se han registrado cambios durante la ejecución."
            : `${totalCambios} cambio(s) registrados con su impacto en costo y tiempo.`}
        </p>
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
  const [form, setForm] = useState({
    medidas: ultima?.medidas ?? "",
    materiales: ultima?.materiales ?? "",
    acabados: ultima?.acabados ?? "",
    observaciones: ultima?.observaciones ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  if (!proyecto) return null;

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);
    if (!puedeEditar) return setError("No tienes permisos.");
    if (!form.medidas.trim() || !form.materiales.trim() || !form.acabados.trim()) {
      return setError("Completa medidas, materiales y acabados. Las observaciones son opcionales.");
    }
    agregarEspecificacion.mutate(
      {
        medidas: form.medidas.trim(),
        materiales: form.materiales.trim(),
        acabados: form.acabados.trim(),
        observaciones: form.observaciones.trim(),
        actualizadoPor: usuario?.nombre ?? "—",
      },
      {
        onSuccess: () => {
          setOk(
            ultima
              ? "Nueva versión de la especificación guardada."
              : "Especificación inicial registrada.",
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
          description="No se puede generar una orden de producción sin especificaciones completas."
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
                  setForm({
                    medidas: ultima.medidas,
                    materiales: ultima.materiales,
                    acabados: ultima.acabados,
                    observaciones: ultima.observaciones,
                  });
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
          <dl className="grid gap-3 p-4 sm:grid-cols-2">
            <SpecField label="Medidas">{ultima.medidas}</SpecField>
            <SpecField label="Materiales">{ultima.materiales}</SpecField>
            <SpecField label="Acabados">{ultima.acabados}</SpecField>
            <SpecField label="Observaciones">
              {ultima.observaciones || (
                <span className="text-muted-foreground">Sin observaciones</span>
              )}
            </SpecField>
          </dl>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Medidas" required>
              <TextInput
                value={form.medidas}
                onChange={(e) => setForm({ ...form, medidas: e.target.value })}
                placeholder="Ej. 2.40m x 0.60m, alto 0.90m"
              />
            </Field>
            <Field label="Materiales" required>
              <TextInput
                value={form.materiales}
                onChange={(e) => setForm({ ...form, materiales: e.target.value })}
                placeholder="Ej. MDF enchapado, aglomerado melamínico"
              />
            </Field>
            <Field label="Acabados" required>
              <TextInput
                value={form.acabados}
                onChange={(e) => setForm({ ...form, acabados: e.target.value })}
                placeholder="Ej. Laca mate, herrajes Blum"
              />
            </Field>
            <Field label="Observaciones">
              <TextArea
                value={form.observaciones}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                placeholder="Notas adicionales para producción…"
              />
            </Field>
          </div>
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
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Versión {e.version}</span>
                    <span className="text-xs text-muted-foreground">
                      {e.actualizadoEn} · {e.actualizadoPor}
                    </span>
                  </div>
                  <div className="mt-1 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                    <div>
                      <b>Medidas:</b> {e.medidas}
                    </div>
                    <div>
                      <b>Materiales:</b> {e.materiales}
                    </div>
                    <div>
                      <b>Acabados:</b> {e.acabados}
                    </div>
                    {e.observaciones && (
                      <div className="sm:col-span-2">
                        <b>Obs.:</b> {e.observaciones}
                      </div>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SpecField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

/* ---------------- Cotizaciones ---------------- */

function crearItemVacio(): CotizacionItem {
  return { descripcion: "", materiales: 0, manoObra: 0 };
}

function CotizacionesTab({
  proyectoId,
  puedeEditar,
}: {
  proyectoId: string;
  puedeEditar: boolean;
}) {
  const { data: proyecto } = useProyecto(proyectoId);
  // materialesBase sigue en el store mientras Compras no se migre
  const materialesBase = useStore((s) => s.materialesBase);
  const { data: usuario } = useMe();
  const agregarCotizacion = useAgregarCotizacion(proyectoId);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    descripcion: "",
    margenPct: 25,
    condicionesPago: "50% anticipo, 50% contra entrega",
    items: [crearItemVacio()] as CotizacionItem[],
  });
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const total = useMemo(
    () => calcularTotalCotizacion(form.items, form.margenPct),
    [form.items, form.margenPct],
  );

  if (!proyecto) return null;

  const setItem = (i: number, patch: Partial<CotizacionItem>) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
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
    if (!form.descripcion.trim()) return setError("Agrega una descripción para la cotización.");
    if (form.items.length === 0 || form.items.every((i) => !i.descripcion.trim())) {
      return setError("Agrega al menos un ítem con descripción.");
    }
    agregarCotizacion.mutate(
      {
        descripcion: form.descripcion.trim(),
        items: form.items.filter((i) => i.descripcion.trim()),
        margenPct: form.margenPct,
        condicionesPago: form.condicionesPago,
        total,
        creadaPor: usuario?.nombre ?? "—",
      },
      {
        onSuccess: () => {
          setOk("Cotización creada y archivada en el historial.");
          setCreating(false);
          setForm({
            descripcion: "",
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
          <Field label="Descripción general" required>
            <TextInput
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Ej. Cocina integral en nogal con isla"
            />
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Ítems</span>
                <p className="text-xs text-muted-foreground">
                  El costo de materiales se toma del catálogo base de Compras (cantidad × costo
                  unitario). Usa <i>Ítem personalizado</i> si no está en el catálogo.
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={addItem}>
                <Plus className="h-3.5 w-3.5" /> Agregar ítem
              </Button>
            </div>
            <div className="space-y-2">
              {form.items.map((it, i) => {
                const esCustom = it.materialBaseId === "__custom__";
                const material =
                  it.materialBaseId && it.materialBaseId !== "__custom__"
                    ? materialesBase.find((m) => m.id === it.materialBaseId)
                    : undefined;
                return (
                  <div key={i} className="rounded-md border border-border bg-surface-2 p-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                      <div className="sm:col-span-7">
                        <label className="mb-1 block text-xs text-muted-foreground">
                          Material del catálogo
                        </label>
                        <Select
                          value={it.materialBaseId ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "__custom__") {
                              setItem(i, {
                                materialBaseId: "__custom__",
                                descripcion: "",
                                cantidad: 1,
                                unidad: undefined,
                                costoUnitario: 0,
                                materiales: 0,
                              });
                            } else if (val === "") {
                              setItem(i, {
                                materialBaseId: undefined,
                                descripcion: "",
                                cantidad: undefined,
                                unidad: undefined,
                                costoUnitario: undefined,
                                materiales: 0,
                              });
                            } else {
                              const m = materialesBase.find((x) => x.id === val);
                              if (!m) return;
                              const qty = it.cantidad && it.cantidad > 0 ? it.cantidad : 1;
                              setItem(i, {
                                materialBaseId: m.id,
                                descripcion: m.nombre,
                                cantidad: qty,
                                unidad: m.unidad,
                                costoUnitario: m.costoUnitario,
                                materiales: Math.round(qty * m.costoUnitario),
                              });
                            }
                          }}
                        >
                          <option value="">Selecciona del catálogo…</option>
                          {materialesBase.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.nombre} — {formatCOP(m.costoUnitario)}/{m.unidad}
                            </option>
                          ))}
                          <option value="__custom__">+ Ítem personalizado (no en catálogo)</option>
                        </Select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs text-muted-foreground">
                          Cantidad {material ? `(${material.unidad})` : ""}
                        </label>
                        <TextInput
                          type="number"
                          min={0}
                          step="0.01"
                          disabled={!it.materialBaseId || esCustom}
                          value={it.cantidad ?? ""}
                          onChange={(e) => {
                            const qty = Number(e.target.value);
                            const cu = it.costoUnitario ?? 0;
                            setItem(i, {
                              cantidad: qty,
                              materiales: Math.round((qty || 0) * cu),
                            });
                          }}
                          placeholder="0"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs text-muted-foreground">
                          Mano obra (COP)
                        </label>
                        <TextInput
                          type="number"
                          min={0}
                          value={it.manoObra || ""}
                          onChange={(e) => setItem(i, { manoObra: Number(e.target.value) })}
                          placeholder="0"
                        />
                      </div>
                      <div className="flex items-end justify-end sm:col-span-1">
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="h-9 px-2 text-xs text-muted-foreground hover:text-destructive"
                          title="Quitar ítem"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {esCustom && (
                      <div className="mt-2 grid grid-cols-1 gap-2 rounded-md border border-dashed border-border p-2 sm:grid-cols-12">
                        <div className="sm:col-span-8">
                          <label className="mb-1 block text-xs text-muted-foreground">
                            Descripción del ítem personalizado
                          </label>
                          <TextInput
                            placeholder="Ej. Pieza especial sobre medida"
                            value={it.descripcion}
                            onChange={(e) => setItem(i, { descripcion: e.target.value })}
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <label className="mb-1 block text-xs text-muted-foreground">
                            Costo materiales (COP)
                          </label>
                          <TextInput
                            type="number"
                            min={0}
                            value={it.materiales || ""}
                            onChange={(e) => setItem(i, { materiales: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                    )}

                    {(material || esCustom) && (
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2 text-xs">
                        <div className="text-muted-foreground">
                          {material ? (
                            <>
                              {it.cantidad || 0} {material.unidad} ×{" "}
                              {formatCOP(material.costoUnitario)}
                            </>
                          ) : (
                            <span className="text-warning-foreground">
                              Ítem fuera del catálogo · sugerir a Compras agregarlo
                            </span>
                          )}
                        </div>
                        <div className="tabular-nums">
                          Materiales: <b>{formatCOP(it.materiales || 0)}</b>
                          {(it.manoObra || 0) > 0 && (
                            <>
                              {" "}
                              · Mano obra: <b>{formatCOP(it.manoObra)}</b>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Margen (%)" required>
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
            <span className="text-sm text-muted-foreground">Total calculado</span>
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
          description="Crea la primera cotización del proyecto. El total se calcula automáticamente."
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
                  <div className="text-xs text-muted-foreground">
                    {c.descripcion} · creada por {c.creadaPor}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-semibold tabular-nums">{formatCOP(c.total)}</div>
                  <div className="text-xs text-muted-foreground">margen {c.margenPct}%</div>
                </div>
              </header>
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-medium">Ítem</th>
                    <th className="px-4 py-2 font-medium tabular-nums">Materiales</th>
                    <th className="px-4 py-2 font-medium tabular-nums">Mano obra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {c.items.map((it, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2">
                        <div>{it.descripcion}</div>
                        {it.cantidad != null && it.unidad && it.costoUnitario != null ? (
                          <div className="text-xs text-muted-foreground">
                            {it.cantidad} {it.unidad} × {formatCOP(it.costoUnitario)}
                            {it.materialBaseId && it.materialBaseId !== "__custom__" && (
                              <span className="ml-1 rounded bg-surface-2 px-1.5 py-0.5">
                                catálogo
                              </span>
                            )}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-2 tabular-nums">{formatCOP(it.materiales)}</td>
                      <td className="px-4 py-2 tabular-nums">{formatCOP(it.manoObra)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
