import type {
  RecipeEditorScene,
  RecipeEditorZone,
  RecipeReport,
  RecipeWorkspaceReport,
  TaskStatus,
} from "./types.ts";

/** What the selected run did inside a zone. */
export interface ZoneRun {
  /** The most pressing status of its tasks, or `done` once all of them finished. */
  readonly status?: TaskStatus;
  readonly finished: number;
  readonly total: number;
  /** Branch, kept directory or publications that the run reported for a workspace. */
  readonly details: readonly string[];
}

const pressing: readonly TaskStatus[] = [
  "failed",
  "rejected",
  "active",
  "waiting-input",
  "paused",
  "waiting",
  "cancelled",
];

const reported: {
  readonly [Kind in RecipeWorkspaceReport["kind"]]: (
    report: Extract<RecipeWorkspaceReport, { kind: Kind }>,
  ) => string[];
} = {
  git: ({ branch, retainedDirectory }) => [
    `branch ${branch}`,
    ...(retainedDirectory ? [`kept in ${retainedDirectory}`] : []),
  ],
  files: ({ fileOutputs }) => [
    fileOutputs.length === 1
      ? "1 publication"
      : `${fileOutputs.length} publications`,
  ],
};

function workspaceReport(
  zone: RecipeEditorZone,
  report: RecipeReport | undefined,
): RecipeWorkspaceReport | undefined {
  if (!report) return undefined;
  if (zone.name) return report.workspaces?.[zone.name];
  if (report.workspace) return { kind: "git", ...report.workspace };
  return report.fileOutputs
    ? { kind: "files", fileOutputs: report.fileOutputs }
    : undefined;
}

/** Task statuses of the selected run gathered by sandbox and workspace zone. */
export function zoneRuns(
  scene: RecipeEditorScene,
  statuses: Readonly<Record<string, TaskStatus>>,
  report?: RecipeReport,
): Record<string, ZoneRun> {
  const parents = new Map(scene.zones.map((zone) => [zone.id, zone.parent]));
  return Object.fromEntries(
    scene.zones.map((zone) => {
      const tasks = scene.tasks.filter(
        (task) =>
          task.zone === zone.id ||
          (!!task.zone && parents.get(task.zone) === zone.id),
      );
      const seen = tasks.flatMap((task) => {
        const status = task.key ? statuses[task.key] : undefined;
        return status ? [status] : [];
      });
      const finished = seen.filter(
        (status) => status === "done" || status === "skipped",
      ).length;
      const status =
        pressing.find((item) => seen.includes(item)) ??
        (tasks.length && finished === tasks.length ? "done" : undefined);
      const workspace =
        zone.kind === "workspace" ? workspaceReport(zone, report) : undefined;
      const describe = workspace
        ? (reported[workspace.kind] as (
            value: RecipeWorkspaceReport,
          ) => string[])
        : undefined;
      return [
        zone.id,
        {
          ...(status ? { status } : {}),
          finished,
          total: tasks.length,
          details: workspace && describe ? describe(workspace) : [],
        },
      ];
    }),
  );
}
