import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  MultipleSelector,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from "@repo/ui";
import type { ExerciseDetail } from "@repo/types/notion-training-app";
import {
  EXERCISE_RM_TYPES,
  type ExerciseRmTypes,
} from "@repo/types/notion-training-app";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import PageHero, { HeroLinkButton } from "../components/PageHero";
import AlertCard from "../components/AlertCard";
import DetailSkeleton from "../components/DetailPageSkeleton";
import BODY_PARTS from "../constants/parts";
import { useExerciseDetail } from "../features/exercise/hooks/useExerciseDetail";
import { useExerciseMutations } from "../features/exercise/hooks/useExerciseMutations";

const RM_TYPE_LABELS: Record<ExerciseRmTypes, string> = {
  upperBody: "上半身",
  lowerBody: "下半身",
};

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
  const navigate = useNavigate();
  const {
    error,
    exerciseDetail,
    isLoading,
    mutate: mutateExerciseDetail,
  } = useExerciseDetail(exerciseId);
  const { updateExercise, isSubmitting } = useExerciseMutations();
  const [exerciseName, setExerciseName] = useState("");
  const [selectedParts, setSelectedParts] = useState<Option[]>([]);
  const [defaultRest, setDefaultRest] = useState("");
  const [rmType, setRmType] = useState<ExerciseRmTypes | "">("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!exerciseDetail) return;

    setExerciseName(getExerciseName(exerciseDetail));
    setSelectedParts(toPartOptions(exerciseDetail.musclesTypes));
    setDefaultRest(
      exerciseDetail.rest !== null ? String(exerciseDetail.rest) : "",
    );
    setRmType(exerciseDetail.rmTypes ?? "");
  }, [exerciseDetail]);

  const summaryItems = useMemo(
    () => [
      { label: "対象部位", value: `${selectedParts.length}` },
      {
        label: "目標重量 (Notion管理)",
        value: exerciseDetail?.maxGoalWeight
          ? `${exerciseDetail.maxGoalWeight}kg`
          : "未設定",
      },
      {
        label: "現在MAX重量",
        value: exerciseDetail
          ? `${exerciseDetail.currentMaxWeight ?? 0}kg`
          : "読み込み中",
      },
    ],
    [exerciseDetail, selectedParts.length],
  );

  if (!exerciseId) return <Navigate replace to="/exercises" />;

  const resetDraft = () => {
    if (!exerciseDetail) return;

    setExerciseName(getExerciseName(exerciseDetail));
    setSelectedParts(toPartOptions(exerciseDetail.musclesTypes));
    setDefaultRest(
      exerciseDetail.rest !== null ? String(exerciseDetail.rest) : "",
    );
    setRmType(exerciseDetail.rmTypes ?? "");
  };

  const canSubmit = exerciseName.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitError(null);
    try {
      await updateExercise(exerciseId, {
        name: exerciseName.trim(),
        musclesTypes: selectedParts.map((part) => part.value),
        rmTypes: rmType === "" ? null : rmType,
        rest: defaultRest.trim() === "" ? null : Number(defaultRest),
      });
      navigate(`/exercises/${exerciseId}`);
    } catch (submitFailure) {
      setSubmitError(
        submitFailure instanceof Error
          ? submitFailure.message
          : "更新に失敗しました",
      );
    }
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
    <>
      <PageHero
        badge="Edit Exercise"
        title="エクササイズ種目を編集"
        description="取得済みの種目情報をもとに、種目名、対象部位、休憩時間、RMタイプを編集します。"
        actions={
          <>
            <HeroLinkButton to={`/exercises/${exerciseId}`} variant="outline">
              詳細へ戻る
            </HeroLinkButton>
            <Button
              className="w-full sm:w-auto"
              disabled={!canSubmit || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "保存中..." : "変更を保存"}
            </Button>
          </>
        }
      />

      {submitError && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {submitError}
        </section>
      )}

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
                    休憩時間（秒）
                  </label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="90"
                    value={defaultRest}
                    onChange={(event) => setDefaultRest(event.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    RMタイプ（次回セット目安の計算に使用）
                  </label>
                  <Select
                    value={rmType}
                    onValueChange={(value) =>
                      setRmType(value as ExerciseRmTypes)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="上半身 / 下半身" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXERCISE_RM_TYPES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {RM_TYPE_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className="rounded-2xl border bg-zinc-50 p-4 text-sm text-zinc-500">
                目標重量は Notion の GOAL_WEIGHTS
                データベースで管理しているため、この画面では編集できません。
              </p>
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
                <Button
                  className="w-full"
                  disabled={!canSubmit || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? "保存中..." : "変更を保存"}
                </Button>
              </CardContent>
            </Card>
          </div>
      </section>
    </>
  );
};

export default ExerciseEdit;
