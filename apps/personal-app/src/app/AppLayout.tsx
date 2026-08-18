import { Outlet } from "react-router-dom";

/**
 * 全ページ共通のレイアウト。
 * 以前は各ページが同じ <main> ラッパを重複記述していたものを集約。
 * (設計方針: docs/design-policy-2026-07-25.md Part 2)
 */
export function AppLayout() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Outlet />
      </div>
    </main>
  );
}
