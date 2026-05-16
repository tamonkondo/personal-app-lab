import { Link } from "react-router-dom";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui";

export function LogoutPage() {
  return (
    <main className="mx-auto max-w-md p-8">
      <Card>
        <CardHeader>
          <CardTitle>Logout</CardTitle>
          <CardDescription>API 側の logout エンドポイント接続に備えたページです。</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link to="/">Back to portal</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
