import { defineConfig } from "vitest/config";
import path from "node:path";

// tsconfig.json の paths と同じ解決を vitest に教える
// (順序重要: "@" が "@repo/..." を飲み込まないよう @repo を先に置く)
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
      { find: "@", replacement: path.resolve(import.meta.dirname, "src") },
    ],
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
