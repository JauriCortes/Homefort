import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/seguimiento/$id")({
  component: FichaProyecto,
});

function FichaProyecto() {
  const { id } = Route.useParams();
  return <Navigate to="/comercial/proyectos/$id" params={{ id }} replace />;
}
