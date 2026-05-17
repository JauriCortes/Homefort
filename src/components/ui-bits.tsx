import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export interface Crumb {
  label: string;
  to?: string;
}

export function PageHeader({
  title,
  description,
  crumbs,
  actions,
}: {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:mb-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {crumbs && crumbs.length > 0 && (
          <nav className="mb-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                {c.to ? (
                  <Link to={c.to} className="hover:text-foreground hover:underline">
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
                {i < crumbs.length - 1 && <ChevronRight className="h-3 w-3" />}
              </span>
            ))}
          </nav>
        )}
        <h1 className="truncate text-xl font-semibold text-foreground md:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
      {Icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      <span className="mt-0.5">⚠</span>
      <div>{children}</div>
    </div>
  );
}

export function SuccessBanner({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="mb-4 flex items-start gap-2 rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-success"
    >
      <span className="mt-0.5">✓</span>
      <div>{children}</div>
    </div>
  );
}

export function InfoBanner({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-md border border-info/40 bg-info/10 px-3 py-2 text-sm text-info">
      <span className="mt-0.5">i</span>
      <div>{children}</div>
    </div>
  );
}

export function WarningBanner({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
      <span className="mt-0.5">⚠</span>
      <div>{children}</div>
    </div>
  );
}

export function ReadOnlyBanner({ area }: { area: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
      <span>🔒</span>
      <span>
        Tu usuario no tiene permisos para editar el área <b>{area}</b>. Puedes consultar la
        información pero no modificarla.
      </span>
    </div>
  );
}

const ESTADO_STYLES: Record<string, string> = {
  Solicitud: "bg-muted text-foreground",
  "En definición": "bg-info/15 text-info",
  "En cotización": "bg-warning/20 text-warning-foreground",
  Aprobada: "bg-success/15 text-success",
  "En producción": "bg-primary/10 text-primary",
  Entregado: "bg-success/25 text-success",
  "En garantía": "bg-warning/20 text-warning-foreground",
  Rechazada: "bg-destructive/15 text-destructive",
};

export function EstadoBadge({ estado }: { estado: string }) {
  const cls = ESTADO_STYLES[estado] ?? "bg-muted text-foreground";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {estado}
    </span>
  );
}

export function TipoClienteBadge({ tipo }: { tipo: "B2B" | "B2C" }) {
  const cls =
    tipo === "B2B"
      ? "bg-primary/10 text-primary"
      : "bg-accent/15 text-accent-foreground";
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      {tipo}
    </span>
  );
}
