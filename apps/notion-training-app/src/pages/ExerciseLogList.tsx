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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui";
import { Link } from "react-router-dom";

const exerciseLogs = [
  {
    id: "exercise-1",
    name: "ベンチプレス",
    parts: ["胸", "三頭"],
    isPr: true,
    currentMaxWeight: 92.5,
    goalWeight: 100,
    latestDate: "2026/06/01",
    totalSessions: 24,
    totalSets: 86,
    memo: "足の踏み込みと肩甲骨の固定を優先。",
    latestSets: [
      { set: 1, weight: "80kg", reps: "8回" },
      { set: 2, weight: "87.5kg", reps: "6回" },
      { set: 3, weight: "92.5kg", reps: "3回" },
    ],
  },
  {
    id: "exercise-2",
    name: "スクワット",
    parts: ["脚"],
    isPr: false,
    currentMaxWeight: 125,
    goalWeight: 140,
    latestDate: "2026/05/27",
    totalSessions: 18,
    totalSets: 74,
    memo: "ボトムで潰れない深さを維持。高重量日はベルト使用。",
    latestSets: [
      { set: 1, weight: "105kg", reps: "6回" },
      { set: 2, weight: "115kg", reps: "5回" },
      { set: 3, weight: "125kg", reps: "3回" },
    ],
  },
  {
    id: "exercise-3",
    name: "デッドリフト",
    parts: ["背中", "脚"],
    isPr: false,
    currentMaxWeight: 150,
    goalWeight: 170,
    latestDate: "2026/05/29",
    totalSessions: 15,
    totalSets: 52,
    memo: "床引きは週1回。疲労が強い日はトップサイドに変更。",
    latestSets: [
      { set: 1, weight: "120kg", reps: "5回" },
      { set: 2, weight: "140kg", reps: "3回" },
      { set: 3, weight: "150kg", reps: "2回" },
    ],
  },
  {
    id: "exercise-4",
    name: "ショルダープレス",
    parts: ["肩"],
    isPr: false,
    currentMaxWeight: 45,
    goalWeight: 55,
    latestDate: "2026/05/25",
    totalSessions: 20,
    totalSets: 69,
    memo: "腰を反りすぎない。トップで一瞬止める。",
    latestSets: [
      { set: 1, weight: "35kg", reps: "8回" },
      { set: 2, weight: "40kg", reps: "6回" },
      { set: 3, weight: "45kg", reps: "4回" },
    ],
  },
];

const summaryItems = [
  { label: "登録種目", value: "18" },
  { label: "PR更新", value: "3" },
  { label: "目標達成間近", value: "5" },
  { label: "総セット", value: "412" },
];

const getProgress = (current: number, goal: number) =>
  Math.min(Math.round((current / goal) * 100), 100);

const ExerciseCard = ({ exercise }: { exercise: (typeof exerciseLogs)[number] }) => {
  const progress = getProgress(exercise.currentMaxWeight, exercise.goalWeight);

  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold">{exercise.name}</h2>
            <Badge variant="secondary">{exercise.parts.join(", ")}</Badge>
            {exercise.isPr ? (
              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                PR更新
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-zinc-500">
            Current {exercise.currentMaxWeight}kg / Goal {exercise.goalWeight}kg
            / Latest {exercise.latestDate}
          </p>
          <p className="max-w-3xl text-sm leading-6 text-zinc-600">
            {exercise.memo}
          </p>
        </div>
        <Link to={`/exercise-log/${exercise.id}`}>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            種目詳細
          </Button>
        </Link>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[240px_1fr]">
        <div className="rounded-2xl border bg-zinc-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Goal Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-zinc-950"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-zinc-500">記録回数</p>
              <p className="font-semibold">{exercise.totalSessions}</p>
            </div>
            <div>
              <p className="text-zinc-500">セット数</p>
              <p className="font-semibold">{exercise.totalSets}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader className="bg-zinc-50 text-xs font-semibold text-zinc-500 uppercase">
              <TableRow>
                <TableHead>Set</TableHead>
                <TableHead>重量</TableHead>
                <TableHead>回数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercise.latestSets.map((set) => (
                <TableRow key={`${exercise.id}-${set.set}`}>
                  <TableCell className="font-semibold">{set.set}</TableCell>
                  <TableCell>{set.weight}</TableCell>
                  <TableCell>{set.reps}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </article>
  );
};

const ExerciseLogList = () => {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Badge className="bg-white/10 text-white hover:bg-white/10">
                Exercise Logs
              </Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  種目ログ一覧
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">
                  種目ごとのMAX重量、目標進捗、直近セットをまとめて確認できます。
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
              <Button className="w-full sm:w-auto">種目を追加</Button>
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
                <CardTitle>種目</CardTitle>
                <p className="mt-1 text-sm text-zinc-500">
                  詳細ボタンから種目別の履歴へ移動できます。
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                目標を一括確認
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="h-auto gap-2 px-3 py-2 [&>button]:h-auto [&>button]:cursor-pointer">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pr">PR</TabsTrigger>
                  <TabsTrigger value="goal">Goal</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-5 space-y-5">
                  {exerciseLogs.map((exercise) => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                  ))}
                </TabsContent>
                <TabsContent value="pr" className="mt-5 space-y-5">
                  {exerciseLogs
                    .filter((exercise) => exercise.isPr)
                    .map((exercise) => (
                      <ExerciseCard key={exercise.id} exercise={exercise} />
                    ))}
                </TabsContent>
                <TabsContent value="goal" className="mt-5 space-y-5">
                  {exerciseLogs
                    .filter(
                      (exercise) =>
                        getProgress(
                          exercise.currentMaxWeight,
                          exercise.goalWeight,
                        ) >= 85,
                    )
                    .map((exercise) => (
                      <ExerciseCard key={exercise.id} exercise={exercise} />
                    ))}
                </TabsContent>
              </Tabs>
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
                  <Input placeholder="ベンチ、脚、PR..." />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline">胸</Button>
                  <Button variant="outline">背中</Button>
                  <Button variant="outline">脚</Button>
                  <Button variant="outline">肩</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>次に狙う記録</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl border bg-zinc-50 p-4">
                  <p className="text-sm font-semibold">ベンチプレス</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    100kg まであと 7.5kg です。
                  </p>
                </div>
                <div className="rounded-2xl border bg-zinc-50 p-4">
                  <p className="text-sm font-semibold">スクワット</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    140kg まであと 15kg です。
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

export default ExerciseLogList;
