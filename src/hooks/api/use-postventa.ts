import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface EtapaGarantia {
  id: string;
  ordenId: string;
  nombre: string;
  responsable: string;
  fechaEstimada: string;
  estado: "pendiente" | "completada";
  observaciones: string;
}

export interface CostoGarantia {
  concepto: string;
  monto: number;
  fecha: string;
}

export interface OrdenGarantia {
  id: string;
  numero: string;
  proyectoId: string;
  solicitudId: string;
  fechaCreacion: string;
  estado: "activa" | "completada";
  etapas: EtapaGarantia[];
  costos: CostoGarantia[];
}

export interface SolicitudGarantia {
  id: string;
  proyectoId: string;
  fecha: string;
  descripcion: string;
  abiertoBy: string;
  estado: "abierta" | "en_proceso" | "cerrada";
  ordenGarantiaId: string | null;
}

export interface SolicitudConOrden extends SolicitudGarantia {
  orden: OrdenGarantia | null;
}

const keys = {
  solicitudes: ["postventa", "solicitudes"] as const,
  solicitud: (id: string) => ["postventa", "solicitudes", id] as const,
};

export function useSolicitudesGarantia() {
  return useQuery({
    queryKey: keys.solicitudes,
    queryFn: () => api.get<SolicitudGarantia[]>("/postventa/solicitudes"),
  });
}

export function useSolicitudGarantia(id: string) {
  return useQuery({
    queryKey: keys.solicitud(id),
    queryFn: () => api.get<SolicitudConOrden>(`/postventa/solicitudes/${id}`),
    enabled: !!id,
  });
}

export function useCrearSolicitudGarantia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { proyectoId: string; descripcion: string; fecha?: string; abiertoBy?: string }) =>
      api.post<SolicitudGarantia>("/postventa/solicitudes", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.solicitudes });
      qc.invalidateQueries({ queryKey: ["comercial", "proyectos"] });
    },
  });
}

export function useCrearOrdenGarantia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { solicitudId: string }) =>
      api.post<OrdenGarantia>("/postventa/ordenes", data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: keys.solicitudes });
      qc.invalidateQueries({ queryKey: keys.solicitud(vars.solicitudId) });
    },
  });
}

export function useActualizarOrdenGarantia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      solicitudId,
      ...data
    }: {
      id: string;
      solicitudId: string;
      agregarEtapa?: { nombre: string; responsable: string; fechaEstimada: string };
      completarEtapa?: string;
      agregarCosto?: CostoGarantia;
      estado?: "activa" | "completada";
    }) => api.patch<OrdenGarantia>(`/postventa/ordenes/${id}`, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: keys.solicitudes });
      qc.invalidateQueries({ queryKey: keys.solicitud(vars.solicitudId) });
      qc.invalidateQueries({ queryKey: ["comercial", "proyectos"] });
    },
  });
}
