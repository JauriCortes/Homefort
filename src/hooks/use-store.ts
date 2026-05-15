import { useSyncExternalStore, useRef } from "react";
import { store } from "@/lib/store";

// Re-render al emitir cambios.
// Memoiza el snapshot con JSON equality para que selectores que devuelven
// nuevos arrays/objetos (filter, find, etc.) no causen loops infinitos en
// useSyncExternalStore cuando el contenido no ha cambiado.
export function useStore<T>(selector: (s: typeof store) => T): T {
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const cacheRef = useRef<{ value: T; json: string } | null>(null);

  // Función estable creada una sola vez por instancia del hook.
  const getSnapshot = useRef(function (): T {
    const next = selectorRef.current(store);
    if (cacheRef.current) {
      if (Object.is(cacheRef.current.value, next)) return cacheRef.current.value;
      const nextJson = JSON.stringify(next);
      if (cacheRef.current.json === nextJson) return cacheRef.current.value;
      cacheRef.current = { value: next, json: nextJson };
    } else {
      cacheRef.current = { value: next, json: JSON.stringify(next) };
    }
    return cacheRef.current.value;
  }).current;

  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    getSnapshot,
    // SSR: sin localStorage → null/seed, coincide con el render del servidor
    () => selectorRef.current(store),
  );
}

// Devuelve el usuario activo o null si no hay sesión.
export function useSesion() {
  return useStore((s) => s.usuarioActivo());
}

// Para usar dentro de rutas protegidas — el layout garantiza sesión válida.
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
