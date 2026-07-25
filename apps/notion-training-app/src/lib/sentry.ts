import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    // warn / error のみ送信 (log まで送るとノイズ・コストになるため)
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],
  enableLogs: true,
});
