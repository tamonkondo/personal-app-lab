import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@repo/ui";
import PageHero, { HeroLinkButton } from "../components/PageHero";
import TrainingLogForm from "../features/trainingLog/components/TrainingLogForm";
import { useTrainingLogForm } from "../features/trainingLog/hooks/useTrainingLogForm";
import { useTrainingLogMutations } from "../features/trainingLog/hooks/useTrainingLogMutations";

const TrainingLogNew = () => {
  const navigate = useNavigate();
  const form = useTrainingLogForm();
  const { createTrainingLog, isSubmitting } = useTrainingLogMutations();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const payload = form.buildPayload();
    if (!payload) return;

    setSubmitError(null);
    try {
      const created = await createTrainingLog(payload);
      navigate(`/training-logs/${created.id}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "登録に失敗しました",
      );
    }
  };

  return (
    <>
      <PageHero
        badge="New Training Log"
        title="トレーニング記録を作成"
        description="体重とメモを入力し、種目ごとのセット内容を追加します (当日記録)。"
        actions={
          <>
            <HeroLinkButton to="/training-logs" variant="outline">
              一覧へ戻る
            </HeroLinkButton>
            <Button
              className="w-full sm:w-auto"
              disabled={!form.canSubmit || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "登録中..." : "登録する"}
            </Button>
          </>
        }
      />

      {submitError && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {submitError}
        </section>
      )}

      <TrainingLogForm form={form} />
    </>
  );
};

export default TrainingLogNew;
