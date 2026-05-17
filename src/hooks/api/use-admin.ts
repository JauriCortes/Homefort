import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Area } from "@/lib/store";

export interface UsuarioAdmin {
  id: string;
  nombre: string;
  email: string;
  areas: Area[];
  esAdmin: boolean;
  activo: boolean;
  intentosFallidos: number;
  bloqueadoHasta: string | null;
  creadoEn: string;
}

const keys = {
  all: () => ["admin", "usuarios"] as const,
  detail: (id: string) => ["admin", "usuarios", id] as const,
};

export function useUsuarios() {
  return useQuery({
    queryKey: keys.all(),
    queryFn: () => api.get<UsuarioAdmin[]>("/admin/usuarios"),
  });
}

export function useUsuario(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => api.get<UsuarioAdmin>(`/admin/usuarios/${id}`),
    enabled: !!id,
  });
}

export function useCrearUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { nombre: string; email: string; password: string; areas: Area[]; esAdmin?: boolean }) =>
      api.post<UsuarioAdmin>("/admin/usuarios", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all() }),
  });
}

export function useActualizarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; nombre?: string; email?: string; areas?: Area[]; esAdmin?: boolean; activo?: boolean }) =>
      api.patch<UsuarioAdmin>(`/admin/usuarios/${id}`, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: keys.all() });
      qc.setQueryData(keys.detail(updated.id), updated);
    },
  });
}

export function useCambiarPasswordAdmin() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      api.patch<{ ok: boolean }>(`/admin/usuarios/${id}/password`, { password }),
  });
}

export function useDesbloquearUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ ok: boolean }>(`/admin/usuarios/${id}/desbloquear`, {}),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: keys.all() });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
    },
  });
}
