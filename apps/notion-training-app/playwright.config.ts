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
const BASE = `http://127.0.0.1:${PORT}/notion-training-app`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["github"]] : [["list"]],
  use: {
    // 末尾スラッシュ必須: テスト側は先頭スラッシュなしの相対パスで goto する
    // (絶対パスだと base の /notion-training-app/ が消えるため)
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
      VITE_API_URL: "http://127.0.0.1:8787/api/notion-training-app",
    },
  },
});
