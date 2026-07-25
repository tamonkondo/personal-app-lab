import * as Sentry from "@sentry/node";
import { config } from "./config";

Sentry.init({
  dsn: config.SENTRY_DSN,
  integrations: [
    // console.warn / console.error のみ Sentry ログへ送信する。
    // (log まで送るとデバッグ出力が全て送信され、ノイズ・コストになるため)
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],
  enableLogs: true,
});
