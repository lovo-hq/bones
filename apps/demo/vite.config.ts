import { defineConfig } from "vite-plus";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  oxc: {
    jsx: {
      runtime: "automatic",
    },
  },
  test: {
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "@": __dirname,
    },
  },
});
