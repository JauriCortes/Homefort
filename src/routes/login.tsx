import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Hammer, Eye, EyeOff } from "lucide-react";
import { store } from "@/lib/store";
import { useSesion } from "@/hooks/use-store";
import { Button, Field, TextInput } from "@/components/form-bits";
import { ErrorBanner, InfoBanner } from "@/components/ui-bits";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const sesion = useSesion();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (sesion) navigate({ to: "/comercial" });
  }, [sesion, navigate]);

  if (sesion) return <Navigate to="/comercial" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    const r = store.login(email, password);
    setEnviando(false);
    if (r.ok) {
      navigate({ to: "/comercial" });
      return;
    }
    if (r.motivo === "bloqueado") {
      setError(
        `Cuenta bloqueada temporalmente. Intenta de nuevo en ${r.minutosRestantes ?? 15} minutos.`,
      );
    } else if (r.motivo === "inactivo") {
      setError("Esta cuenta está desactivada. Contacta al administrador.");
    } else {
      setError("Correo o contraseña incorrectos.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Hammer className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">HF HomeFort</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inicia sesión para acceder al sistema de gestión interna.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-border bg-surface p-5 shadow-sm"
        >
          {error && <ErrorBanner>{error}</ErrorBanner>}

          <div className="flex flex-col gap-3">
            <Field label="Correo" required>
              <TextInput
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@homefort.co"
                required
              />
            </Field>
            <Field label="Contraseña" required>
              <div className="relative">
                <TextInput
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
                  aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Button type="submit" disabled={enviando} className="mt-2 w-full">
              {enviando ? "Verificando…" : "Iniciar sesión"}
            </Button>
          </div>
        </form>

        {import.meta.env.DEV && (
          <div className="mt-4">
            <InfoBanner>
              <div className="space-y-1 text-xs">
                <div className="font-medium">Usuarios de demostración:</div>
                <div>· laura@homefort.co / comercial123</div>
                <div>· carlos@homefort.co / compras123</div>
                <div>· maria@homefort.co / produccion123</div>
                <div>· andres@homefort.co / admin123 (Admin)</div>
              </div>
            </InfoBanner>
          </div>
        )}

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Tras 5 intentos fallidos la cuenta se bloquea 15 minutos. La sesión expira tras 30
          min de inactividad.
        </p>
      </div>
    </div>
  );
}
