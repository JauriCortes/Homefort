import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useMe } from "@/hooks/api/use-auth";
import { useProyectos } from "@/hooks/api/use-comercial";
import { useFacturas, usePagos, useRegistrarPago, useSaldoFactura } from "@/hooks/api/use-administrativa";
import type { Pago } from "@/hooks/api/use-administrativa";
import { PageHeader, EmptyState, ErrorBanner } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";
import { toast } from "sonner";

export const Route = createFileRoute("/administrativa/pagos")({
  component: PagosPage,
});

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

function SaldoDisplay({ facturaId }: { facturaId: string }) {
  const { data } = useSaldoFactura(facturaId);
  if (!data) return null;
  return <div className="text-sm text-muted-foreground">Saldo actual: {formatCOP(data.saldo)}</div>;
}

function PagosPage() {
  const { data: usuario } = useMe();
  const { data: pagos = [] } = usePagos();
  const { data: facturas = [] } = useFacturas();
  const { data: proyectos = [] } = useProyectos();
  const registrarPago = useRegistrarPago();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ facturaId: "", monto: 0, tipo: "Transferencia" as Pago["tipo"], referencia: "" });
  const [error, setError] = useState<string | null>(null);

  const puedeEditar = usuario?.esAdmin || usuario?.areas?.includes("administrativa");
  const facturasActivas = facturas.filter((f) => f.estado !== "Pagada" && f.estado !== "Anulada");

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.facturaId) return setError("Selecciona una factura.");
    if (form.monto <= 0) return setError("El monto debe ser mayor a 0.");
    try {
      await registrarPago.mutateAsync({
        facturaId: form.facturaId,
        monto: Number(form.monto),
        tipo: form.tipo,
        referencia: form.referencia || undefined,
      });
      toast.success("Pago registrado.");
      setShowForm(false);
      setForm({ facturaId: "", monto: 0, tipo: "Transferencia", referencia: "" });
    } catch (err: any) {
      toast.error(err?.message ?? "Error al registrar el pago.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Pagos"
        crumbs={[{ label: "Administrativa" }, { label: "Pagos" }]}
        actions={
          puedeEditar ? (
            <Button onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-4 w-4" /> {showForm ? "Cancelar" : "Registrar pago"}
            </Button>
          ) : undefined
        }
      />
      {showForm && (
        <form onSubmit={guardar} className="mb-4 space-y-4 rounded-lg border border-border bg-surface p-4">
          {error && <ErrorBanner>{error}</ErrorBanner>}
          <Field label="Factura" required>
            <Select value={form.facturaId} onChange={(e) => setForm({ ...form, facturaId: e.target.value })}>
              <option value="">Selecciona...</option>
              {facturasActivas.map((f) => (
                <option key={f.id} value={f.id}>{f.numero} — {formatCOP(f.monto)}</option>
              ))}
            </Select>
          </Field>
          {form.facturaId && <SaldoDisplay facturaId={form.facturaId} />}
          <Field label="Monto" required>
            <TextInput type="number" min={0} step="1" value={form.monto || ""} onChange={(e) => setForm({ ...form, monto: Number(e.target.value) })} />
          </Field>
          <Field label="Tipo de pago" required>
            <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as Pago["tipo"] })}>
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
            <Button type="submit" disabled={registrarPago.isPending}>Registrar pago</Button>
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
