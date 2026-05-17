/**
 * Comercial Dashboard — src/routes/comercial.index.tsx
 *
 * KPI grid + recent projects section with badges.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Briefcase, Users, FolderKanban, PlusCircle, ArrowRight } from 'lucide-react';
import { PageHeader, EstadoBadge, TipoClienteBadge } from '@/components/ui-bits';

type Proyecto = { id: string; codigo: string; tipo: string; estado: string; clienteId: string; fechaSolicitud: string };
type Cliente = { id: string; nombre: string; tipo: 'B2B' | 'B2C' };

const clientes: Cliente[] = [
  { id: 'c1', nombre: 'Diana Restrepo', tipo: 'B2C' },
  { id: 'c2', nombre: 'Constructora Andina S.A.S.', tipo: 'B2B' },
  { id: 'c3', nombre: 'Carlos Méndez', tipo: 'B2C' },
  { id: 'c4', nombre: 'Arq. Patricia López', tipo: 'B2B' },
];

const proyectos: Proyecto[] = [
  { id: 'p1', codigo: 'PY-001', tipo: 'Cocina integral', estado: 'Aprobada', clienteId: 'c1', fechaSolicitud: '2026-05-10' },
  { id: 'p2', codigo: 'PY-002', tipo: 'Closet empotrado', estado: 'En producción', clienteId: 'c2', fechaSolicitud: '2026-05-08' },
  { id: 'p3', codigo: 'PY-003', tipo: 'Mueble de sala', estado: 'En cotización', clienteId: 'c3', fechaSolicitud: '2026-05-05' },
  { id: 'p4', codigo: 'PY-004', tipo: 'Biblioteca', estado: 'En definición', clienteId: 'c4', fechaSolicitud: '2026-05-03' },
  { id: 'p5', codigo: 'PY-005', tipo: 'Comedor', estado: 'Entregado', clienteId: 'c1', fechaSolicitud: '2026-04-20' },
];

function KpiCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-muted/40">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs">{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

function ComercialDashboard({
  nombreUsuario,
  clientes: cls,
  proyectos: pros,
}: {
  nombreUsuario: string;
  clientes: Cliente[];
  proyectos: Proyecto[];
}) {
  const porEstado = pros.reduce<Record<string, number>>((acc, p) => {
    acc[p.estado] = (acc[p.estado] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Resumen comercial"
        description={`Hola, ${nombreUsuario}. Vista general del área Comercial.`}
        crumbs={[{ label: 'Comercial' }, { label: 'Resumen' }]}
        actions={
          <>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted">
              <PlusCircle className="h-4 w-4" /> Nuevo cliente
            </button>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <PlusCircle className="h-4 w-4" /> Nuevo proyecto
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Clientes" value={cls.length} icon={Users} />
        <KpiCard label="Proyectos" value={pros.length} icon={FolderKanban} />
        <KpiCard label="En cotización" value={porEstado['En cotización'] ?? 0} icon={Briefcase} />
        <KpiCard label="Aprobadas" value={porEstado['Aprobada'] ?? 0} icon={Briefcase} />
      </div>

      <section className="mt-6 rounded-lg border border-border bg-surface">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Proyectos recientes</h2>
          <span className="inline-flex cursor-pointer items-center gap-1 text-xs text-primary hover:underline">
            Ver todos <ArrowRight className="h-3 w-3" />
          </span>
        </header>
        {pros.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Aún no hay proyectos registrados.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {pros.map((p) => {
              const cliente = cls.find((c) => c.id === p.clienteId);
              return (
                <li key={p.id} className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="truncate">{p.codigo}</span>
                      {cliente && <TipoClienteBadge tipo={cliente.tipo} />}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {cliente?.nombre ?? 'Cliente eliminado'} · {p.tipo}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <EstadoBadge estado={p.estado} />
                    <span className="hidden text-xs text-muted-foreground sm:inline">{p.fechaSolicitud}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

const meta: Meta = {
  title: 'Pages/Comercial/Dashboard',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

export const ConDatos: Story = {
  name: 'Con datos',
  render: () => <ComercialDashboard nombreUsuario="Laura Gómez" clientes={clientes} proyectos={proyectos} />,
};

export const SinProyectos: Story = {
  name: 'Sin proyectos (vacío)',
  render: () => <ComercialDashboard nombreUsuario="Laura Gómez" clientes={clientes} proyectos={[]} />,
};

export const SinDatos: Story = {
  name: 'Sin datos (nuevo sistema)',
  render: () => <ComercialDashboard nombreUsuario="Laura Gómez" clientes={[]} proyectos={[]} />,
};

export const AdminView: Story = {
  name: 'Vista Admin',
  render: () => <ComercialDashboard nombreUsuario="Andrés Torres" clientes={clientes} proyectos={proyectos} />,
};
