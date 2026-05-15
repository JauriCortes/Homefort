import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useMe } from "@/hooks/api/use-auth";
import { useClientes, useCrearProyecto } from "@/hooks/api/use-comercial";
import {
  PageHeader,
  ErrorBanner,
  ReadOnlyBanner,
  SuccessBanner,
  EmptyState,
} from "@/components/ui-bits";
import { Field, Select, TextInput, TextArea, Button } from "@/components/form-bits";

const searchSchema = z.object({
  clienteId: z.string().optional(),
});

export const Route = createFileRoute("/comercial/proyectos/nuevo")({
  validateSearch: searchSchema,
  component: NuevoProyecto,
});

function NuevoProyecto() {
  const search = Route.useSearch();
  const { data: usuario } = useMe();
  const navigate = useNavigate();
  const { data: clientes = [] } = useClientes();
  const crearProyecto = useCrearProyecto();
  const puedeEditar = (usuario?.esAdmin || usuario?.areas.includes("comercial")) ?? false;

  const [form, setForm] = useState({
    clienteId: search.clienteId ?? "",
    titulo: "",
    especificacionInicial: "",
    fechaEntrega: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  if (clientes.length === 0) {
    return (
      <div>
        <PageHeader
          title="Crear proyecto"
          crumbs={[
            { label: "Comercial", to: "/comercial" },
            { label: "Proyectos", to: "/comercial/proyectos" },
            { label: "Nuevo" },
          ]}
        />
        <EmptyState
          title="Necesitas registrar un cliente primero"
          description="No se puede crear un proyecto sin un cliente previamente registrado."
          action={
            <Link
              to="/comercial/clientes/nuevo"
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Registrar cliente
            </Link>
          }
        />
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    if (!puedeEditar) return setError("No tienes permisos para crear proyectos.");
    if (!form.clienteId) return setError("Selecciona un cliente para el proyecto.");
    if (!form.titulo.trim()) return setError("El nombre del proyecto es obligatorio.");
    crearProyecto.mutate(
      {
        clienteId: form.clienteId,
        titulo: form.titulo.trim(),
        fechaEntrega: form.fechaEntrega || undefined,
        especificacionInicial: form.especificacionInicial.trim() || undefined,
      },
      {
        onSuccess: (proyecto) => {
          setOkMsg("Proyecto creado. Redirigiendo…");
          setTimeout(
            () => navigate({ to: "/comercial/proyectos/$id", params: { id: proyecto.id } }),
            600,
          );
        },
        onError: () => setError("No se pudo crear el proyecto. Intenta nuevamente."),
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Crear nuevo proyecto"
        description="El proyecto inicia automáticamente en estado Solicitud."
        crumbs={[
          { label: "Comercial", to: "/comercial" },
          { label: "Proyectos", to: "/comercial/proyectos" },
          { label: "Nuevo" },
        ]}
        actions={
          <Link
            to="/comercial/proyectos"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        }
      />

      {!puedeEditar && <ReadOnlyBanner area="Comercial" />}
      {error && <ErrorBanner>{error}</ErrorBanner>}
      {okMsg && <SuccessBanner>{okMsg}</SuccessBanner>}

      <form onSubmit={submit} className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <Field label="Cliente" required hint="Solo se listan clientes ya registrados.">
          <Select
            disabled={!puedeEditar}
            value={form.clienteId}
            onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
          >
            <option value="">Selecciona un cliente…</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({c.tipo})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Nombre del proyecto" required>
          <TextInput
            disabled={!puedeEditar}
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            placeholder="Ej. Cocina integral apartamento 302"
          />
        </Field>

        <Field label="Fecha tentativa de entrega">
          <TextInput
            disabled={!puedeEditar}
            type="date"
            value={form.fechaEntrega}
            onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })}
          />
        </Field>

        <Field
          label="Especificaciones del proyecto"
          hint="Opcional. Medidas, materiales, acabados, condiciones especiales y cualquier detalle técnico. Puedes completarlas luego desde el proyecto."
        >
          <TextArea
            disabled={!puedeEditar}
            value={form.especificacionInicial}
            onChange={(e) => setForm({ ...form, especificacionInicial: e.target.value })}
            placeholder="Describe medidas, materiales, acabados, condiciones especiales y detalles técnicos…"
            rows={6}
          />
        </Field>

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Link
            to="/comercial/proyectos"
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
          >
            Cancelar
          </Link>
          <Button type="submit" disabled={!puedeEditar || crearProyecto.isPending}>
            {crearProyecto.isPending ? "Creando…" : "Crear proyecto"}
          </Button>
        </div>
      </form>
    </div>
  );
}
