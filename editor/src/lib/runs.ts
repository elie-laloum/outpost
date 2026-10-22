import { create } from "zustand";
import { applyRecipeTaskStatus } from "../../../src/domain/recipes/run-status.ts";
import { api } from "./api.ts";
import type {
  Observation,
  RecipeEditorRun,
  RecipeEditorRunDetail,
  RecipeEditorRunEvent,
  RecipeEditorRunRequest,
  TaskStatus,
} from "./types.ts";

const eventLimit = 2_000;

interface RunsStore {
  readonly runs: readonly RecipeEditorRun[];
  /** Run shown in the Runs view and on the canvas. */
  readonly selected?: string;
  readonly detail?: RecipeEditorRunDetail;
  readonly events: readonly Observation[];
  readonly tasks: Readonly<Record<string, TaskStatus>>;
  readonly failure?: string;
  load(): Promise<void>;
  choose(id: string | undefined): Promise<void>;
  start(request: RecipeEditorRunRequest): Promise<RecipeEditorRun | undefined>;
  cancel(id: string): Promise<void>;
  receive(event: RecipeEditorRunEvent): void;
  dismiss(): void;
}

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const useRuns = create<RunsStore>()((set, get) => {
  async function refresh(id: string) {
    const detail = await api<RecipeEditorRunDetail>(
      `/api/runs/detail?id=${encodeURIComponent(id)}`,
    );
    if (get().selected !== id) return;
    const tasks: Record<string, TaskStatus> = { ...detail.run.tasks };
    if (detail.run.state === "running")
      for (const observation of detail.events)
        applyRecipeTaskStatus(tasks, observation);
    set({ detail, events: detail.events, tasks });
  }

  return {
    runs: [],
    events: [],
    tasks: {},
    async load() {
      try {
        const { runs } = await api<{ runs: RecipeEditorRun[] }>("/api/runs");
        set({ runs });
      } catch (error) {
        set({ failure: message(error) });
      }
    },
    async choose(id) {
      set({ selected: id, detail: undefined, events: [], tasks: {} });
      if (!id) return;
      await refresh(id).catch((error: unknown) =>
        set({ failure: message(error) }),
      );
    },
    async start(request) {
      try {
        const run = await api<RecipeEditorRun>("/api/runs", request);
        set((store) => ({
          failure: undefined,
          runs: [run, ...store.runs.filter((item) => item.id !== run.id)],
        }));
        await get().choose(run.id);
        return run;
      } catch (error) {
        set({ failure: message(error) });
        return undefined;
      }
    },
    async cancel(id) {
      await api("/api/runs/cancel", { id }).catch((error: unknown) =>
        set({ failure: message(error) }),
      );
    },
    receive(event) {
      if (event.type === "observation") {
        if (event.id !== get().selected) return;
        set((store) => {
          const tasks = { ...store.tasks };
          applyRecipeTaskStatus(tasks, event.observation);
          return {
            tasks,
            events: [...store.events, event.observation].slice(-eventLimit),
          };
        });
        return;
      }
      const { run } = event;
      set((store) => ({
        runs: [run, ...store.runs.filter((item) => item.id !== run.id)].sort(
          (left, right) => right.startedAt.localeCompare(left.startedAt),
        ),
      }));
      if (run.id === get().selected && run.state !== "running")
        void refresh(run.id).catch(() => undefined);
    },
    dismiss: () => set({ failure: undefined }),
  };
});
