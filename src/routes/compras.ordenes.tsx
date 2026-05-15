import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMe } from "@/hooks/api/use-auth";
import { useProyectos } from "@/hooks/api/use-comercial";
import { ApiError } from "@/lib/api-client";
import {
  useProveedores,
  useOrdenesCompra,
  useCrearOrdenCompra,
  useActualizarOrdenCompra,
  useEliminarOrdenCompra,
  type OrdenCompra,
} from "@/hooks/api/use-compras";
import { PageHeader, EmptyState, SuccessBanner, ErrorBanner } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";

export const Route = createFileRoute("/compras/ordenes")({
  component: OrdenesCompraPage,
});

type OrdenEstado = "borrador" | "enviada" | "recibida" | "cancelada";

function OrdenesCompraPage() {
  const { data: usuario } = useMe();
  const { data: ordenes = [] } = useOrdenesCompra();
  const { data: proyectos = [] } = useProyectos();
  const { data: proveedores = [] } = useProveedores();
  const crearOrden = useCrearOrdenCompra();
  const actualizarOrden = useActualizarOrdenCompra();
  const eliminarOrden = useEliminarOrdenCompra();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ proyectoId: "", proveedorId: "", fechaEntregaEstimada: "", notas: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [ok, setOk] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const [editando, setEditando] = useState<OrdenCompra | null>(null);
  const [editForm, setEditForm] = useState<Partial<OrdenCompra>>({});
  const [editError, setEditError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<OrdenCompra | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const puedeEditar = (usuario?.esAdmin || usuario?.areas.includes("compras")) ?? false;

  const ordenesFiltradas = ordenes.filter((o) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    const proy = proyectos.find((p) => p.id === o.proyectoId) as { codigo?: string } | undefined;
    return o.codigo.toLowerCase().includes(q) || (proy?.codigo?.toLowerCase().includes(q) ?? false);
  });

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.proveedorId) errs.proveedorId = "Selecciona un proveedor.";
    if (!form.fechaEntregaEstimada) errs.fechaEntregaEstimada = "Ingresa la fecha estimada.";
    if (Object.keys(errs).length) return setFieldErrors(errs);
    crearOrden.mutate(
      { proyectoId: form.proyectoId || null, proveedorId: form.proveedorId, fechaEntregaEstimada: form.fechaEntregaEstimada, notas: form.notas || null, solicitudId: null, items: [] },
      {
        onSuccess: () => {
          setOk("Orden de compra creada.");
          setShowForm(false);
          setForm({ proyectoId: "", proveedorId: "", fechaEntregaEstimada: "", notas: "" });
          setFieldErrors({});
          setTimeout(() => setOk(null), 2500);
        },
      },
    );
  };

  const abrirEdit = (o: OrdenCompra) => {
    setEditando(o);
    setEditForm({ proveedorId: o.proveedorId, fechaEntregaEstimada: o.fechaEntregaEstimada, notas: o.notas ?? "" });
    setEditError(null);
  };

  const guardarEdit = () => {
    if (!editando) return;
    actualizarOrden.mutate(
      { id: editando.id, ...editForm },
      {
        onSuccess: () => { setEditando(null); toast.success("Orden actualizada."); },
        onError: () => setEditError("No se pudo guardar. Intenta nuevamente."),
      },
    );
  };

  const confirmarEliminar = () => {
    if (!confirmDelete) return;
    setDeleteError(null);
    eliminarOrden.mutate(confirmDelete.id, {
      onSuccess: () => { setConfirmDelete(null); toast.success("Orden eliminada."); },
      onError: (err) => {
        const msg = err instanceof ApiError ? `Error ${err.status}: ${err.message || "sin detalle"}` : String(err);
        setDeleteError(msg);
      },
    });
  };

  return (
    <div>
      <PageHeader
        title="Órdenes de compra"
        crumbs={[{ label: "Compras" }, { label: "Órdenes" }]}
        actions={puedeEditar ? <Button onClick={() => setShowForm((v) => !v)}><Plus className="h-4 w-4" /> {showForm ? "Cancelar" : "Nueva orden"}</Button> : undefined}
      />
      {ok && <SuccessBanner>{ok}</SuccessBanner>}
      <div className="mb-3 flex items-center gap-2">
        <input
          type="search"
          placeholder="Buscar por código o proyecto…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-xs rounded-md border border-border bg-surface px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        {busqueda && <span className="text-xs text-muted-foreground">{ordenesFiltradas.length} resultado(s)</span>}
      </div>

      {showForm && (
        <form onSubmit={guardar} className="mb-4 space-y-4 rounded-lg border border-border bg-surface p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Proyecto" error={fieldErrors.proyectoId}>
              <Select value={form.proyectoId} onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}>
                <option value="">Selecciona...</option>
                {proyectos.map((p) => <option key={p.id} value={p.id}>{(p as { codigo?: string }).codigo} — {p.titulo}</option>)}
              </Select>
            </Field>
            <Field label="Proveedor" required error={fieldErrors.proveedorId}>
              <Select value={form.proveedorId} onChange={(e) => setForm({ ...form, proveedorId: e.target.value })}>
                <option value="">Selecciona...</option>
                {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </Select>
            </Field>
            <Field label="Fecha entrega estimada" required error={fieldErrors.fechaEntregaEstimada}>
              <TextInput type="date" value={form.fechaEntregaEstimada} onChange={(e) => setForm({ ...form, fechaEntregaEstimada: e.target.value })} />
            </Field>
            <Field label="Notas">
              <TextInput value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" disabled={crearOrden.isPending}>{crearOrden.isPending ? "Creando…" : "Crear orden"}</Button>
          </div>
        </form>
      )}

      {ordenesFiltradas.length === 0 ? (
        <EmptyState
          title={busqueda ? "Sin resultados" : "Sin órdenes de compra"}
          description={busqueda ? `No hay órdenes que coincidan con "${busqueda}".` : "Crea la primera orden de compra."}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Código</th>
                <th className="px-3 py-2 text-left font-medium">Proyecto</th>
                <th className="px-3 py-2 text-left font-medium">Proveedor</th>
                <th className="px-3 py-2 text-left font-medium">Entrega est.</th>
                <th className="px-3 py-2 text-left font-medium">Estado</th>
                {puedeEditar && <th className="px-3 py-2 w-16" />}
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.map((o) => {
                const proy = proyectos.find((p) => p.id === o.proyectoId) as { codigo?: string } | undefined;
                const prov = proveedores.find((p) => p.id === o.proveedorId);
                return (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{o.codigo}</td>
                    <td className="px-3 py-2 text-muted-foreground">{proy?.codigo ?? (o.proyectoId ? o.proyectoId : "—")}</td>
                    <td className="px-3 py-2 text-muted-foreground">{prov?.nombre ?? o.proveedorId}</td>
                    <td className="px-3 py-2 text-muted-foreground">{o.fechaEntregaEstimada}</td>
                    <td className="px-3 py-2">
                      <select
                        value={o.estado}
                        disabled={!puedeEditar}
                        onChange={(ev) => actualizarOrden.mutate({ id: o.id, estado: ev.target.value as OrdenEstado })}
                        className="rounded border border-border bg-surface px-2 py-0.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="borrador">Borrador</option>
                        <option value="enviada">Enviada</option>
                        <option value="recibida">Recibida</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </td>
                    {puedeEditar && (
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => abrirEdit(o)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" title="Editar">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => { setConfirmDelete(o); setDeleteError(null); }} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive" title="Eliminar">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal editar orden */}
      {editando && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-xl">
            <h2 className="mb-4 text-sm font-semibold">Editar orden {editando.codigo}</h2>
            {editError && <ErrorBanner>{editError}</ErrorBanner>}
            <div className="space-y-3">
              <Field label="Proveedor">
                <Select value={editForm.proveedorId ?? ""} onChange={(e) => setEditForm({ ...editForm, proveedorId: e.target.value })}>
                  {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </Select>
              </Field>
              <Field label="Fecha entrega estimada">
                <TextInput type="date" value={editForm.fechaEntregaEstimada ?? ""} onChange={(e) => setEditForm({ ...editForm, fechaEntregaEstimada: e.target.value })} />
              </Field>
              <Field label="Notas">
                <TextInput value={editForm.notas ?? ""} onChange={(e) => setEditForm({ ...editForm, notas: e.target.value })} />
              </Field>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditando(null)}>Cancelar</Button>
              <Button onClick={guardarEdit} disabled={actualizarOrden.isPending}>{actualizarOrden.isPending ? "Guardando…" : "Guardar"}</Button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* Modal confirmar eliminar orden */}
      {confirmDelete && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-5 shadow-xl">
            <h2 className="text-sm font-semibold">¿Eliminar orden de compra?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Se eliminará <strong>{confirmDelete.codigo}</strong> permanentemente.
            </p>
            {deleteError && <p className="mt-2 rounded bg-destructive/10 px-3 py-2 text-xs text-destructive">{deleteError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
              <Button variant="danger" onClick={confirmarEliminar} disabled={eliminarOrden.isPending}>
                {eliminarOrden.isPending ? "Eliminando…" : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
