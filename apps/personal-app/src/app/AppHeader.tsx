import { NavLink } from "react-router-dom";
import { cn } from "@repo/ui/lib/utils";

/** 統合アプリの横断ナビ。ドメイン(トレーニング / Todo)の切り替えを担う */
const NAV = [
  { to: "/", label: "ホーム", end: true },
  { to: "/training", label: "トレーニング", end: false },
  { to: "/todo", label: "Todo", end: false },
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2 font-semibold">
          <span className="text-lg">🗂️</span>
          <span>Personal App</span>
        </NavLink>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-900 text-zinc-50"
                    : "text-zinc-600 hover:bg-zinc-100",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
