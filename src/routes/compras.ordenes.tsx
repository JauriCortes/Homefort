import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Plus, Pencil, Trash2, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";
import { formatCOP } from "@/lib/store";
import { useMe } from "@/hooks/api/use-auth";
import { useProyectos } from "@/hooks/api/use-comercial";
import { ApiError } from "@/lib/api-client";
import {
  useProveedores,
  useStock,
  useCrearMaterial,
  useOrdenesCompra,
  useCrearOrdenCompra,
  useActualizarOrdenCompra,
  useEliminarOrdenCompra,
  useRegistrarMovimiento,
  type OrdenCompra,
  type Material,
  type MaterialConStock,
} from "@/hooks/api/use-compras";
import { PageHeader, EmptyState, SuccessBanner, ErrorBanner } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";

export const Route = createFileRoute("/compras/ordenes")({
  component: OrdenesCompraPage,
});

type OrdenEstado = "borrador" | "enviada" | "recibida" | "cancelada";

const GRUPOS: { estado: OrdenEstado; label: string; underline: string }[] = [
  { estado: "borrador",  label: "Borrador",  underline: "border-border" },
  { estado: "enviada",   label: "Enviada",   underline: "border-blue-500" },
  { estado: "recibida",  label: "Recibida",  underline: "border-green-500" },
  { estado: "cancelada", label: "Cancelada", underline: "border-destructive" },
];

const SIGUIENTE: Partial<Record<OrdenEstado, OrdenEstado>> = {
  borrador: "enviada",
  enviada: "recibida",
};

