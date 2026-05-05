import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { store, formatCOP } from "@/lib/store";
import { useStore, useUsuarioActivo } from "@/hooks/use-store";
import { PageHeader, EmptyState, ErrorBanner, SuccessBanner } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";

export const Route = createFileRoute("/administrativa/facturas")({
  component: FacturasPage,
});

function FacturasPage() {
  const usuario = useUsuarioActivo();
  const facturas = useStore((s) => s.facturas);
  const proyectos = useStore((s) => s.proyectos);
  const clientes = useStore((s) => s.clientes);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ proyectoId: "", fechaVencimiento: "", condicionesPago: "" });
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const puedeEditar = usuario.esAdmin || usuario.areas.includes("administrativa");

  const proyectosConCotizacion = proyectos.filter((p) => p.cotizaciones.length > 0);

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.proyectoId) return setError("Selecciona un proyecto.");
    if (!form.fechaVencimiento) return setError("La fecha de vencimiento es obligatoria.");
    const proy = proyectos.find((p) => p.id === form.proyectoId);
    if (!proy) return;
    const cot = proy.cotizaciones.at(-1);
    if (!cot) return setError("El proyecto no tiene cotizacion.");
    store.crearFactura({
      proyectoId: form.proyectoId,
      cotizacionId: cot.id,
      clienteId: proy.clienteId,
      fechaEmision: new Date().toISOString().slice(0, 10),
      fechaVencimiento: form.fechaVencimiento,
      monto: cot.total,
      condicionesPago: form.condicionesPago || cot.condicionesPago,
    });
    setOk("Factura creada.");
    setShowForm(false);
    setForm({ proyectoId: "", fechaVencimiento: "", condicionesPago: "" });
    setTimeout(() => setOk(null), 2500);
  };

  return (
    <div>
      <PageHeader
        title="Facturas"
        crumbs={[{ label: "Administrativa" }, { label: "Facturas" }]}
        actions={puedeEditar ? <Button onClick={() => setShowForm((v) => !v)}><Plus className="h-4 w-4" /> {showForm ? "Cancelar" : "Nueva factura"}</Button> : undefined}
      />
      {ok && <SuccessBanner>{ok}</SuccessBanner>}
      {showForm && (
        <form onSubmit={guardar} className="mb-4 space-y-4 rounded-lg border border-border bg-surface p-4">
          {error && <ErrorBanner>{error}</ErrorBanner>}
          <Field label="Proyecto" required>
            <Select value={form.proyectoId} onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}>
              <option value="">Selecciona...</option>
              {proyectosConCotizacion.map((p) => {
                const cot = p.cotizaciones.at(-1)!;
                return <option key={p.id} value={p.id}>{p.codigo} - {formatCOP(cot.total)}</option>;
              })}
            </Select>
          </Field>
          <Field label="Fecha vencimiento" required>
            <TextInput type="date" value={form.fechaVencimiento} onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })} />
          </Field>
          <Field label="Condiciones de pago">
            <TextInput value={form.condicionesPago} onChange={(e) => setForm({ ...form, condicionesPago: e.target.value })} placeholder="Se tomara de la cotizacion si no se especifica" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit">Crear factura</Button>
          </div>
        </form>
      )}
      {facturas.length === 0 ? (
        <EmptyState title="Sin facturas" description="Crea la primera factura desde una cotizacion aprobada." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Numero</th>
                <th className="px-3 py-2 text-left font-medium">Cliente</th>
                <th className="px-3 py-2 text-right font-medium">Monto</th>
                <th className="px-3 py-2 text-left font-medium">Vencimiento</th>
                <th className="px-3 py-2 text-left font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f) => {
                const cliente = clientes.find((c) => c.id === f.clienteId);
                return (
                  <tr key={f.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{f.numero}</td>
                    <td className="px-3 py-2 text-muted-foreground">{cliente?.nombre ?? "Eliminado"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatCOP(f.monto)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{f.fechaVencimiento}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs rounded-full px-2 py-0.5 ${f.estado === "Pagada" ? "bg-green-100 text-green-800" : f.estado === "Anulada" ? "bg-red-100 text-red-800" : f.estado === "Parcialmente pagada" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>{f.estado}</span>
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
