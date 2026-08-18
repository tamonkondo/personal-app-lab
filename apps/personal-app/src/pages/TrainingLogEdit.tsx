import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "@repo/ui";
import PageHero, { HeroLinkButton } from "../components/PageHero";
import AlertCard from "../components/AlertCard";
import DetailSkeleton from "../components/DetailPageSkeleton";
import TrainingLogForm from "../features/trainingLog/components/TrainingLogForm";
import { useTrainingLogDetail } from "../features/trainingLog/hooks/useTrainingLogDetail";
import { useTrainingLogForm } from "../features/trainingLog/hooks/useTrainingLogForm";
import { useTrainingLogMutations } from "../features/trainingLog/hooks/useTrainingLogMutations";
import { toUpdateTrainingLogInput } from "../features/trainingLog/trainingLogForm.schema";

const TrainingLogEdit = () => {
  const { trainingId } = useParams();
  const navigate = useNavigate();
  const { error, isLoading, mutate, trainingLogDetail } =
    useTrainingLogDetail(trainingId);
  const form = useTrainingLogForm();
  const { updateTrainingLog, isSubmitting } = useTrainingLogMutations();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 取得できたらフォームへプリフィル (詳細が変わったときのみ)
  useEffect(() => {
    if (trainingLogDetail) {
      form.hydrate(trainingLogDetail);
    }
    // form は毎レンダー生成される closure のため依存に含めない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainingLogDetail]);

  if (!trainingId) return <Navigate replace to="/training-logs" />;

  if (isLoading) return <DetailSkeleton />;

  if (error) {
    return (
      <AlertCard
        title="データの取得に失敗しました"
        message="編集するトレーニングログのデータを取得できませんでした。"
        action={<Button onClick={() => mutate()}>再読み込み</Button>}
      />
    );
  }

  if (!trainingLogDetail) {
    return (
      <AlertCard
        title="データが一件も存在しません"
        message="編集するトレーニングログのデータが存在しません。"
        action={
          <Link to="/training-logs">
            <Button>一覧へ戻る</Button>
          </Link>
        }
      />
    );
  }

  // zod 検証を通過した値だけが submit ハンドラに渡る
  const handleSubmit = form.form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await updateTrainingLog(trainingId, toUpdateTrainingLogInput(values));
      navigate(`/training-logs/${trainingId}`);
    } catch (submitFailure) {
      setSubmitError(
        submitFailure instanceof Error
          ? submitFailure.message
          : "更新に失敗しました",
      );
    }
  });

  return (
    <>
      <PageHero
        badge="Edit Training Log"
        title="トレーニング記録を編集"
        description="取得済みの記録をもとに、基本情報と種目ごとのセット内容を編集します。"
        actions={
          <>
            <HeroLinkButton
              to={`/training-logs/${trainingId}`}
              variant="outline"
            >
              詳細へ戻る
            </HeroLinkButton>
            <Button
              className="w-full sm:w-auto"
              disabled={!form.form.formState.isValid || isSubmitting}
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

      <TrainingLogForm form={form} logDate={trainingLogDetail.createdTime} />
    </>
  );
};

export default TrainingLogEdit;
