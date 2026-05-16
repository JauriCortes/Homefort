import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, SlidersHorizontal, Check, X } from "lucide-react";
import { formatCOP } from "@/lib/store";
import { useMe } from "@/hooks/api/use-auth";
import {
  useStock,
  useProveedores,
  useCrearMaterial,
  useRegistrarMovimiento,
  type MaterialConStock,
} from "@/hooks/api/use-compras";
import { PageHeader, ErrorBanner, SuccessBanner } from "@/components/ui-bits";
import { Button } from "@/components/form-bits";
import { toast } from "sonner";

export const Route = createFileRoute("/compras/inventario")({
  component: InventarioPage,
});

interface FilaEntrada {
  materialNombre: string;
  cantidad: string;
  proveedorId: string;
  notas: string;
}

function crearFila(): FilaEntrada {
  return { materialNombre: "", cantidad: "", proveedorId: "", notas: "" };
}

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

function StockInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      step="1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-20 rounded border border-ring bg-transparent px-2 py-0.5 text-right text-sm tabular-nums outline-none focus:ring-1 focus:ring-ring/30"
    />
  );
}

function InventarioPage() {
  const { data: usuario } = useMe();
  const { data: stocks = [] } = useStock();
  const { data: proveedores = [] } = useProveedores();
  const crearMaterial = useCrearMaterial();
  const registrar = useRegistrarMovimiento();

  const [showForm, setShowForm] = useState(false);
  const [filas, setFilas] = useState<FilaEntrada[]>([crearFila()]);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Inline stock editing
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ disponible: "", bloqueado: "", consumido: "" });
  const [editError, setEditError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const puedeEditar = (usuario?.esAdmin || usuario?.areas.includes("compras")) ?? false;

  const setFila = (i: number, patch: Partial<FilaEntrada>) =>
    setFilas((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const filasValidas = filas.filter((f) => f.materialNombre.trim() && f.cantidad);
    if (!filasValidas.length) return setError("Agrega al menos una fila con material y cantidad.");

    const materialMap = new Map<string, string>(
      stocks.map((m) => [m.nombre.toLowerCase(), m.id]),
    );

    try {
      for (const fila of filasValidas) {
        if (Number(fila.cantidad) <= 0) return setError("La cantidad debe ser mayor a 0.");
        const nombreNorm = fila.materialNombre.trim().toLowerCase();
        let materialId = materialMap.get(nombreNorm);
        if (!materialId) {
          const nuevo = await new Promise<{ id: string }>((resolve, reject) =>
            crearMaterial.mutate(
              { nombre: fila.materialNombre.trim(), categoria: "general", unidad: "unidad" },
              { onSuccess: resolve, onError: reject },
            ),
          );
          materialId = nuevo.id;
          materialMap.set(nombreNorm, materialId);
        }
        await new Promise<void>((resolve, reject) =>
          registrar.mutate(
            {
              materialId,
              tipo: "entrada",
              cantidad: Number(fila.cantidad),
              fecha: new Date().toISOString().slice(0, 10),
              proveedorId: fila.proveedorId || null,
              proyectoId: null,
              notas: fila.notas || null,
            },
            { onSuccess: () => resolve(), onError: reject },
          ),
        );
      }
      setOk(`${filasValidas.length} entrada(s) registrada(s).`);
      setFilas([crearFila()]);
      setShowForm(false);
      setTimeout(() => setOk(null), 3000);
    } catch {
      setError("Error al registrar algunas entradas. Intenta nuevamente.");
    }
  };

  const abrirEdicion = (m: MaterialConStock) => {
    setEditandoId(m.id);
    setEditValues({
      disponible: String(m.disponible),
      bloqueado: String(m.bloqueado),
      consumido: String(m.consumido),
    });
    setEditError(null);
  };

  const guardarEdicion = async (m: MaterialConStock) => {
    const newDisponible = parseFloat(editValues.disponible) || 0;
    const newBloqueado = parseFloat(editValues.bloqueado) || 0;
    const newConsumido = parseFloat(editValues.consumido) || 0;

    if (newDisponible < 0 || newBloqueado < 0 || newConsumido < 0) {
      setEditError("Los valores no pueden ser negativos.");
      return;
    }

    const movimientos: { tipo: "ajuste" | "bloqueo" | "consumo"; cantidad: number }[] = [];
    const dDisponible = newDisponible - m.disponible;
    const dBloqueado = newBloqueado - m.bloqueado;
    const dConsumido = newConsumido - m.consumido;

    if (dDisponible !== 0) movimientos.push({ tipo: "ajuste", cantidad: dDisponible });
    if (dBloqueado !== 0) movimientos.push({ tipo: "bloqueo", cantidad: dBloqueado });
    if (dConsumido !== 0) movimientos.push({ tipo: "consumo", cantidad: dConsumido });

    if (!movimientos.length) { setEditandoId(null); return; }

    setGuardando(true);
    setEditError(null);
    try {
      for (const mov of movimientos) {
        await new Promise<void>((resolve, reject) =>
          registrar.mutate(
            {
              materialId: m.id,
              tipo: mov.tipo,
              cantidad: mov.cantidad,
              fecha: new Date().toISOString().slice(0, 10),
              proveedorId: null,
              proyectoId: null,
              notas: "Ajuste manual",
            },
            { onSuccess: () => resolve(), onError: reject },
          ),
        );
      }
      setEditandoId(null);
      toast.success("Stock actualizado.");
    } catch {
      setEditError("No se pudo guardar. Intenta nuevamente.");
    }
    setGuardando(false);
  };

  return (
    <div>
      <PageHeader
        title="Inventario"
        description="Stock por material basado en movimientos registrados."
        crumbs={[{ label: "Compras" }, { label: "Inventario" }]}
        actions={
          puedeEditar ? (
            <Button onClick={() => { setShowForm((v) => !v); setFilas([crearFila()]); setError(null); }}>
              <Plus className="h-4 w-4" /> {showForm ? "Cancelar" : "Registrar entradas"}
            </Button>
          ) : undefined
        }
      />
      {ok && <SuccessBanner>{ok}</SuccessBanner>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 rounded-lg border border-border bg-surface">
          {error && <div className="px-4 pt-3"><ErrorBanner>{error}</ErrorBanner></div>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium w-48">Material</th>
                  <th className="px-3 py-2 text-left font-medium w-24">Cantidad</th>
                  <th className="px-3 py-2 text-left font-medium w-40">Proveedor</th>
                  <th className="px-3 py-2 text-left font-medium">Notas</th>
                  <th className="px-3 py-2 w-8" />
                </tr>
              </thead>
              <tbody>
                {filas.map((fila, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-2 py-1">
                      <MaterialAutocomplete
                        value={fila.materialNombre}
                        materiales={stocks}
                        onChange={(nombre) => setFila(i, { materialNombre: nombre })}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        min={0}
                        step="1"
                        placeholder="0"
                        value={fila.cantidad}
                        onChange={(e) => setFila(i, { cantidad: e.target.value })}
                        className="w-full rounded border border-border bg-transparent px-2 py-1.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <select
                        value={fila.proveedorId}
                        onChange={(e) => setFila(i, { proveedorId: e.target.value })}
                        className="w-full rounded border border-border bg-surface px-2 py-1.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
                      >
                        <option value="">Sin proveedor</option>
                        {proveedores.map((p) => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        placeholder="Opcional…"
                        value={fila.notas}
                        onChange={(e) => setFila(i, { notas: e.target.value })}
                        className="w-full rounded border border-border bg-transparent px-2 py-1.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
                      />
                    </td>
                    <td className="px-2 py-1">
                      {filas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setFilas((p) => p.filter((_, idx) => idx !== i))}
                          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-3 py-2">
            <button
              type="button"
              onClick={() => setFilas((p) => [...p, crearFila()])}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar fila
            </button>
            <div className="flex gap-2">
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={registrar.isPending}>
                {registrar.isPending ? "Guardando…" : "Guardar entradas"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {stocks.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No hay materiales registrados. Se crean automáticamente al recibir órdenes de compra.
        </p>
      ) : (
        <div className="space-y-6">
          {[
            { label: "En stock", items: stocks.filter((m) => m.disponible > 0), underline: "border-green-500" },
            { label: "Sin existencias", items: stocks.filter((m) => m.disponible <= 0), underline: "border-border" },
          ].map(({ label, items, underline }) => {
            if (!items.length) return null;
            return (
              <section key={label}>
                <h3 className={`mb-3 border-b-2 pb-1 text-sm font-semibold ${underline}`}>{label}</h3>
                <div className="overflow-hidden rounded-lg border border-border bg-surface">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Material</th>
                        <th className="px-3 py-2 text-left font-medium">Categoría</th>
                        <th className="px-3 py-2 text-left font-medium">Unidad</th>
                        <th className="px-3 py-2 text-right font-medium">Disponible</th>
                        <th className="px-3 py-2 text-right font-medium">Bloqueado</th>
                        <th className="px-3 py-2 text-right font-medium">Consumido</th>
                        <th className="px-3 py-2 text-right font-medium">Costo unit.</th>
                        {puedeEditar && <th className="px-3 py-2 w-16" />}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((m) => {
                        const editando = editandoId === m.id;
                        return (
                          <tr key={m.id} className={`border-t border-border ${editando ? "bg-muted/30" : ""}`}>
                            <td className="px-3 py-2 font-medium">{m.nombre}</td>
                            <td className="px-3 py-2 text-muted-foreground">{m.categoria}</td>
                            <td className="px-3 py-2 text-muted-foreground">{m.unidad}</td>
                            <td className="px-3 py-2 text-right">
                              {editando ? (
                                <StockInput value={editValues.disponible} onChange={(v) => setEditValues((p) => ({ ...p, disponible: v }))} />
                              ) : (
                                <span className={`tabular-nums font-medium ${m.disponible <= 0 ? "text-destructive" : "text-success"}`}>{m.disponible}</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {editando ? (
                                <StockInput value={editValues.bloqueado} onChange={(v) => setEditValues((p) => ({ ...p, bloqueado: v }))} />
                              ) : (
                                <span className="tabular-nums text-muted-foreground">{m.bloqueado}</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {editando ? (
                                <StockInput value={editValues.consumido} onChange={(v) => setEditValues((p) => ({ ...p, consumido: v }))} />
                              ) : (
                                <span className="tabular-nums text-muted-foreground">{m.consumido}</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">{formatCOP(m.costoUnitario)}</td>
                            {puedeEditar && (
                              <td className="px-3 py-2">
                                {editando ? (
                                  <div className="flex items-center justify-end gap-1">
                                    {editError && createPortal(
                                      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[300] rounded-md bg-destructive px-4 py-2 text-xs text-destructive-foreground shadow-lg">
                                        {editError}
                                      </div>,
                                      document.body,
                                    )}
                                    <button
                                      onClick={() => guardarEdicion(m)}
                                      disabled={guardando}
                                      className="rounded p-1 text-green-600 hover:bg-muted"
                                      title="Guardar"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setEditandoId(null)}
                                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                                      title="Cancelar"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => abrirEdicion(m)}
                                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                    title="Ajustar stock"
                                  >
                                    <SlidersHorizontal className="h-3.5 w-3.5" />
                                  </button>
                                )}
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
    </div>
  );
}
