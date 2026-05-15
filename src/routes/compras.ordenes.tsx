import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useMe } from "@/hooks/api/use-auth";
import { useProyectos } from "@/hooks/api/use-comercial";
import {
  useProveedores,
  useOrdenesCompra,
  useCrearOrdenCompra,
  useActualizarOrdenCompra,
} from "@/hooks/api/use-compras";
import { PageHeader, EmptyState, SuccessBanner } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";

export const Route = createFileRoute("/compras/ordenes")({
  component: OrdenesCompraPage,
});

function OrdenesCompraPage() {
  const { data: usuario } = useMe();
  const { data: ordenes = [] } = useOrdenesCompra();
  const { data: proyectos = [] } = useProyectos();
  const { data: proveedores = [] } = useProveedores();
  const crearOrden = useCrearOrdenCompra();
  const actualizarOrden = useActualizarOrdenCompra();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    proyectoId: "",
    proveedorId: "",
    fechaEntregaEstimada: "",
    notas: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [ok, setOk] = useState<string | null>(null);
  const [pendingChange, setPendingChange] = useState<{ id: string; estado: string } | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const puedeEditar = (usuario?.esAdmin || usuario?.areas.includes("compras")) ?? false;

  const ordenesFiltradas = ordenes.filter((o) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    const proy = proyectos.find((p) => p.id === o.proyectoId) as { codigo?: string } | undefined;
    return (
      o.codigo.toLowerCase().includes(q) || (proy?.codigo?.toLowerCase().includes(q) ?? false)
    );
  });

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.proyectoId) errs.proyectoId = "Selecciona un proyecto.";
    if (!form.proveedorId) errs.proveedorId = "Selecciona un proveedor.";
    if (!form.fechaEntregaEstimada) errs.fechaEntregaEstimada = "Ingresa la fecha estimada.";
    if (Object.keys(errs).length) return setFieldErrors(errs);
    crearOrden.mutate(
      {
        proyectoId: form.proyectoId,
        proveedorId: form.proveedorId,
        fechaEntregaEstimada: form.fechaEntregaEstimada,
        notas: form.notas || null,
        solicitudId: null,
        items: [],
      },
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

  return (
    <div>
      <PageHeader
        title="Órdenes de compra"
        crumbs={[{ label: "Compras" }, { label: "Órdenes" }]}
        actions={
          puedeEditar ? (
            <Button onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-4 w-4" /> {showForm ? "Cancelar" : "Nueva orden"}
            </Button>
          ) : undefined
        }
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
        {busqueda && (
          <span className="text-xs text-muted-foreground">{ordenesFiltradas.length} resultado(s)</span>
        )}
      </div>
      {showForm && (
        <form
          onSubmit={guardar}
          className="mb-4 space-y-4 rounded-lg border border-border bg-surface p-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Proyecto" required error={fieldErrors.proyectoId}>
              <Select
                value={form.proyectoId}
                onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}
              >
                <option value="">Selecciona...</option>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {(p as { codigo?: string }).codigo} — {p.titulo}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Proveedor" required error={fieldErrors.proveedorId}>
              <Select
                value={form.proveedorId}
                onChange={(e) => setForm({ ...form, proveedorId: e.target.value })}
              >
                <option value="">Selecciona...</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Fecha entrega estimada" required error={fieldErrors.fechaEntregaEstimada}>
              <TextInput
                type="date"
                value={form.fechaEntregaEstimada}
                onChange={(e) => setForm({ ...form, fechaEntregaEstimada: e.target.value })}
              />
            </Field>
            <Field label="Notas">
              <TextInput
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={crearOrden.isPending}>
              {crearOrden.isPending ? "Creando…" : "Crear orden"}
            </Button>
          </div>
        </form>
      )}
      {ordenesFiltradas.length === 0 ? (
        <EmptyState
          title={busqueda ? "Sin resultados" : "Sin órdenes de compra"}
          description={
            busqueda
              ? `No hay órdenes que coincidan con "${busqueda}".`
              : "Crea la primera orden de compra."
          }
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
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.map((o) => {
                const proy = proyectos.find((p) => p.id === o.proyectoId) as
                  | { codigo?: string }
                  | undefined;
                const prov = proveedores.find((p) => p.id === o.proveedorId);
                return (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{o.codigo}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {proy?.codigo ?? o.proyectoId}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {prov?.nombre ?? o.proveedorId}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{o.fechaEntregaEstimada}</td>
                    <td className="px-3 py-2">
                      <select
                        value={o.estado}
                        disabled={!puedeEditar}
                        onChange={(ev) => {
                          const next = ev.target.value;
                          if (next === "cancelada") {
                            setPendingChange({ id: o.id, estado: next });
                          } else {
                            actualizarOrden.mutate({ id: o.id, estado: next as OrdenEstado });
                          }
                        }}
                        className="rounded border border-border bg-surface px-2 py-0.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="borrador">Borrador</option>
                        <option value="enviada">Enviada</option>
                        <option value="recibida">Recibida</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {pendingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-5 shadow-xl">
            <h2 className="text-sm font-semibold text-foreground">¿Cancelar orden de compra?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta acción cambiará el estado a <strong>Cancelada</strong>. No podrá revertirse
              fácilmente.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setPendingChange(null)}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Mantener estado
              </button>
              <button
                onClick={() => {
                  actualizarOrden.mutate({
                    id: pendingChange.id,
                    estado: pendingChange.estado as OrdenEstado,
                  });
                  setPendingChange(null);
                }}
                className="rounded-md bg-destructive px-3 py-1.5 text-sm text-destructive-foreground hover:bg-destructive/90"
              >
                Sí, cancelar orden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type OrdenEstado = "borrador" | "enviada" | "recibida" | "cancelada";
