import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui";
import { Link } from "react-router-dom";

const exerciseLog = {
  id: "exercise-1",
  name: "ベンチプレス",
  part: "胸",
  status: "更新中",
  latestDate: "2026/06/01",
  currentMaxWeight: 92.5,
  goalWeight: 100,
  totalSessions: 24,
  totalSets: 86,
  totalVolume: "74,280kg",
  averageRest: "3分",
  memo: "胸の日のメイン種目。高重量日は肩甲骨の固定と足の踏み込みを優先する。",
};

const sessionLogs = [
  {
    id: "session-1",
    trainingLogId: "log-1",
    date: "2026/06/01",
    day: "月",
    title: "胸・三頭",
    rest: "3分",
    volume: "3,450kg",
    bestSet: "92.5kg x 3",
    isPr: true,
    sets: [
      { set: 1, weight: "80kg", reps: 8, oneRm: "101.3kg", memo: "アップ" },
      { set: 2, weight: "87.5kg", reps: 6, oneRm: "105kg", memo: "余裕あり" },
      { set: 3, weight: "92.5kg", reps: 3, oneRm: "101.8kg", memo: "PR" },
      { set: 4, weight: "85kg", reps: 7, oneRm: "104.8kg", memo: "フォーム重視" },
    ],
  },
  {
    id: "session-2",
    trainingLogId: "log-2",
    date: "2026/05/25",
    day: "月",
    title: "胸・肩",
    rest: "3分",
    volume: "3,180kg",
    bestSet: "90kg x 4",
    isPr: false,
    sets: [
      { set: 1, weight: "77.5kg", reps: 8, oneRm: "98.1kg", memo: "" },
      { set: 2, weight: "85kg", reps: 6, oneRm: "102kg", memo: "" },
      { set: 3, weight: "90kg", reps: 4, oneRm: "102kg", memo: "重め" },
      { set: 4, weight: "82.5kg", reps: 8, oneRm: "104.5kg", memo: "" },
    ],
  },
  {
    id: "session-3",
    trainingLogId: "log-3",
    date: "2026/05/18",
    day: "月",
    title: "胸・三頭",
    rest: "2.5分",
    volume: "3,020kg",
    bestSet: "87.5kg x 5",
    isPr: false,
    sets: [
      { set: 1, weight: "75kg", reps: 8, oneRm: "95kg", memo: "" },
      { set: 2, weight: "82.5kg", reps: 6, oneRm: "99kg", memo: "" },
      { set: 3, weight: "87.5kg", reps: 5, oneRm: "102.1kg", memo: "安定" },
      { set: 4, weight: "80kg", reps: 8, oneRm: "101.3kg", memo: "" },
    ],
  },
];

const personalRecords = [
  { label: "最高重量", value: "92.5kg", date: "2026/06/01" },
  { label: "最多回数", value: "80kg x 10", date: "2026/05/04" },
  { label: "推定1RM", value: "105kg", date: "2026/06/01" },
  { label: "最大総重量", value: "3,450kg", date: "2026/06/01" },
];

const trendItems = [
  { label: "直近4週の伸び", value: "+5kg", tone: "text-emerald-700" },
  { label: "平均セット数", value: "4.0 set", tone: "text-zinc-950" },
  { label: "次回目安", value: "90kg x 5", tone: "text-zinc-950" },
];

const summaryItems = [
  { label: "現在MAX", value: `${exerciseLog.currentMaxWeight}kg` },
  { label: "目標重量", value: `${exerciseLog.goalWeight}kg` },
  { label: "記録回数", value: `${exerciseLog.totalSessions}` },
  { label: "総重量", value: exerciseLog.totalVolume },
];

const goalProgress = Math.round(
  (exerciseLog.currentMaxWeight / exerciseLog.goalWeight) * 100,
);

