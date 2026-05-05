import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Plus, Search, Eye } from "lucide-react";
import { useStore, useUsuarioActivo } from "@/hooks/use-store";
import { PageHeader, EmptyState, TipoClienteBadge } from "@/components/ui-bits";
import { TextInput, Select } from "@/components/form-bits";

export const Route = createFileRoute("/comercial/clientes/")({
  component: ClientesList,
});

function ClientesList() {
  const usuario = useUsuarioActivo();
  const clientes = useStore((s) => s.clientes);
  const proyectos = useStore((s) => s.proyectos);
  const puedeEditar = usuario.esAdmin || usuario.areas.includes("comercial");

  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<string>("");

  const filtrados = clientes.filter((c) => {
    const text = `${c.nombre} ${c.contacto} ${c.empresa ?? ""}`.toLowerCase();
    return text.includes(q.toLowerCase()) && (tipo ? c.tipo === tipo : true);
  });

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Base de clientes consultable por todas las áreas."
        crumbs={[{ label: "Comercial", to: "/comercial" }, { label: "Clientes" }]}
        actions={
          puedeEditar ? (
            <Link
              to="/comercial/clientes/nuevo"
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Registrar cliente
            </Link>
          ) : (
            <button
              disabled
              title="Solo el área comercial puede crear clientes"
              className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-md bg-muted px-3 text-sm font-medium text-muted-foreground"
            >
              <Plus className="h-4 w-4" /> Registrar cliente
            </button>
          )
        }
      />

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput
            placeholder="Buscar por nombre, contacto o empresa…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={tipo} onChange={(e) => setTipo(e.target.value)} className="sm:w-40">
          <option value="">Todos los tipos</option>
          <option value="B2B">B2B</option>
          <option value="B2C">B2C</option>
        </Select>
      </div>

      {clientes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aún no hay clientes registrados"
          description="Registra el primer cliente para comenzar a crear proyectos."
          action={
            puedeEditar && (
              <Link
                to="/comercial/clientes/nuevo"
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" /> Registrar cliente
              </Link>
            )
          }
        />
      ) : filtrados.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="Ajusta los filtros para encontrar el cliente que buscas."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          {/* Tabla en escritorio */}
          <table className="hidden w-full text-sm md:table">
            <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Contacto</th>
                <th className="px-4 py-2 font-medium">Tipo</th>
                <th className="px-4 py-2 font-medium">Proyectos</th>
                <th className="px-4 py-2 font-medium">Registro</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtrados.map((c) => {
                const n = proyectos.filter((p) => p.clienteId === c.id).length;
                return (
                  <tr key={c.id} className="hover:bg-muted/40">
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{c.nombre}</div>
                      {c.empresa && (
                        <div className="text-xs text-muted-foreground">{c.empresa}</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-foreground">{c.contacto}</td>
                    <td className="px-4 py-2.5">
                      <TipoClienteBadge tipo={c.tipo} />
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">{n}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{c.creadoEn}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        to="/comercial/clientes/$id"
                        params={{ id: c.id }}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" /> Ver
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Lista en móvil */}
          <ul className="divide-y divide-border md:hidden">
            {filtrados.map((c) => {
              const n = proyectos.filter((p) => p.clienteId === c.id).length;
              return (
                <li key={c.id}>
                  <Link
                    to="/comercial/clientes/$id"
                    params={{ id: c.id }}
                    className="block px-4 py-3 hover:bg-muted/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{c.nombre}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {c.contacto}
                        </div>
                      </div>
                      <TipoClienteBadge tipo={c.tipo} />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {n} {n === 1 ? "proyecto" : "proyectos"} · alta {c.creadoEn}
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
