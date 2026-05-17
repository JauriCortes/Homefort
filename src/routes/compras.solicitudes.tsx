import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardList, ChevronDown, ChevronUp, X } from "lucide-react";
import { toast } from "sonner";
import {
  useSolicitudesCompra,
  useActualizarSolicitud,
  useMateriales,
  useProveedores,
  useCrearOrdenCompra,
  type SolicitudCompra,
} from "@/hooks/api/use-compras";
import { useProyectos } from "@/hooks/api/use-comercial";
import { PageHeader, EmptyState } from "@/components/ui-bits";
import { Button, Field, TextInput } from "@/components/form-bits";

export const Route = createFileRoute("/compras/solicitudes")({
  component: SolicitudesPage,
});

type ItemForm = {
  materialId: string | null;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
};

function OrdenForm({
  sol,
  onClose,
}: {
  sol: SolicitudCompra;
  onClose: () => void;
}) {
  const { data: materiales = [] } = useMateriales();
  const { data: proveedores = [] } = useProveedores();
  const crearOrden = useCrearOrdenCompra();
  const actualizarSolicitud = useActualizarSolicitud();

  const [proveedorId, setProveedorId] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [notas, setNotas] = useState("");
  const [items, setItems] = useState<ItemForm[]>(
    sol.items.map((item) => {
      const mat = materiales.find((m) => m.id === item.materialId);
      return {
        materialId: item.materialId,
        descripcion: mat?.nombre ?? item.materialId,
        cantidad: item.cantidadFaltante,
        precioUnitario: mat?.costoUnitario ?? 0,
      };
    }),
  );

  const setItemField = (i: number, field: keyof ItemForm, value: string | number) => {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedorId) return toast.error("Selecciona un proveedor.");
    if (!fechaEntrega) return toast.error("Indica la fecha de entrega estimada.");

    try {
      const orden = await crearOrden.mutateAsync({
        proyectoId: sol.proyectoId,
        proveedorId,
        solicitudId: sol.id,
        fechaEntregaEstimada: fechaEntrega,
        items,
        notas: notas || null,
      });
      await actualizarSolicitud.mutateAsync({
        id: sol.id,
        estado: "atendida",
        ordenCompraId: orden.id,
      });
      toast.success(`Orden ${orden.codigo} creada. Solicitud marcada como atendida.`);
      onClose();
    } catch {
      toast.error("Error al crear la orden.");
    }
  };

  const isPending = crearOrden.isPending || actualizarSolicitud.isPending;

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 border-t border-border pt-4">
      <h4 className="text-sm font-semibold">Nueva orden de compra</h4>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Proveedor" required>
          <select
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
            required
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Seleccionar…</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fecha entrega estimada" required>
          <TextInput
            type="date"
            value={fechaEntrega}
            onChange={(e) => setFechaEntrega(e.target.value)}
            required
          />
        </Field>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Ítems</p>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_80px_100px] gap-2 items-end">
              <Field label={i === 0 ? "Material / descripción" : undefined}>
                <TextInput
                  value={item.descripcion}
                  onChange={(e) => setItemField(i, "descripcion", e.target.value)}
                  required
                />
              </Field>
              <Field label={i === 0 ? "Cant." : undefined}>
                <TextInput
                  type="number"
                  step="1"
                  min="1"
                  value={item.cantidad}
                  onChange={(e) => setItemField(i, "cantidad", Number(e.target.value))}
                  required
                />
              </Field>
              <Field label={i === 0 ? "Precio unit." : undefined}>
                <TextInput
                  type="number"
                  step="1"
                  min="0"
                  value={item.precioUnitario}
                  onChange={(e) => setItemField(i, "precioUnitario", Number(e.target.value))}
                  required
                />
              </Field>
            </div>
          ))}
        </div>
      </div>

      <Field label="Notas (opcional)">
        <TextInput value={notas} onChange={(e) => setNotas(e.target.value)} />
      </Field>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
          <X className="h-4 w-4" /> Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creando…" : "Crear orden"}
        </Button>
      </div>
    </form>
  );
}

function SolicitudesPage() {
  const { data: solicitudes = [] } = useSolicitudesCompra();
  const { data: proyectos = [] } = useProyectos();
  const { data: materiales = [] } = useMateriales();
  const actualizarSolicitud = useActualizarSolicitud();

  const [abierta, setAbierta] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        title="Solicitudes de compra"
        crumbs={[{ label: "Compras" }, { label: "Solicitudes" }]}
      />
      {solicitudes.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Sin solicitudes"
          description="Las solicitudes se generan automáticamente al aprobar un proyecto con materiales faltantes."
        />
      ) : (
        <div className="space-y-3">
          {[...solicitudes].reverse().map((sol) => {
            const proyecto = proyectos.find((p) => p.id === sol.proyectoId);
            const expandida = abierta === sol.id;
            return (
              <div key={sol.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">
                      {(proyecto as { codigo?: string })?.codigo ?? sol.proyectoId}
                    </span>
                    {sol.generadaAutomaticamente && (
                      <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-[11px] text-blue-800">
                        Automática
                      </span>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      sol.estado === "pendiente"
                        ? "bg-yellow-100 text-yellow-800"
                        : sol.estado === "atendida"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {sol.estado}
                  </span>
                </div>
                <div className="mb-2 text-xs text-muted-foreground">{sol.fechaCreacion}</div>
                <ul className="space-y-1 text-sm">
                  {sol.items.map((item, i) => {
                    const mat = materiales.find((m) => m.id === item.materialId);
                    return (
                      <li key={i} className="text-muted-foreground">
                        {mat?.nombre ?? item.materialId}: faltan {item.cantidadFaltante}{" "}
                        {mat?.unidad}
                      </li>
                    );
                  })}
                </ul>

                {sol.estado !== "atendida" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      type="button"
                      onClick={() => setAbierta(expandida ? null : sol.id)}
                    >
                      {expandida ? (
                        <>
                          <ChevronUp className="h-4 w-4" /> Cancelar
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" /> Crear orden de compra
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={actualizarSolicitud.isPending}
                      type="button"
                      onClick={() => actualizarSolicitud.mutate({ id: sol.id, estado: "atendida" })}
                    >
                      Solo marcar atendida
                    </Button>
                  </div>
                )}

                {expandida && (
                  <OrdenForm sol={sol} onClose={() => setAbierta(null)} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
