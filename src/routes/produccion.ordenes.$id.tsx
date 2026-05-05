import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, Check } from "lucide-react";
import { store, type EstadoEtapa } from "@/lib/store";
import { useStore, useUsuarioActivo } from "@/hooks/use-store";
import { PageHeader, EmptyState, ErrorBanner, SuccessBanner } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";

export const Route = createFileRoute("/produccion/ordenes/$id")({
  component: OrdenDetalle,
});

function OrdenDetalle() {
  const { id } = Route.useParams();
  const usuario = useUsuarioActivo();
  const orden = useStore((s) => s.ordenesProduccion.find((o) => o.id === id));
  const etapas = useStore((s) => s.etapas.filter((e) => e.ordenId === id));
  const proyecto = useStore((s) => orden ? s.proyecto(orden.proyectoId) : undefined);
  const materiales = useStore((s) => s.materialesBase);
  const entregas = useStore((s) => s.entregas.filter((e) => e.ordenId === id));
  const [showEtapaForm, setShowEtapaForm] = useState(false);
  const [etapaForm, setEtapaForm] = useState({ nombre: "", responsable: "", fechaEstimada: "" });
  const [showEntregaForm, setShowEntregaForm] = useState(false);
  const [checklist, setChecklist] = useState({ medidas: false, acabados: false, estadoProducto: false, documentacion: false });
  const [entregaObs, setEntregaObs] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const puedeEditar = usuario.esAdmin || usuario.areas.includes("produccion");

  if (!orden) {
    return (
      <div>
        <PageHeader title="Orden no encontrada" />
        <Link to="/produccion" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </div>
    );
  }

  const crearEtapa = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!etapaForm.nombre.trim() || !etapaForm.responsable.trim() || !etapaForm.fechaEstimada) return setError("Completa todos los campos de la etapa.");
    store.crearEtapa({ ordenId: id, proyectoId: orden.proyectoId, nombre: etapaForm.nombre, responsable: etapaForm.responsable, fechaEstimada: etapaForm.fechaEstimada, materiales: [] });
    setOk("Etapa agregada.");
    setShowEtapaForm(false);
    setEtapaForm({ nombre: "", responsable: "", fechaEstimada: "" });
    setTimeout(() => setOk(null), 2500);
  };

  const completarEtapa = (etapaId: string) => {
    store.completarEtapa(etapaId);
    setOk("Etapa completada.");
    setTimeout(() => setOk(null), 2500);
  };

  const registrarEntrega = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checklist.medidas || !checklist.acabados || !checklist.estadoProducto || !checklist.documentacion) {
      return setError("Completa todos los items del checklist de entrega.");
    }
    store.registrarEntrega({ ordenId: id, proyectoId: orden.proyectoId, fecha: new Date().toISOString().slice(0, 10), responsable: usuario.nombre, checklist, observaciones: entregaObs || undefined });
    setOk("Entrega registrada. El proyecto ha sido marcado como Entregado.");
    setShowEntregaForm(false);
    setTimeout(() => setOk(null), 3000);
  };

  const todasCompletadas = etapas.length > 0 && etapas.every((e) => e.estado === "completada");
  const entregaRegistrada = entregas.length > 0;

  return (
    <div>
      <PageHeader
        title={orden.numero}
        description={`Proyecto ${proyecto?.codigo ?? orden.proyectoId} - ${proyecto?.tipo}`}
        crumbs={[{ label: "Produccion", to: "/produccion" }, { label: orden.numero }]}
        actions={
          <Link to="/produccion" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        }
      />
      {ok && <SuccessBanner>{ok}</SuccessBanner>}
      {error && <ErrorBanner>{error}</ErrorBanner>}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Info orden */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold">Informacion de la orden</h3>
          <dl className="space-y-1 text-sm">
            <div><dt className="text-xs text-muted-foreground">Estado</dt><dd>{orden.estado}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Responsable</dt><dd>{orden.responsable}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Emision</dt><dd>{orden.fechaEmision}</dd></div>
            {orden.notas && <div><dt className="text-xs text-muted-foreground">Notas</dt><dd>{orden.notas}</dd></div>}
          </dl>
        </div>

        {/* Especificaciones del proyecto */}
        {proyecto && proyecto.especificaciones.length > 0 && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-2 text-sm font-semibold">Especificaciones (solo lectura)</h3>
            {(() => {
              const spec = proyecto.especificaciones.at(-1)!;
              return (
                <dl className="space-y-1 text-sm">
                  <div><dt className="text-xs text-muted-foreground">Medidas</dt><dd>{spec.medidas}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Materiales</dt><dd>{spec.materiales}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Acabados</dt><dd>{spec.acabados}</dd></div>
                  {spec.observaciones && <div><dt className="text-xs text-muted-foreground">Obs.</dt><dd>{spec.observaciones}</dd></div>}
                </dl>
              );
            })()}
          </div>
        )}
      </div>

      {/* Etapas */}
      <div className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Etapas de produccion ({etapas.length})</h3>
          {puedeEditar && !entregaRegistrada && (
            <Button size="sm" onClick={() => setShowEtapaForm((v) => !v)}>
              <Plus className="h-3.5 w-3.5" /> {showEtapaForm ? "Cancelar" : "Agregar etapa"}
            </Button>
          )}
        </div>
        {showEtapaForm && (
          <form onSubmit={crearEtapa} className="mb-4 space-y-4 rounded-lg border border-border bg-surface p-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Nombre de la etapa" required><TextInput value={etapaForm.nombre} onChange={(e) => setEtapaForm({ ...etapaForm, nombre: e.target.value })} placeholder="Ej. Corte de piezas" /></Field>
              <Field label="Responsable" required><TextInput value={etapaForm.responsable} onChange={(e) => setEtapaForm({ ...etapaForm, responsable: e.target.value })} /></Field>
              <Field label="Fecha estimada" required><TextInput type="date" value={etapaForm.fechaEstimada} onChange={(e) => setEtapaForm({ ...etapaForm, fechaEstimada: e.target.value })} /></Field>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setShowEtapaForm(false)}>Cancelar</Button>
              <Button type="submit">Agregar etapa</Button>
            </div>
          </form>
        )}
        {etapas.length === 0 ? (
          <EmptyState title="Sin etapas" description="Agrega la primera etapa de produccion para este proyecto." />
        ) : (
          <div className="space-y-2">
            {etapas.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
                <div>
                  <div className="text-sm font-medium">{e.nombre}</div>
                  <div className="text-xs text-muted-foreground">Responsable: {e.responsable} - Est: {e.fechaEstimada}</div>
                  {e.fechaCompletada && <div className="text-xs text-success">Completada: {e.fechaCompletada}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs rounded-full px-2 py-0.5 ${e.estado === "completada" ? "bg-green-100 text-green-800" : e.estado === "en_curso" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>{e.estado}</span>
                  {puedeEditar && e.estado !== "completada" && (
                    <Button size="sm" variant="secondary" onClick={() => completarEtapa(e.id)}>
                      <Check className="h-3.5 w-3.5" /> Completar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checklist de entrega */}
      {puedeEditar && todasCompletadas && !entregaRegistrada && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Checklist de entrega</h3>
            <Button size="sm" onClick={() => setShowEntregaForm((v) => !v)}>
              {showEntregaForm ? "Cancelar" : "Registrar entrega"}
            </Button>
          </div>
          {showEntregaForm && (
            <form onSubmit={registrarEntrega} className="space-y-4 rounded-lg border border-border bg-surface p-4">
              {error && <ErrorBanner>{error}</ErrorBanner>}
              <div className="space-y-2">
                {[
                  { key: "medidas", label: "Medidas verificadas" },
                  { key: "acabados", label: "Acabados verificados" },
                  { key: "estadoProducto", label: "Estado del producto OK" },
                  { key: "documentacion", label: "Documentacion completa" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={checklist[key as keyof typeof checklist]} onChange={(e) => setChecklist({ ...checklist, [key]: e.target.checked })} />
                    {label}
                  </label>
                ))}
              </div>
              <Field label="Observaciones adicionales">
                <TextInput value={entregaObs} onChange={(e) => setEntregaObs(e.target.value)} />
              </Field>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" type="button" onClick={() => setShowEntregaForm(false)}>Cancelar</Button>
                <Button type="submit">Confirmar entrega</Button>
              </div>
            </form>
          )}
        </div>
      )}

      {entregaRegistrada && (
        <div className="mt-4 rounded-lg border border-success/40 bg-success/10 p-4">
          <div className="text-sm font-medium text-success">Entrega registrada el {entregas[0].fecha}</div>
          <div className="text-xs text-success">Responsable: {entregas[0].responsable}</div>
        </div>
      )}
    </div>
  );
}
