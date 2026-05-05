import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { PageHeader, EmptyState } from "@/components/ui-bits";
import { Button } from "@/components/form-bits";

export const Route = createFileRoute("/postventa/garantias/")({
  component: GarantiasList,
});

function GarantiasList() {
  const solicitudes = useStore((s) => s.solicitudesGarantia);
  const proyectos = useStore((s) => s.proyectos);

  return (
    <div>
      <PageHeader
        title="Garantias"
        crumbs={[{ label: "Postventa" }, { label: "Garantias" }]}
        actions={<Link to="/postventa/garantias/nueva"><Button><Plus className="h-4 w-4" /> Nueva solicitud</Button></Link>}
      />
      {solicitudes.length === 0 ? (
        <EmptyState title="Sin solicitudes de garantia" description="Registra la primera solicitud de garantia de un cliente." />
      ) : (
        <div className="space-y-3">
          {[...solicitudes].reverse().map((sol) => {
            const proy = proyectos.find((p) => p.id === sol.proyectoId);
            return (
              <Link key={sol.id} to="/postventa/garantias/$id" params={{ id: sol.id }} className="block rounded-lg border border-border bg-surface p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{proy?.codigo ?? sol.proyectoId} - {proy?.tipo}</div>
                    <div className="text-xs text-muted-foreground">{sol.fecha} - {sol.descripcion}</div>
                    <div className="text-xs text-muted-foreground">Abierto por: {sol.abiertoBy}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${sol.estado === "cerrada" ? "bg-green-100 text-green-800" : sol.estado === "en_proceso" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>{sol.estado}</span>
                    {sol.ordenGarantiaId && <span className="text-[11px] text-muted-foreground">Con orden</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
