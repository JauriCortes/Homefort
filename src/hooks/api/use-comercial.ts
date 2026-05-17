import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Cliente, Proyecto, TipoCliente, CotizacionItem } from "@/lib/store";

// La API devuelve empresa como null en vez de undefined
export type ClienteAPI = Omit<Cliente, "empresa"> & { empresa: string | null };

export type ItemHistorico = { descripcion: string; precioUnitario: number };
export type MaterialStock = { id: string; nombre: string; stockDisponible: number; unidad: string };

// El endpoint de lista devuelve proyectos sin arrays embebidos
export type ProyectoBase = Omit<Proyecto, "especificaciones" | "cotizaciones" | "cambios">;

export const comercialKeys = {
  clientes: {
    all: () => ["comercial", "clientes"] as const,
    detail: (id: string) => ["comercial", "clientes", id] as const,
  },
  proyectos: {
    all: (params?: { clienteId?: string }) => ["comercial", "proyectos", params] as const,
    detail: (id: string) => ["comercial", "proyectos", id] as const,
  },
};

// ── Clientes ──────────────────────────────────────────────────────────────────

export function useClientes() {
  return useQuery({
    queryKey: comercialKeys.clientes.all(),
    queryFn: () => api.get<ClienteAPI[]>("/comercial/clientes"),
  });
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: comercialKeys.clientes.detail(id),
    queryFn: () => api.get<ClienteAPI>(`/comercial/clientes/${id}`),
    enabled: !!id,
  });
}

export function useCrearCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { nombre: string; contacto: string; tipo: TipoCliente; empresa?: string }) =>
      api.post<ClienteAPI>("/comercial/clientes", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: comercialKeys.clientes.all() });
    },
  });
}

export function useActualizarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      nombre: string;
      contacto: string;
      tipo: TipoCliente;
      empresa?: string;
    }) => api.patch<ClienteAPI>(`/comercial/clientes/${id}`, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: comercialKeys.clientes.all() });
      qc.setQueryData(comercialKeys.clientes.detail(updated.id), updated);
    },
  });
}

export function useEliminarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ ok: boolean }>(`/comercial/clientes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: comercialKeys.clientes.all() });
    },
  });
}

// ── Proyectos ─────────────────────────────────────────────────────────────────

export function useProyectos(params?: { clienteId?: string }) {
  const search = params?.clienteId ? `?clienteId=${params.clienteId}` : "";
  return useQuery({
    queryKey: comercialKeys.proyectos.all(params),
    queryFn: () => api.get<ProyectoBase[]>(`/comercial/proyectos${search}`),
  });
}

export function useProyecto(id: string) {
  return useQuery({
    queryKey: comercialKeys.proyectos.detail(id),
    queryFn: () => api.get<Proyecto>(`/comercial/proyectos/${id}`),
    enabled: !!id,
  });
}

export function useCrearProyecto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      clienteId: string;
      titulo: string;
      descripcionProyecto?: string;
      aspectos?: string;
      caracteristicas?: string;
      fechaEntrega?: string;
      especificacionInicial?: string;
    }) => api.post<Proyecto>("/comercial/proyectos", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: comercialKeys.proyectos.all() });
    },
  });
}

export function useEliminarProyecto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ ok: boolean }>(`/comercial/proyectos/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: comercialKeys.proyectos.all() });
    },
  });
}

export function useActualizarEstadoProyecto(proyectoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (estado: string) =>
      api.patch<Proyecto>(`/comercial/proyectos/${proyectoId}/estado`, { estado }),
    onSuccess: (updated) => {
      qc.setQueryData(comercialKeys.proyectos.detail(proyectoId), updated);
      qc.invalidateQueries({ queryKey: comercialKeys.proyectos.all() });
    },
  });
}

export function useAgregarEspecificacion(proyectoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      medidas?: string;
      materiales?: string;
      acabados?: string;
      observaciones?: string;
      actualizadoPor?: string;
    }) => api.post(`/comercial/proyectos/${proyectoId}/especificaciones`, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: comercialKeys.proyectos.detail(proyectoId),
      });
    },
  });
}

export function useAgregarCotizacion(proyectoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      items: CotizacionItem[];
      margenPct: number;
      condicionesPago: string;
      total: number;
      creadaPor: string;
    }) => api.post(`/comercial/proyectos/${proyectoId}/cotizaciones`, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: comercialKeys.proyectos.detail(proyectoId),
      });
    },
  });
}

export function useItemsHistorico() {
  return useQuery({
    queryKey: ["comercial", "cotizaciones", "items-historico"],
    queryFn: () => api.get<ItemHistorico[]>("/comercial/cotizaciones/items-historico"),
  });
}

export function useMaterialesStock() {
  return useQuery({
    queryKey: ["comercial", "materiales-stock"],
    queryFn: () => api.get<MaterialStock[]>("/comercial/materiales-stock"),
  });
}

export function useAgregarCambio(proyectoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      descripcion: string;
      responsable: string;
      impactoCosto?: number;
      impactoDias?: number;
    }) => api.post(`/comercial/proyectos/${proyectoId}/cambios`, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: comercialKeys.proyectos.detail(proyectoId),
      });
    },
  });
}
