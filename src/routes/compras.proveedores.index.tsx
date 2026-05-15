import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMe } from "@/hooks/api/use-auth";
import {
  useProveedores,
  useMateriales,
  useActualizarProveedor,
  useEliminarProveedor,
  type Proveedor,
} from "@/hooks/api/use-compras";
import { PageHeader, EmptyState, ErrorBanner } from "@/components/ui-bits";
import { Button, Field, TextInput } from "@/components/form-bits";

export const Route = createFileRoute("/compras/proveedores/")({
  component: ProveedoresList,
});

function ProveedoresList() {
  const { data: usuario } = useMe();
  const { data: proveedores = [] } = useProveedores();
  const { data: materiales = [] } = useMateriales();
  const actualizarProveedor = useActualizarProveedor();
  const eliminarProveedor = useEliminarProveedor();

  const [editando, setEditando] = useState<Proveedor | null>(null);
  const [editForm, setEditForm] = useState<Partial<Proveedor>>({});
  const [editError, setEditError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Proveedor | null>(null);

  const puedeEditar = (usuario?.esAdmin || usuario?.areas.includes("compras")) ?? false;

  const abrirEdit = (p: Proveedor) => {
    setEditando(p);
    setEditForm({ ...p });
    setEditError(null);
  };

  const guardarEdit = () => {
    if (!editando) return;
    if (!editForm.nombre?.trim()) return setEditError("El nombre es obligatorio.");
    if (!editForm.email?.trim()) return setEditError("El email es obligatorio.");
    actualizarProveedor.mutate(
      { id: editando.id, ...editForm },
      {
        onSuccess: () => { setEditando(null); toast.success("Proveedor actualizado."); },
        onError: () => setEditError("No se pudo guardar. Intenta nuevamente."),
      },
    );
  };

  const confirmarEliminar = () => {
    if (!confirmDelete) return;
    eliminarProveedor.mutate(confirmDelete.id, {
      onSuccess: () => { setConfirmDelete(null); toast.success("Proveedor eliminado."); },
      onError: (err) => { toast.error(`Error al eliminar: ${err.message}`); setConfirmDelete(null); },
    });
  };

  const toggleMat = (id: string) => {
    const prev = editForm.materialesIds ?? [];
    setEditForm({
      ...editForm,
      materialesIds: prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    });
  };

  return (
    <div>
      <PageHeader
        title="Proveedores"
        crumbs={[{ label: "Compras" }, { label: "Proveedores" }]}
        actions={
          <Link to="/compras/proveedores/nuevo">
            <Button><Plus className="h-4 w-4" /> Nuevo proveedor</Button>
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
                {puedeEditar && <th className="px-3 py-2 w-16" />}
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
                  {puedeEditar && (
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => abrirEdit(p)}
                          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(p)}
                          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal editar — portal al body para evitar stacking context */}
      {editando && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-xl">
            <h2 className="mb-4 text-sm font-semibold">Editar proveedor</h2>
            {editError && <ErrorBanner>{editError}</ErrorBanner>}
            <div className="space-y-3">
              <Field label="Nombre" required>
                <TextInput value={editForm.nombre ?? ""} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} />
              </Field>
              <Field label="Persona de contacto">
                <TextInput value={editForm.contacto ?? ""} onChange={(e) => setEditForm({ ...editForm, contacto: e.target.value })} />
              </Field>
              <Field label="Teléfono">
                <TextInput value={editForm.telefono ?? ""} onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })} />
              </Field>
              <Field label="Email" required>
                <TextInput type="email" value={editForm.email ?? ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              </Field>
              <Field label="Condiciones de pago">
                <TextInput value={editForm.condicionesPago ?? ""} onChange={(e) => setEditForm({ ...editForm, condicionesPago: e.target.value })} />
              </Field>
              <Field label="Materiales que suministra">
                <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                  {materiales.map((m) => (
                    <label key={m.id} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input type="checkbox" checked={(editForm.materialesIds ?? []).includes(m.id)} onChange={() => toggleMat(m.id)} className="h-3.5 w-3.5" />
                      {m.nombre}
                    </label>
                  ))}
                </div>
              </Field>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditando(null)}>Cancelar</Button>
              <Button onClick={guardarEdit} disabled={actualizarProveedor.isPending}>
                {actualizarProveedor.isPending ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* Modal confirmar eliminar — portal al body */}
      {confirmDelete && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-5 shadow-xl">
            <h2 className="text-sm font-semibold">¿Eliminar proveedor?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Se eliminará <strong>{confirmDelete.nombre}</strong> permanentemente.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
              <Button variant="danger" onClick={confirmarEliminar} disabled={eliminarProveedor.isPending}>
                {eliminarProveedor.isPending ? "Eliminando…" : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
