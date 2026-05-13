import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useMe } from "@/hooks/api/use-auth";
import { useClientes, useCrearProyecto } from "@/hooks/api/use-comercial";
import type { TipoProyecto } from "@/lib/store";
import {
  PageHeader,
  ErrorBanner,
  ReadOnlyBanner,
  SuccessBanner,
  EmptyState,
} from "@/components/ui-bits";
import { Field, Select, TextInput, Button } from "@/components/form-bits";

const searchSchema = z.object({
  clienteId: z.string().optional(),
});

export const Route = createFileRoute("/comercial/proyectos/nuevo")({
  validateSearch: searchSchema,
  component: NuevoProyecto,
});

const TIPOS: TipoProyecto[] = [
  "Cocina integral",
  "Closet",
  "Mobiliario oficina",
  "Puertas",
  "Mobiliario comercial",
  "Otro",
];

function NuevoProyecto() {
  const search = Route.useSearch();
  const { data: usuario } = useMe();
  const navigate = useNavigate();
  const { data: clientes = [] } = useClientes();
  const crearProyecto = useCrearProyecto();
  const puedeEditar = (usuario?.esAdmin || usuario?.areas.includes("comercial")) ?? false;

  const [form, setForm] = useState({
    clienteId: search.clienteId ?? "",
    tipo: "Cocina integral" as TipoProyecto,
    fechaSolicitud: new Date().toISOString().slice(0, 10),
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
    if (!form.fechaSolicitud) return setError("La fecha de solicitud es obligatoria.");
    crearProyecto.mutate(
      { clienteId: form.clienteId, tipo: form.tipo, fechaSolicitud: form.fechaSolicitud },
      {
        onSuccess: (proyecto) => {
          setOkMsg("Proyecto creado en estado Solicitud. Redirigiendo...");
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tipo de proyecto" required>
            <Select
              disabled={!puedeEditar}
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoProyecto })}
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Fecha de solicitud" required>
            <TextInput
              disabled={!puedeEditar}
              type="date"
              value={form.fechaSolicitud}
              onChange={(e) => setForm({ ...form, fechaSolicitud: e.target.value })}
            />
          </Field>
        </div>
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
