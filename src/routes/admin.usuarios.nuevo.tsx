import { createFileRoute, Link, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { store, type Area } from "@/lib/store";
import { useUsuarioActivo } from "@/hooks/use-store";
import { PageHeader, ErrorBanner } from "@/components/ui-bits";
import { AreasChecklist, Button, Field, TextInput } from "@/components/form-bits";

export const Route = createFileRoute("/admin/usuarios/nuevo")({
  component: NuevoUsuario,
});

function NuevoUsuario() {
  const usuario = useUsuarioActivo();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [areas, setAreas] = useState<Area[]>(["comercial"]);
  const [esAdmin, setEsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!usuario.esAdmin) return <Navigate to="/comercial" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (nombre.trim().length < 2) return setError("El nombre es obligatorio.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Correo inválido.");
    if (store.emailUsuarioExiste(email)) return setError("Ya existe un usuario con ese correo.");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (areas.length === 0) return setError("Selecciona al menos un área.");
    const u = store.crearUsuario({ nombre, email, password, areas, esAdmin });
    navigate({ to: "/admin/usuarios/$id", params: { id: u.id } });
  };

  return (
    <div>
      <PageHeader
        title="Nuevo usuario"
        crumbs={[
          { label: "Administración" },
          { label: "Usuarios", to: "/admin/usuarios" },
          { label: "Nuevo" },
        ]}
        actions={
          <Link to="/admin/usuarios">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" /> Volver
            </Button>
          </Link>
        }
      />

      <form
        onSubmit={handleSubmit}
        className="max-w-lg space-y-4 rounded-lg border border-border bg-surface p-5"
      >
        {error && <ErrorBanner>{error}</ErrorBanner>}

        <Field label="Nombre completo" required>
          <TextInput value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </Field>
        <Field label="Correo" required hint="Será su identificador de acceso al sistema.">
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Contraseña inicial" required hint="Mínimo 6 caracteres.">
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </Field>
        <Field
          label="Áreas asignadas"
          required
          hint="El usuario podrá editar registros de cada área marcada. Puedes asignar más de una."
        >
          <AreasChecklist value={areas} onChange={setAreas} />
        </Field>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={esAdmin}
            onChange={(e) => setEsAdmin(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            <span className="font-medium text-foreground">Permisos de administrador</span>
            <span className="block text-xs text-muted-foreground">
              Puede editar todas las áreas y gestionar usuarios.
            </span>
          </span>
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Link to="/admin/usuarios">
            <Button variant="secondary" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit">Crear usuario</Button>
        </div>
      </form>
    </div>
  );
}
