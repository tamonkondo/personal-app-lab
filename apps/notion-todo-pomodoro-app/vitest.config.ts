import { defineConfig } from "vitest/config";
import path from "node:path";

// tsconfig の paths と同じ解決を vitest に教える
// (順序重要: "@" 系は具体的なものを先に置く)
export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@repo/types",
        replacement: path.resolve(import.meta.dirname, "../../packages/types"),
      },
      {
        find: "@repo/schemas",
        replacement: path.resolve(
          import.meta.dirname,
          "../../packages/schemas",
        ),
      },
      {
        find: "@repo/utils",
        replacement: path.resolve(import.meta.dirname, "../../packages/utils"),
      },
    ],
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
