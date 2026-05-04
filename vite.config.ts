import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { Connect } from "vite";
import { componentTagger } from "lovable-tagger";

/** When neither WAITLIST_ENDPOINT nor a Next app URL is used, POST /api/waitlist would 404. Accept signups in dev so the UI can be exercised. */
function waitlistDevFallbackPlugin(): {
  name: string;
  configureServer(server: { middlewares: Connect.Server }): void;
} {
  return {
    name: "waitlist-dev-fallback",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split("?")[0] ?? "";
        if (pathname === "/api/waitlist" && req.method === "POST") {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, persisted: false }));
          return;
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const waitlistEndpoint = env.WAITLIST_ENDPOINT;
  const waitlistUrl = waitlistEndpoint ? new URL(waitlistEndpoint) : null;
  const custosAppUrl = env.VITE_CUSTOS_APP_URL?.trim();

  return {
    server: {
      host: "::",
      port: 5173,
      hmr: {
        overlay: false,
      },
      proxy: waitlistUrl
        ? {
            "/api/waitlist": {
              target: waitlistUrl.origin,
              changeOrigin: true,
              rewrite: () => `${waitlistUrl.pathname}${waitlistUrl.search}`,
            },
          }
        : undefined,
    },
    preview: {
      host: "::",
      port: 5173,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      mode === "development" && !waitlistUrl && !custosAppUrl && waitlistDevFallbackPlugin(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
