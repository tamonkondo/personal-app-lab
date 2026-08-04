import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from "@repo/ui";
import { formatDate } from "@repo/utils";
import { useWatch } from "react-hook-form";
import { useExerciseNames } from "../../exercise/hooks/useExerciseNames";
import { todayDateString } from "../trainingLogForm.schema";
import {
  getCompletedSetCount,
  getMaxWeight,
  type TrainingLogFormState,
} from "../hooks/useTrainingLogForm";

interface Props {
  form: TrainingLogFormState;
  /** 編集時に表示する記録日 (ISO)。編集では日付変更不可のため表示のみ。未指定 (新規) なら日付入力を表示 */
  logDate?: string;
}

/**
 * トレーニング記録 作成/編集フォーム (react-hook-form + zod)。
 * 状態は useTrainingLogForm が持ち、送信ボタンはページ側 (PageHero) に置く。
 */
const TrainingLogForm = ({ form: state, logDate }: Props) => {
  const { exerciseNames, isLoading: isNamesLoading } = useExerciseNames();
  const {
    form,
    exercisesArray,
    draftForm,
    draftSets,
    dialogOpen,
    setDialogOpen,
    editingIndex,
    openNewExerciseDialog,
    openEditExerciseDialog,
    saveExerciseDraft,
    removeExercise,
    addDraftSet,
    removeDraftSet,
  } = state;

  // 表示は常に最新値を watch から読む (fields は編集反映まで snapshot のため)
  const watchedExercises =
    useWatch({ control: form.control, name: "exercises" }) ?? [];
  const totalSets = watchedExercises.reduce(
    (total, exercise) => total + getCompletedSetCount(exercise.sets),
    0,
  );
  const maxWeightExerciseCount = watchedExercises.filter(
    (exercise) => getMaxWeight(exercise.sets) !== null,
  ).length;

  const draftExerciseId = draftForm.watch("exerciseId");
  const exercisesError = form.formState.errors.exercises;
  const draftSetsError = draftForm.formState.errors.sets;

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-zinc-500">種目数</p>
            <p className="mt-2 text-xl font-bold md:text-2xl">
              {watchedExercises.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-zinc-500">合計セット数</p>
            <p className="mt-2 text-xl font-bold md:text-2xl">{totalSets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-zinc-500">最大重量あり</p>
            <p className="mt-2 text-xl font-bold md:text-2xl">
              {maxWeightExerciseCount}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>種目リスト</CardTitle>
              <p className="mt-1 text-sm text-zinc-500">
                種目を追加して、モーダルでセットごとの重量と回数を入力します。
              </p>
            </div>
            <Button className="w-full sm:w-auto" onClick={openNewExerciseDialog}>
              種目を追加
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {exercisesError?.message && (
              <p className="text-sm text-red-600">{exercisesError.message}</p>
            )}
            {exercisesArray.fields.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-zinc-50 p-8 text-center">
                <p className="font-semibold">種目がまだありません</p>
                <p className="mt-2 text-sm text-zinc-500">
                  最初の種目を追加してセット内容を入力してください。
                </p>
              </div>
            ) : (
              exercisesArray.fields.map((field, index) => {
                const exercise = watchedExercises[index] ?? field;
                const maxWeight = getMaxWeight(exercise.sets);
                const completedSetCount = getCompletedSetCount(exercise.sets);
                const setsRootError =
                  form.formState.errors.exercises?.[index]?.sets?.root;

                return (
                  <article
                    key={field.id}
                    className="rounded-2xl border bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold">
                            {exercise.exerciseName}
                          </h2>
                          <Badge variant="secondary">
                            {completedSetCount} set
                          </Badge>
                        </div>
                        <p className="text-sm text-zinc-500">
                          最大重量{" "}
                          {maxWeight !== null ? `${maxWeight}kg` : "未入力"} /
                          休憩 {exercise.rest || "未入力"}秒
                        </p>
                        <p className="max-w-3xl text-sm leading-6 text-zinc-600">
                          {exercise.memo || "メモはありません。"}
                        </p>
                        {setsRootError?.message && (
                          <p className="text-sm text-red-600">
                            {setsRootError.message}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditExerciseDialog(index)}
                        >
                          編集
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => removeExercise(index)}
                        >
                          削除
                        </Button>
                      </div>
                    </div>

                    <div className="mt-5 overflow-x-auto rounded-2xl border">
                      <Table>
                        <TableHeader className="bg-zinc-50 text-xs font-semibold text-zinc-500 uppercase">
                          <TableRow>
                            <TableHead>Set</TableHead>
                            <TableHead>重量</TableHead>
                            <TableHead>回数</TableHead>
                            <TableHead>メモ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {exercise.sets.map((set, setIndex) => (
                            <TableRow key={`${field.id}-${setIndex}`}>
                              <TableCell className="font-semibold">
                                {setIndex + 1}
                              </TableCell>
                              <TableCell>{set.kg || "-"}kg</TableCell>
                              <TableCell>{set.rep || "-"}回</TableCell>
                              <TableCell>{set.memo || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </article>
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">日付</label>
                {logDate ? (
                  <p className="rounded-md border bg-zinc-50 px-3 py-2 text-sm">
                    {formatDate(logDate, "slash")}
                  </p>
                ) : (
                  <>
                    <Input
                      type="date"
                      max={todayDateString()}
                      {...form.register("date")}
                    />
                    {form.formState.errors.date?.message && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.date.message}
                      </p>
                    )}
                  </>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">体重</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="72.4"
                  {...form.register("bodyWeight")}
                />
                {form.formState.errors.bodyWeight?.message && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.bodyWeight.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">メモ</label>
                <Textarea
                  placeholder="今日のコンディション、フォームの気づきなど"
                  {...form.register("memo")}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "種目を編集" : "種目を追加"}
            </DialogTitle>
            <DialogDescription>
              種目の休憩時間とセットごとの重量、回数、メモを入力します。
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">種目</label>
              <Select
                value={draftExerciseId}
                onValueChange={(value) => {
                  const selected = exerciseNames.find(
                    (item) => item.id === value,
                  );
                  draftForm.setValue("exerciseId", value, {
                    shouldValidate: true,
                  });
                  draftForm.setValue("exerciseName", selected?.name ?? "");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isNamesLoading ? "読み込み中..." : "種目を選択"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {exerciseNames.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {draftForm.formState.errors.exerciseId?.message && (
                <p className="mt-1 text-sm text-red-600">
                  {draftForm.formState.errors.exerciseId.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                休憩時間（秒）
              </label>
              <Input
                type="number"
                inputMode="numeric"
                {...draftForm.register("rest")}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium">種目メモ</label>
              <Textarea
                placeholder="フォーム、補助、次回の注意点など"
                {...draftForm.register("memo")}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">セット</h3>
              <Button variant="outline" size="sm" onClick={addDraftSet}>
                セット追加
              </Button>
            </div>

            {draftSetsError?.root?.message && (
              <p className="text-sm text-red-600">
                {draftSetsError.root.message}
              </p>
            )}

            <div className="space-y-3">
              {draftSets.fields.map((setField, index) => (
                <div
                  key={setField.id}
                  className="grid gap-3 rounded-2xl border bg-zinc-50 p-3 sm:grid-cols-[64px_1fr_1fr_1.6fr_auto]"
                >
                  <div className="flex items-center text-sm font-semibold">
                    Set {index + 1}
                  </div>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="kg"
                    {...draftForm.register(`sets.${index}.kg`)}
                  />
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="rep"
                    {...draftForm.register(`sets.${index}.rep`)}
                  />
                  <Input
                    placeholder="メモ"
                    {...draftForm.register(`sets.${index}.memo`)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    disabled={draftSets.fields.length === 1}
                    onClick={() => removeDraftSet(index)}
                  >
                    削除
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={saveExerciseDraft} disabled={!draftExerciseId}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrainingLogForm;
