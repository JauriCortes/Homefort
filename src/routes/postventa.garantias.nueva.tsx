import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { store } from "@/lib/store";
import { useStore, useUsuarioActivo } from "@/hooks/use-store";
import { PageHeader, ErrorBanner } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";

export const Route = createFileRoute("/postventa/garantias/nueva")({
  component: NuevaGarantia,
});

function NuevaGarantia() {
  const navigate = useNavigate();
  const usuario = useUsuarioActivo();
  const proyectos = useStore((s) => s.proyectos);
  const [form, setForm] = useState({ proyectoId: "", fecha: new Date().toISOString().slice(0, 10), descripcion: "" });
  const [error, setError] = useState<string | null>(null);

  const proyectosEntregados = proyectos.filter((p) => p.estado === "Entregado");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.proyectoId) return setError("Selecciona un proyecto.");
    if (!form.descripcion.trim()) return setError("La descripcion es obligatoria.");
    const sol = store.crearSolicitudGarantia({ proyectoId: form.proyectoId, fecha: form.fecha, descripcion: form.descripcion.trim(), abiertoBy: usuario.nombre });
    navigate({ to: "/postventa/garantias/$id", params: { id: sol.id } });
  };

  return (
    <div>
      <PageHeader
        title="Nueva solicitud de garantia"
        crumbs={[{ label: "Postventa" }, { label: "Garantias", to: "/postventa/garantias" }, { label: "Nueva" }]}
        actions={<Link to="/postventa/garantias"><Button variant="secondary"><ArrowLeft className="h-4 w-4" /> Volver</Button></Link>}
      />
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4 rounded-lg border border-border bg-surface p-5">
        {error && <ErrorBanner>{error}</ErrorBanner>}
        <Field label="Proyecto (solo entregados)" required>
          <Select value={form.proyectoId} onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}>
            <option value="">Selecciona...</option>
            {proyectosEntregados.map((p) => <option key={p.id} value={p.id}>{p.codigo} - {p.tipo}</option>)}
          </Select>
        </Field>
        {proyectosEntregados.length === 0 && <p className="text-sm text-muted-foreground">No hay proyectos en estado Entregado.</p>}
        <Field label="Fecha" required>
          <TextInput type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
        </Field>
        <Field label="Descripcion del problema" required>
          <TextInput value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Describe el problema reportado por el cliente" />
        </Field>
        <div className="flex justify-end gap-2">
          <Link to="/postventa/garantias"><Button variant="secondary" type="button">Cancelar</Button></Link>
          <Button type="submit" disabled={proyectosEntregados.length === 0}>Crear solicitud</Button>
        </div>
      </form>
    </div>
  );
}
