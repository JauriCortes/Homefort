import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useProveedores, useMateriales } from "@/hooks/api/use-compras";
import { PageHeader, EmptyState } from "@/components/ui-bits";
import { Button } from "@/components/form-bits";

export const Route = createFileRoute("/compras/proveedores/")({
  component: ProveedoresList,
});

function ProveedoresList() {
  const { data: proveedores = [] } = useProveedores();
  const { data: materiales = [] } = useMateriales();

  return (
    <div>
      <PageHeader
        title="Proveedores"
        crumbs={[{ label: "Compras" }, { label: "Proveedores" }]}
        actions={
          <Link to="/compras/proveedores/nuevo">
            <Button>
              <Plus className="h-4 w-4" /> Nuevo proveedor
            </Button>
          </Link>
        }
      />
      {proveedores.length === 0 ? (
        <EmptyState title="Sin proveedores" description="Agrega el primer proveedor." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Nombre</th>
                <th className="px-3 py-2 text-left font-medium">Contacto</th>
                <th className="px-3 py-2 text-left font-medium">Materiales</th>
                <th className="px-3 py-2 text-left font-medium">Condiciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{p.nombre}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.email}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {p.materialesIds
                      .map((mid) => materiales.find((m) => m.id === mid)?.nombre)
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{p.condicionesPago || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
