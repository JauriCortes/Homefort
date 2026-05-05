import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/hooks/use-store";
import { PageHeader, EmptyState } from "@/components/ui-bits";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/produccion/")({
  component: ProduccionDashboard,
});

function ProduccionDashboard() {
  const ordenes = useStore((s) => s.ordenesProduccion);
  const proyectos = useStore((s) => s.proyectos);

  return (
    <div>
      <PageHeader title="Produccion" description="Gestion de ordenes y etapas de produccion." crumbs={[{ label: "Produccion" }]} />
      {ordenes.length === 0 ? (
        <EmptyState icon={Settings} title="Sin ordenes de produccion" description="Las ordenes se generan desde el modulo Administrativo cuando un proyecto es aprobado." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Numero</th>
                <th className="px-3 py-2 text-left font-medium">Proyecto</th>
                <th className="px-3 py-2 text-left font-medium">Responsable</th>
                <th className="px-3 py-2 text-left font-medium">Emision</th>
                <th className="px-3 py-2 text-left font-medium">Estado</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => {
                const proy = proyectos.find((p) => p.id === o.proyectoId);
                return (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{o.numero}</td>
                    <td className="px-3 py-2 text-muted-foreground">{proy?.codigo ?? o.proyectoId}</td>
                    <td className="px-3 py-2">{o.responsable}</td>
                    <td className="px-3 py-2 text-muted-foreground">{o.fechaEmision}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs rounded-full px-2 py-0.5 ${o.estado === "Finalizada" ? "bg-green-100 text-green-800" : o.estado === "En produccion" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>{o.estado}</span>
                    </td>
                    <td className="px-3 py-2">
                      <Link to="/produccion/ordenes/$id" params={{ id: o.id }} className="text-xs text-primary hover:underline">Ver detalle</Link>
                    </td>
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
