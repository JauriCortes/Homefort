import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useStore, useUsuarioActivo } from "@/hooks/use-store";
import { store, type TipoCliente } from "@/lib/store";
import {
  PageHeader,
  ErrorBanner,
  ReadOnlyBanner,
  SuccessBanner,
} from "@/components/ui-bits";
import { Field, TextInput, Select, Button } from "@/components/form-bits";

export const Route = createFileRoute("/comercial/clientes/$id/editar")({
  component: EditarCliente,
});

function EditarCliente() {
  const { id } = Route.useParams();
  const usuario = useUsuarioActivo();
  const navigate = useNavigate();
  const cliente = useStore((s) => s.cliente(id));
  const puedeEditar = usuario.esAdmin || usuario.areas.includes("comercial");

  const [form, setForm] = useState({
    nombre: cliente?.nombre ?? "",
    contacto: cliente?.contacto ?? "",
    tipo: (cliente?.tipo ?? "B2C") as TipoCliente,
    empresa: cliente?.empresa ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  if (!cliente) {
    return (
      <div className="mx-auto max-w-xl">
        <PageHeader title="Cliente no encontrado" />
        <ErrorBanner>Este cliente ya no existe.</ErrorBanner>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    if (!puedeEditar) return setError("No tienes permisos para editar clientes.");
    if (!form.nombre.trim()) return setError("El nombre del cliente es obligatorio.");
    if (!form.contacto.trim()) return setError("El contacto es obligatorio.");
    if (store.contactoExiste(form.contacto, cliente.id)) {
      return setError("Ya existe otro cliente con ese contacto.");
    }
    cliente.nombre = form.nombre.trim();
    cliente.contacto = form.contacto.trim();
    cliente.tipo = form.tipo;
    cliente.empresa = form.empresa.trim() || undefined;
    store.emit();
    setOkMsg("Cambios guardados correctamente.");
    setTimeout(() => navigate({ to: "/comercial/clientes/$id", params: { id: cliente.id } }), 600);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={`Editar ${cliente.nombre}`}
        crumbs={[
          { label: "Comercial", to: "/comercial" },
          { label: "Clientes", to: "/comercial/clientes" },
          { label: cliente.nombre, to: `/comercial/clientes/${cliente.id}` as never },
          { label: "Editar" },
        ]}
        actions={
          <Link
            to="/comercial/clientes/$id"
            params={{ id: cliente.id }}
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
        <Field label="Nombre del cliente" required>
          <TextInput
            disabled={!puedeEditar}
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tipo de cliente" required>
            <Select
              disabled={!puedeEditar}
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoCliente })}
            >
              <option value="B2C">B2C — Persona natural</option>
              <option value="B2B">B2B — Empresa</option>
            </Select>
          </Field>
          <Field label="Contacto" required>
            <TextInput
              disabled={!puedeEditar}
              value={form.contacto}
              onChange={(e) => setForm({ ...form, contacto: e.target.value })}
            />
          </Field>
        </div>
        {form.tipo === "B2B" && (
          <Field label="Razón social / empresa">
            <TextInput
              disabled={!puedeEditar}
              value={form.empresa}
              onChange={(e) => setForm({ ...form, empresa: e.target.value })}
            />
          </Field>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Link
            to="/comercial/clientes/$id"
            params={{ id: cliente.id }}
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
          >
            Cancelar
          </Link>
          <Button type="submit" disabled={!puedeEditar}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
