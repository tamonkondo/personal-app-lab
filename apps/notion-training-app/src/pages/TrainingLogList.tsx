import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { Link } from "react-router-dom";

const trainingLogs = [
  {
    id: "log-1",
    date: "2026/06/01",
    day: "月",
    title: "胸・三頭",
    status: "完了",
    duration: 68,
    exerciseCount: 5,
    sets: 18,
    volume: "8,420kg",
    bodyWeight: "72.4kg",
    memo: "ベンチプレスでPR更新。全体的に調子良し。",
    exercises: [
      { name: "ベンチプレス", maxWeight: "92.5kg", sets: "4set" },
      { name: "インクラインダンベルプレス", maxWeight: "30kg", sets: "3set" },
      { name: "ケーブルフライ", maxWeight: "22.5kg", sets: "3set" },
    ],
  },
  {
    id: "log-2",
    date: "2026/05/29",
    day: "金",
    title: "背中・二頭",
    status: "完了",
    duration: 74,
    exerciseCount: 6,
    sets: 21,
    volume: "9,860kg",
    bodyWeight: "72.1kg",
    memo: "ラットプルは可動域を優先。次回はデッドリフトを先に入れる。",
    exercises: [
      { name: "デッドリフト", maxWeight: "150kg", sets: "4set" },
      { name: "ラットプルダウン", maxWeight: "65kg", sets: "4set" },
      { name: "シーテッドロー", maxWeight: "70kg", sets: "3set" },
    ],
  },
  {
    id: "log-3",
    date: "2026/05/27",
    day: "水",
    title: "脚",
    status: "完了",
    duration: 82,
    exerciseCount: 5,
    sets: 19,
    volume: "11,200kg",
    bodyWeight: "72.3kg",
    memo: "スクワットはフォーム安定。ブルガリアンスクワットは左右差あり。",
    exercises: [
      { name: "スクワット", maxWeight: "125kg", sets: "5set" },
      { name: "レッグプレス", maxWeight: "180kg", sets: "4set" },
      { name: "レッグカール", maxWeight: "45kg", sets: "3set" },
    ],
  },
  {
    id: "log-4",
    date: "2026/05/25",
    day: "月",
    title: "胸・肩",
    status: "完了",
    duration: 64,
    exerciseCount: 5,
    sets: 17,
    volume: "7,940kg",
    bodyWeight: "72.0kg",
    memo: "胸上部を優先。肩は軽めでパンプ狙い。",
    exercises: [
      { name: "ベンチプレス", maxWeight: "90kg", sets: "4set" },
      { name: "ショルダープレス", maxWeight: "45kg", sets: "3set" },
      { name: "サイドレイズ", maxWeight: "12kg", sets: "4set" },
    ],
  },
];

const summaryItems = [
  { label: "今月の回数", value: "12" },
  { label: "平均時間", value: "72分" },
  { label: "総セット", value: "221" },
  { label: "総重量", value: "106,420kg" },
];

const statusClassName: Record<string, string> = {
  完了: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  予定: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  未完了: "bg-amber-100 text-amber-700 hover:bg-amber-100",
};

const TrainingLogList = () => {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Badge className="bg-white/10 text-white hover:bg-white/10">
                Training Logs
              </Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  トレーニングログ一覧
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">
                  日ごとの種目、セット数、総重量、メモをまとめて確認できます。
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link to="/">
                <Button
                  variant="outline"
                  className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                >
                  ホームへ戻る
                </Button>
              </Link>
              <Button className="w-full sm:w-auto">新規作成</Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryItems.map((item) => (
            <Card key={item.label}>
              <CardContent className="p-5">
                <p className="text-sm text-zinc-500">{item.label}</p>
                <p className="mt-2 text-xl font-bold md:text-2xl">
                  {item.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>ログ</CardTitle>
                <p className="mt-1 text-sm text-zinc-500">
                  詳細ボタンから各日のセット記録へ移動できます。
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                CSV出力
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              {trainingLogs.map((log) => (
                <article
                  key={log.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold">
                          {log.date} {log.day}
                        </h2>
                        <Badge variant="secondary">{log.title}</Badge>
                        <Badge className={statusClassName[log.status]}>
                          {log.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-500">
                        {log.duration}分 / {log.exerciseCount}種目 / {log.sets}
                        set / {log.volume}
                      </p>
                      <p className="max-w-3xl text-sm leading-6 text-zinc-600">
                        {log.memo}
                      </p>
                    </div>
                    <Link to={`/training-log/${log.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        詳細
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-5 overflow-x-auto rounded-2xl border">
                    <Table>
                      <TableHeader className="bg-zinc-50 text-xs font-semibold text-zinc-500 uppercase">
                        <TableRow>
                          <TableHead>種目</TableHead>
                          <TableHead>最大重量</TableHead>
                          <TableHead>セット数</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {log.exercises.map((exercise) => (
                          <TableRow key={`${log.id}-${exercise.name}`}>
                            <TableCell className="font-semibold">
                              {exercise.name}
                            </TableCell>
                            <TableCell>{exercise.maxWeight}</TableCell>
                            <TableCell>{exercise.sets}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </article>
              ))}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>表示条件</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">キーワード</p>
                  <Input placeholder="胸、スクワット、PR..." />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline">今週</Button>
                  <Button variant="outline">今月</Button>
                  <Button variant="outline">PRあり</Button>
                  <Button variant="outline">重量順</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>今月のハイライト</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-4">
                  <p className="text-sm font-semibold text-yellow-800">
                    PR更新
                  </p>
                  <p className="mt-1 text-sm text-yellow-800">
                    ベンチプレス 92.5kg を記録しました。
                  </p>
                </div>
                <div className="rounded-2xl border bg-zinc-50 p-4">
                  <p className="text-sm font-semibold">最多ボリューム</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    脚トレの日が 11,200kg で最大でした。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
};

export default TrainingLogList;
