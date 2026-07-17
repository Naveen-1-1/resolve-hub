import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "../", ""); // load from repo root
  const backendPort = env.BACKEND_PORT || "8000";

  return {
    plugins: [react()],
    server: {
      port: Number(env.FRONTEND_PORT) || 3000,
      proxy: {
        "/api": {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
