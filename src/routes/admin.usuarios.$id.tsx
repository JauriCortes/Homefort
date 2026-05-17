import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Shield, KeyRound, Power, Unlock } from "lucide-react";
import { type Area, AREAS_LABEL } from "@/lib/store";
import { useMe } from "@/hooks/api/use-auth";
import {
  useUsuario,
  useActualizarUsuario,
  useCambiarPasswordAdmin,
  useDesbloquearUsuario,
} from "@/hooks/api/use-admin";
import {
  PageHeader,
  ErrorBanner,
  SuccessBanner,
  InfoBanner,
} from "@/components/ui-bits";
import { Button, Field, TextInput, AreasChecklist } from "@/components/form-bits";

export const Route = createFileRoute("/admin/usuarios/$id")({
  component: UsuarioDetalle,
});

function UsuarioDetalle() {
  const { id } = Route.useParams();
  const { data: usuario } = useMe();
  const navigate = useNavigate();
  const { data: u } = useUsuario(id);

  const actualizarUsuario = useActualizarUsuario();
  const cambiarPassword = useCambiarPasswordAdmin();
  const desbloquear = useDesbloquearUsuario();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [areas, setAreas] = useState<Area[]>(["comercial"]);
  const [esAdmin, setEsAdmin] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [nuevaPwd, setNuevaPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [errorPwd, setErrorPwd] = useState<string | null>(null);
  const [okPwd, setOkPwd] = useState<string | null>(null);

  if (!usuario?.esAdmin) return <Navigate to="/comercial" replace />;

  if (u && !initialized) {
    setNombre(u.nombre);
    setEmail(u.email);
    setAreas(u.areas);
    setEsAdmin(u.esAdmin);
    setInitialized(true);
  }

  if (!u) {
    return (
      <div>
        <PageHeader
          title="Usuario no encontrado"
          crumbs={[{ label: "Administración" }, { label: "Usuarios", to: "/admin/usuarios" }]}
        />
        <Link to="/admin/usuarios">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
        </Link>
      </div>
    );
  }

  const esYoMismo = u.id === usuario?.id;
  const bloqueado = !!u.bloqueadoHasta && new Date(u.bloqueadoHasta).getTime() > Date.now();

  const guardarDatos = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);
    if (nombre.trim().length < 2) return setError("El nombre es obligatorio.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Correo inválido.");
    if (areas.length === 0) return setError("Selecciona al menos un área.");
    actualizarUsuario.mutate(
      { id: u.id, nombre, email, areas, esAdmin },
      {
        onSuccess: () => setOk("Cambios guardados."),
        onError: (err: Error) => setError(err.message),
      },
    );
  };

  const cambiarPwd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPwd(null);
    setOkPwd(null);
    if (nuevaPwd.length < 6) return setErrorPwd("Mínimo 6 caracteres.");
    if (nuevaPwd !== confirmPwd) return setErrorPwd("Las contraseñas no coinciden.");
    cambiarPassword.mutate(
      { id: u.id, password: nuevaPwd },
      {
        onSuccess: () => {
          setNuevaPwd("");
          setConfirmPwd("");
          setOkPwd("Contraseña actualizada.");
        },
        onError: (err: Error) => setErrorPwd(err.message),
      },
    );
  };

  const togglePower = () => {
    if (esYoMismo) return;
    actualizarUsuario.mutate(
      { id: u.id, activo: !u.activo },
      { onSuccess: () => setOk(u.activo ? "Usuario desactivado." : "Usuario reactivado.") },
    );
  };

  return (
    <div>
      <PageHeader
        title={u.nombre}
        description={u.email}
        crumbs={[
          { label: "Administración" },
          { label: "Usuarios", to: "/admin/usuarios" },
          { label: u.nombre },
        ]}
        actions={
          <Link to="/admin/usuarios">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" /> Volver
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
          {u.areas.length === 1 ? "Área:" : "Áreas:"}{" "}
          <b className="ml-1">{u.areas.map((a) => AREAS_LABEL[a]).join(" · ")}</b>
        </span>
        {u.esAdmin && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            <Shield className="h-3 w-3" /> Administrador
          </span>
        )}
        {!u.activo && (
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Inactivo
          </span>
        )}
        {bloqueado && (
          <span className="inline-flex items-center rounded-full bg-warning/20 px-2 py-0.5 text-xs text-warning-foreground">
            Bloqueado por intentos fallidos
          </span>
        )}
        <span className="ml-auto text-xs text-muted-foreground">Creado: {u.creadoEn}</span>
      </div>

      {esYoMismo && (
        <InfoBanner>
          Estás editando tu propio usuario. No puedes desactivarte a ti mismo.
        </InfoBanner>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <form
          onSubmit={guardarDatos}
          className="space-y-4 rounded-lg border border-border bg-surface p-5"
        >
          <h3 className="text-sm font-semibold">Datos y permisos</h3>
          {error && <ErrorBanner>{error}</ErrorBanner>}
          {ok && <SuccessBanner>{ok}</SuccessBanner>}
          <Field label="Nombre" required>
            <TextInput value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </Field>
          <Field label="Correo" required>
            <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Áreas asignadas" required hint="El usuario podrá editar registros de cada área marcada.">
            <AreasChecklist value={areas} onChange={setAreas} />
          </Field>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={esAdmin}
              onChange={(e) => setEsAdmin(e.target.checked)}
              disabled={esYoMismo}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium text-foreground">Permisos de administrador</span>
              <span className="block text-xs text-muted-foreground">
                Puede editar todas las áreas y gestionar usuarios.
                {esYoMismo && " No puedes quitarte tus propios permisos."}
              </span>
            </span>
          </label>
          <div className="flex justify-end">
            <Button type="submit" disabled={actualizarUsuario.isPending}>
              Guardar cambios
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          <form
            onSubmit={cambiarPwd}
            className="space-y-4 rounded-lg border border-border bg-surface p-5"
          >
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Cambiar contraseña</h3>
            </div>
            {errorPwd && <ErrorBanner>{errorPwd}</ErrorBanner>}
            {okPwd && <SuccessBanner>{okPwd}</SuccessBanner>}
            <Field label="Nueva contraseña" required hint="Mínimo 6 caracteres.">
              <TextInput
                type="password"
                value={nuevaPwd}
                onChange={(e) => setNuevaPwd(e.target.value)}
                required
                minLength={6}
              />
            </Field>
            <Field label="Confirmar contraseña" required>
              <TextInput
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                required
                minLength={6}
              />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" disabled={cambiarPassword.isPending}>
                Actualizar contraseña
              </Button>
            </div>
          </form>

          <div className="space-y-3 rounded-lg border border-border bg-surface p-5">
            <h3 className="text-sm font-semibold">Estado de la cuenta</h3>
            <p className="text-xs text-muted-foreground">
              Desactivar le impide iniciar sesión, pero conserva todo su historial en el sistema.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={u.activo ? "danger" : "primary"}
                onClick={togglePower}
                disabled={esYoMismo || actualizarUsuario.isPending}
                type="button"
              >
                <Power className="h-4 w-4" />
                {u.activo ? "Desactivar usuario" : "Reactivar usuario"}
              </Button>
              {bloqueado && (
                <Button
                  variant="secondary"
                  type="button"
                  disabled={desbloquear.isPending}
                  onClick={() =>
                    desbloquear.mutate(u.id, { onSuccess: () => setOk("Bloqueo levantado.") })
                  }
                >
                  <Unlock className="h-4 w-4" /> Desbloquear acceso
                </Button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Intentos fallidos recientes: <b>{u.intentosFallidos}</b>
              {u.bloqueadoHasta && bloqueado && (
                <>
                  {" · "}Bloqueado hasta{" "}
                  <b>{new Date(u.bloqueadoHasta).toLocaleTimeString("es-CO")}</b>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
