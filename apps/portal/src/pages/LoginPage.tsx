import { Link, useSearchParams } from "react-router-dom";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui";

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  return (
    <main className="mx-auto max-w-md p-8">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Cookie 認証を API 側に集約するための導線です。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">ログイン後の戻り先: {redirectTo}</p>
          <Button asChild>
            <Link to={redirectTo}>Continue</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
