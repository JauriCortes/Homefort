import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { store } from "@/lib/store";
import { useStore, useUsuarioActivo } from "@/hooks/use-store";
import { PageHeader, ErrorBanner, SuccessBanner } from "@/components/ui-bits";
import { Button, Field, TextInput } from "@/components/form-bits";

export const Route = createFileRoute("/postventa/garantias/$id")({
  component: GarantiaDetalle,
});

function GarantiaDetalle() {
  const { id } = Route.useParams();
  const usuario = useUsuarioActivo();
  const solicitud = useStore((s) => s.solicitudesGarantia.find((sg) => sg.id === id));
  const orden = useStore((s) => solicitud?.ordenGarantiaId ? s.ordenesGarantia.find((og) => og.id === solicitud.ordenGarantiaId) : undefined);
  const proyecto = useStore((s) => solicitud ? s.proyecto(solicitud.proyectoId) : undefined);
  const [showEtapaForm, setShowEtapaForm] = useState(false);
  const [etapaForm, setEtapaForm] = useState({ nombre: "", responsable: "", fechaEstimada: "" });
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const puedeEditar = usuario.esAdmin || usuario.areas.includes("comercial") || usuario.areas.includes("administrativa");

  if (!solicitud) {
    return (
      <div>
        <PageHeader title="Solicitud no encontrada" />
        <Link to="/postventa/garantias" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </div>
    );
  }

  const generarOrden = () => {
    store.crearOrdenGarantia({ proyectoId: solicitud.proyectoId, solicitudId: solicitud.id });
    setOk("Orden de garantia generada. El proyecto ha sido marcado En garantia.");
    setTimeout(() => setOk(null), 3000);
  };

  const agregarEtapa = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!orden) return;
    if (!etapaForm.nombre.trim() || !etapaForm.responsable.trim() || !etapaForm.fechaEstimada) return setError("Completa todos los campos.");
    const nuevaEtapa = { id: `eg_${Date.now()}`, ordenId: orden.id, nombre: etapaForm.nombre, responsable: etapaForm.responsable, fechaEstimada: etapaForm.fechaEstimada, estado: "pendiente" as const, observaciones: "" };
    store.ordenesGarantia = store.ordenesGarantia.map((og) => og.id === orden.id ? { ...og, etapas: [...og.etapas, nuevaEtapa] } : og);
    store.emit();
    setOk("Etapa agregada.");
    setShowEtapaForm(false);
    setEtapaForm({ nombre: "", responsable: "", fechaEstimada: "" });
    setTimeout(() => setOk(null), 2500);
  };

  const completarEtapaGarantia = (etapaId: string) => {
    if (!orden) return;
    store.ordenesGarantia = store.ordenesGarantia.map((og) => og.id === orden.id ? { ...og, etapas: og.etapas.map((et) => et.id === etapaId ? { ...et, estado: "completada" as const } : et) } : og);
    store.emit();
    setOk("Etapa completada.");
    setTimeout(() => setOk(null), 2500);
  };

  const cerrarGarantia = () => {
    if (!orden) return;
    store.completarOrdenGarantia(orden.id);
    setOk("Garantia cerrada. El proyecto volvio a estado Entregado.");
    setTimeout(() => setOk(null), 3000);
  };

  const todasEtapasCompletas = orden && orden.etapas.length > 0 && orden.etapas.every((et) => et.estado === "completada");

  return (
    <div>
      <PageHeader
        title={`Garantia - ${proyecto?.codigo ?? solicitud.proyectoId}`}
        description={solicitud.descripcion}
        crumbs={[{ label: "Postventa" }, { label: "Garantias", to: "/postventa/garantias" }, { label: solicitud.id }]}
        actions={<Link to="/postventa/garantias" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"><ArrowLeft className="h-4 w-4" /> Volver</Link>}
      />
      {ok && <SuccessBanner>{ok}</SuccessBanner>}
      {error && <ErrorBanner>{error}</ErrorBanner>}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Datos del proyecto original */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold">Proyecto original</h3>
          <dl className="space-y-1 text-sm">
            <div><dt className="text-xs text-muted-foreground">Codigo</dt><dd>{proyecto?.codigo}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Tipo</dt><dd>{proyecto?.tipo}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Estado actual</dt><dd>{proyecto?.estado}</dd></div>
          </dl>
        </div>

        {/* Datos de la solicitud */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold">Solicitud</h3>
          <dl className="space-y-1 text-sm">
            <div><dt className="text-xs text-muted-foreground">Fecha</dt><dd>{solicitud.fecha}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Descripcion</dt><dd>{solicitud.descripcion}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Abierto por</dt><dd>{solicitud.abiertoBy}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Estado</dt>
              <dd>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${solicitud.estado === "cerrada" ? "bg-green-100 text-green-800" : solicitud.estado === "en_proceso" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>{solicitud.estado}</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Generar orden si no existe */}
      {!orden && solicitud.estado === "abierta" && puedeEditar && (
        <div className="mt-4 rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold">Orden de garantia</h3>
          <p className="mb-3 text-sm text-muted-foreground">Esta solicitud no tiene orden de garantia. Genera una para gestionar la reparacion.</p>
          <Button onClick={generarOrden}>Generar orden de garantia</Button>
        </div>
      )}

      {/* Detalles de la orden si existe */}
      {orden && (
        <div className="mt-4 rounded-lg border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Orden {orden.numero} ({orden.estado})</h3>
            <div className="flex gap-2">
              {puedeEditar && <Button size="sm" onClick={() => setShowEtapaForm((v) => !v)}><Plus className="h-3.5 w-3.5" /> Etapa</Button>}
              {puedeEditar && todasEtapasCompletas && orden.estado === "activa" && (
                <Button size="sm" variant="danger" onClick={cerrarGarantia}>Cerrar garantia</Button>
              )}
            </div>
          </div>
          {showEtapaForm && (
            <form onSubmit={agregarEtapa} className="mb-4 space-y-3 rounded-lg border border-border bg-muted/30 p-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Nombre" required><TextInput value={etapaForm.nombre} onChange={(e) => setEtapaForm({ ...etapaForm, nombre: e.target.value })} /></Field>
                <Field label="Responsable" required><TextInput value={etapaForm.responsable} onChange={(e) => setEtapaForm({ ...etapaForm, responsable: e.target.value })} /></Field>
                <Field label="Fecha estimada" required><TextInput type="date" value={etapaForm.fechaEstimada} onChange={(e) => setEtapaForm({ ...etapaForm, fechaEstimada: e.target.value })} /></Field>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" type="button" size="sm" onClick={() => setShowEtapaForm(false)}>Cancelar</Button>
                <Button type="submit" size="sm">Agregar</Button>
              </div>
            </form>
          )}
          {orden.etapas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin etapas registradas.</p>
          ) : (
            <div className="space-y-2">
              {orden.etapas.map((et) => (
                <div key={et.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <div className="text-sm font-medium">{et.nombre}</div>
                    <div className="text-xs text-muted-foreground">{et.responsable} - {et.fechaEstimada}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${et.estado === "completada" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{et.estado}</span>
                    {puedeEditar && et.estado !== "completada" && (
                      <Button size="sm" variant="secondary" onClick={() => completarEtapaGarantia(et.id)}>Completar</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
