import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useMe } from "@/hooks/api/use-auth";
import { useProyectos } from "@/hooks/api/use-comercial";
import { useCrearAjusteCosto, useResumenCostos } from "@/hooks/api/use-administrativa";
import { PageHeader, ErrorBanner } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";
import { toast } from "sonner";

export const Route = createFileRoute("/administrativa/costos")({
  component: CostosPage,
});

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

function CostosPage() {
  const { data: usuario } = useMe();
  const { data: proyectos = [] } = useProyectos();
  const { data: resumen = [] } = useResumenCostos();
  const crearAjuste = useCrearAjusteCosto();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ proyectoId: "", concepto: "", monto: 0 });
  const [error, setError] = useState<string | null>(null);

  const puedeEditar = usuario?.esAdmin || usuario?.areas?.includes("administrativa");

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.proyectoId) return setError("Selecciona un proyecto.");
    if (!form.concepto.trim()) return setError("El concepto es obligatorio.");
    try {
      await crearAjuste.mutateAsync({ proyectoId: form.proyectoId, concepto: form.concepto, monto: Number(form.monto) });
      toast.success("Ajuste registrado.");
      setShowForm(false);
      setForm({ proyectoId: "", concepto: "", monto: 0 });
    } catch {
      toast.error("Error al registrar el ajuste.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Costos"
        description="Comparativo de costos cotizados vs reales por proyecto."
        crumbs={[{ label: "Administrativa" }, { label: "Costos" }]}
        actions={
          puedeEditar ? (
            <Button onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-4 w-4" /> {showForm ? "Cancelar" : "Ajuste manual"}
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
              {proyectos.map((p) => <option key={p.id} value={p.id}>{p.codigo} - {p.tipo}</option>)}
            </Select>
          </Field>
          <Field label="Concepto" required>
            <TextInput value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} />
          </Field>
          <Field label="Monto (COP)" required>
            <TextInput type="number" min={0} step="1" value={form.monto || ""} onChange={(e) => setForm({ ...form, monto: Number(e.target.value) })} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" disabled={crearAjuste.isPending}>Guardar ajuste</Button>
          </div>
        </form>
      )}
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Proyecto</th>
              <th className="px-3 py-2 text-left font-medium">Estado</th>
              <th className="px-3 py-2 text-right font-medium">Cotizado</th>
              <th className="px-3 py-2 text-right font-medium">Costo real</th>
              <th className="px-3 py-2 text-right font-medium">Desviación</th>
            </tr>
          </thead>
          <tbody>
            {resumen.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Sin datos de costos disponibles.
                </td>
              </tr>
            ) : (
              resumen.map((r) => {
                const desviacion = r.costoReal - r.cotizado;
                return (
                  <tr key={r.proyectoId} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{r.codigo}</td>
                    <td className="px-3 py-2 text-muted-foreground text-xs">{r.estado}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatCOP(r.cotizado)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatCOP(r.costoReal)}</td>
                    <td className={`px-3 py-2 text-right tabular-nums font-medium ${desviacion > 0 ? "text-destructive" : desviacion < 0 ? "text-success" : ""}`}>
                      {desviacion !== 0 ? `${desviacion > 0 ? "+" : ""}${formatCOP(desviacion)}` : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
