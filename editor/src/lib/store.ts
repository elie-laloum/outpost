import { create } from "zustand";
import { ApiError, api, streamEvents } from "./api.ts";
import type {
  EditorFailure,
  Position,
  RecipeEditorOperation,
  RecipeEditorRole,
  RecipeEditorSessionInfo,
  RecipeEditorState,
} from "./types.ts";

type Connection = "connecting" | "live" | "offline";

interface EditorStore {
  readonly info?: RecipeEditorSessionInfo;
  readonly state?: RecipeEditorState;
  readonly connection: Connection;
  readonly failure?: EditorFailure;
  /** Files changed on disk that a save would overwrite. */
  readonly conflict?: readonly string[];
  readonly pending: number;
  readonly selected?: string;
  start(): () => void;
  select(id: string | undefined): void;
  dismiss(): void;
  open(request: {
    recipe: string;
    config?: string;
    starter?: string;
  }): Promise<boolean>;
  edit(
    role: RecipeEditorRole,
    operations: readonly RecipeEditorOperation[],
  ): Promise<boolean>;
  replaceText(role: RecipeEditorRole, text: string): Promise<boolean>;
  moveNodes(
    positions: Readonly<Record<string, Position>>,
    replace?: boolean,
  ): Promise<boolean>;
  undo(): Promise<boolean>;
  redo(): Promise<boolean>;
  save(overwrite?: boolean): Promise<boolean>;
  reload(): Promise<boolean>;
}

let queue: Promise<unknown> = Promise.resolve();

export const useEditor = create<EditorStore>()((set, get) => {
  /** Every server change bumps the revision, so an equal one is a duplicate of the state held. */
  function receive(next: RecipeEditorState, fresh = false) {
    const current = get().state;
    if (!fresh && current && next.revision <= current.revision) return;
    set({ state: next });
  }

  /** Serializes mutations so each one names the revision the previous one produced. */
  function mutate(
    path: string,
    body: (revision: number) => unknown,
  ): Promise<boolean> {
    set((store) => ({ pending: store.pending + 1 }));
    const run = queue.then(async () => {
      try {
        receive(
          await api<RecipeEditorState>(path, body(get().state?.revision ?? 0)),
        );
        set({ failure: undefined });
        return true;
      } catch (error) {
        if (!(error instanceof ApiError)) throw error;
        const failure = error.failure;
        const conflict =
          failure.status === 409 ? failure.details?.files : undefined;
        set(conflict ? { conflict } : { failure });
        // A stale revision means another window or a disk reload changed the draft.
        if (failure.status === 409)
          await api<RecipeEditorState>("/api/project").then(
            receive,
            () => undefined,
          );
        return false;
      } finally {
        set((store) => ({ pending: store.pending - 1 }));
      }
    });
    queue = run.catch(() => undefined);
    return run;
  }

  return {
    connection: "connecting",
    pending: 0,
    start() {
      const controller = new AbortController();
      api<RecipeEditorSessionInfo>("/api/session")
        .then((info) => set({ info }))
        .catch((error: unknown) => {
          if (error instanceof ApiError) set({ failure: error.failure });
        });
      const connect = async (attempt: number): Promise<void> => {
        if (controller.signal.aborted) return;
        set({ connection: attempt ? "offline" : "connecting" });
        let fresh = true;
        try {
          await streamEvents((event, data) => {
            set({ connection: "live" });
            if (event !== "state") return;
            receive(data as RecipeEditorState, fresh);
            fresh = false;
          }, controller.signal);
        } catch (error) {
          if (error instanceof ApiError && error.failure.status === 401) {
            set({ connection: "offline", failure: error.failure });
            return;
          }
        }
        if (controller.signal.aborted) return;
        set({ connection: "offline" });
        setTimeout(
          () => void connect(attempt + 1),
          Math.min(500 * 2 ** attempt, 10_000),
        );
      };
      void connect(0);
      return () => controller.abort();
    },
    select: (selected) => set({ selected }),
    dismiss: () => set({ failure: undefined, conflict: undefined }),
    open: (request) => mutate("/api/project/open", () => request),
    edit: (role, operations) =>
      mutate("/api/project/edit", (revision) => ({
        role,
        operations,
        revision,
      })),
    replaceText: (role, text) =>
      mutate("/api/project/text", (revision) => ({ role, text, revision })),
    moveNodes: (positions, replace = false) =>
      mutate("/api/project/layout", (revision) => ({
        revision,
        layout: {
          version: 1,
          nodes: {
            ...(replace ? {} : get().state?.layout.nodes),
            ...positions,
          },
        },
      })),
    undo: () => mutate("/api/project/undo", (revision) => ({ revision })),
    redo: () => mutate("/api/project/redo", (revision) => ({ revision })),
    save: (overwrite = false) =>
      mutate("/api/project/save", () => (overwrite ? { overwrite } : {})).then(
        (saved) => {
          if (saved) set({ conflict: undefined });
          return saved;
        },
      ),
    reload: () => mutate("/api/project/reload", () => ({})),
  };
});
