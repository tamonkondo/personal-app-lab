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
import { useMemo, useState } from "react";
import PageHero, { HeroLinkButton } from "../components/PageHero";

type ExerciseSetDraft = {
  id: string;
  kg: string;
  rep: string;
  memo: string;
};

type TrainingExerciseDraft = {
  id: string;
  exerciseName: string;
  rest: string;
  memo: string;
  sets: ExerciseSetDraft[];
};

const exerciseOptions = [
  "ベンチプレス",
  "スクワット",
  "デッドリフト",
  "ショルダープレス",
  "ラットプルダウン",
  "サイドレイズ",
];

const createSetDraft = (): ExerciseSetDraft => ({
  id: crypto.randomUUID(),
  kg: "",
  rep: "",
  memo: "",
});

const createExerciseDraft = (): TrainingExerciseDraft => ({
  id: crypto.randomUUID(),
  exerciseName: "",
  rest: "90",
  memo: "",
  sets: [createSetDraft()],
});

const getToday = () => new Date().toISOString().slice(0, 10);

const getMaxWeight = (sets: ExerciseSetDraft[]) => {
  const weights = sets
    .map((set) => Number(set.kg))
    .filter((weight) => Number.isFinite(weight) && weight > 0);

  return weights.length > 0 ? Math.max(...weights) : null;
};

const getCompletedSetCount = (sets: ExerciseSetDraft[]) =>
  sets.filter((set) => Number(set.kg) > 0 || Number(set.rep) > 0).length;


