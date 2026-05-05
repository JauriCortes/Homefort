import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/produccion/ordenes/")({
  component: () => <Navigate to="/produccion" replace />,
});
