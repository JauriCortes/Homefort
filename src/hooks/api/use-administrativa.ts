import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface OrdenProduccion {
  id: string;
  numero: string;
  proyectoId: string;
  cotizacionId: string;
  fechaEmision: string;
  estado: "Emitida" | "En producción" | "Finalizada";
  responsable: string;
  notas: string | null;
}

export interface Factura {
  id: string;
  numero: string;
  proyectoId: string;
  cotizacionId: string;
  clienteId: string;
  fechaEmision: string;
  fechaVencimiento: string;
  monto: number;
  condicionesPago: string;
  estado: "Pendiente" | "Parcialmente pagada" | "Pagada" | "Anulada";
}

export interface Pago {
  id: string;
  facturaId: string;
  proyectoId: string;
  fecha: string;
  monto: number;
  tipo: "Transferencia" | "Efectivo" | "Cheque" | "Tarjeta";
  referencia: string | null;
}

export interface RecursoTransporte {
  id: string;
  proyectoId: string;
  fechaProgramada: string;
  responsable: string;
  vehiculo: string;
  direccionDestino: string;
  observaciones: string | null;
  estado: "Programada" | "En tránsito" | "Entregada" | "Cancelada";
}

export interface AjusteCosto {
  id: string;
  proyectoId: string;
  fecha: string;
  concepto: string;
  monto: number;
  registradoPor: string;
}

export interface ResumenCosto {
  proyectoId: string;
  codigo: string;
  estado: string;
  cotizado: number;
  costoReal: number;
}

const keys = {
  ordenes: ["administrativa", "ordenes-produccion"] as const,
  facturas: ["administrativa", "facturas"] as const,
  pagos: ["administrativa", "pagos"] as const,
  transporte: ["administrativa", "transporte"] as const,
  costos: ["administrativa", "costos"] as const,
  resumen: ["administrativa", "costos", "resumen"] as const,
};

export function useOrdenesProduccion() {
  return useQuery({ queryKey: keys.ordenes, queryFn: () => api.get<OrdenProduccion[]>("/administrativa/ordenes-produccion") });
}

export function useCrearOrdenProduccion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { proyectoId: string; cotizacionId?: string; responsable: string; notas?: string }) =>
      api.post<OrdenProduccion>("/administrativa/ordenes-produccion", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.ordenes });
      qc.invalidateQueries({ queryKey: ["comercial", "proyectos"] });
    },
  });
}

export function useActualizarOrdenProduccion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<OrdenProduccion> & { id: string }) =>
      api.patch<OrdenProduccion>(`/administrativa/ordenes-produccion/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.ordenes }),
  });
}

export function useFacturas() {
  return useQuery({ queryKey: keys.facturas, queryFn: () => api.get<Factura[]>("/administrativa/facturas") });
}

export function useCrearFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { proyectoId: string; fechaVencimiento: string; condicionesPago?: string; cotizacionId?: string; monto?: number; clienteId?: string }) =>
      api.post<Factura>("/administrativa/facturas", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.facturas }),
  });
}

export function usePagos() {
  return useQuery({ queryKey: keys.pagos, queryFn: () => api.get<Pago[]>("/administrativa/pagos") });
}

export function useRegistrarPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { facturaId: string; monto: number; tipo: Pago["tipo"]; referencia?: string; fecha?: string }) =>
      api.post<Pago & { facturaEstado: string }>("/administrativa/pagos", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.pagos });
      qc.invalidateQueries({ queryKey: keys.facturas });
      qc.invalidateQueries({ queryKey: keys.resumen });
    },
  });
}

export function useSaldoFactura(facturaId: string) {
  return useQuery({
    queryKey: ["administrativa", "facturas", facturaId, "saldo"],
    queryFn: () => api.get<{ saldo: number }>(`/administrativa/facturas/${facturaId}/saldo`),
    enabled: !!facturaId,
  });
}

export function useTransportes() {
  return useQuery({ queryKey: keys.transporte, queryFn: () => api.get<RecursoTransporte[]>("/administrativa/transporte") });
}

export function useCrearTransporte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<RecursoTransporte, "id" | "estado">) =>
      api.post<RecursoTransporte>("/administrativa/transporte", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.transporte }),
  });
}

export function useActualizarTransporte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<RecursoTransporte> & { id: string }) =>
      api.patch<RecursoTransporte>(`/administrativa/transporte/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.transporte }),
  });
}

export function useAjustesCosto() {
  return useQuery({ queryKey: keys.costos, queryFn: () => api.get<AjusteCosto[]>("/administrativa/costos") });
}

export function useCrearAjusteCosto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { proyectoId: string; concepto: string; monto: number; fecha?: string }) =>
      api.post<AjusteCosto>("/administrativa/costos", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.costos });
      qc.invalidateQueries({ queryKey: keys.resumen });
    },
  });
}

export function useResumenCostos() {
  return useQuery({ queryKey: keys.resumen, queryFn: () => api.get<ResumenCosto[]>("/administrativa/costos/resumen") });
}
