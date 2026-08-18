import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@repo/ui";
import type { TrainingLogDetail } from "@repo/types/notion-training-app";
import PageHero, { HeroLinkButton } from "../../components/PageHero";
import TrainingLogForm from "../../features/trainingLog/components/TrainingLogForm";
import { useTrainingLogForm } from "../../features/trainingLog/hooks/useTrainingLogForm";
import { useTrainingLogMutations } from "../../features/trainingLog/hooks/useTrainingLogMutations";
import { toCreateTrainingLogInput } from "../../features/trainingLog/trainingLogForm.schema";

/** 他ページから渡される初期化用の state */
type TrainingLogNewLocationState = {
  /** 「同じ内容で記録作成」: 既存記録の内容をテンプレートとして流し込む */
  template?: TrainingLogDetail;
  /** 「この種目で記録作成」: 種目を1つプリセットする */
  presetExercise?: { exerciseId: string; exerciseName: string };
} | null;

const TrainingLogNew = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const form = useTrainingLogForm();
  const { createTrainingLog, isSubmitting } = useTrainingLogMutations();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 遷移元からの state で一度だけ初期化する
  useEffect(() => {
    const state = location.state as TrainingLogNewLocationState;
    if (state?.template) {
      form.hydrate(state.template, { asTemplate: true });
    } else if (state?.presetExercise) {
      form.addExercisePreset(state.presetExercise);
    }
    // マウント時に一度だけ実行 (form は毎レンダー再生成のため依存に含めない)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // zod 検証を通過した値だけが submit ハンドラに渡る
  const handleSubmit = form.form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const created = await createTrainingLog(toCreateTrainingLogInput(values));
      navigate(`/training/logs/${created.id}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "登録に失敗しました",
      );
    }
  });

  return (
    <>
      <PageHero
        badge="New Training Log"
        title="トレーニング記録を作成"
        description="日付・体重・メモを入力し、種目ごとのセット内容を追加します (過去日付も指定可)。"
        actions={
          <>
            <HeroLinkButton to="/training/logs" variant="outline">
              一覧へ戻る
            </HeroLinkButton>
            <Button
              className="w-full sm:w-auto"
              disabled={!form.form.formState.isValid || isSubmitting}
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
