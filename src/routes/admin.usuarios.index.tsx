import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Shield, Users as UsersIcon, Search } from "lucide-react";
import { useStore, useUsuarioActivo } from "@/hooks/use-store";
import { AREAS_LABEL } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/ui-bits";
import { Button, Select, TextInput } from "@/components/form-bits";

export const Route = createFileRoute("/admin/usuarios/")({
  component: UsuariosIndex,
});

function UsuariosIndex() {
  const usuario = useUsuarioActivo();
  const usuarios = useStore((s) => s.usuarios);
  const [q, setQ] = useState("");
  const [filtroArea, setFiltroArea] = useState<"todas" | string>("todas");
  const [verInactivos, setVerInactivos] = useState(false);

  if (!usuario.esAdmin) return <Navigate to="/comercial" replace />;

  const filtrados = useMemo(() => {
    return usuarios.filter((u) => {
      if (!verInactivos && !u.activo) return false;
      if (filtroArea !== "todas" && !u.areas.includes(filtroArea as never)) return false;
      if (q.trim()) {
        const t = q.trim().toLowerCase();
        if (!u.nombre.toLowerCase().includes(t) && !u.email.toLowerCase().includes(t))
          return false;
      }
      return true;
    });
  }, [usuarios, q, filtroArea, verInactivos]);

  return (
    <div>
      <PageHeader
        title="Usuarios del sistema"
        description="Crea y gestiona accesos individuales. Cada usuario solo puede editar su área."
        crumbs={[{ label: "Administración" }, { label: "Usuarios" }]}
        actions={
          <Link to="/admin/usuarios/nuevo">
            <Button>
              <Plus className="h-4 w-4" /> Nuevo usuario
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o correo"
            className="pl-8"
          />
        </div>
        <Select
          value={filtroArea}
          onChange={(e) => setFiltroArea(e.target.value)}
          className="w-auto min-w-[160px]"
        >
          <option value="todas">Todas las áreas</option>
          <option value="comercial">Comercial</option>
          <option value="compras">Compras</option>
          <option value="produccion">Producción</option>
          <option value="administrativa">Administrativa</option>
        </Select>
        <label className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm">
          <input
            type="checkbox"
            checked={verInactivos}
            onChange={(e) => setVerInactivos(e.target.checked)}
          />
          Mostrar inactivos
        </label>
      </div>

      {filtrados.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="Sin usuarios"
          description="Ajusta los filtros o crea un nuevo usuario."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          {/* Tabla en desktop */}
          <table className="hidden w-full text-sm md:table">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Nombre</th>
                <th className="px-3 py-2 font-medium">Correo</th>
                <th className="px-3 py-2 font-medium">Área</th>
                <th className="px-3 py-2 font-medium">Estado</th>
                <th className="px-3 py-2 font-medium">Creado</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{u.nombre}</span>
                      {u.esAdmin && (
                        <span
                          title="Administrador"
                          className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary"
                        >
                          <Shield className="h-3 w-3" /> Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{u.email}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {u.areas.map((a) => (
                        <span
                          key={a}
                          className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground"
                        >
                          {AREAS_LABEL[a]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {u.activo ? (
                      <span className="inline-flex items-center rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        Inactivo
                      </span>
                    )}
                    {u.bloqueadoHasta && new Date(u.bloqueadoHasta).getTime() > Date.now() && (
                      <span className="ml-1 inline-flex items-center rounded-full bg-warning/20 px-2 py-0.5 text-xs font-medium text-warning-foreground">
                        Bloqueado
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{u.creadoEn}</td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      to="/admin/usuarios/$id"
                      params={{ id: u.id }}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Gestionar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Lista en móvil */}
          <ul className="divide-y divide-border md:hidden">
            {filtrados.map((u) => (
              <li key={u.id} className="p-3">
                <Link
                  to="/admin/usuarios/$id"
                  params={{ id: u.id }}
                  className="flex flex-col gap-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{u.nombre}</span>
                    {u.activo ? (
                      <span className="text-xs text-success">Activo</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Inactivo</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{u.email}</span>
                  <span className="text-xs text-muted-foreground">
                    {u.areas.map((a) => AREAS_LABEL[a]).join(" · ")} {u.esAdmin && "· Admin"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
