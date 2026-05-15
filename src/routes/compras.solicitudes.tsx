import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { useSolicitudesCompra, useActualizarSolicitud, useMateriales } from "@/hooks/api/use-compras";
import { useProyectos } from "@/hooks/api/use-comercial";
import { PageHeader, EmptyState } from "@/components/ui-bits";
import { Button } from "@/components/form-bits";

export const Route = createFileRoute("/compras/solicitudes")({
  component: SolicitudesPage,
});

function SolicitudesPage() {
  const { data: solicitudes = [] } = useSolicitudesCompra();
  const { data: proyectos = [] } = useProyectos();
  const { data: materiales = [] } = useMateriales();
  const actualizarSolicitud = useActualizarSolicitud();

  return (
    <div>
      <PageHeader
        title="Solicitudes de compra"
        crumbs={[{ label: "Compras" }, { label: "Solicitudes" }]}
      />
      {solicitudes.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Sin solicitudes"
          description="Las solicitudes se generan automáticamente al aprobar un proyecto con materiales faltantes."
        />
      ) : (
        <div className="space-y-3">
          {[...solicitudes].reverse().map((sol) => {
            const proyecto = proyectos.find((p) => p.id === sol.proyectoId);
            return (
              <div key={sol.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">
                      {(proyecto as { codigo?: string })?.codigo ?? sol.proyectoId}
                    </span>
                    {sol.generadaAutomaticamente && (
                      <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-[11px] text-blue-800">
                        Automática
                      </span>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      sol.estado === "pendiente"
                        ? "bg-yellow-100 text-yellow-800"
                        : sol.estado === "atendida"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {sol.estado}
                  </span>
                </div>
                <div className="mb-2 text-xs text-muted-foreground">{sol.fechaCreacion}</div>
                <ul className="space-y-1 text-sm">
                  {sol.items.map((item, i) => {
                    const mat = materiales.find((m) => m.id === item.materialId);
                    return (
                      <li key={i} className="text-muted-foreground">
                        {mat?.nombre ?? item.materialId}: faltan {item.cantidadFaltante}{" "}
                        {mat?.unidad}
                      </li>
                    );
                  })}
                </ul>
                {sol.estado !== "atendida" && (
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={actualizarSolicitud.isPending}
                      onClick={() => actualizarSolicitud.mutate({ id: sol.id, estado: "atendida" })}
                    >
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
