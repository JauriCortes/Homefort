import { createFileRoute } from "@tanstack/react-router";
import { useSolicitudesGarantia } from "@/hooks/api/use-postventa";
import { PageHeader } from "@/components/ui-bits";

export const Route = createFileRoute("/postventa/")({
  component: PostventaDashboard,
});

function PostventaDashboard() {
  const { data: solicitudes = [] } = useSolicitudesGarantia();

  const abiertas = solicitudes.filter((s) => s.estado === "abierta").length;
  const enProceso = solicitudes.filter((s) => s.estado === "en_proceso").length;
  const conOrden = solicitudes.filter((s) => s.ordenGarantiaId !== null).length;

  return (
    <div>
      <PageHeader
        title="Postventa"
        description="Gestion de garantias y solicitudes de clientes."
        crumbs={[{ label: "Postventa" }]}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs text-muted-foreground">Solicitudes abiertas</div>
          <div className="mt-1 text-2xl font-semibold">{abiertas}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs text-muted-foreground">Ordenes activas</div>
          <div className="mt-1 text-2xl font-semibold">{enProceso}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs text-muted-foreground">Total solicitudes</div>
          <div className="mt-1 text-2xl font-semibold">{solicitudes.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs text-muted-foreground">Total ordenes</div>
          <div className="mt-1 text-2xl font-semibold">{conOrden}</div>
        </div>
      </div>
    </div>
  );
}
