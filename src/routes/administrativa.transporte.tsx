import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { store, type EstadoTransporte } from "@/lib/store";
import { useStore, useUsuarioActivo } from "@/hooks/use-store";
import { PageHeader, EmptyState, ErrorBanner, SuccessBanner } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";

export const Route = createFileRoute("/administrativa/transporte")({
  component: TransportePage,
});

function TransportePage() {
  const usuario = useUsuarioActivo();
  const transportes = useStore((s) => s.transportes);
  const proyectos = useStore((s) => s.proyectos);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ proyectoId: "", fechaProgramada: "", responsable: "", vehiculo: "", direccionDestino: "", observaciones: "" });
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const puedeEditar = usuario.esAdmin || usuario.areas.includes("administrativa");

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.proyectoId || !form.fechaProgramada || !form.responsable || !form.vehiculo || !form.direccionDestino) return setError("Completa todos los campos obligatorios.");
    store.transportes = [...store.transportes, { id: `tr_${Date.now()}`, ...form, estado: "Programada" as EstadoTransporte }];
    store.emit();
    setOk("Transporte programado.");
    setShowForm(false);
    setForm({ proyectoId: "", fechaProgramada: "", responsable: "", vehiculo: "", direccionDestino: "", observaciones: "" });
    setTimeout(() => setOk(null), 2500);
  };

  return (
    <div>
      <PageHeader
        title="Transporte"
        crumbs={[{ label: "Administrativa" }, { label: "Transporte" }]}
        actions={puedeEditar ? <Button onClick={() => setShowForm((v) => !v)}><Plus className="h-4 w-4" /> {showForm ? "Cancelar" : "Nuevo"}</Button> : undefined}
      />
      {ok && <SuccessBanner>{ok}</SuccessBanner>}
      {showForm && (
        <form onSubmit={guardar} className="mb-4 space-y-4 rounded-lg border border-border bg-surface p-4">
          {error && <ErrorBanner>{error}</ErrorBanner>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Proyecto" required>
              <Select value={form.proyectoId} onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}>
                <option value="">Selecciona...</option>
                {proyectos.map((p) => <option key={p.id} value={p.id}>{p.codigo} - {p.tipo}</option>)}
              </Select>
            </Field>
            <Field label="Fecha programada" required><TextInput type="date" value={form.fechaProgramada} onChange={(e) => setForm({ ...form, fechaProgramada: e.target.value })} /></Field>
            <Field label="Responsable" required><TextInput value={form.responsable} onChange={(e) => setForm({ ...form, responsable: e.target.value })} /></Field>
            <Field label="Vehiculo" required><TextInput value={form.vehiculo} onChange={(e) => setForm({ ...form, vehiculo: e.target.value })} /></Field>
            <Field label="Direccion destino" required><TextInput value={form.direccionDestino} onChange={(e) => setForm({ ...form, direccionDestino: e.target.value })} /></Field>
            <Field label="Observaciones"><TextInput value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} /></Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit">Programar</Button>
          </div>
        </form>
      )}
      {transportes.length === 0 ? (
        <EmptyState title="Sin transportes" description="Programa el primer transporte." />
      ) : (
        <div className="space-y-3">
          {transportes.map((t) => {
            const proy = proyectos.find((p) => p.id === t.proyectoId);
            return (
              <div key={t.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{proy?.codigo ?? t.proyectoId}</div>
                    <div className="text-xs text-muted-foreground">{t.fechaProgramada} - {t.vehiculo} / {t.responsable}</div>
                    <div className="text-xs text-muted-foreground">{t.direccionDestino}</div>
                  </div>
                  <select value={t.estado} onChange={(ev) => { store.transportes = store.transportes.map((x) => x.id === t.id ? { ...x, estado: ev.target.value as EstadoTransporte } : x); store.emit(); }} className="rounded border border-border bg-surface px-2 py-0.5 text-xs">
                    <option>Programada</option>
                    <option>En transito</option>
                    <option>Entregada</option>
                    <option>Cancelada</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
