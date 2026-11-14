import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: true,
    port: 4173
  },
  test: {
    environment: "jsdom",
    env: {
      VITE_API_BASE_URL: "http://127.0.0.1:3000",
      VITE_SOCKET_URL: "http://127.0.0.1:3000",
      VITE_PUBLIC_APP_URL: "http://127.0.0.1:5173/"
    }
  }
});
