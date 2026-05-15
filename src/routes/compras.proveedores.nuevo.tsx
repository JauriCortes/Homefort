import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useMateriales, useCrearProveedor } from "@/hooks/api/use-compras";
import { PageHeader, ErrorBanner } from "@/components/ui-bits";
import { Button, Field, TextInput } from "@/components/form-bits";

export const Route = createFileRoute("/compras/proveedores/nuevo")({
  component: NuevoProveedor,
});

function NuevoProveedor() {
  const navigate = useNavigate();
  const { data: materiales = [] } = useMateriales();
  const crearProveedor = useCrearProveedor();

  const [form, setForm] = useState({
    nombre: "",
    contacto: "",
    telefono: "",
    email: "",
    condicionesPago: "30 días",
    notas: "",
  });
  const [materialIds, setMaterialIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleMat = (id: string) =>
    setMaterialIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim()) return setError("El nombre es obligatorio.");
    if (!form.email.trim()) return setError("El email es obligatorio.");
    crearProveedor.mutate(
      { ...form, notas: form.notas || null, materialesIds: materialIds },
      {
        onSuccess: () => navigate({ to: "/compras/proveedores" }),
        onError: () => setError("No se pudo crear el proveedor. Intenta nuevamente."),
      },
    );
  };

  return (
    <div>
      <PageHeader
        title="Nuevo proveedor"
        crumbs={[
          { label: "Compras" },
          { label: "Proveedores", to: "/compras/proveedores" },
          { label: "Nuevo" },
        ]}
        actions={
          <Link to="/compras/proveedores">
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
        <Field label="Nombre" required>
          <TextInput
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
        </Field>
        <Field label="Persona de contacto">
          <TextInput
            value={form.contacto}
            onChange={(e) => setForm({ ...form, contacto: e.target.value })}
          />
        </Field>
        <Field label="Teléfono">
          <TextInput
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />
        </Field>
        <Field label="Email" required>
          <TextInput
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Condiciones de pago">
          <TextInput
            value={form.condicionesPago}
            onChange={(e) => setForm({ ...form, condicionesPago: e.target.value })}
          />
        </Field>
        <Field label="Materiales que suministra">
          <div className="grid grid-cols-1 gap-1">
            {materiales.map((m) => (
              <label key={m.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={materialIds.includes(m.id)}
                  onChange={() => toggleMat(m.id)}
                  className="h-4 w-4"
                />
                {m.nombre} ({m.categoria})
              </label>
            ))}
          </div>
        </Field>
        <Field label="Notas">
          <TextInput
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Link to="/compras/proveedores">
            <Button variant="secondary" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={crearProveedor.isPending}>
            {crearProveedor.isPending ? "Creando…" : "Crear proveedor"}
          </Button>
        </div>
      </form>
    </div>
  );
}
