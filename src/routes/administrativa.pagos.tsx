import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { store, formatCOP, type TipoPago } from "@/lib/store";
import { useStore, useUsuarioActivo } from "@/hooks/use-store";
import { PageHeader, EmptyState, ErrorBanner, SuccessBanner } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";

export const Route = createFileRoute("/administrativa/pagos")({
  component: PagosPage,
});

function PagosPage() {
  const usuario = useUsuarioActivo();
  const pagos = useStore((s) => s.pagos);
  const facturas = useStore((s) => s.facturas);
  const proyectos = useStore((s) => s.proyectos);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ facturaId: "", monto: 0, tipo: "Transferencia" as TipoPago, referencia: "" });
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const puedeEditar = usuario.esAdmin || usuario.areas.includes("administrativa");

  const facturasActivas = facturas.filter((f) => f.estado !== "Pagada" && f.estado !== "Anulada");
  const saldoFactura = form.facturaId ? store.saldoFactura(form.facturaId) : 0;

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.facturaId) return setError("Selecciona una factura.");
    if (form.monto <= 0) return setError("El monto debe ser mayor a 0.");
    const fac = facturas.find((f) => f.id === form.facturaId);
    if (!fac) return;
    store.registrarPago({ facturaId: form.facturaId, proyectoId: fac.proyectoId, fecha: new Date().toISOString().slice(0, 10), monto: Number(form.monto), tipo: form.tipo, referencia: form.referencia || undefined });
    setOk("Pago registrado.");
    setShowForm(false);
    setForm({ facturaId: "", monto: 0, tipo: "Transferencia", referencia: "" });
    setTimeout(() => setOk(null), 2500);
  };

  return (
    <div>
      <PageHeader
        title="Pagos"
        crumbs={[{ label: "Administrativa" }, { label: "Pagos" }]}
        actions={puedeEditar ? <Button onClick={() => setShowForm((v) => !v)}><Plus className="h-4 w-4" /> {showForm ? "Cancelar" : "Registrar pago"}</Button> : undefined}
      />
      {ok && <SuccessBanner>{ok}</SuccessBanner>}
      {showForm && (
        <form onSubmit={guardar} className="mb-4 space-y-4 rounded-lg border border-border bg-surface p-4">
          {error && <ErrorBanner>{error}</ErrorBanner>}
          <Field label="Factura" required>
            <Select value={form.facturaId} onChange={(e) => setForm({ ...form, facturaId: e.target.value })}>
              <option value="">Selecciona...</option>
              {facturasActivas.map((f) => {
                const saldo = store.saldoFactura(f.id);
                return <option key={f.id} value={f.id}>{f.numero} - saldo: {formatCOP(saldo)}</option>;
              })}
            </Select>
          </Field>
          {form.facturaId && <div className="text-sm text-muted-foreground">Saldo actual: {formatCOP(saldoFactura)}</div>}
          <Field label="Monto" required>
            <TextInput type="number" min={0.01} step="0.01" value={form.monto || ""} onChange={(e) => setForm({ ...form, monto: Number(e.target.value) })} />
          </Field>
          <Field label="Tipo de pago" required>
            <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoPago })}>
              <option>Transferencia</option>
              <option>Efectivo</option>
              <option>Cheque</option>
              <option>Tarjeta</option>
            </Select>
          </Field>
          <Field label="Referencia">
            <TextInput value={form.referencia} onChange={(e) => setForm({ ...form, referencia: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit">Registrar pago</Button>
          </div>
        </form>
      )}
      {pagos.length === 0 ? (
        <EmptyState title="Sin pagos registrados" description="Registra el primer pago." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Proyecto</th>
                <th className="px-3 py-2 text-left font-medium">Factura</th>
                <th className="px-3 py-2 text-right font-medium">Monto</th>
                <th className="px-3 py-2 text-left font-medium">Tipo</th>
                <th className="px-3 py-2 text-left font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {[...pagos].reverse().map((p) => {
                const proy = proyectos.find((x) => x.id === p.proyectoId);
                const fac = facturas.find((f) => f.id === p.facturaId);
                return (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-3 py-2 text-muted-foreground">{proy?.codigo ?? p.proyectoId}</td>
                    <td className="px-3 py-2 text-muted-foreground">{fac?.numero ?? p.facturaId}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium">{formatCOP(p.monto)}</td>
                    <td className="px-3 py-2">{p.tipo}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.fecha}</td>
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
