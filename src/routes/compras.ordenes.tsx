import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCOP } from "@/lib/store";
import { useMe } from "@/hooks/api/use-auth";
import { useProyectos } from "@/hooks/api/use-comercial";
import { ApiError } from "@/lib/api-client";
import {
  useProveedores,
  useMateriales,
  useOrdenesCompra,
  useCrearOrdenCompra,
  useActualizarOrdenCompra,
  useEliminarOrdenCompra,
  type OrdenCompra,
  type Material,
} from "@/hooks/api/use-compras";
import { PageHeader, EmptyState, SuccessBanner, ErrorBanner } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";

export const Route = createFileRoute("/compras/ordenes")({
  component: OrdenesCompraPage,
});

type OrdenEstado = "borrador" | "enviada" | "recibida" | "cancelada";

interface FilaItem {
  materialNombre: string;
  cantidad: string;
  precioUnitario: string;
}

function crearFila(): FilaItem {
  return { materialNombre: "", cantidad: "", precioUnitario: "" };
}

function MaterialAutocomplete({
  value,
  materiales,
  onChange,
}: {
  value: string;
  materiales: Material[];
  onChange: (nombre: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const filtradas = materiales.filter(
    (m) => value.trim() && m.nombre.toLowerCase().includes(value.trim().toLowerCase()),
  );
  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder="Material…"
        className="w-full rounded border border-border bg-transparent px-2 py-1.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />
      {open && filtradas.length > 0 && (
        <ul className="absolute left-0 top-full z-20 mt-0.5 max-h-40 w-52 overflow-y-auto rounded-md border border-border bg-surface text-sm shadow-md">
          {filtradas.map((m) => (
            <li
              key={m.id}
              onMouseDown={() => { onChange(m.nombre); setOpen(false); }}
              className="flex cursor-pointer items-center justify-between px-3 py-1.5 hover:bg-muted"
            >
              <span>{m.nombre}</span>
              <span className="ml-2 text-xs text-muted-foreground">{m.unidad}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NumericInput({
  value,
  onChange,
  placeholder,
  allowDecimals = false,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  allowDecimals?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const num = allowDecimals ? parseFloat(value) : parseInt(value, 10);
  const formatted =
    !isNaN(num) && value !== ""
      ? num.toLocaleString("es-CO", allowDecimals ? { maximumFractionDigits: 3 } : {})
      : "";
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(allowDecimals ? /[^\d.]/g : /[^\d]/g, "");
      onChange(raw);
    },
    [allowDecimals, onChange],
  );
  return (
    <input
      type="text"
      inputMode={allowDecimals ? "decimal" : "numeric"}
      value={editing ? value : formatted}
      placeholder={placeholder}
      className={className}
      onFocus={() => setEditing(true)}
      onBlur={() => setEditing(false)}
      onChange={handleChange}
    />
  );
}

function ItemsTable({
  filas,
  materiales,
  onChange,
  onAdd,
  onRemove,
}: {
  filas: FilaItem[];
  materiales: Material[];
  onChange: (i: number, patch: Partial<FilaItem>) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  const total = filas.reduce((sum, f) => {
    const c = parseFloat(f.cantidad) || 0;
    const p = parseFloat(f.precioUnitario) || 0;
    return sum + c * p;
  }, 0);

  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium w-52">Material</th>
              <th className="px-3 py-2 text-left font-medium w-24">Cantidad</th>
              <th className="px-3 py-2 text-left font-medium w-32">Precio unit.</th>
              <th className="px-3 py-2 text-right font-medium w-32">Total</th>
              <th className="px-3 py-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, i) => {
              const lineTotal = (parseFloat(fila.cantidad) || 0) * (parseFloat(fila.precioUnitario) || 0);
              return (
                <tr key={i} className="border-t border-border">
                  <td className="px-2 py-1">
                    <MaterialAutocomplete
                      value={fila.materialNombre}
                      materiales={materiales}
                      onChange={(nombre) => onChange(i, { materialNombre: nombre })}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <NumericInput
                      allowDecimals
                      value={fila.cantidad}
                      placeholder="0"
                      onChange={(v) => onChange(i, { cantidad: v })}
                      className="w-full rounded border border-border bg-transparent px-2 py-1.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <NumericInput
                      value={fila.precioUnitario}
                      placeholder="0"
                      onChange={(v) => onChange(i, { precioUnitario: v })}
                      className="w-full rounded border border-border bg-transparent px-2 py-1.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
                    />
                  </td>
                  <td className="px-3 py-1 text-right tabular-nums text-muted-foreground">
                    {lineTotal > 0 ? formatCOP(lineTotal) : "—"}
                  </td>
                  <td className="px-2 py-1">
                    {filas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemove(i)}
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-border px-3 py-2">
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> Agregar fila
        </button>
        {total > 0 && (
          <span className="text-xs font-medium tabular-nums">
            Total: {formatCOP(total)}
          </span>
        )}
      </div>
    </div>
  );
}

function resolverItems(filas: FilaItem[], materiales: Material[]) {
  return filas
    .filter((f) => f.materialNombre.trim() && f.cantidad)
    .map((f) => {
      const mat = materiales.find(
        (m) => m.nombre.toLowerCase() === f.materialNombre.trim().toLowerCase(),
      );
      return {
        materialId: mat?.id ?? null,
        descripcion: f.materialNombre.trim(),
        cantidad: Number(f.cantidad),
        precioUnitario: Number(f.precioUnitario) || 0,
      };
    });
}

function OrdenesCompraPage() {
  const { data: usuario } = useMe();
  const { data: ordenes = [] } = useOrdenesCompra();
  const { data: proyectos = [] } = useProyectos();
  const { data: proveedores = [] } = useProveedores();
  const { data: materiales = [] } = useMateriales();
  const crearOrden = useCrearOrdenCompra();
  const actualizarOrden = useActualizarOrdenCompra();
  const eliminarOrden = useEliminarOrdenCompra();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ proyectoId: "", proveedorId: "", fechaEntregaEstimada: "", notas: "" });
  const [filas, setFilas] = useState<FilaItem[]>([crearFila()]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const [editando, setEditando] = useState<OrdenCompra | null>(null);
  const [editForm, setEditForm] = useState<Partial<OrdenCompra>>({});
  const [editFilas, setEditFilas] = useState<FilaItem[]>([crearFila()]);
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

  const setFila = (i: number, patch: Partial<FilaItem>) =>
    setFilas((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));

  const setEditFila = (i: number, patch: Partial<FilaItem>) =>
    setEditFilas((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const errs: Record<string, string> = {};
    if (!form.proveedorId) errs.proveedorId = "Selecciona un proveedor.";
    if (!form.fechaEntregaEstimada) errs.fechaEntregaEstimada = "Ingresa la fecha estimada.";
    if (Object.keys(errs).length) return setFieldErrors(errs);

    const items = resolverItems(filas, materiales);
    crearOrden.mutate(
      { proyectoId: form.proyectoId || null, proveedorId: form.proveedorId, fechaEntregaEstimada: form.fechaEntregaEstimada, notas: form.notas || null, solicitudId: null, items },
      {
        onSuccess: () => {
          setOk("Orden de compra creada.");
          setShowForm(false);
          setForm({ proyectoId: "", proveedorId: "", fechaEntregaEstimada: "", notas: "" });
          setFilas([crearFila()]);
          setFieldErrors({});
          setTimeout(() => setOk(null), 2500);
        },
      },
    );
  };

  const abrirEdit = (o: OrdenCompra) => {
    setEditando(o);
    setEditForm({ proveedorId: o.proveedorId, fechaEntregaEstimada: o.fechaEntregaEstimada, notas: o.notas ?? "" });
    setEditFilas(
      o.items.length > 0
        ? o.items.map((item) => ({
            materialNombre: item.descripcion || (materiales.find((m) => m.id === item.materialId)?.nombre ?? ""),
            cantidad: String(item.cantidad),
            precioUnitario: String(item.precioUnitario),
          }))
        : [crearFila()],
    );
    setEditError(null);
  };

  const guardarEdit = () => {
    if (!editando) return;
    const items = resolverItems(editFilas, materiales);
    actualizarOrden.mutate(
      { id: editando.id, ...editForm, items },
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

  const ordenTotal = (o: OrdenCompra) =>
    o.items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0);

  return (
    <div>
      <PageHeader
        title="Órdenes de compra"
        crumbs={[{ label: "Compras" }, { label: "Órdenes" }]}
        actions={puedeEditar ? <Button onClick={() => { setShowForm((v) => !v); setFilas([crearFila()]); setFormError(null); }}><Plus className="h-4 w-4" /> {showForm ? "Cancelar" : "Nueva orden"}</Button> : undefined}
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
          {formError && <ErrorBanner>{formError}</ErrorBanner>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Proyecto" error={fieldErrors.proyectoId}>
              <Select value={form.proyectoId} onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}>
                <option value="">Sin proyecto…</option>
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
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Ítems a ordenar</p>
            <ItemsTable
              filas={filas}
              materiales={materiales}
              onChange={setFila}
              onAdd={() => setFilas((p) => [...p, crearFila()])}
              onRemove={(i) => setFilas((p) => p.filter((_, idx) => idx !== i))}
            />
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
                <th className="px-3 py-2 text-right font-medium">Total</th>
                <th className="px-3 py-2 text-left font-medium">Estado</th>
                {puedeEditar && <th className="px-3 py-2 w-16" />}
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.map((o) => {
                const proy = proyectos.find((p) => p.id === o.proyectoId) as { codigo?: string } | undefined;
                const prov = proveedores.find((p) => p.id === o.proveedorId);
                const total = ordenTotal(o);
                return (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{o.codigo}</td>
                    <td className="px-3 py-2 text-muted-foreground">{proy?.codigo ?? (o.proyectoId ? o.proyectoId : "—")}</td>
                    <td className="px-3 py-2 text-muted-foreground">{prov?.nombre ?? o.proveedorId}</td>
                    <td className="px-3 py-2 text-muted-foreground">{o.fechaEntregaEstimada}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                      {total > 0 ? formatCOP(total) : <span className="text-xs">—</span>}
                    </td>
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
          <div className="w-full max-w-2xl rounded-lg border border-border bg-surface p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-sm font-semibold">Editar orden {editando.codigo}</h2>
            {editError && <ErrorBanner>{editError}</ErrorBanner>}
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Proveedor">
                  <Select value={editForm.proveedorId ?? ""} onChange={(e) => setEditForm({ ...editForm, proveedorId: e.target.value })}>
                    {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </Select>
                </Field>
                <Field label="Fecha entrega estimada">
                  <TextInput type="date" value={editForm.fechaEntregaEstimada ?? ""} onChange={(e) => setEditForm({ ...editForm, fechaEntregaEstimada: e.target.value })} />
                </Field>
                <Field label="Notas" className="sm:col-span-2">
                  <TextInput value={editForm.notas ?? ""} onChange={(e) => setEditForm({ ...editForm, notas: e.target.value })} />
                </Field>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Ítems a ordenar</p>
                <ItemsTable
                  filas={editFilas}
                  materiales={materiales}
                  onChange={setEditFila}
                  onAdd={() => setEditFilas((p) => [...p, crearFila()])}
                  onRemove={(i) => setEditFilas((p) => p.filter((_, idx) => idx !== i))}
                />
              </div>
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
