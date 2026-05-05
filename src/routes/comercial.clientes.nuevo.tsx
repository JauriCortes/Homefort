import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useUsuarioActivo } from "@/hooks/use-store";
import { store, nuevoId, type TipoCliente } from "@/lib/store";
import {
  PageHeader,
  ErrorBanner,
  ReadOnlyBanner,
  SuccessBanner,
} from "@/components/ui-bits";
import { Field, TextInput, Select, Button } from "@/components/form-bits";

export const Route = createFileRoute("/comercial/clientes/nuevo")({
  component: NuevoCliente,
});

function NuevoCliente() {
  const usuario = useUsuarioActivo();
  const navigate = useNavigate();
  const puedeEditar = usuario.esAdmin || usuario.areas.includes("comercial");

  const [form, setForm] = useState({
    nombre: "",
    contacto: "",
    tipo: "B2C" as TipoCliente,
    empresa: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    if (!puedeEditar) {
      setError("No tienes permisos para registrar clientes.");
      return;
    }
    if (!form.nombre.trim()) {
      setError("El nombre del cliente es obligatorio.");
      return;
    }
    if (!form.contacto.trim()) {
      setError("El contacto es obligatorio (correo o teléfono).");
      return;
    }
    if (store.contactoExiste(form.contacto)) {
      setError(
        "Ya existe un cliente registrado con ese contacto. Verifica la lista de clientes antes de crear uno nuevo.",
      );
      return;
    }
    const id = nuevoId("c");
    store.clientes.push({
      id,
      nombre: form.nombre.trim(),
      contacto: form.contacto.trim(),
      tipo: form.tipo,
      empresa: form.empresa.trim() || undefined,
      creadoEn: new Date().toISOString().slice(0, 10),
    });
    store.emit();
    setOkMsg("Cliente registrado correctamente. Redirigiendo…");
    setTimeout(() => navigate({ to: "/comercial/clientes/$id", params: { id } }), 600);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Registrar nuevo cliente"
        description="Los clientes son consultables por todas las áreas. El contacto debe ser único."
        crumbs={[
          { label: "Comercial", to: "/comercial" },
          { label: "Clientes", to: "/comercial/clientes" },
          { label: "Nuevo" },
        ]}
        actions={
          <Link
            to="/comercial/clientes"
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
            placeholder="Ej. Diana Restrepo"
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Tipo de cliente"
            required
            hint="B2B = empresa · B2C = persona natural"
          >
            <Select
              disabled={!puedeEditar}
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoCliente })}
            >
              <option value="B2C">B2C — Persona natural</option>
              <option value="B2B">B2B — Empresa</option>
            </Select>
          </Field>
          <Field label="Contacto (correo o teléfono)" required>
            <TextInput
              disabled={!puedeEditar}
              value={form.contacto}
              onChange={(e) => setForm({ ...form, contacto: e.target.value })}
              placeholder="correo@dominio.com o +57 300 000 0000"
            />
          </Field>
        </div>
        {form.tipo === "B2B" && (
          <Field label="Razón social / empresa">
            <TextInput
              disabled={!puedeEditar}
              value={form.empresa}
              onChange={(e) => setForm({ ...form, empresa: e.target.value })}
              placeholder="Ej. Constructora Andina S.A.S."
            />
          </Field>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Link
            to="/comercial/clientes"
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
          >
            Cancelar
          </Link>
          <Button type="submit" disabled={!puedeEditar}>
            Guardar cliente
          </Button>
        </div>
      </form>
    </div>
  );
}
