import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useSolicitudesGarantia } from "@/hooks/api/use-postventa";
import { useProyectos } from "@/hooks/api/use-comercial";
import { PageHeader, EmptyState } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";

export const Route = createFileRoute("/postventa/garantias/")({
  component: GarantiasPage,
});

function GarantiasPage() {
  const { data: solicitudes = [] } = useSolicitudesGarantia();
  const { data: proyectos = [] } = useProyectos();

  const [filtroEstado, setFiltroEstado] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const filtradas = useMemo(() => {
    return [...solicitudes].reverse().filter((s) => {
      if (filtroEstado && s.estado !== filtroEstado) return false;
      if (fechaDesde && s.fecha < fechaDesde) return false;
      if (fechaHasta && s.fecha > fechaHasta) return false;
      return true;
    });
  }, [solicitudes, filtroEstado, fechaDesde, fechaHasta]);

  const limpiar = () => { setFiltroEstado(""); setFechaDesde(""); setFechaHasta(""); };
  const hayFiltros = filtroEstado || fechaDesde || fechaHasta;

  return (
    <div>
      <PageHeader
        title="Garantías"
        crumbs={[{ label: "Postventa" }, { label: "Garantías" }]}
        actions={
          <Link to="/postventa/garantias/nueva">
            <Button><Plus className="h-4 w-4" /> Nueva solicitud</Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Field label="Estado">
          <Select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="abierta">Abierta</option>
            <option value="en_proceso">En proceso</option>
            <option value="cerrada">Cerrada</option>
          </Select>
        </Field>
        <Field label="Desde">
          <TextInput type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
        </Field>
        <Field label="Hasta">
          <TextInput type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
        </Field>
        {hayFiltros && (
          <Button variant="secondary" type="button" onClick={limpiar}>Limpiar filtros</Button>
        )}
      </div>

      {filtradas.length === 0 ? (
        <EmptyState title="Sin solicitudes" description="No hay garantías que coincidan con los filtros." />
      ) : (
        <div className="space-y-3">
          {filtradas.map((sol) => {
            const proyecto = proyectos.find((p) => p.id === sol.proyectoId);
            return (
              <Link key={sol.id} to="/postventa/garantias/$id" params={{ id: sol.id }} className="block rounded-lg border border-border bg-surface p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm">{proyecto?.codigo ?? sol.proyectoId}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{sol.descripcion}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{sol.fecha} · {sol.abiertoBy}</div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${sol.estado === "cerrada" ? "bg-green-100 text-green-800" : sol.estado === "en_proceso" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {sol.estado}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
