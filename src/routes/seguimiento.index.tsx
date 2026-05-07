import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/hooks/use-store";
import { store, ESTADO_COLORS, type EstadoProyecto, TRANSICIONES } from "@/lib/store";
import { PageHeader } from "@/components/ui-bits";

const ESTADOS: EstadoProyecto[] = [
  "Solicitud", "En definición", "En cotización", "Aprobada",
  "Rechazada", "En producción", "En garantía", "Entregado"
];

export const Route = createFileRoute("/seguimiento/")({
  component: KanbanPage,
});

function KanbanPage() {
  const proyectos = useStore((s) => s.proyectos);
  const clientes = useStore((s) => s.clientes);
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Kanban de proyectos" description="Vista de todos los proyectos por estado." crumbs={[{ label: "Seguimiento" }, { label: "Kanban" }]} />
      <div className="flex gap-3 overflow-x-auto pb-4">
        {ESTADOS.map((estado) => {
          const cols = proyectos.filter((p) => p.estado === estado);
          return (
            <div key={estado} className="min-w-[220px] flex-shrink-0">
              <div className="mb-2 flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_COLORS[estado]}`}>{estado}</span>
                <span className="text-xs text-muted-foreground">{cols.length}</span>
              </div>
              <div className="space-y-2">
                {cols.map((p) => {
                  const cliente = clientes.find((c) => c.id === p.clienteId);
                  return (
                    <div
                      key={p.id}
                      className="cursor-pointer rounded-lg border border-border bg-surface p-3 hover:bg-muted/50 transition-colors"
                      onClick={() => navigate({ to: "/seguimiento/$id", params: { id: p.id } })}
                    >
                      <div className="text-sm font-medium">{p.codigo}</div>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${ESTADO_COLORS[p.estado]}`}>{p.estado}</span>
                      <div className="text-xs text-muted-foreground">{p.tipo}</div>
                      <div className="mt-1 text-xs text-foreground">{cliente?.nombre ?? "Cliente eliminado"}</div>
                      <div className="mt-1 text-[11px] text-muted-foreground">{p.ultimaActualizacion}</div>
                    </div>
                  );
                })}
                {cols.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border bg-surface px-3 py-4 text-center text-xs text-muted-foreground">
                    Sin proyectos
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
