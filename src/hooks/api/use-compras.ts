import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface Material {
  id: string;
  nombre: string;
  categoria: string;
  unidad: string;
  costoUnitario: number;
  actualizadoEn: string;
}

export interface MaterialConStock extends Material {
  disponible: number;
  bloqueado: number;
  consumido: number;
}

export interface Proveedor {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  materialesIds: string[];
  condicionesPago: string;
  notas: string | null;
  creadoEn: string;
}

export interface MovimientoInventario {
  id: string;
  materialId: string;
  tipo: "entrada" | "bloqueo" | "consumo" | "ajuste";
  cantidad: number;
  fecha: string;
  proveedorId: string | null;
  proyectoId: string | null;
  responsable: string;
  notas: string | null;
}

export interface SolicitudCompra {
  id: string;
  proyectoId: string;
  fechaCreacion: string;
  estado: "pendiente" | "en-gestion" | "atendida";
  items: { materialId: string; cantidadFaltante: number }[];
  ordenCompraId: string | null;
  generadaAutomaticamente: boolean;
}

export interface OrdenCompra {
  id: string;
  codigo: string;
  proyectoId: string;
  proveedorId: string;
  solicitudId: string | null;
  fechaCreacion: string;
  fechaEntregaEstimada: string;
  estado: "borrador" | "enviada" | "recibida" | "cancelada";
  items: { materialId: string; cantidad: number; precioUnitario: number }[];
  notas: string | null;
}

export const comprasKeys = {
  materiales: { all: () => ["compras", "materiales"] as const },
  stock: { all: () => ["compras", "stock"] as const },
  proveedores: { all: () => ["compras", "proveedores"] as const },
  movimientos: { all: () => ["compras", "movimientos"] as const },
  solicitudes: { all: () => ["compras", "solicitudes"] as const },
  ordenes: { all: () => ["compras", "ordenes"] as const },
};

export function useMateriales() {
  return useQuery({
    queryKey: comprasKeys.materiales.all(),
    queryFn: () => api.get<Material[]>("/compras/materiales"),
  });
}

export function useStock() {
  return useQuery({
    queryKey: comprasKeys.stock.all(),
    queryFn: () => api.get<MaterialConStock[]>("/compras/stock"),
  });
}

export function useProveedores() {
  return useQuery({
    queryKey: comprasKeys.proveedores.all(),
    queryFn: () => api.get<Proveedor[]>("/compras/proveedores"),
  });
}

export function useCrearProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Proveedor, "id" | "creadoEn">) =>
      api.post<Proveedor>("/compras/proveedores", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: comprasKeys.proveedores.all() }),
  });
}

export function useActualizarProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Proveedor> & { id: string }) =>
      api.patch<Proveedor>(`/compras/proveedores/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: comprasKeys.proveedores.all() }),
  });
}

export function useEliminarProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/compras/proveedores/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: comprasKeys.proveedores.all() }),
  });
}

export function useMovimientos() {
  return useQuery({
    queryKey: comprasKeys.movimientos.all(),
    queryFn: () => api.get<MovimientoInventario[]>("/compras/movimientos"),
  });
}

export function useRegistrarMovimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<MovimientoInventario, "id" | "responsable">) =>
      api.post<MovimientoInventario>("/compras/movimientos", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: comprasKeys.movimientos.all() });
      qc.invalidateQueries({ queryKey: comprasKeys.stock.all() });
    },
  });
}

export function useSolicitudesCompra() {
  return useQuery({
    queryKey: comprasKeys.solicitudes.all(),
    queryFn: () => api.get<SolicitudCompra[]>("/compras/solicitudes"),
  });
}

export function useActualizarSolicitud() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<SolicitudCompra> & { id: string }) =>
      api.patch<SolicitudCompra>(`/compras/solicitudes/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: comprasKeys.solicitudes.all() }),
  });
}

export function useOrdenesCompra() {
  return useQuery({
    queryKey: comprasKeys.ordenes.all(),
    queryFn: () => api.get<OrdenCompra[]>("/compras/ordenes"),
  });
}

export function useCrearOrdenCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Pick<OrdenCompra, "proyectoId" | "proveedorId" | "fechaEntregaEstimada" | "notas" | "solicitudId" | "items">) =>
      api.post<OrdenCompra>("/compras/ordenes", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: comprasKeys.ordenes.all() }),
  });
}

export function useActualizarOrdenCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<OrdenCompra> & { id: string }) =>
      api.patch<OrdenCompra>(`/compras/ordenes/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: comprasKeys.ordenes.all() }),
  });
}
