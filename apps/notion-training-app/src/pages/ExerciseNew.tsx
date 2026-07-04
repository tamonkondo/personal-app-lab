import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  MultipleSelector,
  Textarea,
  type Option,
} from "@repo/ui";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BODY_PARTS from "../constants/parts";

const ExerciseNew = () => {
  const [exerciseName, setExerciseName] = useState("");
  const [selectedParts, setSelectedParts] = useState<Option[]>([]);
  const [defaultRest, setDefaultRest] = useState("90");
  const [goalWeight, setGoalWeight] = useState("");
  const [memo, setMemo] = useState("");

  const summaryItems = useMemo(
    () => [
      { label: "対象部位", value: `${selectedParts.length}` },
      { label: "休憩時間", value: defaultRest ? `${defaultRest}秒` : "未入力" },
      { label: "目標重量", value: goalWeight ? `${goalWeight}kg` : "未入力" },
    ],
    [defaultRest, goalWeight, selectedParts.length],
  );

  const clearDraft = () => {
    setExerciseName("");
    setSelectedParts([]);
    setDefaultRest("90");
    setGoalWeight("");
    setMemo("");
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Badge className="bg-white/10 text-white hover:bg-white/10">
                New Exercise
              </Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  エクササイズ種目を作成
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">
                  種目名、対象部位、休憩時間、目標重量を入力します。
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link to="/exercises">
                <Button
                  variant="outline"
                  className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                >
                  一覧へ戻る
                </Button>
              </Link>
              <Button className="w-full sm:w-auto" disabled>
                登録する
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
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
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <p className="mt-1 text-sm text-zinc-500">
                登録する種目の基準情報を入力します。
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">種目名</label>
                <Input
                  placeholder="ベンチプレス"
                  value={exerciseName}
                  onChange={(event) => setExerciseName(event.target.value)}
                />
              </div>


              <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  対象部位
                </label>
                <MultipleSelector
                  value={selectedParts}
                  defaultOptions={BODY_PARTS}
                  placeholder="胸、肩、上腕三頭筋..."
                  onChange={setSelectedParts}
                  emptyIndicator={
                    <p className="text-center text-sm text-zinc-500">
                      該当する部位がありません
                    </p>
                  }
                />
              </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    目標重量
                  </label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="100"
                    value={goalWeight}
                    onChange={(event) => setGoalWeight(event.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">メモ</label>
                <Textarea
                  placeholder="フォーム、注意点、補助種目との関係など"
                  value={memo}
                  onChange={(event) => setMemo(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>操作</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Link to="/exercises">
                  <Button variant="outline" className="w-full">
                    一覧へ戻る
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearDraft}
                >
                  下書きクリア
                </Button>
                <Button className="w-full" disabled>
                  登録する
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ExerciseNew;
