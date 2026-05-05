import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/hooks/use-store";
import { PageHeader } from "@/components/ui-bits";
import { formatCOP } from "@/lib/store";

export const Route = createFileRoute("/administrativa/")({
  component: AdministrativaDashboard,
});

function AdministrativaDashboard() {
  const facturas = useStore((s) => s.facturas);
  const pagos = useStore((s) => s.pagos);
  const ordenes = useStore((s) => s.ordenesProduccion);
  const transportes = useStore((s) => s.transportes);

  const totalFacturado = facturas.reduce((s, f) => s + f.monto, 0);
  const totalPagado = pagos.reduce((s, p) => s + p.monto, 0);

  return (
    <div>
      <PageHeader title="Administrativa" description="Gestion financiera y operativa." crumbs={[{ label: "Administrativa" }]} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs text-muted-foreground">Ordenes produccion</div>
          <div className="mt-1 text-2xl font-semibold">{ordenes.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs text-muted-foreground">Facturas</div>
          <div className="mt-1 text-2xl font-semibold">{facturas.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs text-muted-foreground">Total facturado</div>
          <div className="mt-1 text-lg font-semibold">{formatCOP(totalFacturado)}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs text-muted-foreground">Total recaudado</div>
          <div className="mt-1 text-lg font-semibold">{formatCOP(totalPagado)}</div>
        </div>
      </div>
    </div>
  );
}
