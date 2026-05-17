import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { useMe } from "@/hooks/api/use-auth";
import { store, ESTADO_COLORS, TRANSICIONES, formatCOP, type EstadoProyecto } from "@/lib/store";
import {
  PageHeader,
  EstadoBadge,
  ErrorBanner,
  SuccessBanner,
  InfoBanner,
} from "@/components/ui-bits";
import { Button, Select } from "@/components/form-bits";

export const Route = createFileRoute("/seguimiento/$id")({
  component: FichaProyecto,
});

function FichaProyecto() {
  const { id } = Route.useParams();
  const { data: usuario } = useMe();
  const proyecto = useStore((s) => s.proyecto(id));
  const cliente = useStore((s) => (proyecto ? s.cliente(proyecto.clienteId) : undefined));
  const ordenProduccion = useStore((s) => s.ordenesProduccion.find((o) => o.proyectoId === id));
  const etapas = useStore((s) => s.etapas.filter((e) => e.proyectoId === id));
  const factura = useStore((s) => s.facturas.find((f) => f.proyectoId === id));
  const pagos = useStore((s) => s.pagos.filter((p) => p.proyectoId === id));
  const transportes = useStore((s) => s.transportes.filter((t) => t.proyectoId === id));
  const solicitudesGarantia = useStore((s) =>
    s.solicitudesGarantia.filter((sg) => sg.proyectoId === id),
  );
  const consumos = useStore((s) =>
    s.movimientos.filter((m) => m.proyectoId === id && m.tipo === "consumo"),
  );
  const materialesBase = useStore((s) => s.materialesBase);

  const [msgEstado, setMsgEstado] = useState<{ ok: boolean; txt: string } | null>(null);

  if (!proyecto) {
    return (
      <div>
        <PageHeader title="Proyecto no encontrado" />
        <Link
          to="/seguimiento"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </div>
    );
  }

  const puedeEditar = usuario?.esAdmin || usuario?.areas.includes("comercial");
  const transiciones = TRANSICIONES[proyecto.estado];

  const cambiarEstado = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as EstadoProyecto;
    if (!next) return;
    store.actualizarEstadoProyecto(id, next);
    setMsgEstado({ ok: true, txt: `Estado actualizado a "${next}".` });
    setTimeout(() => setMsgEstado(null), 2500);
    e.target.value = "";
  };

  const saldoFactura = factura ? store.saldoFactura(factura.id) : 0;

  return (
    <div>
      <PageHeader
        title={proyecto.codigo}
        description={`${proyecto.tipo} - ${cliente?.nombre ?? "Cliente eliminado"}`}
        crumbs={[{ label: "Seguimiento", to: "/seguimiento" }, { label: proyecto.codigo }]}
        actions={
          <Link
            to="/seguimiento"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* General */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold">General</h3>
          <dl className="space-y-1 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Cliente</dt>
              <dd>
                {cliente?.nombre ?? "Eliminado"} ({cliente?.tipo})
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Tipo</dt>
              <dd>{proyecto.tipo}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Solicitud</dt>
              <dd>{proyecto.fechaSolicitud}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Ultima actualizacion</dt>
              <dd>{proyecto.ultimaActualizacion}</dd>
            </div>
          </dl>
          <div className="mt-3">
            <div className="mb-1 text-xs text-muted-foreground">Estado actual</div>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_COLORS[proyecto.estado]}`}
            >
              {proyecto.estado}
            </span>
          </div>
          {puedeEditar && transiciones.length > 0 && (
            <div className="mt-3">
              <div className="mb-1 text-xs text-muted-foreground">Cambiar estado</div>
              {msgEstado &&
                (msgEstado.ok ? (
                  <SuccessBanner>{msgEstado.txt}</SuccessBanner>
                ) : (
                  <ErrorBanner>{msgEstado.txt}</ErrorBanner>
                ))}
              <Select defaultValue="" onChange={cambiarEstado} className="h-8 py-1 text-xs">
                <option value="">Selecciona...</option>
                {transiciones.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>

        {/* Especificaciones */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold">
            Especificaciones ({proyecto.especificaciones.length})
          </h3>
          {proyecto.especificaciones.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin especificaciones.</p>
          ) : (
            <div className="text-sm">
              {(() => {
                const e = proyecto.especificaciones.at(-1)!;
                return (
                  <ul className="space-y-1">
                    <li>
                      <span className="text-muted-foreground">Medidas:</span> {e.medidas}
                    </li>
                    <li>
                      <span className="text-muted-foreground">Materiales:</span> {e.materiales}
                    </li>
                    <li>
                      <span className="text-muted-foreground">Acabados:</span> {e.acabados}
                    </li>
                    <li className="text-xs text-muted-foreground">
                      v{e.version} - {e.actualizadoEn}
                    </li>
                  </ul>
                );
              })()}
            </div>
          )}
        </div>

        {/* Cotizaciones */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold">
            Cotizaciones ({proyecto.cotizaciones.length})
          </h3>
          {proyecto.cotizaciones.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin cotizaciones.</p>
          ) : (
            <div className="text-sm">
              {(() => {
                const c = proyecto.cotizaciones.at(-1)!;
                return (
                  <div>
                    <div className="text-base font-semibold tabular-nums">{formatCOP(c.total)}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.descripcion} - {c.fecha}
                    </div>
                    <div className="text-xs text-muted-foreground">Margen {c.margenPct}%</div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Orden de produccion */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold">Orden de produccion</h3>
          {ordenProduccion ? (
            <div className="text-sm">
              <div className="font-medium">{ordenProduccion.numero}</div>
              <div className="text-xs text-muted-foreground">Estado: {ordenProduccion.estado}</div>
              <div className="text-xs text-muted-foreground">
                Responsable: {ordenProduccion.responsable}
              </div>
              <Link
                to="/produccion/ordenes/$id"
                params={{ id: ordenProduccion.id }}
                className="mt-2 inline-flex text-xs text-primary hover:underline"
              >
                Ver detalle
              </Link>
            </div>
          ) : proyecto.estado === "Aprobada" &&
            (usuario?.esAdmin || usuario?.areas.includes("administrativa")) ? (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">
                El proyecto esta aprobado. Puedes generar la orden de produccion.
              </p>
              <Link
                to="/administrativa/ordenes-produccion"
                className="text-xs text-primary hover:underline"
              >
                Ir a crear orden
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin orden generada.</p>
          )}
        </div>

        {/* Etapas de produccion */}
        {etapas.length > 0 && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-2 text-sm font-semibold">Etapas ({etapas.length})</h3>
            <ul className="space-y-1">
              {etapas.map((e) => (
                <li key={e.id} className="flex items-center justify-between text-sm">
                  <span>{e.nombre}</span>
                  <span
                    className={`text-xs rounded-full px-1.5 py-0.5 ${e.estado === "completada" ? "bg-green-100 text-green-800" : e.estado === "en_curso" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {e.estado}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Facturacion */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold">Facturacion</h3>
          {factura ? (
            <div className="text-sm">
              <div className="font-medium">{factura.numero}</div>
              <div className="text-xs text-muted-foreground">Total: {formatCOP(factura.monto)}</div>
              <div className="text-xs text-muted-foreground">Saldo: {formatCOP(saldoFactura)}</div>
              <div className="text-xs text-muted-foreground">Estado: {factura.estado}</div>
              <div className="text-xs text-muted-foreground">Pagos registrados: {pagos.length}</div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin factura registrada.</p>
          )}
        </div>

        {/* Transporte */}
        {transportes.length > 0 && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-2 text-sm font-semibold">Transporte ({transportes.length})</h3>
            <ul className="space-y-1">
              {transportes.map((t) => (
                <li key={t.id} className="text-sm">
                  <div>
                    {t.fechaProgramada} - {t.estado}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.vehiculo} / {t.responsable}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Materiales consumidos */}
        {consumos.length > 0 && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-2 text-sm font-semibold">
              Materiales consumidos ({consumos.length})
            </h3>
            <ul className="space-y-1">
              {Object.values(
                consumos.reduce<Record<string, { nombre: string; cantidad: number }>>((acc, m) => {
                  const mat = materialesBase.find((b) => b.id === m.materialId);
                  const nombre = mat?.nombre ?? m.materialId;
                  const unidad = mat?.unidad ?? "";
                  const key = m.materialId;
                  if (!acc[key])
                    acc[key] = { nombre: `${nombre}${unidad ? ` (${unidad})` : ""}`, cantidad: 0 };
                  acc[key].cantidad += m.cantidad;
                  return acc;
                }, {}),
              ).map((item) => (
                <li key={item.nombre} className="flex items-center justify-between text-sm">
                  <span>{item.nombre}</span>
                  <span className="tabular-nums text-muted-foreground">{item.cantidad}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Garantias */}
        {solicitudesGarantia.length > 0 && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-2 text-sm font-semibold">Garantias ({solicitudesGarantia.length})</h3>
            <ul className="space-y-1">
              {solicitudesGarantia.map((sg) => (
                <li key={sg.id} className="text-sm">
                  <Link
                    to="/postventa/garantias/$id"
                    params={{ id: sg.id }}
                    className="text-primary hover:underline"
                  >
                    {sg.fecha}
                  </Link>
                  <span className="ml-2 text-xs text-muted-foreground">{sg.estado}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cambios */}
        {proyecto.cambios.length > 0 && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-2 text-sm font-semibold">Cambios ({proyecto.cambios.length})</h3>
            <ul className="space-y-1">
              {proyecto.cambios.map((c) => (
                <li key={c.id} className="text-sm">
                  <div>{c.descripcion}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.fecha} - {c.responsable}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