const LABEL_SIGUIENTE: Partial<Record<OrdenEstado, string>> = {
  borrador: "Marcar como enviada",
  enviada: "Marcar como recibida",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

interface FilaItem {
  materialNombre: string;
  cantidad: string;
  precioUnitario: string;
}

function crearFila(): FilaItem {
  return { materialNombre: "", cantidad: "", precioUnitario: "" };
}

function resolverItems(filas: FilaItem[], materiales: MaterialConStock[]) {
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

// ── Sub-components ────────────────────────────────────────────────────────────

function MaterialAutocomplete({
  value,
  materiales,
  onChange,
}: {
  value: string;
  materiales: MaterialConStock[];
  onChange: (nombre: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  const filtradas = value.trim()
    ? materiales.filter((m) => m.nombre.toLowerCase().includes(value.trim().toLowerCase()))
    : materiales.slice(0, 8);

  const handleFocus = () => {
    if (inputRef.current) {
      const r = inputRef.current.getBoundingClientRect();
      setPos({ top: r.bottom, left: r.left, width: Math.max(r.width, 208) });
    }
    setOpen(true);
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder="Material o descripción…"
        className="w-full rounded border border-border bg-transparent px-2 py-1.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />
      {open && filtradas.length > 0 && createPortal(
        <ul
          style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
          className="max-h-40 overflow-y-auto rounded-md border border-border bg-surface text-sm shadow-md"
        >
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
        </ul>,
        document.body,
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
  materiales: MaterialConStock[];
  onChange: (i: number, patch: Partial<FilaItem>) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  const total = filas.reduce((sum, f) => {
    return sum + (parseFloat(f.cantidad) || 0) * (parseFloat(f.precioUnitario) || 0);
  }, 0);

  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium w-52">Material / descripción</th>
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
          <span className="text-xs font-medium tabular-nums">Total: {formatCOP(total)}</span>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function OrdenesCompraPage() {
  const { data: usuario } = useMe();
  const { data: ordenes = [] } = useOrdenesCompra();
  const { data: proyectos = [] } = useProyectos();
  const { data: proveedores = [] } = useProveedores();
  const { data: materiales = [] } = useStock();
  const crearOrden = useCrearOrdenCompra();
  const actualizarOrden = useActualizarOrdenCompra();
  const eliminarOrden = useEliminarOrdenCompra();
  const crearMaterial = useCrearMaterial();
  const registrarMovimiento = useRegistrarMovimiento();

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

  const [pendingTransicion, setPendingTransicion] = useState<{ orden: OrdenCompra; nuevoEstado: OrdenEstado } | null>(null);
  const [transicionError, setTransicionError] = useState<string | null>(null);
  const [transicionando, setTransicionando] = useState(false);

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

  const confirmarTransicion = async () => {
    if (!pendingTransicion) return;
    const { orden, nuevoEstado } = pendingTransicion;
    setTransicionError(null);
    setTransicionando(true);

    if (nuevoEstado === "recibida" && orden.items.length > 0) {
      // Mapa nombre → id con los materiales ya conocidos
      const materialMap = new Map<string, string>(
        materiales.map((m) => [m.nombre.toLowerCase(), m.id]),
      );
      try {
        for (const item of orden.items) {
          const nombreNorm = item.descripcion.trim().toLowerCase();
          // Buscar o crear el material
          let materialId = materialMap.get(nombreNorm);
          if (!materialId) {
            const nuevo = await new Promise<Material>((resolve, reject) =>
              crearMaterial.mutate(
                { nombre: item.descripcion.trim(), categoria: "general", unidad: "unidad", costoUnitario: item.precioUnitario },
                { onSuccess: resolve, onError: reject },
              ),
            );
            materialId = nuevo.id;
            materialMap.set(nombreNorm, materialId);
          }
          // Registrar entrada
          await new Promise<void>((resolve, reject) =>
            registrarMovimiento.mutate(
              {
                materialId,
                tipo: "entrada",
                cantidad: item.cantidad,
                fecha: new Date().toISOString().slice(0, 10),
                proveedorId: orden.proveedorId,
                proyectoId: orden.proyectoId,
                notas: `Recepción automática — ${orden.codigo}`,
              },
              { onSuccess: () => resolve(), onError: reject },
            ),
          );
        }
      } catch {
        setTransicionError("Error al registrar en inventario. Intenta nuevamente.");
        setTransicionando(false);
        return;
      }
    }

    actualizarOrden.mutate(
      { id: orden.id, estado: nuevoEstado },
      {
        onSuccess: () => {
          setPendingTransicion(null);
          setTransicionando(false);
          const msg =
            nuevoEstado === "recibida"
              ? "Orden recibida y stock actualizado."
              : nuevoEstado === "cancelada"
                ? "Orden cancelada."
                : "Estado actualizado.";
          toast.success(msg);
        },
        onError: () => {
          setTransicionError("No se pudo actualizar el estado.");
          setTransicionando(false);
        },
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

  const totalOrdenes = ordenesFiltradas.length;

  return (
    <div>
      <PageHeader
        title="Órdenes de compra"
        crumbs={[{ label: "Compras" }, { label: "Órdenes" }]}
        actions={
          puedeEditar ? (
            <Button onClick={() => { setShowForm((v) => !v); setFilas([crearFila()]); setFormError(null); }}>
              <Plus className="h-4 w-4" /> {showForm ? "Cancelar" : "Nueva orden"}
            </Button>
          ) : undefined
        }
      />
      {ok && <SuccessBanner>{ok}</SuccessBanner>}

      <div className="mb-4 flex items-center gap-2">
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
        <form onSubmit={guardar} className="mb-6 space-y-4 rounded-lg border border-border bg-surface p-4">
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

      {/* Grouped by estado */}
      {totalOrdenes === 0 ? (
        <EmptyState
          title={busqueda ? "Sin resultados" : "Sin órdenes de compra"}
          description={busqueda ? `No hay órdenes que coincidan con "${busqueda}".` : "Crea la primera orden de compra."}
        />
      ) : (
        <div className="space-y-6">
          {GRUPOS.map(({ estado, label, underline }) => {
            const lista = ordenesFiltradas.filter((o) => o.estado === estado);
            if (lista.length === 0) return null;
            return (
              <section key={estado}>
                <h3 className={`mb-3 border-b-2 pb-1 text-sm font-semibold ${underline}`}>{label}</h3>
                <div className="overflow-hidden rounded-lg border border-border bg-surface">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Código</th>
                        <th className="px-3 py-2 text-left font-medium">Proyecto</th>
                        <th className="px-3 py-2 text-left font-medium">Proveedor</th>
                        <th className="px-3 py-2 text-left font-medium">Entrega est.</th>
                        <th className="px-3 py-2 text-right font-medium">Total</th>
                        {puedeEditar && <th className="px-3 py-2 w-56 text-right font-medium" />}
                      </tr>
                    </thead>
                    <tbody>
                      {lista.map((o) => {
                        const proy = proyectos.find((p) => p.id === o.proyectoId) as { codigo?: string } | undefined;
                        const prov = proveedores.find((p) => p.id === o.proveedorId);
                        const total = ordenTotal(o);
                        const siguienteEstado = SIGUIENTE[o.estado];
                        return (
                          <tr key={o.id} className="border-t border-border">
                            <td className="px-3 py-2 font-medium">{o.codigo}</td>
                            <td className="px-3 py-2 text-muted-foreground">{proy?.codigo ?? (o.proyectoId ? o.proyectoId : "—")}</td>
                            <td className="px-3 py-2 text-muted-foreground">{prov?.nombre ?? o.proveedorId}</td>
                            <td className="px-3 py-2 text-muted-foreground">{o.fechaEntregaEstimada}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                              {total > 0 ? formatCOP(total) : <span className="text-xs">—</span>}
                            </td>
                            {puedeEditar && (
                              <td className="px-3 py-2">
                                <div className="flex items-center justify-end gap-1">
                                  {siguienteEstado && (
                                    <button
                                      onClick={() => { setPendingTransicion({ orden: o, nuevoEstado: siguienteEstado }); setTransicionError(null); }}
                                      className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
                                    >
                                      <ArrowRight className="h-3 w-3" />
                                      {LABEL_SIGUIENTE[o.estado]}
                                    </button>
                                  )}
                                  {(o.estado === "borrador" || o.estado === "enviada") && (
                                    <button
                                      onClick={() => { setPendingTransicion({ orden: o, nuevoEstado: "cancelada" }); setTransicionError(null); }}
                                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                                      title="Cancelar orden"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  )}
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
              </section>
            );
          })}
        </div>
      )}

      {/* Modal — confirmar transición de estado */}
      {pendingTransicion && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-5 shadow-xl">
            {pendingTransicion.nuevoEstado === "cancelada" ? (
              <>
                <h2 className="text-sm font-semibold">¿Cancelar esta orden?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  La orden <strong>{pendingTransicion.orden.codigo}</strong> se marcará como cancelada.
                </p>
              </>
            ) : pendingTransicion.nuevoEstado === "enviada" ? (
              <>
                <h2 className="text-sm font-semibold">¿Marcar como enviada?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  La orden <strong>{pendingTransicion.orden.codigo}</strong> se marcará como enviada al proveedor.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-sm font-semibold">¿Confirmar recepción?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  La orden <strong>{pendingTransicion.orden.codigo}</strong> se marcará como recibida.
                </p>
                {pendingTransicion.orden.items.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-green-600">Se registrarán en inventario:</p>
                    <ul className="mt-1 space-y-0.5">
                      {pendingTransicion.orden.items.map((item, i) => (
                        <li key={i} className="text-xs text-muted-foreground">
                          • {item.descripcion} — {item.cantidad} {materiales.find((m) => m.id === item.materialId)?.unidad ?? "unidades"}
                          {!item.materialId && <span className="ml-1 text-muted-foreground/60">(nuevo)</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">Esta orden no tiene ítems — no se registrará nada en inventario.</p>
                )}
              </>
            )}
            {transicionError && <p className="mt-2 rounded bg-destructive/10 px-3 py-2 text-xs text-destructive">{transicionError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPendingTransicion(null)}>Volver</Button>
              <Button
                variant={pendingTransicion.nuevoEstado === "cancelada" ? "danger" : "primary"}
                onClick={confirmarTransicion}
                disabled={transicionando}
              >
                {transicionando
                  ? "Procesando…"
                  : pendingTransicion.nuevoEstado === "cancelada"
                    ? "Cancelar orden"
                    : pendingTransicion.nuevoEstado === "recibida"
                      ? "Confirmar recepción"
                      : "Marcar como enviada"}
              </Button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* Modal — editar orden */}
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

      {/* Modal — confirmar eliminar orden */}
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
