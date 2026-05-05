import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/hooks/use-store";
import { PageHeader } from "@/components/ui-bits";

export const Route = createFileRoute("/compras/")({
  component: ComprasDashboard,
});

function ComprasDashboard() {
  const solicitudes = useStore((s) => s.solicitudesCompra);
  const ordenes = useStore((s) => s.ordenesCompra);
  const movimientos = useStore((s) => s.movimientos);
  const materiales = useStore((s) => s.materialesBase);

  const pendientes = solicitudes.filter((s) => s.estado === "pendiente").length;

  return (
    <div>
      <PageHeader title="Compras" description="Gestion de inventario, proveedores y ordenes." crumbs={[{ label: "Compras" }]} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs text-muted-foreground">Materiales</div>
          <div className="mt-1 text-2xl font-semibold">{materiales.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs text-muted-foreground">Movimientos</div>
          <div className="mt-1 text-2xl font-semibold">{movimientos.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs text-muted-foreground">Solicitudes pendientes</div>
          <div className="mt-1 text-2xl font-semibold">{pendientes}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs text-muted-foreground">Ordenes de compra</div>
          <div className="mt-1 text-2xl font-semibold">{ordenes.length}</div>
        </div>
      </div>
    </div>
  );
}