const ExerciseLogDetail = () => {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-white/10 text-white hover:bg-white/10">
                  Exercise Log Detail
                </Badge>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  {exerciseLog.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-300">
                  Latest {exerciseLog.latestDate}
                </p>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {exerciseLog.name}
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">
                  {exerciseLog.memo}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link to="/exercise-logs">
                <Button
                  variant="outline"
                  className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                >
                  一覧へ戻る
                </Button>
              </Link>
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
                <CardTitle>種目別ログ</CardTitle>
                <p className="mt-1 text-sm text-zinc-500">
                  ベストセット、セット履歴、PR履歴を確認できます。
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                セットを追加
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="history">
                <TabsList className="h-auto gap-2 px-3 py-2 [&>button]:h-auto [&>button]:cursor-pointer">
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="records">Records</TabsTrigger>
                </TabsList>

                <TabsContent value="history" className="mt-5 space-y-5">
                  {sessionLogs.map((session) => (
                    <article
                      key={session.id}
                      className="rounded-2xl border bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-bold">
                              {session.date} {session.day}
                            </h2>
                            <Badge variant="secondary">{session.title}</Badge>
                            {session.isPr ? (
                              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                PR更新
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-sm text-zinc-500">
                            Best {session.bestSet} / Volume {session.volume} /
                            Rest {session.rest}
                          </p>
                        </div>
                        <Link to={`/training-log/${session.trainingLogId}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            トレーニング詳細
                          </Button>
                        </Link>
                      </div>

                      <div className="mt-5 overflow-x-auto rounded-2xl border">
                        <Table>
                          <TableHeader className="bg-zinc-50 text-xs font-semibold text-zinc-500 uppercase">
                            <TableRow>
                              <TableHead>Set</TableHead>
                              <TableHead>重量</TableHead>
                              <TableHead>回数</TableHead>
                              <TableHead>1RM</TableHead>
                              <TableHead className="hidden sm:table-cell">
                                メモ
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {session.sets.map((set) => (
                              <TableRow
                                key={`${session.id}-${set.set}`}
                                className={
                                  set.memo === "PR" ? "bg-yellow-50" : undefined
                                }
                              >
                                <TableCell className="font-semibold">
                                  {set.set}
                                </TableCell>
                                <TableCell>{set.weight}</TableCell>
                                <TableCell>{set.reps}回</TableCell>
                                <TableCell>{set.oneRm}</TableCell>
                                <TableCell className="hidden text-zinc-500 sm:table-cell">
                                  {set.memo || "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </article>
                  ))}
                </TabsContent>

                <TabsContent value="records" className="mt-5">
                  <div className="overflow-hidden rounded-2xl border bg-white">
                    <Table>
                      <TableHeader className="bg-zinc-50 text-xs font-semibold text-zinc-500 uppercase">
                        <TableRow>
                          <TableHead>項目</TableHead>
                          <TableHead>記録</TableHead>
                          <TableHead>日付</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {personalRecords.map((record) => (
                          <TableRow key={record.label}>
                            <TableCell className="font-semibold">
                              {record.label}
                            </TableCell>
                            <TableCell>{record.value}</TableCell>
                            <TableCell className="text-zinc-500">
                              {record.date}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>目標進捗</CardTitle>
                <p className="mt-1 text-sm text-zinc-500">
                  目標重量まであと{" "}
                  {(exerciseLog.goalWeight - exerciseLog.currentMaxWeight).toFixed(
                    1,
                  )}
                  kg です。
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-zinc-950"
                    style={{ width: `${goalProgress}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Progress</span>
                  <span className="font-semibold">{goalProgress}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>最近の傾向</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border bg-zinc-50 p-4"
                  >
                    <span className="text-sm text-zinc-500">{item.label}</span>
                    <span className={`text-sm font-semibold ${item.tone}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">この種目で記録作成</Button>
                <Button variant="outline" className="w-full">
                  目標重量を更新
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700"
                >
                  種目ログを削除
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ExerciseLogDetail;
