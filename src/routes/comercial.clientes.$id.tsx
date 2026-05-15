import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { useMe } from "@/hooks/api/use-auth";
import { useCliente, useProyectos, useEliminarCliente } from "@/hooks/api/use-comercial";
import { ApiError } from "@/lib/api-client";
import {
  PageHeader,
  EstadoBadge,
  TipoClienteBadge,
  EmptyState,
  ErrorBanner,
} from "@/components/ui-bits";

export const Route = createFileRoute("/comercial/clientes/$id")({
  component: ClienteDetalle,
});

function ClienteDetalle() {
  const { id } = Route.useParams();
  const { data: usuario } = useMe();
  const { data: cliente, isLoading } = useCliente(id);
  const { data: proyectos = [] } = useProyectos({ clienteId: id });
  const eliminarCliente = useEliminarCliente();
  const navigate = useNavigate();
  const puedeEditar = (usuario?.esAdmin || usuario?.areas.includes("comercial")) ?? false;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (isLoading) return null;

  if (!cliente) {
    return (
      <div className="mx-auto max-w-xl">
        <PageHeader
          title="Cliente no encontrado"
          crumbs={[
            { label: "Comercial", to: "/comercial" },
            { label: "Clientes", to: "/comercial/clientes" },
          ]}
        />
        <ErrorBanner>El cliente que intentas consultar no existe o fue eliminado.</ErrorBanner>
        <Link
          to="/comercial/clientes"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a clientes
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    setDeleteError(null);
    eliminarCliente.mutate(cliente.id, {
      onSuccess: () => navigate({ to: "/comercial/clientes" }),
      onError: (err) => {
        if (err instanceof ApiError && err.status === 422) {
          setDeleteError("No se puede eliminar: el cliente tiene proyectos asociados.");
        } else {
          setDeleteError("No se pudo eliminar el cliente. Intenta nuevamente.");
        }
        setConfirmDelete(false);
      },
    });
  };

  return (
    <div>
      <PageHeader
        title={cliente.nombre}
        description={cliente.empresa ?? "Persona natural"}
        crumbs={[
          { label: "Comercial", to: "/comercial" },
          { label: "Clientes", to: "/comercial/clientes" },
          { label: cliente.nombre },
        ]}
        actions={
          <>
            <Link
              to="/comercial/clientes"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </Link>
            {puedeEditar ? (
              <>
                <Link
                  to="/comercial/clientes/$id/editar"
                  params={{ id: cliente.id }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
                >
                  <Pencil className="h-4 w-4" /> Editar
                </Link>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-destructive/40 bg-surface px-3 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" /> Eliminar
                </button>
              </>
            ) : (
              <>
                <button
                  disabled
                  title="Solo el área comercial puede editar"
                  className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-md bg-muted px-3 text-sm font-medium text-muted-foreground"
                >
                  <Pencil className="h-4 w-4" /> Editar
                </button>
                <button
                  disabled
                  className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-md bg-muted px-3 text-sm font-medium text-muted-foreground"
                >
                  <Trash2 className="h-4 w-4" /> Eliminar
                </button>
              </>
            )}
          </>
        }
      />

      {deleteError && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {deleteError}
        </div>
      )}

      {confirmDelete && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="mb-3 text-sm font-medium">
            ¿Eliminar a <b>{cliente.nombre}</b>? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={eliminarCliente.isPending}
              className="inline-flex h-8 items-center rounded-md bg-destructive px-3 text-xs font-medium text-white hover:bg-destructive/90 disabled:opacity-50"
            >
              {eliminarCliente.isPending ? "Eliminando…" : "Sí, eliminar"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="inline-flex h-8 items-center rounded-md border border-border bg-surface px-3 text-xs font-medium hover:bg-muted"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-lg border border-border bg-surface p-4 md:col-span-1">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Información del cliente
          </h2>
          <dl className="space-y-2 text-sm">
            <Row label="Tipo">
              <TipoClienteBadge tipo={cliente.tipo} />
            </Row>
            <Row label="Contacto">{cliente.contacto}</Row>
            {cliente.empresa && <Row label="Empresa">{cliente.empresa}</Row>}
            <Row label="Fecha de registro">{cliente.creadoEn}</Row>
          </dl>
        </section>

        <section className="rounded-lg border border-border bg-surface md:col-span-2">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Proyectos del cliente</h2>
            {puedeEditar && (
              <Link
                to="/comercial/proyectos/nuevo"
                search={{ clienteId: cliente.id }}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-3.5 w-3.5" /> Nuevo proyecto
              </Link>
            )}
          </header>
          {proyectos.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="Sin proyectos asociados"
                description="Crea un proyecto para iniciar el ciclo comercial con este cliente."
              />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {proyectos.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/comercial/proyectos/$id"
                    params={{ id: p.id }}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{p.titulo || p.codigo}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.codigo} · solicitado {p.fechaSolicitud}
                      </div>
                    </div>
                    <EstadoBadge estado={p.estado} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm">{children}</dd>
    </div>
  );
}
