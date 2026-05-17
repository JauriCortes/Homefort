import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useMe } from "@/hooks/api/use-auth";
import { useProyectos } from "@/hooks/api/use-comercial";
import { useTransportes, useCrearTransporte, useActualizarTransporte } from "@/hooks/api/use-administrativa";
import type { RecursoTransporte } from "@/hooks/api/use-administrativa";
import { PageHeader, EmptyState, ErrorBanner } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";
import { toast } from "sonner";

export const Route = createFileRoute("/administrativa/transporte")({
  component: TransportePage,
});

function TransportePage() {
  const { data: usuario } = useMe();
  const { data: transportes = [] } = useTransportes();
  const { data: proyectos = [] } = useProyectos();
  const crearTransporte = useCrearTransporte();
  const actualizarTransporte = useActualizarTransporte();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ proyectoId: "", fechaProgramada: "", responsable: "", vehiculo: "", direccionDestino: "", observaciones: "" });
  const [error, setError] = useState<string | null>(null);

  const puedeEditar = usuario?.esAdmin || usuario?.areas?.includes("administrativa");

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.proyectoId || !form.fechaProgramada || !form.responsable || !form.vehiculo || !form.direccionDestino)
      return setError("Completa todos los campos obligatorios.");
    try {
      await crearTransporte.mutateAsync(form);
      toast.success("Transporte programado.");
      setShowForm(false);
      setForm({ proyectoId: "", fechaProgramada: "", responsable: "", vehiculo: "", direccionDestino: "", observaciones: "" });
    } catch {
      toast.error("Error al programar el transporte.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Transporte"
        crumbs={[{ label: "Administrativa" }, { label: "Transporte" }]}
        actions={
          puedeEditar ? (
            <Button onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-4 w-4" /> {showForm ? "Cancelar" : "Nuevo"}
            </Button>
          ) : undefined
        }
      />
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
            <Field label="Fecha programada" required>
              <TextInput type="date" value={form.fechaProgramada} onChange={(e) => setForm({ ...form, fechaProgramada: e.target.value })} />
            </Field>
            <Field label="Responsable" required>
              <TextInput value={form.responsable} onChange={(e) => setForm({ ...form, responsable: e.target.value })} />
            </Field>
            <Field label="Vehículo" required>
              <TextInput value={form.vehiculo} onChange={(e) => setForm({ ...form, vehiculo: e.target.value })} />
            </Field>
            <Field label="Dirección destino" required>
              <TextInput value={form.direccionDestino} onChange={(e) => setForm({ ...form, direccionDestino: e.target.value })} />
            </Field>
            <Field label="Observaciones">
              <TextInput value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" disabled={crearTransporte.isPending}>Programar</Button>
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
                    <div className="text-xs text-muted-foreground">{t.fechaProgramada} — {t.vehiculo} / {t.responsable}</div>
                    <div className="text-xs text-muted-foreground">{t.direccionDestino}</div>
                  </div>
                  <select
                    value={t.estado}
                    disabled={!puedeEditar}
                    onChange={(ev) => actualizarTransporte.mutate({ id: t.id, estado: ev.target.value as RecursoTransporte["estado"] })}
                    className="rounded border border-border bg-surface px-2 py-0.5 text-xs"
                  >
                    <option>Programada</option>
                    <option>En tránsito</option>
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
