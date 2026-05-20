import { asyncHandler } from "@/libs/asyncHandler";
import * as fetches from "./goalWeight.notion";

export const getGoalWeights = asyncHandler(async (_, res) => {
  const goalWeights = await fetches.fetchGoalWeights();
  res.status(200).json({ message: "getGoalWeights", data: goalWeights });
});
export const getGoalWeightsDetail = asyncHandler(
  async (req: { params: { id: string } }, res) => {
    const { id } = req.params;
    const goalWeightDetail = await fetches.fetchGoalWeightsDetail(id);
    res.status(200).json({ message: "getGoalWeightsDetail", data: goalWeightDetail });
  },
);
