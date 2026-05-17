import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, Check, MessageSquare } from "lucide-react";
import { useMe } from "@/hooks/api/use-auth";
import { useProyecto } from "@/hooks/api/use-comercial";
import { useStock } from "@/hooks/api/use-compras";
import {
  useOrdenProduccion,
  useCrearEtapa,
  useActualizarEtapa,
  useRegistrarEntrega,
  type MaterialEtapa,
  type ChecklistEntrega,
} from "@/hooks/api/use-produccion";
import { PageHeader, EmptyState, ErrorBanner } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";
import { toast } from "sonner";

export const Route = createFileRoute("/produccion/ordenes/$id")({
  component: OrdenDetalle,
});

function OrdenDetalle() {
  const { id } = Route.useParams();
  const { data: usuario } = useMe();
  const { data: stock = [] } = useStock();
  const { data: orden, isLoading } = useOrdenProduccion(id);
  const { data: proyecto } = useProyecto(orden?.proyectoId ?? "");
  const crearEtapa = useCrearEtapa();
  const actualizarEtapa = useActualizarEtapa();
  const registrarEntrega = useRegistrarEntrega();

  const [showEtapaForm, setShowEtapaForm] = useState(false);
  const [etapaForm, setEtapaForm] = useState({ nombre: "", responsable: "", fechaEstimada: "" });
  const [etapaMats, setEtapaMats] = useState<MaterialEtapa[]>([]);

  const [showEntregaForm, setShowEntregaForm] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistEntrega>({ medidas: false, acabados: false, estadoProducto: false, documentacion: false });
  const [entregaObs, setEntregaObs] = useState("");

  const [completandoId, setCompletandoId] = useState<string | null>(null);
  const [cantReales, setCantReales] = useState<Record<string, number>>({});
  const [obsCompletado, setObsCompletado] = useState("");

  const [obsEtapaId, setObsEtapaId] = useState<string | null>(null);
  const [obsForm, setObsForm] = useState({ descripcion: "", esRetrabajo: false });

  const puedeEditar = usuario?.esAdmin || usuario?.areas?.includes("produccion");

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Cargando...</div>;

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

  const spec = proyecto?.especificaciones?.at(-1);
  const etapas = orden.etapas;
  const entregas = orden.entregas;
  const todasCompletadas = etapas.length > 0 && etapas.every((e) => e.estado === "completada");
  const entregaRegistrada = entregas.length > 0;

  const stockDisp = (materialId: string) => stock.find((s) => s.id === materialId)?.disponible ?? 0;

  const handleCrearEtapa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!etapaForm.nombre.trim() || !etapaForm.responsable.trim() || !etapaForm.fechaEstimada)
      return toast.error("Completa todos los campos de la etapa.");
    try {
      await crearEtapa.mutateAsync({ ordenId: id, ...etapaForm, materiales: etapaMats.filter((m) => m.materialId && m.cantidad > 0) });
      toast.success("Etapa creada y materiales bloqueados.");
      setShowEtapaForm(false);
      setEtapaForm({ nombre: "", responsable: "", fechaEstimada: "" });
      setEtapaMats([]);
    } catch {
      toast.error("Error al crear la etapa.");
    }
  };

  const iniciarCompletar = (etapaId: string) => {
    const etapa = etapas.find((e) => e.id === etapaId);
    if (!etapa) return;
    const init: Record<string, number> = {};
    for (const m of etapa.materiales) init[m.materialId] = m.cantidad;
    setCantReales(init);
    setObsCompletado("");
    setCompletandoId(etapaId);
  };

  const confirmarCompletar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completandoId) return;
    try {
      await actualizarEtapa.mutateAsync({ id: completandoId, ordenId: id, completar: true, cantReales, observacion: obsCompletado || undefined });
      toast.success("Etapa completada. Materiales consumidos.");
      setCompletandoId(null);
    } catch {
      toast.error("Error al completar la etapa.");
    }
  };

  const guardarObservacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsEtapaId || !obsForm.descripcion.trim()) return toast.error("Escribe una descripción.");
    try {
      await actualizarEtapa.mutateAsync({ id: obsEtapaId, ordenId: id, agregarObservacion: obsForm });
      toast.success("Observación registrada.");
      setObsEtapaId(null);
      setObsForm({ descripcion: "", esRetrabajo: false });
    } catch {
      toast.error("Error al guardar la observación.");
    }
  };

  const handleRegistrarEntrega = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checklist.medidas || !checklist.acabados || !checklist.estadoProducto || !checklist.documentacion)
      return toast.error("Completa todos los ítems del checklist.");
    try {
      await registrarEntrega.mutateAsync({ ordenId: id, checklist, observaciones: entregaObs || undefined });
      toast.success("Entrega registrada. El proyecto ha sido marcado como Entregado.");
      setShowEntregaForm(false);
    } catch {
      toast.error("Error al registrar la entrega.");
    }
  };

  return (
    <div>
      <PageHeader
        title={orden.numero}
        description={`Proyecto ${proyecto?.codigo ?? orden.proyectoId} - ${proyecto?.tipo}`}
        crumbs={[{ label: "Producción", to: "/produccion" }, { label: orden.numero }]}
        actions={
          <Link to="/produccion" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold">Información de la orden</h3>
          <dl className="space-y-1 text-sm">
            <div><dt className="text-xs text-muted-foreground">Estado</dt><dd>{orden.estado}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Responsable</dt><dd>{orden.responsable}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Emisión</dt><dd>{orden.fechaEmision}</dd></div>
            {orden.notas && <div><dt className="text-xs text-muted-foreground">Notas</dt><dd>{orden.notas}</dd></div>}
          </dl>
        </div>

        {spec && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-2 text-sm font-semibold">Especificaciones (solo lectura)</h3>
            <dl className="space-y-1 text-sm">
              {spec.medidas && <div><dt className="text-xs text-muted-foreground">Medidas</dt><dd className="whitespace-pre-wrap">{spec.medidas}</dd></div>}
              {spec.materiales && <div><dt className="text-xs text-muted-foreground">Materiales</dt><dd className="whitespace-pre-wrap">{spec.materiales}</dd></div>}
              {spec.acabados && <div><dt className="text-xs text-muted-foreground">Acabados</dt><dd className="whitespace-pre-wrap">{spec.acabados}</dd></div>}
              {spec.observaciones && <div><dt className="text-xs text-muted-foreground">Obs.</dt><dd className="whitespace-pre-wrap">{spec.observaciones}</dd></div>}
              {!spec.medidas && !spec.materiales && !spec.acabados && spec.contenido && <dd className="whitespace-pre-wrap">{spec.contenido}</dd>}
            </dl>
          </div>
        )}
      </div>

      {/* Etapas */}
      <div className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Etapas de producción ({etapas.length})</h3>
          {puedeEditar && !entregaRegistrada && (
            <Button size="sm" onClick={() => setShowEtapaForm((v) => !v)}>
              <Plus className="h-3.5 w-3.5" /> {showEtapaForm ? "Cancelar" : "Agregar etapa"}
            </Button>
          )}
        </div>

        {showEtapaForm && (
          <form onSubmit={handleCrearEtapa} className="mb-4 space-y-4 rounded-lg border border-border bg-surface p-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Nombre de la etapa" required>
                <TextInput value={etapaForm.nombre} onChange={(e) => setEtapaForm({ ...etapaForm, nombre: e.target.value })} placeholder="Ej. Corte de piezas" />
              </Field>
              <Field label="Responsable" required>
                <TextInput value={etapaForm.responsable} onChange={(e) => setEtapaForm({ ...etapaForm, responsable: e.target.value })} />
              </Field>
              <Field label="Fecha estimada" required>
                <TextInput type="date" value={etapaForm.fechaEstimada} onChange={(e) => setEtapaForm({ ...etapaForm, fechaEstimada: e.target.value })} />
              </Field>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Materiales a bloquear para esta etapa</p>
                <button type="button" onClick={() => setEtapaMats([...etapaMats, { materialId: "", cantidad: 1 }])} className="text-xs text-primary hover:underline">+ Agregar material</button>
              </div>
              {etapaMats.length === 0 && <p className="text-xs text-muted-foreground">Sin materiales asignados (opcional).</p>}
              {etapaMats.map((m, i) => {
                const mat = stock.find((s) => s.id === m.materialId);
                const disp = m.materialId ? stockDisp(m.materialId) : 0;
                return (
                  <div key={i} className="mb-2 flex items-end gap-2">
                    <Field label={i === 0 ? "Material" : ""} className="flex-1">
                      <Select value={m.materialId} onChange={(e) => { const u = [...etapaMats]; u[i] = { ...u[i], materialId: e.target.value }; setEtapaMats(u); }}>
                        <option value="">Selecciona…</option>
                        {stock.map((s) => <option key={s.id} value={s.id}>{s.nombre} (disp: {s.disponible} {s.unidad})</option>)}
                      </Select>
                    </Field>
                    <Field label={i === 0 ? "Cantidad" : ""} className="w-28">
                      <TextInput type="number" min={0.01} step="0.01" value={m.cantidad} onChange={(e) => { const u = [...etapaMats]; u[i] = { ...u[i], cantidad: Number(e.target.value) }; setEtapaMats(u); }} />
                    </Field>
                    {mat && <span className="mb-2 text-xs text-muted-foreground">{mat.unidad}</span>}
                    {m.materialId && m.cantidad > disp && <span className="mb-2 text-xs text-warning">⚠ insuficiente</span>}
                    <button type="button" onClick={() => setEtapaMats(etapaMats.filter((_, idx) => idx !== i))} className="mb-2 text-muted-foreground hover:text-destructive">✕</button>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setShowEtapaForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={crearEtapa.isPending}>Agregar etapa</Button>
            </div>
          </form>
        )}

        {etapas.length === 0 ? (
          <EmptyState title="Sin etapas" description="Agrega la primera etapa de producción para este proyecto." />
        ) : (
          <div className="space-y-3">
            {etapas.map((etapa) => (
              <div key={etapa.id} className="rounded-lg border border-border bg-surface p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{etapa.nombre}</div>
                    <div className="text-xs text-muted-foreground">Responsable: {etapa.responsable} · Est: {etapa.fechaEstimada}</div>
                    {etapa.fechaCompletada && <div className="text-xs text-success">Completada: {etapa.fechaCompletada}</div>}

                    {etapa.materiales.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">Materiales:</p>
                        <ul className="mt-0.5 space-y-0.5 text-xs text-muted-foreground">
                          {etapa.materiales.map((m, i) => {
                            const mat = stock.find((s) => s.id === m.materialId);
                            return (
                              <li key={i}>
                                {mat?.nombre ?? m.materialId}: {m.cantidadReal ?? m.cantidad} {mat?.unidad}
                                {m.cantidadReal !== undefined && m.cantidadReal !== m.cantidad && <span className="ml-1 text-warning">(est. {m.cantidad})</span>}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {etapa.observaciones.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">Observaciones:</p>
                        <ul className="mt-0.5 space-y-1">
                          {etapa.observaciones.map((obs, i) => (
                            <li key={i} className={`rounded px-2 py-1 text-xs ${obs.esRetrabajo ? "bg-warning/10 text-warning-foreground" : "bg-muted/50"}`}>
                              {obs.esRetrabajo && <span className="mr-1 font-medium text-warning">⚠ Retrabajo</span>}
                              {obs.descripcion}
                              <span className="ml-1 text-muted-foreground">— {obs.responsable}, {obs.fecha}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {obsEtapaId === etapa.id && (
                      <form onSubmit={guardarObservacion} className="mt-2 space-y-2 rounded-md border border-border p-2">
                        <Field label="Descripción de la observación" required>
                          <TextInput value={obsForm.descripcion} onChange={(e) => setObsForm({ ...obsForm, descripcion: e.target.value })} placeholder="Ej. Se detectó humedad en el tablero" />
                        </Field>
                        <label className="flex items-center gap-2 text-xs">
                          <input type="checkbox" checked={obsForm.esRetrabajo} onChange={(e) => setObsForm({ ...obsForm, esRetrabajo: e.target.checked })} />
                          ¿Es un retrabajo?
                        </label>
                        <div className="flex gap-2">
                          <Button size="sm" type="submit" disabled={actualizarEtapa.isPending}>Guardar</Button>
                          <Button size="sm" variant="secondary" type="button" onClick={() => setObsEtapaId(null)}>Cancelar</Button>
                        </div>
                      </form>
                    )}

                    {completandoId === etapa.id && (
                      <form onSubmit={confirmarCompletar} className="mt-2 space-y-2 rounded-md border border-border p-2">
                        {etapa.materiales.length > 0 && (
                          <div>
                            <p className="mb-1 text-xs font-medium">Cantidades reales consumidas:</p>
                            {etapa.materiales.map((m) => {
                              const mat = stock.find((s) => s.id === m.materialId);
                              return (
                                <div key={m.materialId} className="mb-1 flex items-center gap-2">
                                  <span className="w-40 truncate text-xs">{mat?.nombre ?? m.materialId}</span>
                                  <TextInput type="number" min={0} step="0.01" className="w-24" value={cantReales[m.materialId] ?? m.cantidad} onChange={(e) => setCantReales({ ...cantReales, [m.materialId]: Number(e.target.value) })} />
                                  <span className="text-xs text-muted-foreground">{mat?.unidad}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <Field label="Observación (opcional)">
                          <TextInput value={obsCompletado} onChange={(e) => setObsCompletado(e.target.value)} placeholder="Notas sobre el consumo…" />
                        </Field>
                        <div className="flex gap-2">
                          <Button size="sm" type="submit" disabled={actualizarEtapa.isPending}><Check className="h-3.5 w-3.5" /> Confirmar</Button>
                          <Button size="sm" variant="secondary" type="button" onClick={() => setCompletandoId(null)}>Cancelar</Button>
                        </div>
                      </form>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${etapa.estado === "completada" ? "bg-green-100 text-green-800" : etapa.estado === "en_curso" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                      {etapa.estado}
                    </span>
                    {puedeEditar && etapa.estado !== "completada" && (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => iniciarCompletar(etapa.id)}><Check className="h-3.5 w-3.5" /> Completar</Button>
                        <Button size="sm" variant="secondary" onClick={() => { setObsEtapaId(obsEtapaId === etapa.id ? null : etapa.id); setObsForm({ descripcion: "", esRetrabajo: false }); }}>
                          <MessageSquare className="h-3.5 w-3.5" /> Observación
                        </Button>
                      </>
                    )}
                    {puedeEditar && etapa.estado === "completada" && (
                      <Button size="sm" variant="secondary" onClick={() => { setObsEtapaId(obsEtapaId === etapa.id ? null : etapa.id); setObsForm({ descripcion: "", esRetrabajo: false }); }}>
                        <MessageSquare className="h-3.5 w-3.5" /> Observación
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {puedeEditar && todasCompletadas && !entregaRegistrada && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Checklist de entrega</h3>
            <Button size="sm" onClick={() => setShowEntregaForm((v) => !v)}>{showEntregaForm ? "Cancelar" : "Registrar entrega"}</Button>
          </div>
          {showEntregaForm && (
            <form onSubmit={handleRegistrarEntrega} className="space-y-4 rounded-lg border border-border bg-surface p-4">
              <div className="space-y-2">
                {([["medidas", "Medidas verificadas"], ["acabados", "Acabados verificados"], ["estadoProducto", "Estado del producto OK"], ["documentacion", "Documentación completa"]] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={checklist[key]} onChange={(e) => setChecklist({ ...checklist, [key]: e.target.checked })} />
                    {label}
                  </label>
                ))}
              </div>
              <Field label="Observaciones adicionales">
                <TextInput value={entregaObs} onChange={(e) => setEntregaObs(e.target.value)} />
              </Field>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" type="button" onClick={() => setShowEntregaForm(false)}>Cancelar</Button>
                <Button type="submit" disabled={registrarEntrega.isPending}>Confirmar entrega</Button>
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
