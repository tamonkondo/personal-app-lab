import { defineConfig } from "@playwright/test";

/**
 * E2E テスト設定。
 * API はテスト内で route intercept によりモックするため、実 API や
 * Notion 認証は不要 (dev サーバのみ自動起動する)。
 *
 * PLAYWRIGHT_CHROMIUM_PATH: Playwright 管理外の Chromium バイナリを
 * 使うときの逃げ道 (プリインストール済みブラウザしか無い環境用)。
 */
const PORT = 5199;
const BASE = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["github"]] : [["list"]],
  use: {
    baseURL: `${BASE}/`,
    ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? {
          launchOptions: {
            executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
          },
        }
      : {}),
  },
  webServer: {
    command: `pnpm dev --port ${PORT} --strictPort --host 127.0.0.1`,
    url: `${BASE}/`,
    reuseExistingServer: !process.env.CI,
    env: {
      // API のルート。モジュール名は src/lib/fetch.ts が付与する
      VITE_API_URL: "http://127.0.0.1:8787/api",
    },
  },
});
