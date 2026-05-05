import { useSyncExternalStore } from "react";
import { store } from "@/lib/store";

// Re-render al emitir cambios
export function useStore<T>(selector: (s: typeof store) => T): T {
  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => selector(store),
    () => selector(store),
  );
}

// Devuelve el usuario activo o null si no hay sesión.
export function useSesion() {
  return useStore((s) => s.usuarioActivo());
}

// Para usar dentro de rutas protegidas — el layout garantiza sesión válida.
// Lanza un error claro si se invoca fuera de un contexto autenticado.
export function useUsuarioActivo() {
  const u = useStore((s) => s.usuarioActivo());
  if (!u) {
    throw new Error(
      "useUsuarioActivo requiere una sesión activa. Envuelve la vista con AppLayout.",
    );
  }
  return u;
}

export function usePuedeEditar(area: Parameters<typeof store.puedeEditar>[0]) {
  return useStore((s) => s.puedeEditar(area));
}
