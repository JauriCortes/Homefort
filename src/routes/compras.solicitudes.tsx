import { createFileRoute } from "@tanstack/react-router";
import { store } from "@/lib/store";
import { useStore } from "@/hooks/use-store";
import { PageHeader, EmptyState } from "@/components/ui-bits";
import { Button } from "@/components/form-bits";
import { ClipboardList } from "lucide-react";

export const Route = createFileRoute("/compras/solicitudes")({
  component: SolicitudesPage,
});

function SolicitudesPage() {
  const solicitudes = useStore((s) => s.solicitudesCompra);
  const proyectos = useStore((s) => s.proyectos);
  const materiales = useStore((s) => s.materialesBase);

  return (
    <div>
      <PageHeader title="Solicitudes de compra" crumbs={[{ label: "Compras" }, { label: "Solicitudes" }]} />
      {solicitudes.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Sin solicitudes" description="Las solicitudes se generan automaticamente al aprobar un proyecto con materiales faltantes." />
      ) : (
        <div className="space-y-3">
          {[...solicitudes].reverse().map((sol) => {
            const proyecto = proyectos.find((p) => p.id === sol.proyectoId);
            return (
              <div key={sol.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">{proyecto?.codigo ?? sol.proyectoId}</span>
                    {sol.generadaAutomaticamente && <span className="ml-2 text-[11px] rounded bg-blue-100 text-blue-800 px-1.5 py-0.5">Automatica</span>}
                  </div>
                  <span className={`text-xs rounded-full px-2 py-0.5 ${sol.estado === "pendiente" ? "bg-yellow-100 text-yellow-800" : sol.estado === "atendida" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>{sol.estado}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">{sol.fechaCreacion}</div>
                <ul className="space-y-1 text-sm">
                  {sol.items.map((item, i) => {
                    const mat = materiales.find((m) => m.id === item.materialId);
                    return <li key={i} className="text-muted-foreground">{mat?.nombre ?? item.materialId}: faltan {item.cantidadFaltante} {mat?.unidad}</li>;
                  })}
                </ul>
                {sol.estado !== "atendida" && (
                  <div className="mt-3">
                    <Button size="sm" variant="secondary" onClick={() => { store.solicitudesCompra = store.solicitudesCompra.map((s) => s.id === sol.id ? { ...s, estado: "atendida" } : s); }}>
                      Marcar como atendida
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
