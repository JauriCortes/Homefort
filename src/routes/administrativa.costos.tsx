import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { store, formatCOP } from "@/lib/store";
import { useStore, useUsuarioActivo } from "@/hooks/use-store";
import { PageHeader, ErrorBanner, SuccessBanner } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";

export const Route = createFileRoute("/administrativa/costos")({
  component: CostosPage,
});

function CostosPage() {
  const usuario = useUsuarioActivo();
  const proyectos = useStore((s) => s.proyectos);
  const ajustes = useStore((s) => s.ajustesCosto);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ proyectoId: "", concepto: "", monto: 0 });
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const puedeEditar = usuario.esAdmin || usuario.areas.includes("administrativa");

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.proyectoId) return setError("Selecciona un proyecto.");
    if (!form.concepto.trim()) return setError("El concepto es obligatorio.");
    store.ajustesCosto = [...store.ajustesCosto, { id: `aj_${Date.now()}`, proyectoId: form.proyectoId, fecha: new Date().toISOString().slice(0, 10), concepto: form.concepto, monto: Number(form.monto), registradoPor: usuario.nombre }];
    store.emit();
    setOk("Ajuste registrado.");
    setShowForm(false);
    setForm({ proyectoId: "", concepto: "", monto: 0 });
    setTimeout(() => setOk(null), 2500);
  };

  return (
    <div>
      <PageHeader
        title="Costos"
        description="Comparativo de costos cotizados vs reales por proyecto."
        crumbs={[{ label: "Administrativa" }, { label: "Costos" }]}
        actions={puedeEditar ? <Button onClick={() => setShowForm((v) => !v)}><Plus className="h-4 w-4" /> {showForm ? "Cancelar" : "Ajuste manual"}</Button> : undefined}
      />
      {ok && <SuccessBanner>{ok}</SuccessBanner>}
      {showForm && (
        <form onSubmit={guardar} className="mb-4 space-y-4 rounded-lg border border-border bg-surface p-4">
          {error && <ErrorBanner>{error}</ErrorBanner>}
          <Field label="Proyecto" required>
            <Select value={form.proyectoId} onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}>
              <option value="">Selecciona...</option>
              {proyectos.map((p) => <option key={p.id} value={p.id}>{p.codigo} - {p.tipo}</option>)}
            </Select>
          </Field>
          <Field label="Concepto" required><TextInput value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} /></Field>
          <Field label="Monto (COP)" required><TextInput type="number" value={form.monto || ""} onChange={(e) => setForm({ ...form, monto: Number(e.target.value) })} /></Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit">Guardar ajuste</Button>
          </div>
        </form>
      )}
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Proyecto</th>
              <th className="px-3 py-2 text-right font-medium">Cotizado</th>
              <th className="px-3 py-2 text-right font-medium">Costo real</th>
              <th className="px-3 py-2 text-right font-medium">Desviacion</th>
            </tr>
          </thead>
          <tbody>
            {proyectos.filter((p) => p.cotizaciones.length > 0).map((p) => {
              const cotizado = p.cotizaciones.at(-1)?.total ?? 0;
              const costoReal = store.costoRealProyecto(p.id);
              const desviacion = costoReal - cotizado;
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{p.codigo}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCOP(cotizado)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCOP(costoReal)}</td>
                  <td className={`px-3 py-2 text-right tabular-nums font-medium ${desviacion > 0 ? "text-destructive" : desviacion < 0 ? "text-success" : ""}`}>
                    {desviacion !== 0 ? `${desviacion > 0 ? "+" : ""}${formatCOP(desviacion)}` : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
