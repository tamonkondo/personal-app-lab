import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import PageHero, { HeroLinkButton } from "../../components/PageHero";
import AlertCard from "../../components/AlertCard";
import DetailSkeleton from "../../components/DetailPageSkeleton";
import ExerciseFormFields from "../../features/exercise/components/ExerciseFormFields";
import { useExerciseDetail } from "../../features/exercise/hooks/useExerciseDetail";
import { useExerciseMutations } from "../../features/exercise/hooks/useExerciseMutations";
import {
  detailToExerciseFormValues,
  emptyExerciseFormValues,
  exerciseFormSchema,
  toExerciseInput,
  type ExerciseFormValues,
} from "../../features/exercise/exerciseForm.schema";

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
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: emptyExerciseFormValues(),
    mode: "onChange",
  });
  const { watch, reset, formState } = form;
  const selectedParts = watch("musclesTypes");

  // 取得できたらフォームへプリフィル
  useEffect(() => {
    if (exerciseDetail) {
      reset(detailToExerciseFormValues(exerciseDetail));
    }
  }, [exerciseDetail, reset]);

  const summaryItems = [
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
  ];

  if (!exerciseId) return <Navigate replace to="/training/exercises" />;

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await updateExercise(exerciseId, toExerciseInput(values));
      navigate(`/training/exercises/${exerciseId}`);
    } catch (submitFailure) {
      setSubmitError(
        submitFailure instanceof Error
          ? submitFailure.message
          : "更新に失敗しました",
      );
    }
  });

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
          <Link to="/training/exercises">
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
            <HeroLinkButton to={`/training/exercises/${exerciseId}`} variant="outline">
              詳細へ戻る
            </HeroLinkButton>
            <Button
              className="w-full sm:w-auto"
              disabled={!formState.isValid || isSubmitting}
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
              <ExerciseFormFields form={form} />

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
                <Link to={`/training/exercises/${exerciseId}`}>
                  <Button variant="outline" className="w-full">
                    詳細へ戻る
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    reset(detailToExerciseFormValues(exerciseDetail))
                  }
                >
                  変更を破棄
                </Button>
                <Button
                  className="w-full"
                  disabled={!formState.isValid || isSubmitting}
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
