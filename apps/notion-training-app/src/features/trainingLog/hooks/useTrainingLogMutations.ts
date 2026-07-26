import { useState } from "react";
import { useSWRConfig } from "swr";
import type {
  CreateTrainingLogResponse,
  CreateTrainingLogResult,
} from "@repo/types/notion-training-app";
import type { CreateTrainingLogInput } from "@repo/schemas/notion-training-app";
import { API_BASE, mutateJson } from "../../../lib/fetch";

const TRAINING_LOGS_KEY_PREFIX = `${API_BASE}/training-logs`;

/**
 * トレーニング記録のミューテーション。
 * 作成後は training-logs 系の SWR キャッシュ (一覧/最新) をまとめて再検証する。
 */
export function useTrainingLogMutations() {
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const revalidateTrainingLogs = () =>
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith(TRAINING_LOGS_KEY_PREFIX),
    );

  const createTrainingLog = async (
    input: CreateTrainingLogInput,
  ): Promise<CreateTrainingLogResult> => {
    setIsSubmitting(true);
    try {
      const response = await mutateJson<CreateTrainingLogResponse>(
        TRAINING_LOGS_KEY_PREFIX,
        "POST",
        input,
      );
      await revalidateTrainingLogs();
      return response.data;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createTrainingLog, isSubmitting };
}
