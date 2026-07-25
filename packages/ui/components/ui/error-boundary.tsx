import React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  /** エラー捕捉時の通知先 (Sentry.captureException 等) */
  onError?: (error: unknown, errorInfo: React.ErrorInfo) => void;
  /** フォールバック UI。未指定時はデフォルトの簡易表示 */
  fallback?: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

/**
 * アプリ root 用のエラーバウンダリ。
 * レンダリング中の例外でアプリ全体が白画面になるのを防ぐ。
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
            <h1 className="text-xl font-bold">エラーが発生しました</h1>
            <p className="text-sm text-zinc-500">
              ページを再読み込みしてください。改善しない場合は時間をおいて再度お試しください。
            </p>
            <button
              type="button"
              className="rounded-md border px-4 py-2 text-sm"
              onClick={() => window.location.reload()}
            >
              再読み込み
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
