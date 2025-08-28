import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["e4c85f7eafc9.ngrok-free.app", "app.dinhviethoang604.id.vn"],
  },
});
