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
} from "@repo/ui";
import {
  EXERCISE_RM_TYPES,
  type ExerciseRmTypes,
} from "@repo/types/notion-training-app";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import BODY_PARTS from "../constants/parts";
import PageHero, { HeroLinkButton } from "../components/PageHero";
import { useExerciseMutations } from "../features/exercise/hooks/useExerciseMutations";
import {
  emptyExerciseFormValues,
  exerciseFormSchema,
  toExerciseInput,
  type ExerciseFormValues,
} from "../features/exercise/exerciseForm.schema";

const RM_TYPE_LABELS: Record<ExerciseRmTypes, string> = {
  upperBody: "上半身",
  lowerBody: "下半身",
};

const ExerciseNew = () => {
  const navigate = useNavigate();
  const { createExercise, isSubmitting } = useExerciseMutations();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: emptyExerciseFormValues(),
    mode: "onChange",
  });
  const { register, control, watch, reset, formState } = form;
  const [selectedParts, defaultRest, rmType] = watch([
    "musclesTypes",
    "rest",
    "rmType",
  ]);

  const summaryItems = [
    { label: "対象部位", value: `${selectedParts.length}` },
    { label: "休憩時間", value: defaultRest ? `${defaultRest}秒` : "未入力" },
    {
      label: "RMタイプ",
      value: rmType === "" ? "未設定" : RM_TYPE_LABELS[rmType],
    },
  ];

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const created = await createExercise(toExerciseInput(values));
      navigate(`/exercises/${created.id}`);
    } catch (submitFailure) {
      setSubmitError(
        submitFailure instanceof Error
          ? submitFailure.message
          : "登録に失敗しました",
      );
    }
  });

  return (
    <>
      <PageHero
        badge="New Exercise"
        title="エクササイズ種目を作成"
        description="種目名、対象部位、休憩時間、RMタイプを入力します。"
        actions={
          <>
            <HeroLinkButton to="/exercises" variant="outline">
              一覧へ戻る
            </HeroLinkButton>
            <Button
              className="w-full sm:w-auto"
              disabled={!formState.isValid || isSubmitting}
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
              <Input placeholder="ベンチプレス" {...register("name")} />
              {formState.errors.name?.message && (
                <p className="mt-1 text-sm text-red-600">
                  {formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  対象部位
                </label>
                <Controller
                  control={control}
                  name="musclesTypes"
                  render={({ field }) => (
                    <MultipleSelector
                      value={field.value}
                      defaultOptions={BODY_PARTS}
                      placeholder="胸、肩、上腕三頭筋..."
                      onChange={field.onChange}
                      emptyIndicator={
                        <p className="text-center text-sm text-zinc-500">
                          該当する部位がありません
                        </p>
                      }
                    />
                  )}
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
                  {...register("rest")}
                />
                {formState.errors.rest?.message && (
                  <p className="mt-1 text-sm text-red-600">
                    {formState.errors.rest.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  RMタイプ（次回セット目安の計算に使用）
                </label>
                <Controller
                  control={control}
                  name="rmType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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
                  )}
                />
              </div>
            </div>

            <p className="rounded-2xl border bg-zinc-50 p-4 text-sm text-zinc-500">
              目標重量は Notion の GOAL_WEIGHTS
              データベースで管理しているため、この画面では設定しません。
            </p>
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
                onClick={() => reset(emptyExerciseFormValues())}
              >
                下書きクリア
              </Button>
              <Button
                className="w-full"
                disabled={!formState.isValid || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? "登録中..." : "登録する"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
};

export default ExerciseNew;