const TrainingLogNew = () => {
  const [trainingDate, setTrainingDate] = useState(getToday());
  const [bodyWeight, setBodyWeight] = useState("");
  const [memo, setMemo] = useState("");
  const [exercises, setExercises] = useState<TrainingExerciseDraft[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [exerciseDraft, setExerciseDraft] = useState(createExerciseDraft);

  const totalSets = useMemo(
    () =>
      exercises.reduce(
        (total, exercise) => total + getCompletedSetCount(exercise.sets),
        0,
      ),
    [exercises],
  );

  const maxWeightExerciseCount = useMemo(
    () =>
      exercises.filter((exercise) => getMaxWeight(exercise.sets) !== null)
        .length,
    [exercises],
  );

  const openNewExerciseDialog = () => {
    setEditingId(null);
    setExerciseDraft(createExerciseDraft());
    setDialogOpen(true);
  };

  const openEditExerciseDialog = (exercise: TrainingExerciseDraft) => {
    setEditingId(exercise.id);
    setExerciseDraft({
      ...exercise,
      sets: exercise.sets.map((set) => ({ ...set })),
    });
    setDialogOpen(true);
  };

  const saveExerciseDraft = () => {
    if (!exerciseDraft.exerciseName.trim()) return;

    if (editingId) {
      setExercises((current) =>
        current.map((exercise) =>
          exercise.id === editingId ? exerciseDraft : exercise,
        ),
      );
    } else {
      setExercises((current) => [...current, exerciseDraft]);
    }

    setDialogOpen(false);
  };

  const updateSet = (
    setId: string,
    field: keyof Omit<ExerciseSetDraft, "id">,
    value: string,
  ) => {
    setExerciseDraft((current) => ({
      ...current,
      sets: current.sets.map((set) =>
        set.id === setId ? { ...set, [field]: value } : set,
      ),
    }));
  };

  return (
    <>
      <PageHero
        badge="New Training Log"
        title="トレーニング記録を作成"
        description="日付、体重、部位を入力し、種目ごとのセット内容を追加します。"
        actions={
          <>
            <HeroLinkButton to="/training-logs" variant="outline">
              一覧へ戻る
            </HeroLinkButton>
            <Button className="w-full sm:w-auto" disabled>
              登録する
            </Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-zinc-500">種目数</p>
              <p className="mt-2 text-xl font-bold md:text-2xl">
                {exercises.length}
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
              {exercises.length === 0 ? (
                <div className="rounded-2xl border border-dashed bg-zinc-50 p-8 text-center">
                  <p className="font-semibold">種目がまだありません</p>
                  <p className="mt-2 text-sm text-zinc-500">
                    最初の種目を追加してセット内容を入力してください。
                  </p>
                </div>
              ) : (
                exercises.map((exercise) => {
                  const maxWeight = getMaxWeight(exercise.sets);
                  const completedSetCount = getCompletedSetCount(exercise.sets);

                  return (
                    <article
                      key={exercise.id}
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
                            {maxWeight !== null ? `${maxWeight}kg` : "未入力"}{" "}
                            / 休憩 {exercise.rest || "未入力"}秒
                          </p>
                          <p className="max-w-3xl text-sm leading-6 text-zinc-600">
                            {exercise.memo || "メモはありません。"}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditExerciseDialog(exercise)}
                          >
                            編集
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() =>
                              setExercises((current) =>
                                current.filter((item) => item.id !== exercise.id),
                              )
                            }
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
                            {exercise.sets.map((set, index) => (
                              <TableRow key={set.id}>
                                <TableCell className="font-semibold">
                                  {index + 1}
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
                  <Input
                    type="date"
                    value={trainingDate}
                    onChange={(event) => setTrainingDate(event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    体重
                  </label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="72.4"
                    value={bodyWeight}
                    onChange={(event) => setBodyWeight(event.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">メモ</label>
                  <Textarea
                    placeholder="今日のコンディション、フォームの気づきなど"
                    value={memo}
                    onChange={(event) => setMemo(event.target.value)}
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
              {editingId ? "種目を編集" : "種目を追加"}
            </DialogTitle>
            <DialogDescription>
              種目の休憩時間とセットごとの重量、回数、メモを入力します。
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">種目</label>
              <Select
                value={exerciseDraft.exerciseName}
                onValueChange={(value) =>
                  setExerciseDraft((current) => ({
                    ...current,
                    exerciseName: value,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="種目を選択" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseOptions.map((exerciseName) => (
                    <SelectItem key={exerciseName} value={exerciseName}>
                      {exerciseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                休憩時間（秒）
              </label>
              <Input
                type="number"
                inputMode="numeric"
                value={exerciseDraft.rest}
                onChange={(event) =>
                  setExerciseDraft((current) => ({
                    ...current,
                    rest: event.target.value,
                  }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium">種目メモ</label>
              <Textarea
                placeholder="フォーム、補助、次回の注意点など"
                value={exerciseDraft.memo}
                onChange={(event) =>
                  setExerciseDraft((current) => ({
                    ...current,
                    memo: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">セット</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setExerciseDraft((current) => ({
                    ...current,
                    sets: [...current.sets, createSetDraft()],
                  }))
                }
              >
                セット追加
              </Button>
            </div>

            <div className="space-y-3">
              {exerciseDraft.sets.map((set, index) => (
                <div
                  key={set.id}
                  className="grid gap-3 rounded-2xl border bg-zinc-50 p-3 sm:grid-cols-[64px_1fr_1fr_1.6fr_auto]"
                >
                  <div className="flex items-center text-sm font-semibold">
                    Set {index + 1}
                  </div>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="kg"
                    value={set.kg}
                    onChange={(event) =>
                      updateSet(set.id, "kg", event.target.value)
                    }
                  />
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="rep"
                    value={set.rep}
                    onChange={(event) =>
                      updateSet(set.id, "rep", event.target.value)
                    }
                  />
                  <Input
                    placeholder="メモ"
                    value={set.memo}
                    onChange={(event) =>
                      updateSet(set.id, "memo", event.target.value)
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    disabled={exerciseDraft.sets.length === 1}
                    onClick={() =>
                      setExerciseDraft((current) => ({
                        ...current,
                        sets: current.sets.filter((item) => item.id !== set.id),
                      }))
                    }
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
            <Button
              onClick={saveExerciseDraft}
              disabled={!exerciseDraft.exerciseName.trim()}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrainingLogNew;
