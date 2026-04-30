import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const waitlistEndpoint = env.WAITLIST_ENDPOINT;
  const waitlistUrl = waitlistEndpoint ? new URL(waitlistEndpoint) : null;

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
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
