import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    cloudflare(),
    tailwindcss(),
    tsconfigPaths(),
    react(),
  ],
  server: {
    port: 5173,
  },
});
