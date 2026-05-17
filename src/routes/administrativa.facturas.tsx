import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useMe } from "@/hooks/api/use-auth";
import { useProyectos, useClientes } from "@/hooks/api/use-comercial";
import { useFacturas, useCrearFactura } from "@/hooks/api/use-administrativa";
import { PageHeader, EmptyState, ErrorBanner } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";
import { toast } from "sonner";

export const Route = createFileRoute("/administrativa/facturas")({
  component: FacturasPage,
});

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

function FacturasPage() {
  const { data: usuario } = useMe();
  const { data: facturas = [] } = useFacturas();
  const { data: proyectos = [] } = useProyectos();
  const { data: clientes = [] } = useClientes();
  const crearFactura = useCrearFactura();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ proyectoId: "", fechaVencimiento: "", condicionesPago: "" });
  const [error, setError] = useState<string | null>(null);

  const puedeEditar = usuario?.esAdmin || usuario?.areas?.includes("administrativa");
  const estados = ["Aprobada", "En producción", "Entregado", "En garantía"];
  const proyectosFacturables = proyectos.filter((p) => estados.includes(p.estado));

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.proyectoId) return setError("Selecciona un proyecto.");
    if (!form.fechaVencimiento) return setError("La fecha de vencimiento es obligatoria.");
    try {
      await crearFactura.mutateAsync({
        proyectoId: form.proyectoId,
        fechaVencimiento: form.fechaVencimiento,
        condicionesPago: form.condicionesPago || undefined,
      });
      toast.success("Factura creada.");
      setShowForm(false);
      setForm({ proyectoId: "", fechaVencimiento: "", condicionesPago: "" });
    } catch {
      toast.error("Error al crear la factura.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Facturas"
        crumbs={[{ label: "Administrativa" }, { label: "Facturas" }]}
        actions={
          puedeEditar ? (
            <Button onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-4 w-4" /> {showForm ? "Cancelar" : "Nueva factura"}
            </Button>
          ) : undefined
        }
      />
      {showForm && (
        <form onSubmit={guardar} className="mb-4 space-y-4 rounded-lg border border-border bg-surface p-4">
          {error && <ErrorBanner>{error}</ErrorBanner>}
          <Field label="Proyecto" required>
            <Select value={form.proyectoId} onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}>
              <option value="">Selecciona...</option>
              {proyectosFacturables.map((p) => (
                <option key={p.id} value={p.id}>{p.codigo} — {p.titulo}</option>
              ))}
            </Select>
          </Field>
          <Field label="Fecha vencimiento" required>
            <TextInput type="date" value={form.fechaVencimiento} onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })} />
          </Field>
          <Field label="Condiciones de pago">
            <TextInput value={form.condicionesPago} onChange={(e) => setForm({ ...form, condicionesPago: e.target.value })} placeholder="Se tomará de la cotización si no se especifica" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" disabled={crearFactura.isPending}>Crear factura</Button>
          </div>
        </form>
      )}
      {facturas.length === 0 ? (
        <EmptyState title="Sin facturas" description="Crea la primera factura desde una cotización aprobada." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Número</th>
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
                    <td className="px-3 py-2 text-muted-foreground">{cliente?.nombre ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatCOP(f.monto)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{f.fechaVencimiento}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs rounded-full px-2 py-0.5 ${f.estado === "Pagada" ? "bg-green-100 text-green-800" : f.estado === "Anulada" ? "bg-red-100 text-red-800" : f.estado === "Parcialmente pagada" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {f.estado}
                      </span>
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
