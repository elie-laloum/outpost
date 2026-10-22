import { create } from "zustand";
import { ApiError, api, streamEvents } from "./api.ts";
import { useRuns } from "./runs.ts";
import type { JsonSchema } from "./schema.ts";
import type {
  CanvasLayers,
  EditorFailure,
  RecipeEditorLayoutNode,
  RecipeEditorRunEvent,
  RecipeEditorOperation,
  RecipeEditorRole,
  RecipeEditorSceneOperation,
  RecipeEditorSessionInfo,
  RecipeEditorState,
} from "./types.ts";

type Connection = "connecting" | "live" | "offline";
type SchemaName = "recipe" | "configuration";

interface EditorStore {
  readonly info?: RecipeEditorSessionInfo;
  readonly state?: RecipeEditorState;
  readonly connection: Connection;
  readonly failure?: EditorFailure;
  /** Files changed on disk that a save would overwrite. */
  readonly conflict?: readonly string[];
  readonly pending: number;
  /** Scene id of the selected node, such as `task:build` or `zone:sandbox`. */
  readonly selected?: string;
  readonly layers: CanvasLayers;
  readonly schemas: Partial<Record<SchemaName, JsonSchema>>;
  start(): () => void;
  /** Fetches a document schema once, for the inspector forms. */
  loadSchema(name: SchemaName): void;
  /** Accepts a state returned by a request outside the edit queue. */
  receive(state: RecipeEditorState): void;
  select(id: string | undefined): void;
  toggleLayer(layer: keyof CanvasLayers): void;
  /** Shows a refusal decided in the browser, such as an invalid drop. */
  notify(message: string): void;
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
  editScene(
    operations: readonly RecipeEditorSceneOperation[],
    positions?: Readonly<Record<string, RecipeEditorLayoutNode>>,
  ): Promise<boolean>;
  /** Saves layout entries keyed by scene id; `replace` drops the entries not given. */
  moveNodes(
    entries: Readonly<Record<string, RecipeEditorLayoutNode>>,
    replace?: boolean,
  ): Promise<boolean>;
  undo(): Promise<boolean>;
  redo(): Promise<boolean>;
  save(overwrite?: boolean): Promise<boolean>;
  reload(): Promise<boolean>;
}

let queue: Promise<unknown> = Promise.resolve();
const requested = new Set<SchemaName>();

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
    layers: { components: true, references: false },
    schemas: {},
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
            if (event === "run" || event === "observation")
              return useRuns.getState().receive(data as RecipeEditorRunEvent);
            if (event !== "state") return;
            receive(data as RecipeEditorState, fresh);
            // Run events missed while disconnected are only in the history.
            if (fresh) void useRuns.getState().load();
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
    receive: (next) => receive(next),
    loadSchema(name) {
      if (requested.has(name)) return;
      requested.add(name);
      api<JsonSchema>(`/api/schemas/${name}`).then(
        (schema) =>
          set((store) => ({ schemas: { ...store.schemas, [name]: schema } })),
        () => requested.delete(name),
      );
    },
    select: (selected) => set({ selected }),
    toggleLayer: (layer) =>
      set((store) => ({
        layers: { ...store.layers, [layer]: !store.layers[layer] },
      })),
    notify: (message) => set({ failure: { status: 0, message } }),
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
    editScene: (operations, positions = {}) =>
      mutate("/api/project/scene", (revision) => ({
        revision,
        operations,
        positions,
      })),
    moveNodes: (entries, replace = false) =>
      mutate("/api/project/layout", (revision) => ({
        revision,
        layout: {
          version: 2,
          nodes: {
            ...(replace ? {} : get().state?.layout.nodes),
            ...entries,
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
