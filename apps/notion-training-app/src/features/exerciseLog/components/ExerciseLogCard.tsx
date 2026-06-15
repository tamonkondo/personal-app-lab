import type { ExerciseSummaryItemResponse } from "@repo/types/notion-training-app";
import {
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui";
import { Link } from "react-router-dom";
import ExerciseLogTable from "./ExerciseLogTable";

interface Props {
  data: ExerciseSummaryItemResponse;
}
export function ExerciseLogCard({ data }: Props) {
  return (
    <article
      key={data.id}
      className="rounded-2xl border bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold">{data.trainingName}</h2>
            <Badge variant="secondary">{data.musclesTypes.join(", ")}</Badge>
            {data.isPr ? (
              <>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  PR更新
                </Badge>
                <Button size="sm">Create New Goal</Button>
              </>
            ) : null}
          </div>
          <div className="flex gap-2">
            <p className="text-sm text-zinc-500">
              Goal Weight:{data.maxGoalWeight.toFixed(0)}kg
            </p>
            <p className="text-sm text-zinc-500">
              Current Max Weight:{data.currentMaxWeight.toFixed(0)}kg
            </p>
            {!data.isPr && data.currentMaxWeight < data.maxGoalWeight ? (
              <p className="text-sm text-green-500">
                Only {(data.maxGoalWeight - data.currentMaxWeight).toFixed(0)}{" "}
                kg to go!!
              </p>
            ) : null}
          </div>
        </div>
        <Link to={`/exercise/${data.id}`}>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            種目詳細
          </Button>
        </Link>
      </div>
      <Tabs defaultValue="maxWeightLogs" className="mt-3">
        <TabsList className="bg-color-none h-auto gap-2 [&>button]:h-auto [&>button]:cursor-pointer">
          <TabsTrigger value="maxWeightLogs">
            MaxWeight Exercise Logs
          </TabsTrigger>
          <TabsTrigger value="latestExerciseLogs">
            Latest Exercise Logs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="maxWeightLogs">
          {data.maxWeightSets.sets.length > 0 ? (
            <ExerciseLogTable data={data.maxWeightSets} />
          ) : (
            <p>No max weight logs available.</p>
          )}
        </TabsContent>
        <TabsContent value="latestExerciseLogs">
          {data.latestSets.sets.length > 0 ? (
            <ExerciseLogTable data={data.latestSets} />
          ) : (
            <p>No latest exercise logs available.</p>
          )}
        </TabsContent>
      </Tabs>
    </article>
  );
}
