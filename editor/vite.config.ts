import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// `bun run editor:dev` proxies the API to an editor started with --port 4310.
const api = process.env.OUTPOST_EDITOR_API ?? "http://127.0.0.1:4310";

export default defineConfig({
  root: import.meta.dirname,
  resolve: { tsconfigPaths: true },
  // The editor is served from the loopback interface, so one larger bundle is acceptable.
  build: { chunkSizeWarningLimit: 2_000 },
  plugins: [
    tailwindcss(),
    tanstackStart({
      spa: { enabled: true, prerender: { outputPath: "/index.html" } },
    }),
    viteReact(),
  ],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: api,
        changeOrigin: true,
        configure: (proxy) =>
          proxy.on("proxyReq", (request) => request.removeHeader("origin")),
      },
    },
  },
});
