import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { store } from "@/lib/store";
import { useStore, useUsuarioActivo } from "@/hooks/use-store";
import { PageHeader, EmptyState, ErrorBanner, SuccessBanner } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";

export const Route = createFileRoute("/administrativa/ordenes-produccion")({
  component: OrdenesProduccionPage,
});

function OrdenesProduccionPage() {
  const usuario = useUsuarioActivo();
  const ordenes = useStore((s) => s.ordenesProduccion);
  const proyectos = useStore((s) => s.proyectos);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ proyectoId: "", cotizacionId: "", responsable: "", notas: "" });
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const puedeEditar = usuario.esAdmin || usuario.areas.includes("administrativa");

  const proyectosAprobados = proyectos.filter((p) => p.estado === "Aprobada");

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.proyectoId) return setError("Selecciona un proyecto.");
    if (!form.responsable.trim()) return setError("El responsable es obligatorio.");
    const proy = proyectos.find((p) => p.id === form.proyectoId);
    const cotId = form.cotizacionId || proy?.cotizaciones.at(-1)?.id || "";
    store.crearOrdenProduccion({ proyectoId: form.proyectoId, cotizacionId: cotId, responsable: form.responsable, notas: form.notas || undefined });
    store.actualizarEstadoProyecto(form.proyectoId, "En producción");
    setOk("Orden de produccion creada.");
    setShowForm(false);
    setForm({ proyectoId: "", cotizacionId: "", responsable: "", notas: "" });
    setTimeout(() => setOk(null), 2500);
  };

  return (
    <div>
      <PageHeader
        title="Ordenes de produccion"
        crumbs={[{ label: "Administrativa" }, { label: "Ordenes produccion" }]}
        actions={puedeEditar && proyectosAprobados.length > 0 ? <Button onClick={() => setShowForm((v) => !v)}><Plus className="h-4 w-4" /> {showForm ? "Cancelar" : "Nueva orden"}</Button> : undefined}
      />
      {ok && <SuccessBanner>{ok}</SuccessBanner>}
      {showForm && (
        <form onSubmit={guardar} className="mb-4 space-y-4 rounded-lg border border-border bg-surface p-4">
          {error && <ErrorBanner>{error}</ErrorBanner>}
          <Field label="Proyecto aprobado" required>
            <Select value={form.proyectoId} onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}>
              <option value="">Selecciona...</option>
              {proyectosAprobados.map((p) => <option key={p.id} value={p.id}>{p.codigo} - {p.tipo}</option>)}
            </Select>
          </Field>
          <Field label="Responsable" required>
            <TextInput value={form.responsable} onChange={(e) => setForm({ ...form, responsable: e.target.value })} placeholder="Nombre del responsable" />
          </Field>
          <Field label="Notas">
            <TextInput value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit">Crear orden</Button>
          </div>
        </form>
      )}
      {ordenes.length === 0 ? (
        <EmptyState title="Sin ordenes de produccion" description={proyectosAprobados.length === 0 ? "No hay proyectos aprobados pendientes de orden." : "Crea la primera orden de produccion."} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Numero</th>
                <th className="px-3 py-2 text-left font-medium">Proyecto</th>
                <th className="px-3 py-2 text-left font-medium">Responsable</th>
                <th className="px-3 py-2 text-left font-medium">Emision</th>
                <th className="px-3 py-2 text-left font-medium">Estado</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => {
                const proy = proyectos.find((p) => p.id === o.proyectoId);
                return (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{o.numero}</td>
                    <td className="px-3 py-2 text-muted-foreground">{proy?.codigo ?? o.proyectoId}</td>
                    <td className="px-3 py-2">{o.responsable}</td>
                    <td className="px-3 py-2 text-muted-foreground">{o.fechaEmision}</td>
                    <td className="px-3 py-2">
                      <select value={o.estado} onChange={(ev) => store.actualizarOrdenProduccion(o.id, { estado: ev.target.value as any })} className="rounded border border-border bg-surface px-2 py-0.5 text-xs">
                        <option>Emitida</option>
                        <option>En produccion</option>
                        <option>Finalizada</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <Link to="/produccion/ordenes/$id" params={{ id: o.id }} className="text-xs text-primary hover:underline">Ver</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
