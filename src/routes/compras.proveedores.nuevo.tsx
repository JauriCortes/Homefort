import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { store } from "@/lib/store";
import { useStore } from "@/hooks/use-store";
import { PageHeader, ErrorBanner } from "@/components/ui-bits";
import { Button, Field, TextInput } from "@/components/form-bits";

export const Route = createFileRoute("/compras/proveedores/nuevo")({
  component: NuevoProveedor,
});

function NuevoProveedor() {
  const navigate = useNavigate();
  const materiales = useStore((s) => s.materialesBase);
  const [form, setForm] = useState({ nombre: "", contacto: "", telefono: "", email: "", condicionesPago: "30 dias", notas: "" });
  const [materialIds, setMaterialIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleMat = (id: string) => setMaterialIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim()) return setError("El nombre es obligatorio.");
    if (!form.email.trim()) return setError("El email es obligatorio.");
    const p = store.crearProveedor ? store.crearProveedor({ ...form, materialesIds: materialIds }) : null;
    if (p) navigate({ to: "/compras/proveedores" });
    else {
      // fallback: guardamos en store directamente
      const pv = { id: `pv_${Date.now()}`, ...form, materialesIds: materialIds, creadoEn: new Date().toISOString().slice(0, 10) };
      store.proveedores = [...store.proveedores, pv];
      navigate({ to: "/compras/proveedores" });
    }
  };

  return (
    <div>
      <PageHeader
        title="Nuevo proveedor"
        crumbs={[{ label: "Compras" }, { label: "Proveedores", to: "/compras/proveedores" }, { label: "Nuevo" }]}
        actions={<Link to="/compras/proveedores"><Button variant="secondary"><ArrowLeft className="h-4 w-4" /> Volver</Button></Link>}
      />
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4 rounded-lg border border-border bg-surface p-5">
        {error && <ErrorBanner>{error}</ErrorBanner>}
        <Field label="Nombre" required><TextInput value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></Field>
        <Field label="Persona de contacto"><TextInput value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} /></Field>
        <Field label="Telefono"><TextInput value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></Field>
        <Field label="Email" required><TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></Field>
        <Field label="Condiciones de pago"><TextInput value={form.condicionesPago} onChange={(e) => setForm({ ...form, condicionesPago: e.target.value })} /></Field>
        <Field label="Materiales que suministra">
          <div className="grid grid-cols-1 gap-1">
            {materiales.map((m) => (
              <label key={m.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={materialIds.includes(m.id)} onChange={() => toggleMat(m.id)} />
                {m.nombre} ({m.categoria})
              </label>
            ))}
          </div>
        </Field>
        <Field label="Notas"><TextInput value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} /></Field>
        <div className="flex justify-end gap-2">
          <Link to="/compras/proveedores"><Button variant="secondary" type="button">Cancelar</Button></Link>
          <Button type="submit">Crear proveedor</Button>
        </div>
      </form>
    </div>
  );
}
