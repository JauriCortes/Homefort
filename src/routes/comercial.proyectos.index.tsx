import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, FolderKanban, Eye } from "lucide-react";
import { useStore, useUsuarioActivo } from "@/hooks/use-store";
import {
  PageHeader,
  EmptyState,
  EstadoBadge,
  TipoClienteBadge,
} from "@/components/ui-bits";
import { TextInput, Select } from "@/components/form-bits";

export const Route = createFileRoute("/comercial/proyectos/")({
  component: ProyectosList,
});

function ProyectosList() {
  const usuario = useUsuarioActivo();
  const proyectos = useStore((s) => s.proyectos);
  const clientes = useStore((s) => s.clientes);
  const puedeEditar = usuario.esAdmin || usuario.areas.includes("comercial");

  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");

  const lista = proyectos.filter((p) => {
    const cliente = clientes.find((c) => c.id === p.clienteId);
    const text = `${p.codigo} ${p.tipo} ${cliente?.nombre ?? ""}`.toLowerCase();
    return text.includes(q.toLowerCase()) && (estado ? p.estado === estado : true);
  });

  return (
    <div>
      <PageHeader
        title="Proyectos"
        description="Cada proyecto avanza por un ciclo comercial: Solicitud → En definición → En cotización → Aprobada/Rechazada."
        crumbs={[{ label: "Comercial", to: "/comercial" }, { label: "Proyectos" }]}
        actions={
          puedeEditar ? (
            <Link
              to="/comercial/proyectos/nuevo"
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Nuevo proyecto
            </Link>
          ) : (
            <button
              disabled
              title="Solo Comercial puede crear proyectos"
              className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-md bg-muted px-3 text-sm font-medium text-muted-foreground"
            >
              <Plus className="h-4 w-4" /> Nuevo proyecto
            </button>
          )
        }
      />

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput
            placeholder="Buscar por código, cliente o tipo…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={estado} onChange={(e) => setEstado(e.target.value)} className="sm:w-48">
          <option value="">Todos los estados</option>
          <option value="Solicitud">Solicitud</option>
          <option value="En definición">En definición</option>
          <option value="En cotización">En cotización</option>
          <option value="Aprobada">Aprobada</option>
          <option value="Rechazada">Rechazada</option>
        </Select>
      </div>

      {proyectos.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Aún no hay proyectos"
          description="Registra primero un cliente y luego crea su proyecto."
          action={
            puedeEditar && (
              <Link
                to="/comercial/proyectos/nuevo"
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" /> Crear proyecto
              </Link>
            )
          }
        />
      ) : lista.length === 0 ? (
        <EmptyState title="Sin resultados" description="No hay proyectos que coincidan." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="hidden w-full text-sm md:table">
            <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Código</th>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Tipo</th>
                <th className="px-4 py-2 font-medium">Solicitado</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lista.map((p) => {
                const cli = clientes.find((c) => c.id === p.clienteId);
                return (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="px-4 py-2.5 font-medium">{p.codigo}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span>{cli?.nombre ?? "—"}</span>
                        {cli && <TipoClienteBadge tipo={cli.tipo} />}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">{p.tipo}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{p.fechaSolicitud}</td>
                    <td className="px-4 py-2.5">
                      <EstadoBadge estado={p.estado} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        to="/comercial/proyectos/$id"
                        params={{ id: p.id }}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" /> Detalle
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <ul className="divide-y divide-border md:hidden">
            {lista.map((p) => {
              const cli = clientes.find((c) => c.id === p.clienteId);
              return (
                <li key={p.id}>
                  <Link
                    to="/comercial/proyectos/$id"
                    params={{ id: p.id }}
                    className="block px-4 py-3 hover:bg-muted/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{p.codigo}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {cli?.nombre ?? "—"} · {p.tipo}
                        </div>
                      </div>
                      <EstadoBadge estado={p.estado} />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Solicitado {p.fechaSolicitud}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
