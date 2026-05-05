import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/hooks/use-store";
import { PageHeader } from "@/components/ui-bits";

export const Route = createFileRoute("/postventa/")({
  component: PostventaDashboard,
});

function PostventaDashboard() {
  const solicitudes = useStore((s) => s.solicitudesGarantia);
  const ordenes = useStore((s) => s.ordenesGarantia);

  const abiertas = solicitudes.filter((s) => s.estado === "abierta").length;
  const activas = ordenes.filter((o) => o.estado === "activa").length;

  return (
    <div>
      <PageHeader title="Postventa" description="Gestion de garantias y solicitudes de clientes." crumbs={[{ label: "Postventa" }]} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs text-muted-foreground">Solicitudes abiertas</div>
          <div className="mt-1 text-2xl font-semibold">{abiertas}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs text-muted-foreground">Ordenes activas</div>
          <div className="mt-1 text-2xl font-semibold">{activas}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs text-muted-foreground">Total solicitudes</div>
          <div className="mt-1 text-2xl font-semibold">{solicitudes.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs text-muted-foreground">Total ordenes</div>
          <div className="mt-1 text-2xl font-semibold">{ordenes.length}</div>
        </div>
      </div>
    </div>
  );
}
