import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Users, FolderKanban, PlusCircle, ArrowRight } from "lucide-react";
import { useMe } from "@/hooks/api/use-auth";
import { useClientes, useProyectos } from "@/hooks/api/use-comercial";
import { PageHeader, EstadoBadge, TipoClienteBadge } from "@/components/ui-bits";
import { AREAS_LABEL } from "@/lib/store";

export const Route = createFileRoute("/comercial/")({
  component: ResumenComercial,
});

function ResumenComercial() {
  const { data: usuario } = useMe();
  const { data: clientes = [] } = useClientes();
  const { data: proyectos = [] } = useProyectos();

  const porEstado = proyectos.reduce<Record<string, number>>((acc, p) => {
    acc[p.estado] = (acc[p.estado] ?? 0) + 1;
    return acc;
  }, {});

  const recientes = [...proyectos]
    .sort((a, b) => b.fechaSolicitud.localeCompare(a.fechaSolicitud))
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Resumen comercial"
        description={`Hola, ${usuario?.nombre ?? "…"}. Vista general del área ${AREAS_LABEL.comercial}.`}
        crumbs={[{ label: "Comercial" }, { label: "Resumen" }]}
        actions={
          <>
            <Link
              to="/comercial/clientes/nuevo"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
            >
              <PlusCircle className="h-4 w-4" /> Nuevo cliente
            </Link>
            <Link
              to="/comercial/proyectos/nuevo"
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <PlusCircle className="h-4 w-4" /> Nuevo proyecto
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Clientes" value={clientes.length} icon={Users} to="/comercial/clientes" />
        <KpiCard
          label="Proyectos"
          value={proyectos.length}
          icon={FolderKanban}
          to="/comercial/proyectos"
        />
        <KpiCard label="En cotización" value={porEstado["En cotización"] ?? 0} icon={Briefcase} />
        <KpiCard label="Aprobadas" value={porEstado["Aprobada"] ?? 0} icon={Briefcase} />
      </div>

      <section className="mt-6 rounded-lg border border-border bg-surface">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Proyectos recientes</h2>
          <Link
            to="/comercial/proyectos"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Ver todos <ArrowRight className="h-3 w-3" />
          </Link>
        </header>
        {recientes.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Aún no hay proyectos registrados.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recientes.map((p) => {
              const cliente = clientes.find((c) => c.id === p.clienteId);
              return (
                <li key={p.id}>
                  <Link
                    to="/comercial/proyectos/$id"
                    params={{ id: p.id }}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="truncate">{p.codigo}</span>
                        {cliente && <TipoClienteBadge tipo={cliente.tipo} />}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {cliente?.nombre ?? "Cliente eliminado"} · {p.tipo}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <EstadoBadge estado={p.estado} />
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {p.fechaSolicitud}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  to,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  to?: string;
}) {
  const inner = (
    <div className="flex h-full flex-col rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-muted/40">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs">{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}
