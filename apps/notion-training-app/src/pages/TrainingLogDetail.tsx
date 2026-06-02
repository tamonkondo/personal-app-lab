import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui";

const trainingLog = {
  id: "log-1",
  date: "2026/06/01",
  day: "月",
  title: "胸・三頭",
  status: "完了",
  duration: 68,
  exerciseCount: 5,
  sets: 18,
  volume: "8,420kg",
  memo: "ベンチプレスでPR更新。全体的に調子良し。次回はインクライン種目を先に入れても良さそう。",
};

const exerciseDetails = [
  {
    id: "exercise-1",
    name: "ベンチプレス",
    part: "胸",
    maxWeight: "92.5kg",
    volume: "3,450kg",
    isPr: true,
    sets: [
      { set: 1, weight: "80kg", reps: 8, memo: "ウォームアップ" },
      { set: 2, weight: "87.5kg", reps: 6, memo: "余裕あり" },
      { set: 3, weight: "92.5kg", reps: 3, memo: "PR" },
      { set: 4, weight: "85kg", reps: 7, memo: "フォーム重視" },
    ],
  },
  {
    id: "exercise-2",
    name: "インクラインダンベルプレス",
    part: "胸",
    maxWeight: "30kg",
    volume: "1,680kg",
    isPr: false,
    sets: [
      { set: 1, weight: "26kg", reps: 10, memo: "" },
      { set: 2, weight: "28kg", reps: 8, memo: "" },
      { set: 3, weight: "30kg", reps: 6, memo: "やや重い" },
    ],
  },
  {
    id: "exercise-3",
    name: "ケーブルフライ",
    part: "胸",
    maxWeight: "22.5kg",
    volume: "1,350kg",
    isPr: false,
    sets: [
      { set: 1, weight: "20kg", reps: 12, memo: "" },
      { set: 2, weight: "22.5kg", reps: 10, memo: "" },
      { set: 3, weight: "22.5kg", reps: 10, memo: "収縮意識" },
    ],
  },
  {
    id: "exercise-4",
    name: "トライセプスプレスダウン",
    part: "三頭",
    maxWeight: "35kg",
    volume: "1,940kg",
    isPr: false,
    sets: [
      { set: 1, weight: "30kg", reps: 12, memo: "" },
      { set: 2, weight: "32.5kg", reps: 10, memo: "" },
      { set: 3, weight: "35kg", reps: 8, memo: "" },
    ],
  },
];

const summaryItems = [
  { label: "時間", value: `${trainingLog.duration}分` },
  { label: "種目数", value: `${trainingLog.exerciseCount}` },
  { label: "セット数", value: `${trainingLog.sets}` },
  { label: "総重量", value: trainingLog.volume },
];

const statusClassName: Record<string, string> = {
  完了: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  予定: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  未完了: "bg-amber-100 text-amber-700 hover:bg-amber-100",
};

const TrainingLogDetail = () => {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-white/10 text-white hover:bg-white/10">
                  Training Log Detail
                </Badge>
                <Badge className={statusClassName[trainingLog.status]}>
                  {trainingLog.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-300">
                  {trainingLog.date} {trainingLog.day}
                </p>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {trainingLog.title}
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">
                  {trainingLog.memo}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20 sm:w-auto">
                一覧へ戻る
              </Button>
              <Button className="w-full sm:w-auto">編集する</Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryItems.map((item) => (
            <Card key={item.label}>
              <CardContent className="p-5">
                <p className="text-sm text-zinc-500">{item.label}</p>
                <p className="mt-2 text-2xl font-bold">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>種目別セット記録</CardTitle>
                <p className="mt-1 text-sm text-zinc-500">
                  各種目ごとの重量、回数、メモを確認できます。
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                セットを追加
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              {exerciseDetails.map((exercise) => (
                <article
                  key={exercise.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold">{exercise.name}</h2>
                        <Badge variant="secondary">{exercise.part}</Badge>
                        {exercise.isPr ? (
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            PR更新
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-zinc-500">
                        最大重量 {exercise.maxWeight} / 総重量 {exercise.volume}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      種目詳細
                    </Button>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-2xl border">
                    <div className="grid grid-cols-[64px_1fr_1fr] bg-zinc-50 px-4 py-3 text-xs font-semibold text-zinc-500 sm:grid-cols-[72px_1fr_1fr_1.5fr]">
                      <span>Set</span>
                      <span>重量</span>
                      <span>回数</span>
                      <span className="hidden sm:block">メモ</span>
                    </div>

                    {exercise.sets.map((set) => (
                      <div
                        key={`${exercise.id}-${set.set}`}
                        className="grid grid-cols-[64px_1fr_1fr] border-t px-4 py-3 text-sm sm:grid-cols-[72px_1fr_1fr_1.5fr]"
                      >
                        <span className="font-semibold">{set.set}</span>
                        <span>{set.weight}</span>
                        <span>{set.reps}回</span>
                        <span className="hidden text-zinc-500 sm:block">
                          {set.memo || "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>この日のハイライト</CardTitle>
                <p className="mt-1 text-sm text-zinc-500">
                  記録から自動で見たいポイントをまとめます。
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-4">
                  <p className="text-sm font-semibold text-yellow-800">PR更新</p>
                  <p className="mt-1 text-sm text-yellow-800">
                    ベンチプレス 92.5kg を記録しました。
                  </p>
                </div>
                <div className="rounded-2xl border bg-zinc-50 p-4">
                  <p className="text-sm font-semibold">最多ボリューム</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    ベンチプレスが 3,450kg で最大でした。
                  </p>
                </div>
                <div className="rounded-2xl border bg-zinc-50 p-4">
                  <p className="text-sm font-semibold">次回メモ</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    インクライン種目を先に実施して胸上部を優先。
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">同じ内容で記録作成</Button>
                <Button variant="outline" className="w-full">
                  メモを編集
                </Button>
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                  記録を削除
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
};

export default TrainingLogDetail;