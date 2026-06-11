import React from "react";

interface Props {
  statusMessage: string;
}

const DailyLogsHeaderSkeleton = ({ statusMessage }:Props) => {
  return (
    <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm lg:p-8">
      {statusMessage}
    </section>
  );
};

export default DailyLogsHeaderSkeleton;
