import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface MaterialEtapa {
  materialId: string;
  cantidad: number;
  cantidadReal?: number;
}

export interface Observacion {
  fecha: string;
  descripcion: string;
  esRetrabajo: boolean;
  responsable: string;
}

export interface EtapaProduccion {
  id: string;
  ordenId: string;
  proyectoId: string;
  nombre: string;
  responsable: string;
  fechaEstimada: string;
  fechaCompletada: string | null;
  estado: "pendiente" | "en_curso" | "completada";
  materiales: MaterialEtapa[];
  observaciones: Observacion[];
}

export interface ChecklistEntrega {
  medidas: boolean;
  acabados: boolean;
  estadoProducto: boolean;
  documentacion: boolean;
}

export interface EntregaProduccion {
  id: string;
  ordenId: string;
  proyectoId: string;
  fecha: string;
  responsable: string;
  checklist: ChecklistEntrega;
  observaciones: string | null;
}

export interface OrdenProduccionDetalle {
  id: string;
  numero: string;
  proyectoId: string;
  cotizacionId: string;
  fechaEmision: string;
  estado: "Emitida" | "En producción" | "Finalizada";
  responsable: string;
  notas: string | null;
  etapas: EtapaProduccion[];
  entregas: EntregaProduccion[];
}

const keys = {
  ordenes: ["produccion", "ordenes"] as const,
  orden: (id: string) => ["produccion", "ordenes", id] as const,
};

export function useOrdenesProduccionList() {
  return useQuery({
    queryKey: keys.ordenes,
    queryFn: () => api.get<Omit<OrdenProduccionDetalle, "etapas" | "entregas">[]>("/produccion/ordenes"),
  });
}

export function useOrdenProduccion(id: string) {
  return useQuery({
    queryKey: keys.orden(id),
    queryFn: () => api.get<OrdenProduccionDetalle>(`/produccion/ordenes/${id}`),
    enabled: !!id,
  });
}

export function useCrearEtapa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ordenId, ...data }: { ordenId: string; nombre: string; responsable: string; fechaEstimada: string; materiales?: MaterialEtapa[] }) =>
      api.post<EtapaProduccion>(`/produccion/ordenes/${ordenId}/etapas`, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: keys.orden(vars.ordenId) });
      qc.invalidateQueries({ queryKey: ["compras", "stock"] });
      qc.invalidateQueries({ queryKey: ["compras", "movimientos"] });
    },
  });
}

export function useActualizarEtapa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ordenId, ...data }: {
      id: string;
      ordenId: string;
      completar?: boolean;
      cantReales?: Record<string, number>;
      observacion?: string;
      agregarObservacion?: { descripcion: string; esRetrabajo: boolean };
    }) => api.patch<EtapaProduccion>(`/produccion/etapas/${id}`, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: keys.orden(vars.ordenId) });
      qc.invalidateQueries({ queryKey: ["compras", "stock"] });
      qc.invalidateQueries({ queryKey: ["compras", "movimientos"] });
    },
  });
}

export function useRegistrarEntrega() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ordenId, ...data }: { ordenId: string; checklist: ChecklistEntrega; observaciones?: string }) =>
      api.post<EntregaProduccion>(`/produccion/ordenes/${ordenId}/entregas`, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: keys.orden(vars.ordenId) });
      qc.invalidateQueries({ queryKey: keys.ordenes });
      qc.invalidateQueries({ queryKey: ["comercial", "proyectos"] });
    },
  });
}
