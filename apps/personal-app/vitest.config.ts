import { defineConfig } from "vitest/config";
import path from "node:path";

// tsconfig の paths / vite.config の alias と同じ解決を vitest に教える
// (順序重要: より具体的な "@repo/ui/icons" 系を先に置く)
const resolveFromRoot = (relative: string) =>
  path.resolve(import.meta.dirname, relative);

export default defineConfig({
  resolve: {
    alias: [
      { find: "@repo/icons", replacement: resolveFromRoot("../../packages/ui/icons") },
      { find: "@repo/ui", replacement: resolveFromRoot("../../packages/ui") },
      { find: "@repo/api-client", replacement: resolveFromRoot("../../packages/api-client") },
      { find: "@repo/types", replacement: resolveFromRoot("../../packages/types") },
      { find: "@repo/schemas", replacement: resolveFromRoot("../../packages/schemas") },
      { find: "@repo/utils", replacement: resolveFromRoot("../../packages/utils") },
      { find: "@", replacement: resolveFromRoot("./src") },
    ],
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
