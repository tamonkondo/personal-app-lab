import type { TrainingLogDetail } from "@repo/types/notion-training-app";
import AlertCard from "../../../components/AlertCard";
import { TrainingLogExerciseCard } from "./TrainingLogExerciseCard";

type Props = {
  exercises: TrainingLogDetail["exercises"];
};

export function TrainingLogExerciseList({ exercises }: Props) {
  if (!exercises.length) {
    return (
      <AlertCard
        title="データが一件も存在しません"
        message="このトレーニングログに種目別セット記録が存在しません。"
      />
    );
  }

  return (
    <div className="space-y-5">
      {exercises.map((exercise) => (
        <TrainingLogExerciseCard key={exercise.id} data={exercise} />
      ))}
    </div>
  );
}
