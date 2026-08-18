import { Badge, Button } from "@repo/ui";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/**
 * 各ページ冒頭のダークヒーロー。
 * 以前は全ページに同じ section マークアップが重複していたものを集約。
 * (設計方針: docs/design-policy-2026-07-25.md Part 2)
 */
type PageHeroProps = {
  /** 左上のバッジテキスト (例: "Training Logs") */
  badge?: string;
  /** タイトル上の小さな行 (日付など)。badge と併用可 */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** 右側のアクションボタン群 */
  actions?: ReactNode;
};

const PageHero = ({
  badge,
  eyebrow,
  title,
  description,
  actions,
}: PageHeroProps) => {
  return (
    <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm lg:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          {badge && (
            <Badge className="bg-white/10 text-white hover:bg-white/10">
              {badge}
            </Badge>
          )}
          <div className="space-y-2">
            {eyebrow && (
              <p className="text-sm font-medium text-zinc-300">{eyebrow}</p>
            )}
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex flex-col gap-2 sm:flex-row">{actions}</div>
        )}
      </div>
    </section>
  );
};

/** ヒーロー内のリンクボタン。outline は「戻る」系、primary は主要アクション */
export const HeroLinkButton = ({
  to,
  variant = "primary",
  children,
}: {
  to: string;
  variant?: "primary" | "outline";
  children: ReactNode;
}) => {
  return (
    <Link to={to}>
      {variant === "outline" ? (
        <Button
          variant="outline"
          className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
        >
          {children}
        </Button>
      ) : (
        <Button className="w-full sm:w-auto">{children}</Button>
      )}
    </Link>
  );
};

export default PageHero;
