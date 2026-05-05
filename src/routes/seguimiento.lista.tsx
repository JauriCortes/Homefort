import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { ESTADO_COLORS, type EstadoProyecto } from "@/lib/store";
import { PageHeader } from "@/components/ui-bits";
import { TextInput, Select } from "@/components/form-bits";

export const Route = createFileRoute("/seguimiento/lista")({
  component: ListaProyectos,
});

const ESTADOS: EstadoProyecto[] = [
  "Solicitud", "En definición", "En cotización", "Aprobada",
  "Rechazada", "En producción", "En garantía", "Entregado"
];

function ListaProyectos() {
  const proyectos = useStore((s) => s.proyectos);
  const clientes = useStore((s) => s.clientes);
  const [q, setQ] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"" | EstadoProyecto>("");

  const filtrados = useMemo(() => {
    return proyectos.filter((p) => {
      if (filtroEstado && p.estado !== filtroEstado) return false;
      if (q.trim()) {
        const t = q.trim().toLowerCase();
        const cliente = clientes.find((c) => c.id === p.clienteId);
        if (!p.codigo.toLowerCase().includes(t) && !p.tipo.toLowerCase().includes(t) && !cliente?.nombre.toLowerCase().includes(t)) return false;
      }
      return true;
    });
  }, [proyectos, clientes, q, filtroEstado]);

  return (
    <div>
      <PageHeader title="Lista de proyectos" description="Vista filtrable de todos los proyectos." crumbs={[{ label: "Seguimiento" }, { label: "Lista" }]} />
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por codigo, tipo o cliente" className="pl-8" />
        </div>
        <Select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as EstadoProyecto | "")} className="w-auto min-w-[180px]">
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
        </Select>
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Codigo</th>
              <th className="px-3 py-2 font-medium">Cliente</th>
              <th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium">Estado</th>
              <th className="px-3 py-2 font-medium">Solicitud</th>
              <th className="px-3 py-2 font-medium">Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p) => {
              const cliente = clientes.find((c) => c.id === p.clienteId);
              return (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <Link to="/seguimiento/$id" params={{ id: p.id }} className="font-medium text-primary hover:underline">{p.codigo}</Link>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{cliente?.nombre ?? "Eliminado"}</td>
                  <td className="px-3 py-2">{p.tipo}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_COLORS[p.estado]}`}>{p.estado}</span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{p.fechaSolicitud}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.ultimaActualizacion}</td>
                </tr>
              );
            })}
            {filtrados.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-sm text-muted-foreground">Sin proyectos que coincidan con el filtro.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
