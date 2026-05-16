import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, SlidersHorizontal } from "lucide-react";
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
import { Button, Field, TextInput } from "@/components/form-bits";

export const Route = createFileRoute("/compras/inventario")({
  component: InventarioPage,
});

type TipoMovimiento = "entrada" | "bloqueo" | "consumo" | "ajuste";

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

const TIPO_LABELS: Record<TipoMovimiento, string> = {
  entrada: "Entrada — suma a disponible",
  ajuste: "Ajuste — suma/resta a disponible",
  bloqueo: "Bloqueo — reserva para un proyecto",
  consumo: "Consumo — marca como usado",
};

function InventarioPage() {
  const { data: usuario } = useMe();
  const { data: stocks = [] } = useStock();
  const { data: proveedores = [] } = useProveedores();
  const crearMaterial = useCrearMaterial();
  const registrar = useRegistrarMovimiento();

  // Form registrar entradas
  const [showForm, setShowForm] = useState(false);
  const [filas, setFilas] = useState<FilaEntrada[]>([crearFila()]);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Modal ajuste por material
  const [ajustando, setAjustando] = useState<MaterialConStock | null>(null);
  const [ajusteForm, setAjusteForm] = useState<{ tipo: TipoMovimiento; cantidad: string; notas: string }>({
    tipo: "entrada",
    cantidad: "",
    notas: "",
  });
  const [ajusteError, setAjusteError] = useState<string | null>(null);
  const [ajustePending, setAjustePending] = useState(false);

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

  const abrirAjuste = (m: MaterialConStock) => {
    setAjustando(m);
    setAjusteForm({ tipo: "entrada", cantidad: "", notas: "" });
    setAjusteError(null);
  };

  const confirmarAjuste = async () => {
    if (!ajustando) return;
    if (!ajusteForm.cantidad || Number(ajusteForm.cantidad) <= 0) {
      setAjusteError("La cantidad debe ser mayor a 0.");
      return;
    }
    setAjusteError(null);
    setAjustePending(true);
    await new Promise<void>((resolve, reject) =>
      registrar.mutate(
        {
          materialId: ajustando.id,
          tipo: ajusteForm.tipo,
          cantidad: Number(ajusteForm.cantidad),
          fecha: new Date().toISOString().slice(0, 10),
          proveedorId: null,
          proyectoId: null,
          notas: ajusteForm.notas || null,
        },
        { onSuccess: () => resolve(), onError: reject },
      ),
    ).catch(() => setAjusteError("No se pudo registrar el movimiento."));
    setAjustePending(false);
    if (!ajusteError) {
      setAjustando(null);
      setOk(`Movimiento registrado para ${ajustando.nombre}.`);
      setTimeout(() => setOk(null), 3000);
    }
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
                        min={0.01}
                        step="0.01"
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
                        {puedeEditar && <th className="px-3 py-2 w-10" />}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((m) => (
                        <tr key={m.id} className="border-t border-border">
                          <td className="px-3 py-2 font-medium">{m.nombre}</td>
                          <td className="px-3 py-2 text-muted-foreground">{m.categoria}</td>
                          <td className="px-3 py-2 text-muted-foreground">{m.unidad}</td>
                          <td className={`px-3 py-2 text-right tabular-nums font-medium ${m.disponible <= 0 ? "text-destructive" : "text-success"}`}>
                            {m.disponible}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{m.bloqueado}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{m.consumido}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{formatCOP(m.costoUnitario)}</td>
                          {puedeEditar && (
                            <td className="px-3 py-2">
                              <button
                                onClick={() => abrirAjuste(m)}
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="Registrar movimiento"
                              >
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Modal ajuste */}
      {ajustando && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-5 shadow-xl">
            <h2 className="mb-1 text-sm font-semibold">Registrar movimiento</h2>
            <p className="mb-4 text-xs text-muted-foreground">{ajustando.nombre}</p>
            <div className="mb-2 flex gap-4 text-xs text-muted-foreground">
              <span>Disponible: <strong className="text-foreground">{ajustando.disponible}</strong></span>
              <span>Bloqueado: <strong className="text-foreground">{ajustando.bloqueado}</strong></span>
              <span>Consumido: <strong className="text-foreground">{ajustando.consumido}</strong></span>
            </div>
            {ajusteError && <ErrorBanner>{ajusteError}</ErrorBanner>}
            <div className="mt-3 space-y-3">
              <Field label="Tipo de movimiento">
                <select
                  value={ajusteForm.tipo}
                  onChange={(e) => setAjusteForm({ ...ajusteForm, tipo: e.target.value as TipoMovimiento })}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                >
                  {(Object.entries(TIPO_LABELS) as [TipoMovimiento, string][]).map(([v, label]) => (
                    <option key={v} value={v}>{label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Cantidad">
                <TextInput
                  type="number"
                  min={0.01}
                  step="0.01"
                  placeholder="0"
                  value={ajusteForm.cantidad}
                  onChange={(e) => setAjusteForm({ ...ajusteForm, cantidad: e.target.value })}
                />
              </Field>
              <Field label="Notas">
                <TextInput
                  placeholder="Opcional…"
                  value={ajusteForm.notas}
                  onChange={(e) => setAjusteForm({ ...ajusteForm, notas: e.target.value })}
                />
              </Field>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setAjustando(null)}>Cancelar</Button>
              <Button onClick={confirmarAjuste} disabled={ajustePending}>
                {ajustePending ? "Guardando…" : "Registrar"}
              </Button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
