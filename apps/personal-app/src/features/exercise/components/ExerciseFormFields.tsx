import {
  Input,
  MultipleSelector,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { EXERCISE_RM_TYPES } from "@repo/types/notion-training-app";
import { Controller, type UseFormReturn } from "react-hook-form";
import BODY_PARTS from "../../../constants/parts";
import { RM_TYPE_LABELS } from "../constants/constants";
import type { ExerciseFormValues } from "../exerciseForm.schema";

interface Props {
  form: UseFormReturn<ExerciseFormValues>;
}

/**
 * 種目マスタフォームの共通入力フィールド (種目名 / 対象部位 / 休憩時間 / RMタイプ)。
 * ExerciseNew / ExerciseEdit で共有する。
 */
const ExerciseFormFields = ({ form }: Props) => {
  const { register, control, formState } = form;

  return (
    <>
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
          <label className="mb-2 block text-sm font-medium">対象部位</label>
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
    </>
  );
};

export default ExerciseFormFields;
