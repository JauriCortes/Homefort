import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useMe } from "@/hooks/api/use-auth";
import { useProyectos } from "@/hooks/api/use-comercial";
import { useSolicitudGarantia, useCrearOrdenGarantia, useActualizarOrdenGarantia } from "@/hooks/api/use-postventa";
import { PageHeader, ErrorBanner } from "@/components/ui-bits";
import { Button, Field, TextInput } from "@/components/form-bits";
import { toast } from "sonner";

export const Route = createFileRoute("/postventa/garantias/$id")({
  component: GarantiaDetalle,
});

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

function GarantiaDetalle() {
  const { id } = Route.useParams();
  const { data: usuario } = useMe();
  const { data: proyectos = [] } = useProyectos();
  const { data: solicitudData, isLoading } = useSolicitudGarantia(id);
  const crearOrden = useCrearOrdenGarantia();
  const actualizarOrden = useActualizarOrdenGarantia();

  const [showEtapaForm, setShowEtapaForm] = useState(false);
  const [etapaForm, setEtapaForm] = useState({ nombre: "", responsable: "", fechaEstimada: "" });
  const [showCostoForm, setShowCostoForm] = useState(false);
  const [costoForm, setCostoForm] = useState({ concepto: "", monto: "", fecha: new Date().toISOString().slice(0, 10) });
  const [error, setError] = useState<string | null>(null);

  const puedeGenerarOrden = usuario?.esAdmin || usuario?.areas?.includes("comercial");
  const puedeGestionarEtapas = usuario?.esAdmin || usuario?.areas?.includes("produccion");
  const puedeVerCostos = usuario?.esAdmin || usuario?.areas?.includes("administrativa");

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Cargando...</div>;

  if (!solicitudData) {
    return (
      <div>
        <PageHeader title="Solicitud no encontrada" />
        <Link to="/postventa/garantias" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </div>
    );
  }

  const { orden, ...solicitud } = solicitudData;
  const proyecto = proyectos.find((p) => p.id === solicitud.proyectoId);

  const generarOrden = async () => {
    try {
      await crearOrden.mutateAsync({ solicitudId: solicitud.id });
      toast.success("Orden de garantía generada.");
    } catch {
      toast.error("Error al generar la orden.");
    }
  };

  const agregarEtapa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!orden) return;
    if (!etapaForm.nombre.trim() || !etapaForm.responsable.trim() || !etapaForm.fechaEstimada)
      return setError("Completa todos los campos.");
    try {
      await actualizarOrden.mutateAsync({ id: orden.id, solicitudId: solicitud.id, agregarEtapa: etapaForm });
      toast.success("Etapa agregada.");
      setShowEtapaForm(false);
      setEtapaForm({ nombre: "", responsable: "", fechaEstimada: "" });
    } catch {
      toast.error("Error al agregar la etapa.");
    }
  };

  const completarEtapa = async (etapaId: string) => {
    if (!orden) return;
    try {
      await actualizarOrden.mutateAsync({ id: orden.id, solicitudId: solicitud.id, completarEtapa: etapaId });
      toast.success("Etapa completada.");
    } catch {
      toast.error("Error al completar la etapa.");
    }
  };

  const cerrarGarantia = async () => {
    if (!orden) return;
    try {
      await actualizarOrden.mutateAsync({ id: orden.id, solicitudId: solicitud.id, estado: "completada" });
      toast.success("Garantía cerrada. El proyecto volvió a estado Entregado.");
    } catch {
      toast.error("Error al cerrar la garantía.");
    }
  };

  const agregarCosto = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!orden) return;
    const monto = Number(costoForm.monto);
    if (!costoForm.concepto.trim() || !costoForm.fecha || isNaN(monto) || monto <= 0)
      return setError("Completa todos los campos del costo.");
    try {
      await actualizarOrden.mutateAsync({ id: orden.id, solicitudId: solicitud.id, agregarCosto: { concepto: costoForm.concepto.trim(), monto, fecha: costoForm.fecha } });
      toast.success("Costo registrado.");
      setShowCostoForm(false);
      setCostoForm({ concepto: "", monto: "", fecha: new Date().toISOString().slice(0, 10) });
    } catch {
      toast.error("Error al registrar el costo.");
    }
  };

  const todasEtapasCompletas = orden && orden.etapas.length > 0 && orden.etapas.every((et) => et.estado === "completada");

  return (
    <div>
      <PageHeader
        title={`Garantía — ${proyecto?.codigo ?? solicitud.proyectoId}`}
        description={solicitud.descripcion}
        crumbs={[{ label: "Postventa" }, { label: "Garantías", to: "/postventa/garantias" }, { label: solicitud.id }]}
        actions={
          <Link to="/postventa/garantias" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        }
      />
      {error && <ErrorBanner>{error}</ErrorBanner>}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold">Proyecto original</h3>
          <dl className="space-y-1 text-sm">
            <div><dt className="text-xs text-muted-foreground">Código</dt><dd>{proyecto?.codigo}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Tipo</dt><dd>{proyecto?.tipo}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Estado actual</dt><dd>{proyecto?.estado}</dd></div>
          </dl>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold">Solicitud</h3>
          <dl className="space-y-1 text-sm">
            <div><dt className="text-xs text-muted-foreground">Fecha</dt><dd>{solicitud.fecha}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Descripción</dt><dd>{solicitud.descripcion}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Abierto por</dt><dd>{solicitud.abiertoBy}</dd></div>
            <div>
              <dt className="text-xs text-muted-foreground">Estado</dt>
              <dd>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${solicitud.estado === "cerrada" ? "bg-green-100 text-green-800" : solicitud.estado === "en_proceso" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {solicitud.estado}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {!orden && solicitud.estado === "abierta" && puedeGenerarOrden && (
        <div className="mt-4 rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold">Orden de garantía</h3>
          <p className="mb-3 text-sm text-muted-foreground">Esta solicitud no tiene orden de garantía. Genera una para gestionar la reparación.</p>
          <Button onClick={generarOrden} disabled={crearOrden.isPending}>Generar orden de garantía</Button>
        </div>
      )}

      {orden && (
        <div className="mt-4 rounded-lg border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Orden {orden.numero} ({orden.estado})</h3>
            <div className="flex gap-2">
              {puedeGestionarEtapas && (
                <Button size="sm" onClick={() => setShowEtapaForm((v) => !v)}>
                  <Plus className="h-3.5 w-3.5" /> Etapa
                </Button>
              )}
              {puedeGestionarEtapas && todasEtapasCompletas && orden.estado === "activa" && (
                <Button size="sm" variant="danger" onClick={cerrarGarantia} disabled={actualizarOrden.isPending}>
                  Cerrar garantía
                </Button>
              )}
            </div>
          </div>
          {showEtapaForm && (
            <form onSubmit={agregarEtapa} className="mb-4 space-y-3 rounded-lg border border-border bg-muted/30 p-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Nombre" required>
                  <TextInput value={etapaForm.nombre} onChange={(e) => setEtapaForm({ ...etapaForm, nombre: e.target.value })} />
                </Field>
                <Field label="Responsable" required>
                  <TextInput value={etapaForm.responsable} onChange={(e) => setEtapaForm({ ...etapaForm, responsable: e.target.value })} />
                </Field>
                <Field label="Fecha estimada" required>
                  <TextInput type="date" value={etapaForm.fechaEstimada} onChange={(e) => setEtapaForm({ ...etapaForm, fechaEstimada: e.target.value })} />
                </Field>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" type="button" size="sm" onClick={() => setShowEtapaForm(false)}>Cancelar</Button>
                <Button type="submit" size="sm" disabled={actualizarOrden.isPending}>Agregar</Button>
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
                    <div className="text-xs text-muted-foreground">{et.responsable} — {et.fechaEstimada}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${et.estado === "completada" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {et.estado}
                    </span>
                    {puedeGestionarEtapas && et.estado !== "completada" && (
                      <Button size="sm" variant="secondary" onClick={() => completarEtapa(et.id)} disabled={actualizarOrden.isPending}>
                        Completar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {orden && puedeVerCostos && (
        <div className="mt-4 rounded-lg border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              Costos de garantía
              {orden.costos.length > 0 && (
                <span className="ml-2 font-normal text-muted-foreground">
                  Total: {formatCOP(orden.costos.reduce((s, c) => s + c.monto, 0))}
                </span>
              )}
            </h3>
            {orden.estado === "activa" && (
              <Button size="sm" onClick={() => setShowCostoForm((v) => !v)}>
                <Plus className="h-3.5 w-3.5" /> Costo
              </Button>
            )}
          </div>
          {showCostoForm && (
            <form onSubmit={agregarCosto} className="mb-4 space-y-3 rounded-lg border border-border bg-muted/30 p-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Concepto" required>
                  <TextInput value={costoForm.concepto} onChange={(e) => setCostoForm({ ...costoForm, concepto: e.target.value })} />
                </Field>
                <Field label="Monto (COP)" required>
                  <TextInput type="number" step="1" min="1" value={costoForm.monto} onChange={(e) => setCostoForm({ ...costoForm, monto: e.target.value })} />
                </Field>
                <Field label="Fecha" required>
                  <TextInput type="date" value={costoForm.fecha} onChange={(e) => setCostoForm({ ...costoForm, fecha: e.target.value })} />
                </Field>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" type="button" size="sm" onClick={() => setShowCostoForm(false)}>Cancelar</Button>
                <Button type="submit" size="sm" disabled={actualizarOrden.isPending}>Registrar</Button>
              </div>
            </form>
          )}
          {orden.costos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin costos registrados.</p>
          ) : (
            <div className="space-y-1">
              {orden.costos.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{c.concepto} <span className="text-xs text-muted-foreground">({c.fecha})</span></span>
                  <span className="tabular-nums font-medium">{formatCOP(c.monto)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
