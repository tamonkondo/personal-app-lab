import { Card, CardContent, CardHeader } from "@repo/ui";

const summarySkeletons = ["currentMax", "goal", "totalSets", "volume"];
const logSkeletons = ["latest", "previous", "older"];
const trendSkeletons = ["growth", "sets", "next"];
const actionSkeletons = ["create", "update", "delete"];

type SkeletonBlockProps = {
  className: string;
};

const SkeletonBlock = ({ className }: SkeletonBlockProps) => {
  return <div className={`rounded-full bg-zinc-200 ${className}`} />;
};

const CardSkeleton = ({ id }: { id: string }) => {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBlock className="h-6 w-40" />
            <SkeletonBlock className="h-6 w-20 bg-zinc-100" />
            {id === "latest" ? (
              <SkeletonBlock className="h-6 w-16 bg-zinc-100" />
            ) : null}
          </div>
          <SkeletonBlock className="h-4 w-full max-w-md" />
        </div>
        <SkeletonBlock className="h-9 w-full sm:w-32" />
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border">
        <div className="grid grid-cols-4 gap-4 bg-zinc-50 px-4 py-3">
          <SkeletonBlock className="h-3 w-10 bg-zinc-200" />
          <SkeletonBlock className="h-3 w-12 bg-zinc-200" />
          <SkeletonBlock className="h-3 w-12 bg-zinc-200" />
          <SkeletonBlock className="h-3 w-14 bg-zinc-200" />
        </div>
        {[0, 1, 2].map((row) => (
          <div key={row} className="grid grid-cols-4 gap-4 border-t px-4 py-3">
            <SkeletonBlock className="h-4 w-8" />
            <SkeletonBlock className="h-4 w-12" />
            <SkeletonBlock className="h-4 w-10" />
            <SkeletonBlock className="h-4 w-14" />
          </div>
        ))}
      </div>
    </article>
  );
};

const DetailSkeleton = () => {
  return (
    <div className="flex w-full animate-pulse flex-col gap-6">
        <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <SkeletonBlock className="h-4 w-36 bg-white/20" />
              <SkeletonBlock className="h-10 w-52 bg-white/25 sm:w-72" />
            </div>
            <SkeletonBlock className="h-10 w-full bg-white/15 sm:w-28" />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summarySkeletons.map((item) => (
            <Card key={item}>
              <CardContent className="p-5">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="mt-3 h-7 w-20" />
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <SkeletonBlock className="h-7 w-32" />
                <SkeletonBlock className="h-4 w-full max-w-sm" />
              </div>
              <SkeletonBlock className="h-9 w-full sm:w-28" />
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {logSkeletons.map((item) => (
                  <CardSkeleton key={item} id={item} />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <SkeletonBlock className="h-6 w-24" />
                <SkeletonBlock className="mt-2 h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
                  <div className="h-full w-2/3 rounded-full bg-zinc-200" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <SkeletonBlock className="h-4 w-16" />
                  <SkeletonBlock className="h-4 w-10" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <SkeletonBlock className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <SkeletonBlock className="h-10 w-full rounded-md" />
                {trendSkeletons.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border bg-zinc-50 p-4"
                  >
                    <SkeletonBlock className="h-4 w-24" />
                    <SkeletonBlock className="h-4 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <SkeletonBlock className="h-6 w-12" />
              </CardHeader>
              <CardContent className="space-y-3">
                {actionSkeletons.map((item) => (
                  <SkeletonBlock
                    key={item}
                    className="h-10 w-full rounded-md"
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
    </div>
  );
};

export default DetailSkeleton;
