import { Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
const ControllPanel = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>操作</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full">同じ内容で記録作成</Button>
        <Button variant="outline" className="w-full">
          メモを編集
        </Button>
        <Button
          variant="outline"
          className="w-full text-red-600 hover:text-red-700"
        >
          記録を削除
        </Button>
      </CardContent>
    </Card>
  );
};

export default ControllPanel;
