import fetcher from "../../../lib/fetch";
import { TrainingLogSummaryResponse } from "@repo/types/notion-training-app";
import useSWR from "swr";
import { TrainingLogCard } from "./TrainingLogCard";
import { Spinner } from "@repo/ui/components/ui/spinner";

const TrainingLogCardList = () => {
  const {
    data: trainingLogs,
    error: fetchTrainingLogsError,
    isLoading: fetchTrainingLogsLoading,
  } = useSWR<TrainingLogSummaryResponse>(
    `${import.meta.env.VITE_API_URL}/training-logs/`,
    fetcher,
  );
  if (fetchTrainingLogsLoading) return <Spinner />;
  if (fetchTrainingLogsError) return <div>Error loading data</div>;
  if (!trainingLogs || !trainingLogs.data) return <div>No data available</div>;
  return (
    <>
      {trainingLogs.data.map((log) => (
        <TrainingLogCard key={log.id} data={log} />
      ))}
    </>
  );
};

export default TrainingLogCardList;
