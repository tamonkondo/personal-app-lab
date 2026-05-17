import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { formatDate } from "@repo/utils";

export function ExampleCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>App 1 Example</CardTitle>
        <CardDescription>
          共通 UI と utility package を利用したサンプルです。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Today: {formatDate(new Date())}
        </p>
        <Button asChild>
          <a href="/login?redirect=/notion-training-app/">Login from portal</a>
        </Button>
      </CardContent>
    </Card>
  );
}
