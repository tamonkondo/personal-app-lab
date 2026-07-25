import {
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
import PageHero, { HeroLinkButton } from "../components/PageHero";

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
    <>
      <PageHero
        badge="New Exercise"
        title="エクササイズ種目を作成"
        description="種目名、対象部位、休憩時間、目標重量を入力します。"
        actions={
          <>
            <HeroLinkButton to="/exercises" variant="outline">
              一覧へ戻る
            </HeroLinkButton>
            <Button className="w-full sm:w-auto" disabled>
              登録する
            </Button>
          </>
        }
      />

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
    </>
  );
};

export default ExerciseNew;
