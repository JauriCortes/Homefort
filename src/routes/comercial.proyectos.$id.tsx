import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  History,
  ListChecks,
  Receipt,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import { z } from "zod";
import { useMe } from "@/hooks/api/use-auth";
import type { UsuarioPublico } from "@/hooks/api/use-auth";
import {
  useCliente,
  useProyecto,
  useActualizarEstadoProyecto,
  useAgregarEspecificacion,
  useAgregarCotizacion,
  useAgregarCambio,
  useEliminarProyecto,
  useItemsHistorico,
  useMaterialesStock,
  type ItemHistorico,
  type MaterialStock,
} from "@/hooks/api/use-comercial";
import {
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
import { Field, TextInput, NumericInput, TextArea, Select, Button } from "@/components/form-bits";

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

type MilestoneAction = {
  estado: EstadoProyecto;
  label: string;
  variant: "primary" | "secondary" | "danger";
  question: string;
  requiredArea?: string;
};

const MILESTONE_ACCIONES: Partial<Record<string, MilestoneAction[]>> = {
  "En definición": [
    {
      estado: "En cotización",
      label: "Pasar a cotización →",
      variant: "secondary",
      question: "¿Las especificaciones están listas para comenzar a cotizar?",
      requiredArea: "comercial",
    },
  ],
  "En cotización": [
    {
      estado: "Aprobada",
      label: "Proyecto aprobado",
      variant: "primary",
      question: "¿El cliente aprobó formalmente este proyecto y la cotización vigente?",
      requiredArea: "comercial",
    },
    {
      estado: "Rechazada",
      label: "Cancelar proyecto",
      variant: "danger",
      question: "¿Confirmar cancelación del proyecto? Esta acción es definitiva.",
      requiredArea: "comercial",
    },
  ],
  Aprobada: [
    {
      estado: "En cotización",
      label: "Revertir aprobación",
      variant: "secondary",
      question:
        "¿Revertir la aprobación? El proyecto volverá a estado En cotización y podrás corregir antes de re-aprobar.",
      requiredArea: "comercial",
    },
  ],
  "En producción": [
    {
      estado: "Entregado",
      label: "Marcar como entregado",
      variant: "primary",
      question: "¿El proyecto fue entregado e instalado satisfactoriamente al cliente?",
      requiredArea: "produccion",
    },
  ],
  Entregado: [
    {
      estado: "En garantía",
      label: "Activar garantía",
      variant: "secondary",
      question: "¿Activar el período de garantía para este proyecto?",
      requiredArea: "comercial",
    },
  ],
  "En garantía": [
    {
      estado: "Entregado",
      label: "Cerrar garantía",
      variant: "secondary",
      question: "¿El período de garantía ha concluido satisfactoriamente?",
      requiredArea: "comercial",
    },
  ],
  Rechazada: [
    {
      estado: "En definición",
      label: "Reabrir proyecto",
      variant: "secondary",
      question:
        "¿Reabrir el proyecto? Volverá a En definición para que puedas ajustar specs y cotización.",
      requiredArea: "comercial",
    },
  ],
};

function ProyectoDetalleInner({ proyecto }: { proyecto: Proyecto }) {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { data: usuario } = useMe();
  const { data: cliente } = useCliente(proyecto.clienteId);
  const eliminarProyecto = useEliminarProyecto();
  const actualizarEstado = useActualizarEstadoProyecto(proyecto.id);
  const puedeEditar = (usuario?.esAdmin || usuario?.areas.includes("comercial")) ?? false;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmMilestone, setConfirmMilestone] = useState<MilestoneAction | null>(null);
  const [milestoneError, setMilestoneError] = useState<string | null>(null);

  const handleMilestoneConfirm = () => {
    if (!confirmMilestone) return;
    setMilestoneError(null);
    actualizarEstado.mutate(confirmMilestone.estado, {
      onSuccess: () => setConfirmMilestone(null),
      onError: () => {
        setMilestoneError("No se pudo cambiar el estado. Intenta nuevamente.");
        setConfirmMilestone(null);
      },
    });
  };

  const tab = search.tab ?? "resumen";
  const setTab = (t: NonNullable<z.infer<typeof searchSchema>["tab"]>) =>
    navigate({
      to: "/comercial/proyectos/$id",
      params: { id: proyecto.id },
      search: { tab: t },
    });

  const especActual = proyecto.especificaciones[proyecto.especificaciones.length - 1];
  const tieneEspec = !!especActual?.contenido?.trim();

  const handleDelete = () => {
    setDeleteError(null);
    eliminarProyecto.mutate(proyecto.id, {
      onSuccess: () => navigate({ to: "/comercial/proyectos" }),
      onError: () => {
        setDeleteError("No se pudo eliminar el proyecto. Intenta nuevamente.");
        setConfirmDelete(false);
      },
    });
  };

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
          <>
            <Link
              to="/comercial/proyectos"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </Link>
            {puedeEditar && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-destructive/40 bg-surface px-3 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" /> Eliminar
              </button>
            )}
          </>
        }
      />

      {deleteError && (
        <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {deleteError}
        </div>
      )}

      {confirmDelete && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="mb-3 text-sm font-medium">
            ¿Eliminar el proyecto <b>{proyecto.titulo || proyecto.codigo}</b>? Esta acción eliminará
            también sus especificaciones, cotizaciones y cambios.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={eliminarProyecto.isPending}
              className="inline-flex h-8 items-center rounded-md bg-destructive px-3 text-xs font-medium text-white hover:bg-destructive/90 disabled:opacity-50"
            >
              {eliminarProyecto.isPending ? "Eliminando…" : "Sí, eliminar"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="inline-flex h-8 items-center rounded-md border border-border bg-surface px-3 text-xs font-medium hover:bg-muted"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border bg-surface px-4 py-3 text-sm">
        <span className="font-medium text-muted-foreground">{proyecto.codigo}</span>
        <span className="text-border">·</span>
        {cliente ? (
          <Link
            to="/comercial/clientes/$id"
            params={{ id: cliente.id }}
            className="flex items-center gap-1.5 text-primary hover:underline"
          >
            {cliente.nombre} <TipoClienteBadge tipo={cliente.tipo} />
          </Link>
        ) : (
          <span className="text-muted-foreground">Cliente eliminado</span>
        )}
        <span className="text-border">·</span>
        <span className="text-muted-foreground">Solicitado {proyecto.fechaSolicitud}</span>
        {proyecto.fechaEntrega && (
          <>
            <span className="text-border">·</span>
            <span className="text-muted-foreground">Entrega {proyecto.fechaEntrega}</span>
          </>
        )}
        <span className="ml-auto flex items-center gap-2">
          <EstadoBadge estado={proyecto.estado} />
          {puedeEditar && (
            <MilestoneButtons
              estadoActual={proyecto.estado}
              onAction={setConfirmMilestone}
              usuario={usuario}
            />
          )}
        </span>
      </div>

      {confirmMilestone && (
        <div className="mb-4 rounded-lg border border-border bg-surface p-3">
          <p className="mb-2 text-sm text-muted-foreground">{confirmMilestone.question}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={confirmMilestone.variant}
              disabled={actualizarEstado.isPending}
              onClick={handleMilestoneConfirm}
            >
              {actualizarEstado.isPending ? "Actualizando…" : "Confirmar"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={actualizarEstado.isPending}
              onClick={() => setConfirmMilestone(null)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
      {milestoneError && <ErrorBanner>{milestoneError}</ErrorBanner>}

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

function MilestoneButtons({
  estadoActual,
  onAction,
  usuario,
}: {
  estadoActual: EstadoProyecto;
  onAction: (action: MilestoneAction) => void;
  usuario: UsuarioPublico | undefined;
}) {
  const botones = (MILESTONE_ACCIONES[estadoActual] ?? []).filter(
    (btn) =>
      !btn.requiredArea || usuario?.esAdmin || usuario?.areas.includes(btn.requiredArea as never),
  );
  if (!botones.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {botones.map((btn) => (
        <Button key={btn.estado} size="sm" variant={btn.variant} onClick={() => onAction(btn)}>
          {btn.label}
        </Button>
      ))}
    </div>
  );
}

/* ---------------- Resumen ---------------- */

function ResumenTab({ proyecto }: { proyecto: Proyecto }) {
  const especActual = proyecto.especificaciones[proyecto.especificaciones.length - 1];
  const ultimaCot = proyecto.cotizaciones[proyecto.cotizaciones.length - 1];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <ListChecks className="h-4 w-4" /> Especificaciones del proyecto
        </h3>
        {especActual ? (
          <EspecFields e={especActual} />
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

function EspecFields({
  e,
}: {
  e: {
    medidas?: string;
    materiales?: string;
    acabados?: string;
    observaciones?: string;
    contenido?: string;
  };
}) {
  const hasStructured = e.medidas || e.materiales || e.acabados || e.observaciones;
  if (hasStructured) {
    return (
      <dl className="space-y-2 text-sm">
        {e.medidas && (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Medidas</dt>
            <dd className="whitespace-pre-wrap">{e.medidas}</dd>
          </div>
        )}
        {e.materiales && (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Materiales</dt>
            <dd className="whitespace-pre-wrap">{e.materiales}</dd>
          </div>
        )}
        {e.acabados && (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Acabados</dt>
            <dd className="whitespace-pre-wrap">{e.acabados}</dd>
          </div>
        )}
        {e.observaciones && (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Observaciones</dt>
            <dd className="whitespace-pre-wrap">{e.observaciones}</dd>
          </div>
        )}
      </dl>
    );
  }
  return <p className="whitespace-pre-wrap text-sm">{e.contenido}</p>;
}

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
    medidas: "",
    materiales: "",
    acabados: "",
    observaciones: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  if (!proyecto) return null;

  const startEditing = () => {
    setForm({
      medidas: ultima?.medidas ?? "",
      materiales: ultima?.materiales ?? "",
      acabados: ultima?.acabados ?? "",
      observaciones: ultima?.observaciones ?? "",
    });
    setEditing(true);
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);
    if (!puedeEditar) return setError("No tienes permisos.");
    if (
      !form.medidas.trim() &&
      !form.materiales.trim() &&
      !form.acabados.trim() &&
      !form.observaciones.trim()
    ) {
      return setError("Completa al menos un campo de especificación.");
    }
    agregarEspecificacion.mutate(
      { ...form, actualizadoPor: usuario?.nombre ?? "—" },
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
          description="Registra medidas, materiales, acabados y observaciones del proyecto."
          action={
            puedeEditar ? (
              <Button onClick={startEditing}>
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
              <Button variant="secondary" size="sm" onClick={startEditing}>
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
            <EspecFields e={ultima} />
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Medidas" hint="Ej. 3.20m × 0.60m, alto 0.90m">
              <TextArea
                value={form.medidas}
                onChange={(e) => setForm({ ...form, medidas: e.target.value })}
                placeholder="Dimensiones, largo, alto, fondo…"
                rows={3}
              />
            </Field>
            <Field label="Materiales" hint="Ej. MDF enchapado nogal, granito negro">
              <TextArea
                value={form.materiales}
                onChange={(e) => setForm({ ...form, materiales: e.target.value })}
                placeholder="Tableros, herrajes, vidrios…"
                rows={3}
              />
            </Field>
            <Field label="Acabados" hint="Ej. Laca mate, herrajes Blum">
              <TextArea
                value={form.acabados}
                onChange={(e) => setForm({ ...form, acabados: e.target.value })}
                placeholder="Laca, pintura, canto, textura…"
                rows={3}
              />
            </Field>
            <Field label="Observaciones" hint="Detalles adicionales para producción">
              <TextArea
                value={form.observaciones}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                placeholder="Isla central, instalación especial…"
                rows={3}
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
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium">Versión {e.version}</span>
                    <span className="text-xs text-muted-foreground">
                      {e.actualizadoEn} · {e.actualizadoPor}
                    </span>
                  </div>
                  <EspecFields e={e} />
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------------- Helpers de cotizaciones ---------------- */

function crearItemVacio(): CotizacionItem {
  return { descripcion: "", cantidad: 1, precioUnitario: 0, precioTotal: 0 };
}

function getStockWarning(
  descripcion: string,
  cantidad: number,
  stocks: MaterialStock[],
): string | null {
  if (!descripcion.trim() || !stocks.length) return null;
  const match = stocks.find((m) => m.nombre.toLowerCase() === descripcion.trim().toLowerCase());
  if (!match) return null;
  if (match.stockDisponible < cantidad) {
    return `Stock insuficiente: hay ${match.stockDisponible} ${match.unidad} disponibles, se necesitan ${cantidad}.`;
  }
  return null;
}

function SuggestionDropdown({
  query,
  items,
  onSelect,
}: {
  query: string;
  items: ItemHistorico[];
  onSelect: (item: ItemHistorico) => void;
}) {
  const filtered = items.filter(
    (s) => query.trim() && s.descripcion.toLowerCase().includes(query.trim().toLowerCase()),
  );
  if (!filtered.length) return null;
  return (
    <ul className="absolute left-0 top-full z-20 mt-0.5 max-h-40 w-full overflow-y-auto rounded-md border border-border bg-surface text-sm shadow-md">
      {filtered.map((s) => (
        <li
          key={s.descripcion}
          onMouseDown={() => onSelect(s)}
          className="flex cursor-pointer items-center justify-between px-3 py-1.5 hover:bg-muted"
        >
          <span>{s.descripcion}</span>
          <span className="ml-2 text-xs text-muted-foreground">{formatCOP(s.precioUnitario)}</span>
        </li>
      ))}
    </ul>
  );
}

function WarningBadge({ message }: { message: string }) {
  return (
    <div className="group absolute right-1 top-1/2 -translate-y-1/2">
      <span className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-warning text-[10px] font-bold text-warning-foreground">
        !
      </span>
      <div className="absolute bottom-full right-0 z-30 mb-1 hidden w-56 rounded-md bg-foreground px-2 py-1.5 text-xs text-background shadow-md group-hover:block">
        {message}
      </div>
    </div>
  );
}

/* ---------------- Cotizaciones ---------------- */

function CotizacionesTab({
  proyectoId,
  puedeEditar,
}: {
  proyectoId: string;
  puedeEditar: boolean;
}) {
  const { data: proyecto } = useProyecto(proyectoId);
  const { data: usuario } = useMe();
  const { data: itemsHistorico = [] } = useItemsHistorico();
  const { data: materialesStock = [] } = useMaterialesStock();
  const agregarCotizacion = useAgregarCotizacion(proyectoId);
  const [creating, setCreating] = useState(false);
  const [openSuggest, setOpenSuggest] = useState<number | null>(null);
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

  const ultimaCot = proyecto.cotizaciones[proyecto.cotizaciones.length - 1];
  const historial = proyecto.cotizaciones.slice(0, -1);
  const hayStockWarnEnForm = form.items.some(
    (it) => it.descripcion.trim() && getStockWarning(it.descripcion, it.cantidad, materialesStock),
  );

  const setItem = (i: number, patch: Partial<CotizacionItem>) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, idx) => {
        if (idx !== i) return it;
        const updated = { ...it, ...patch };
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

      {/* ── Formulario nueva cotización ── */}
      {creating && (
        <form
          onSubmit={guardar}
          className="mb-6 space-y-4 rounded-lg border border-border bg-surface p-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              Nueva cotización (v{proyecto.cotizaciones.length + 1})
            </h3>
            <Button variant="secondary" size="sm" type="button" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
          </div>

          {hayStockWarnEnForm && (
            <InfoBanner>
              Uno o más ítems tienen stock insuficiente. La cotización se puede guardar, pero se
              generará una advertencia visible para Compras.
            </InfoBanner>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 pr-2 font-medium">Ítem</th>
                  <th className="w-20 pb-2 pr-2 font-medium">Cant.</th>
                  <th className="w-36 pb-2 pr-2 font-medium">P. unitario</th>
                  <th className="w-36 pb-2 pr-2 font-medium">P. total</th>
                  <th className="w-8 pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {form.items.map((it, i) => {
                  const warn = getStockWarning(it.descripcion, it.cantidad, materialesStock);
                  return (
                    <tr key={i} className={warn ? "bg-warning/10" : ""}>
                      <td className="py-1.5 pr-2">
                        <div className="relative">
                          <TextInput
                            value={it.descripcion}
                            onChange={(e) => {
                              setItem(i, { descripcion: e.target.value });
                              setOpenSuggest(i);
                            }}
                            onFocus={() => setOpenSuggest(i)}
                            onBlur={() => setTimeout(() => setOpenSuggest(null), 150)}
                            className={warn ? "border-warning bg-warning/10 pr-6" : ""}
                            placeholder="Descripción del ítem…"
                          />
                          {openSuggest === i && (
                            <SuggestionDropdown
                              query={it.descripcion}
                              items={itemsHistorico}
                              onSelect={(s) => {
                                setItem(i, {
                                  descripcion: s.descripcion,
                                  precioUnitario: s.precioUnitario,
                                });
                                setOpenSuggest(null);
                              }}
                            />
                          )}
                          {warn && <WarningBadge message={warn} />}
                        </div>
                      </td>
                      <td className="py-1.5 pr-2">
                        <TextInput
                          type="number"
                          min={0}
                          step="1"
                          value={it.cantidad || ""}
                          onChange={(e) => setItem(i, { cantidad: Number(e.target.value) })}
                          placeholder="0"
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <NumericInput
                          value={it.precioUnitario}
                          onChange={(n) => setItem(i, { precioUnitario: n })}
                          placeholder="0"
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <NumericInput
                          value={it.precioTotal}
                          onChange={(n) => setItem(i, { precioTotal: n })}
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
                  );
                })}
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
                step="1"
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

      {/* ── Cotización vigente ── */}
      {!creating && (
        <>
          {!ultimaCot ? (
            <EmptyState
              icon={Receipt}
              title="Sin cotizaciones"
              description="Registra la primera cotización del proyecto."
              action={
                puedeEditar ? (
                  <Button onClick={() => setCreating(true)}>
                    <Plus className="h-4 w-4" /> Primera cotización
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="rounded-lg border border-border bg-surface">
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold">
                    Cotización vigente (v{proyecto.cotizaciones.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {ultimaCot.fecha} · por {ultimaCot.creadaPor}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-base font-semibold tabular-nums">
                      {formatCOP(ultimaCot.total)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      margen {ultimaCot.margenPct}%
                    </div>
                  </div>
                  {puedeEditar && (
                    <Button variant="secondary" size="sm" onClick={() => setCreating(true)}>
                      <Plus className="h-3.5 w-3.5" /> Nueva versión
                    </Button>
                  )}
                </div>
              </header>
              <CotizacionItemsTable items={ultimaCot.items} materialesStock={materialesStock} />
              <div className="border-t border-border bg-surface-2 px-4 py-2 text-xs text-muted-foreground">
                Condiciones de pago: {ultimaCot.condicionesPago}
              </div>
            </div>
          )}

          {/* ── Historial de versiones ── */}
          {historial.length > 0 && (
            <div className="mt-6 rounded-lg border border-border bg-surface">
              <header className="border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold">Historial de versiones</h3>
              </header>
              <ul className="divide-y divide-border">
                {[...historial].reverse().map((c, idx) => {
                  const vNum = historial.length - idx;
                  return (
                    <li key={c.id}>
                      <details className="group">
                        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-muted">
                          <div>
                            <span className="text-sm font-medium">v{vNum}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {c.fecha} · {c.creadaPor}
                            </span>
                          </div>
                          <span className="text-sm font-semibold tabular-nums">
                            {formatCOP(c.total)}
                          </span>
                        </summary>
                        <div className="border-t border-border/50">
                          <CotizacionItemsTable items={c.items} materialesStock={materialesStock} />
                          <div className="bg-surface-2 px-4 py-2 text-xs text-muted-foreground">
                            Condiciones: {c.condicionesPago} · margen {c.margenPct}%
                          </div>
                        </div>
                      </details>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CotizacionItemsTable({
  items,
  materialesStock,
}: {
  items: CotizacionItem[];
  materialesStock: MaterialStock[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr className="border-b border-border">
            <th className="px-4 py-2 font-medium">Ítem</th>
            <th className="px-4 py-2 font-medium tabular-nums">Cantidad</th>
            <th className="px-4 py-2 font-medium tabular-nums">P. unitario</th>
            <th className="px-4 py-2 font-medium tabular-nums">P. total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((it, i) => {
            const warn = getStockWarning(it.descripcion, it.cantidad ?? 0, materialesStock);
            return (
              <tr key={i} className={warn ? "bg-warning/10" : ""}>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1.5">
                    {it.descripcion}
                    {warn && (
                      <div className="group relative inline-flex">
                        <span className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-warning text-[10px] font-bold text-warning-foreground">
                          !
                        </span>
                        <div className="absolute bottom-full left-0 z-30 mb-1 hidden w-56 rounded-md bg-foreground px-2 py-1.5 text-xs text-background shadow-md group-hover:block">
                          {warn}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 tabular-nums">{it.cantidad ?? "—"}</td>
                <td className="px-4 py-2 tabular-nums">
                  {it.precioUnitario != null ? formatCOP(it.precioUnitario) : "—"}
                </td>
                <td className="px-4 py-2 tabular-nums">
                  {it.precioTotal != null ? formatCOP(it.precioTotal) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
                min={0}
                step="1"
                value={form.impactoCosto}
                onChange={(e) => setForm({ ...form, impactoCosto: Number(e.target.value) })}
              />
            </Field>
            <Field label="Impacto en tiempo (días)" hint="Usa 0 si no aplica.">
              <TextInput
                type="number"
                min={0}
                step="1"
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
