// vite.config.widget.ts
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import path from "node:path";

export default defineConfig({
  plugins: [preact()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/widget/main.tsx"),
      name: "LiveChatWidget",
      fileName: () => "widget.js",
      formats: ["iife"],
    },
    outDir: "dist/widget",
    emptyOutDir: true,
  },
});
