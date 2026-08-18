import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";

/** 統合アプリの入口。旧 portal の役割をここが引き継ぐ */
const SECTIONS = [
  {
    to: "/training",
    emoji: "🏋️",
    title: "トレーニング記録",
    description: "トレーニングログと種目の記録・推移を管理します。",
  },
  {
    to: "/todo",
    emoji: "🍅",
    title: "Todo & ポモドーロ",
    description: "今日のタスクとポモドーロタイマーで作業を進めます。",
  },
];

const HomePage = () => {
  return (
    <>
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Personal App</h1>
        <p className="text-sm text-zinc-500">
          Notion をデータソースにした個人用アプリをまとめています。
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Card key={section.to}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span aria-hidden>{section.emoji}</span>
                {section.title}
              </CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link to={section.to}>開く</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default HomePage;
