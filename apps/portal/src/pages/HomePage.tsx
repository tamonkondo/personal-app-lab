import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";

const apps = [
  {
    href: "/notion-training-app/",
    title: "App 1",
    description: "学習用アプリ1",
  },
  { href: "/app2/", title: "App 2", description: "学習用アプリ2" },
];

export function HomePage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold">Portfolio Portal</h1>
      <p className="mt-2 text-muted-foreground">
        複数の学習用アプリをまとめたポートフォリオです。
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {apps.map((app) => (
          <Card key={app.href}>
            <CardHeader>
              <CardTitle>{app.title}</CardTitle>
              <CardDescription>{app.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <a href={app.href}>Open</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/logout">Logout</Link>
        </Button>
      </div>
    </main>
  );
}
