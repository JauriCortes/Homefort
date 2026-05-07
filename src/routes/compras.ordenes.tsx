import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { store, formatCOP } from "@/lib/store";
import { useStore, useUsuarioActivo } from "@/hooks/use-store";
import { PageHeader, EmptyState, ErrorBanner, SuccessBanner } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";

export const Route = createFileRoute("/compras/ordenes")({
  component: OrdenesCompraPage,
});

function OrdenesCompraPage() {
  const usuario = useUsuarioActivo();
  const ordenes = useStore((s) => s.ordenesCompra);
  const proyectos = useStore((s) => s.proyectos);
  const proveedores = useStore((s) => s.proveedores);
  const materiales = useStore((s) => s.materialesBase);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ proyectoId: "", proveedorId: "", fechaEntregaEstimada: "", notas: "" });
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pendingChange, setPendingChange] = useState<{ id: string; estado: string } | null>(null);
  const puedeEditar = usuario.esAdmin || usuario.areas.includes("compras");

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.proyectoId || !form.proveedorId || !form.fechaEntregaEstimada) return setError("Completa todos los campos obligatorios.");
    store.crearOrdenCompra({ proyectoId: form.proyectoId, proveedorId: form.proveedorId, fechaEntregaEstimada: form.fechaEntregaEstimada, items: [], notas: form.notas || undefined });
    setOk("Orden de compra creada.");
    setShowForm(false);
    setForm({ proyectoId: "", proveedorId: "", fechaEntregaEstimada: "", notas: "" });
    setTimeout(() => setOk(null), 2500);
  };

  return (
    <div>
      <PageHeader
        title="Órdenes de compra"
        crumbs={[{ label: "Compras" }, { label: "Órdenes" }]}
        actions={puedeEditar ? <Button onClick={() => setShowForm((v) => !v)}><Plus className="h-4 w-4" /> {showForm ? "Cancelar" : "Nueva orden"}</Button> : undefined}
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
            <Field label="Proveedor" required>
              <Select value={form.proveedorId} onChange={(e) => setForm({ ...form, proveedorId: e.target.value })}>
                <option value="">Selecciona...</option>
                {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </Select>
            </Field>
            <Field label="Fecha entrega estimada" required>
              <TextInput type="date" value={form.fechaEntregaEstimada} onChange={(e) => setForm({ ...form, fechaEntregaEstimada: e.target.value })} />
            </Field>
            <Field label="Notas">
              <TextInput value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit">Crear orden</Button>
          </div>
        </form>
      )}
      {ordenes.length === 0 ? (
        <EmptyState title="Sin ordenes de compra" description="Crea la primera orden." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Codigo</th>
                <th className="px-3 py-2 text-left font-medium">Proyecto</th>
                <th className="px-3 py-2 text-left font-medium">Proveedor</th>
                <th className="px-3 py-2 text-left font-medium">Entrega est.</th>
                <th className="px-3 py-2 text-left font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => {
                const proy = proyectos.find((p) => p.id === o.proyectoId);
                const prov = proveedores.find((p) => p.id === o.proveedorId);
                return (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{o.codigo}</td>
                    <td className="px-3 py-2 text-muted-foreground">{proy?.codigo ?? o.proyectoId}</td>
                    <td className="px-3 py-2 text-muted-foreground">{prov?.nombre ?? o.proveedorId}</td>
                    <td className="px-3 py-2 text-muted-foreground">{o.fechaEntregaEstimada}</td>
                    <td className="px-3 py-2">
                      <select
                        value={o.estado}
                        onChange={(ev) => {
                          const next = ev.target.value;
                          if (next === "cancelada") {
                            setPendingChange({ id: o.id, estado: next });
                          } else {
                            store.actualizarOrdenCompra(o.id, { estado: next as any });
                          }
                        }}
                        className="rounded border border-border bg-surface px-2 py-0.5 text-xs"
                      >
                        <option value="borrador">Borrador</option>
                        <option value="enviada">Enviada</option>
                        <option value="recibida">Recibida</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {pendingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-5 shadow-xl">
            <h2 className="text-sm font-semibold text-foreground">¿Cancelar orden de compra?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta acción cambiará el estado a <strong>Cancelada</strong>. No podrá revertirse fácilmente.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setPendingChange(null)}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Mantener estado
              </button>
              <button
                onClick={() => {
                  store.actualizarOrdenCompra(pendingChange.id, { estado: pendingChange.estado as any });
                  setPendingChange(null);
                }}
                className="rounded-md bg-destructive px-3 py-1.5 text-sm text-destructive-foreground hover:bg-destructive/90"
              >
                Sí, cancelar orden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
