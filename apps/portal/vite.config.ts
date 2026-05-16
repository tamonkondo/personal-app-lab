import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@repo/ui": fileURLToPath(new URL("../../packages/ui", import.meta.url)),
      "@repo/types": fileURLToPath(new URL("../../packages/types", import.meta.url)),
      "@repo/schemas": fileURLToPath(new URL("../../packages/schemas", import.meta.url)),
      "@repo/utils": fileURLToPath(new URL("../../packages/utils", import.meta.url))
    }
  }
});
