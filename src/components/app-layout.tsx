import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Briefcase,
  Hammer,
  Menu,
  ShoppingCart,
  Wallet,
  Users,
  FolderKanban,
  X,
  LogOut,
  Shield,
  Package,
  ClipboardList,
  FileText,
  DollarSign,
  Truck,
  BarChart2,
  Settings,
  Wrench,
  LayoutDashboard,
  ListFilter,
  Store,
} from "lucide-react";
import { useMe, useLogout } from "@/hooks/api/use-auth";
import { AREAS_LABEL } from "@/lib/store";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SectionDef {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: SectionDef[] = [
  {
    label: "Seguimiento",
    items: [
      { to: "/seguimiento", label: "Kanban", icon: LayoutDashboard },
      { to: "/seguimiento/lista", label: "Lista de proyectos", icon: ListFilter },
    ],
  },
  {
    label: "Comercial",
    items: [
      { to: "/comercial/clientes", label: "Clientes", icon: Users },
      { to: "/comercial/proyectos", label: "Proyectos", icon: FolderKanban },
    ],
  },
  {
    label: "Compras",
    items: [
      { to: "/compras/proveedores", label: "Proveedores", icon: Store },
      { to: "/compras/solicitudes", label: "Solicitudes", icon: ClipboardList },
      { to: "/compras/ordenes", label: "Órdenes de compra", icon: ShoppingCart },
      { to: "/compras/inventario", label: "Inventario", icon: Package },
    ],
  },
  {
    label: "Administrativa",
    items: [
      { to: "/administrativa/ordenes-produccion", label: "Órdenes de producción", icon: Briefcase },
      { to: "/administrativa/facturas", label: "Facturas", icon: FileText },
      { to: "/administrativa/pagos", label: "Pagos", icon: DollarSign },
      { to: "/administrativa/transporte", label: "Transporte", icon: Truck },
      { to: "/administrativa/costos", label: "Costos", icon: BarChart2 },
    ],
  },
  {
    label: "Producción",
    items: [
      { to: "/produccion/ordenes", label: "Ordenes", icon: Settings },
    ],
  },
  {
    label: "Postventa",
    items: [
      { to: "/postventa/garantias", label: "Garantias", icon: Wrench },
    ],
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { data: usuario } = useMe();
  const logout = useLogout();
  const location = useLocation();
  const [canScrollDown, setCanScrollDown] = useState(false);

  const navRef = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const check = () =>
      setCanScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 1);
    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
  }, []);

  if (!usuario) return null;

  const handleLogout = () => {
    onNavigate?.();
    logout.mutate();
  };

  const isActive = (to: string) => {
    if (to === "/seguimiento") return location.pathname === "/seguimiento";
    return location.pathname.startsWith(to);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-4">
        <Link to="/comercial" className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground hover:opacity-80 transition-opacity">
          <Hammer className="h-5 w-5" />
        </Link>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-sidebar-foreground">HF HomeFort</div>
          <div className="text-[11px] uppercase tracking-wide text-sidebar-foreground/60">
            Gestión interna
          </div>
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        {canScrollDown && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-16 bg-gradient-to-t from-sidebar to-transparent" />
        )}
      <nav ref={navRef} className="sidebar-scroll h-full overflow-y-auto px-2 pb-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-2">
            <div className="px-2 py-1.5 text-[11px] uppercase tracking-wide text-sidebar-foreground/60">
              {section.label}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0 opacity-80" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {usuario.esAdmin && (
          <div className="mb-2 mt-4 border-t border-sidebar-border pt-3">
            <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] uppercase tracking-wide text-sidebar-foreground/60">
              <Shield className="h-3.5 w-3.5" /> Administración
            </div>
            <ul className="space-y-0.5">
              <li>
                <Link
                  to="/admin/usuarios"
                  onClick={onNavigate}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                    location.pathname.startsWith("/admin/usuarios")
                      ? "bg-accent text-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <Users className="h-4 w-4 shrink-0 opacity-80" />
                  <span className="truncate">Usuarios</span>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
      </div>
      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 rounded-md bg-sidebar-accent/40 px-3 py-2 text-sm">
          <div className="truncate font-medium text-sidebar-foreground">{usuario.nombre}</div>
          <div className="truncate text-xs text-sidebar-foreground/70">
            {usuario.areas.map((a) => AREAS_LABEL[a]).join(" · ")}
            {usuario.esAdmin && " · Admin"}
          </div>
          <div className="truncate text-[11px] text-sidebar-foreground/50">{usuario.email}</div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-sidebar-border px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: usuario, isLoading } = useMe();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !usuario && location.pathname !== "/login") {
      navigate({ to: "/login" });
    }
  }, [usuario, isLoading, location.pathname, navigate]);

  if (location.pathname === "/login") {
    return <Outlet />;
  }

  if (!usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Redirigiendo...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:block">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground shadow-xl">
            <div className="flex justify-end p-2">
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded p-1.5 text-sidebar-foreground hover:bg-sidebar-accent"
                aria-label="Cerrar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-surface/90 px-3 backdrop-blur md:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded p-1.5 hover:bg-muted md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-muted-foreground">
              {location.pathname.split("/").filter(Boolean).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" / ") || "Inicio"}
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right text-xs leading-tight">
              <div className="font-medium text-foreground">{usuario.nombre}</div>
              <div className="text-muted-foreground">
                {usuario.areas.length === 1 ? "Area " : "Areas "}
                {usuario.areas.map((a) => AREAS_LABEL[a]).join(" · ")}
                {usuario.esAdmin && " · Administrador"}
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {usuario.nombre
                .split(" ")
                .map((p: string) => p[0])
                .slice(0, 2)
                .join("")}
            </div>
          </div>
        </header>
        <main className="flex-1 px-3 py-4 md:px-6 md:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
