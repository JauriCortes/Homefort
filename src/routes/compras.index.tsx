import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import {
  useMateriales,
  useMovimientos,
  useSolicitudesCompra,
  useOrdenesCompra,
} from "@/hooks/api/use-compras";

export const Route = createFileRoute("/compras/")({
  component: ComprasDashboard,
});

function ComprasDashboard() {
  const { data: materiales = [] } = useMateriales();
  const { data: movimientos = [] } = useMovimientos();
  const { data: solicitudes = [] } = useSolicitudesCompra();
  const { data: ordenes = [] } = useOrdenesCompra();

  const pendientes = solicitudes.filter((s) => s.estado === "pendiente").length;

  return (
    <div>
      <PageHeader
        title="Compras"
        description="Gestión de inventario, proveedores y órdenes."
        crumbs={[{ label: "Compras" }]}
      />
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
          <div className="text-xs text-muted-foreground">Órdenes de compra</div>
          <div className="mt-1 text-2xl font-semibold">{ordenes.length}</div>
        </div>
      </div>
    </div>
  );
}
