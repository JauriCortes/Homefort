import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { formatCOP } from "@/lib/store";
import { useMe } from "@/hooks/api/use-auth";
import { useStock, useProveedores, useRegistrarMovimiento } from "@/hooks/api/use-compras";
import { PageHeader, ErrorBanner, SuccessBanner } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";

export const Route = createFileRoute("/compras/inventario")({
  component: InventarioPage,
});

function InventarioPage() {
  const { data: usuario } = useMe();
  const { data: stocks = [] } = useStock();
  const { data: proveedores = [] } = useProveedores();
  const registrar = useRegistrarMovimiento();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ materialId: "", cantidad: 1, proveedorId: "", notas: "" });
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const puedeEditar = (usuario?.esAdmin || usuario?.areas.includes("compras")) ?? false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.materialId) return setError("Selecciona un material.");
    if (form.cantidad <= 0) return setError("La cantidad debe ser mayor a 0.");
    registrar.mutate(
      {
        materialId: form.materialId,
        tipo: "entrada",
        cantidad: Number(form.cantidad),
        fecha: new Date().toISOString().slice(0, 10),
        proveedorId: form.proveedorId || null,
        proyectoId: null,
        notas: form.notas || null,
      },
      {
        onSuccess: () => {
          setOk("Entrada registrada.");
          setForm({ materialId: "", cantidad: 1, proveedorId: "", notas: "" });
          setShowForm(false);
          setTimeout(() => setOk(null), 2500);
        },
        onError: () => setError("No se pudo registrar la entrada. Intenta nuevamente."),
      },
    );
  };

  return (
    <div>
      <PageHeader
        title="Inventario"
        description="Stock por material basado en movimientos registrados."
        crumbs={[{ label: "Compras" }, { label: "Inventario" }]}
        actions={
          puedeEditar ? (
            <Button onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-4 w-4" /> {showForm ? "Cancelar" : "Registrar entrada"}
            </Button>
          ) : undefined
        }
      />
      {ok && <SuccessBanner>{ok}</SuccessBanner>}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-4 space-y-4 rounded-lg border border-border bg-surface p-4"
        >
          {error && <ErrorBanner>{error}</ErrorBanner>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Material" required>
              <Select
                value={form.materialId}
                onChange={(e) => setForm({ ...form, materialId: e.target.value })}
              >
                <option value="">Selecciona...</option>
                {stocks.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} ({m.unidad})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Cantidad" required>
              <TextInput
                type="number"
                min={0.01}
                step="0.01"
                value={form.cantidad}
                onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })}
              />
            </Field>
            <Field label="Proveedor">
              <Select
                value={form.proveedorId}
                onChange={(e) => setForm({ ...form, proveedorId: e.target.value })}
              >
                <option value="">Sin proveedor</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Notas">
              <TextInput
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={registrar.isPending}>
              {registrar.isPending ? "Guardando…" : "Guardar entrada"}
            </Button>
          </div>
        </form>
      )}
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Material</th>
              <th className="px-3 py-2 text-left font-medium">Categoría</th>
              <th className="px-3 py-2 text-left font-medium">Unidad</th>
              <th className="px-3 py-2 text-right font-medium">Disponible</th>
              <th className="px-3 py-2 text-right font-medium">Bloqueado</th>
              <th className="px-3 py-2 text-right font-medium">Consumido</th>
              <th className="px-3 py-2 text-right font-medium">Costo unit.</th>
            </tr>
          </thead>
          <tbody>
            {stocks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground text-sm">
                  No hay materiales registrados.
                </td>
              </tr>
            ) : (
              stocks.map((m) => (
                <tr key={m.id} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">
                    <div className="flex items-center gap-1">
                      {m.disponible <= 0 && (
                        <AlertTriangle className="h-3.5 w-3.5 text-warning-foreground" />
                      )}
                      {m.nombre}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{m.categoria}</td>
                  <td className="px-3 py-2 text-muted-foreground">{m.unidad}</td>
                  <td
                    className={`px-3 py-2 text-right tabular-nums font-medium ${m.disponible <= 0 ? "text-destructive" : "text-success"}`}
                  >
                    {m.disponible}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {m.bloqueado}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {m.consumido}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatCOP(m.costoUnitario)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
