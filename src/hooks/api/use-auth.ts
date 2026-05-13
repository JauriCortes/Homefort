import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Area } from "@/lib/store";

export interface UsuarioPublico {
  id: string;
  nombre: string;
  email: string;
  areas: Area[];
  esAdmin: boolean;
}

export const authKeys = {
  me: () => ["auth", "me"] as const,
};

export function useMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => api.get<UsuarioPublico>("/auth/me"),
    retry: false,
    staleTime: Infinity,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (creds: { email: string; password: string }) =>
      api.post<{ usuario: UsuarioPublico }>("/auth/login", creds),
    onSuccess: ({ usuario }) => {
      qc.setQueryData(authKeys.me(), usuario);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/auth/logout", {}),
    onSuccess: () => {
      qc.clear();
      window.location.href = "/login";
    },
  });
}
