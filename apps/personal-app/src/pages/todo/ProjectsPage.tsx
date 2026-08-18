import { useNavigate } from "react-router-dom";
import { Badge, Button, Spinner } from "@repo/ui";
import { useProjects } from "../../features/project/hooks/useProjects";
import type {
  ProjectItem,
  ProjectStatus,
} from "@repo/types/notion-todo-pomodoro-app";
import { formatDateTime } from "../../lib/format";

const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  "Not started": {
    label: "未着手",
    className: "bg-secondary text-secondary-foreground",
  },
  "In progress": { label: "進行中", className: "bg-blue-100 text-blue-700" },
  Done: { label: "完了", className: "bg-green-100 text-green-700" },
};

export default function ProjectsPage() {
  const { projects, isLoading, error } = useProjects();
  const navigate = useNavigate();

  return (
    <>
      <div className="space-y-5">
        <h1 className="text-xl font-bold">プロジェクト</h1>

        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}
        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            プロジェクトの取得に失敗しました。APIサーバを確認してください。
          </p>
        )}
        {!isLoading && !error && projects.length === 0 && (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            プロジェクトがありません。
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpenTasks={() =>
                navigate(`/todo/tasks?projectId=${project.id}&scope=all`)
              }
            />
          ))}
        </div>
      </div>
    </>
  );
}

function ProjectCard({
  project,
  onOpenTasks,
}: {
  project: ProjectItem;
  onOpenTasks: () => void;
}) {
  const statusMeta = project.status
    ? PROJECT_STATUS_META[project.status]
    : null;
  const schedule = [project.scheduledStart, project.scheduledEnd]
    .filter(Boolean)
    .map((d) => formatDateTime(d))
    .join(" 〜 ");

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-semibold">{project.name || "(無題)"}</h2>
        {statusMeta && (
          <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
        )}
      </div>

      {project.goal && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.goal}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {project.category && <Badge variant="outline">{project.category}</Badge>}
        {project.kinds.map((k) => (
          <Badge key={k} variant="secondary">
            {k}
          </Badge>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
        <span>
          タスク {project.taskIds.length} 件
          {schedule && ` ・ ${schedule}`}
        </span>
        <Button size="sm" variant="ghost" onClick={onOpenTasks}>
          タスクを見る
        </Button>
      </div>
    </div>
  );
}
