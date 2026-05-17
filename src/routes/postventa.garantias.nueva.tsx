import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useMe } from "@/hooks/api/use-auth";
import { useProyectos } from "@/hooks/api/use-comercial";
import { useCrearSolicitudGarantia } from "@/hooks/api/use-postventa";
import { PageHeader, ErrorBanner } from "@/components/ui-bits";
import { Button, Field, TextInput, Select } from "@/components/form-bits";
import { toast } from "sonner";

export const Route = createFileRoute("/postventa/garantias/nueva")({
  component: NuevaGarantia,
});

function NuevaGarantia() {
  const navigate = useNavigate();
  const { data: usuario } = useMe();
  const { data: proyectos = [] } = useProyectos();
  const crearSolicitud = useCrearSolicitudGarantia();

  const [form, setForm] = useState({
    proyectoId: "",
    fecha: new Date().toISOString().slice(0, 10),
    descripcion: "",
  });
  const [error, setError] = useState<string | null>(null);

  const puedeAbrir = usuario?.esAdmin || usuario?.areas?.includes("comercial");
  const proyectosEntregados = proyectos.filter((p) => p.estado === "Entregado");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.proyectoId) return setError("Selecciona un proyecto.");
    if (!form.descripcion.trim()) return setError("La descripción es obligatoria.");
    try {
      const sol = await crearSolicitud.mutateAsync({
        proyectoId: form.proyectoId,
        fecha: form.fecha,
        descripcion: form.descripcion.trim(),
        abiertoBy: usuario?.nombre ?? "",
      });
      toast.success("Solicitud de garantía creada.");
      navigate({ to: "/postventa/garantias/$id", params: { id: sol.id } });
    } catch {
      toast.error("Error al crear la solicitud.");
    }
  };

  if (!puedeAbrir) {
    return (
      <div>
        <PageHeader
          title="Nueva solicitud de garantía"
          crumbs={[{ label: "Postventa" }, { label: "Garantías", to: "/postventa/garantias" }, { label: "Nueva" }]}
        />
        <ErrorBanner>Solo el área Comercial o Administración puede abrir solicitudes de garantía.</ErrorBanner>
        <Link to="/postventa/garantias" className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Nueva solicitud de garantía"
        crumbs={[{ label: "Postventa" }, { label: "Garantías", to: "/postventa/garantias" }, { label: "Nueva" }]}
        actions={
          <Link to="/postventa/garantias">
            <Button variant="secondary"><ArrowLeft className="h-4 w-4" /> Volver</Button>
          </Link>
        }
      />
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4 rounded-lg border border-border bg-surface p-5">
        {error && <ErrorBanner>{error}</ErrorBanner>}
        <Field label="Proyecto (solo entregados)" required>
          <Select value={form.proyectoId} onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}>
            <option value="">Selecciona...</option>
            {proyectosEntregados.map((p) => (
              <option key={p.id} value={p.id}>{p.codigo} - {p.tipo}</option>
            ))}
          </Select>
        </Field>
        {proyectosEntregados.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay proyectos en estado Entregado.</p>
        )}
        <Field label="Fecha" required>
          <TextInput type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
        </Field>
        <Field label="Descripción del problema" required>
          <TextInput value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Describe el problema reportado por el cliente" />
        </Field>
        <div className="flex justify-end gap-2">
          <Link to="/postventa/garantias">
            <Button variant="secondary" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={crearSolicitud.isPending || proyectosEntregados.length === 0}>
            Crear solicitud
          </Button>
        </div>
      </form>
    </div>
  );
}
