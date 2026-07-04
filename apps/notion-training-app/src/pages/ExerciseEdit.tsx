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
import type { ExerciseDetail } from "@repo/types/notion-training-app";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import AlertCard from "../components/AlertCard";
import DetailSkeleton from "../components/DetailPageSkeleton";
import BODY_PARTS from "../constants/parts";
import { useExerciseDetail } from "../features/exercise/hooks/useExerciseDetail";

const toPartOptions = (parts: string[]): Option[] =>
  parts.map((part) => {
    const option = BODY_PARTS.find(
      (bodyPart) => bodyPart.value === part || bodyPart.label === part,
    );

    return option ?? { value: part, label: part };
  });

const getExerciseName = (data: ExerciseDetail) =>
  data.exerciseName || data.trainingName || "";

const ExerciseEdit = () => {
  const { exerciseId } = useParams();
  const {
    error,
    exerciseDetail,
    isLoading,
    mutate: mutateExerciseDetail,
  } = useExerciseDetail(exerciseId);
  const [exerciseName, setExerciseName] = useState("");
  const [selectedParts, setSelectedParts] = useState<Option[]>([]);
  const [goalWeight, setGoalWeight] = useState("");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (!exerciseDetail) return;

    setExerciseName(getExerciseName(exerciseDetail));
    setSelectedParts(toPartOptions(exerciseDetail.musclesTypes));
    setGoalWeight(String(exerciseDetail.maxGoalWeight ?? ""));
    setMemo("");
  }, [exerciseDetail]);

  const summaryItems = useMemo(
    () => [
      { label: "対象部位", value: `${selectedParts.length}` },
      { label: "目標重量", value: goalWeight ? `${goalWeight}kg` : "未入力" },
      {
        label: "現在MAX重量",
        value: exerciseDetail
          ? `${exerciseDetail.currentMaxWeight ?? 0}kg`
          : "読み込み中",
      },
    ],
    [exerciseDetail, goalWeight, selectedParts.length],
  );

  if (!exerciseId) return <Navigate replace to="/exercises" />;

  const resetDraft = () => {
    if (!exerciseDetail) return;

    setExerciseName(getExerciseName(exerciseDetail));
    setSelectedParts(toPartOptions(exerciseDetail.musclesTypes));
    setGoalWeight(String(exerciseDetail.maxGoalWeight ?? ""));
    setMemo("");
  };

  if (isLoading) return <DetailSkeleton />;

  if (error) {
    return (
      <AlertCard
        title="データの取得に失敗しました"
        message="編集するエクササイズ種目のデータを取得できませんでした。"
        action={
          <Button onClick={() => mutateExerciseDetail()}>再読み込み</Button>
        }
      />
    );
  }

  if (!exerciseDetail) {
    return (
      <AlertCard
        title="データが一件も存在しません"
        message="編集するエクササイズ種目のデータが存在しません。"
        action={
          <Link to="/exercises">
            <Button>一覧へ戻る</Button>
          </Link>
        }
      />
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Badge className="bg-white/10 text-white hover:bg-white/10">
                Edit Exercise
              </Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  エクササイズ種目を編集
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">
                  取得済みの種目情報をもとに、種目名、対象部位、目標重量を編集します。
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link to={`/exercises/${exerciseId}`}>
                <Button
                  variant="outline"
                  className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                >
                  詳細へ戻る
                </Button>
              </Link>
              <Button className="w-full sm:w-auto" disabled>
                変更を保存
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
                登録済み種目の基準情報を編集します。
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
                <Link to={`/exercises/${exerciseId}`}>
                  <Button variant="outline" className="w-full">
                    詳細へ戻る
                  </Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={resetDraft}>
                  変更を破棄
                </Button>
                <Button className="w-full" disabled>
                  変更を保存
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ExerciseEdit;
