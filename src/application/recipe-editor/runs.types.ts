import type { Observation } from "../../domain/observation.types.ts";
import type {
  TaskStatus,
  WorkflowResult,
} from "../../domain/workflow.types.ts";
import type { WorkflowAnswer } from "../../domain/workflow/input.types.ts";
import type { WorkflowDecision } from "../../domain/workflow/gates.types.ts";
import type { RecipeReport } from "../recipe-report.types.ts";
import type { RecipeRunStatus } from "../recipes/durable.types.ts";
import type { RecipeEditorSession } from "./session.types.ts";
import type { SupervisedProcess } from "../../infrastructure/supervised-process.types.ts";

export type RecipeEditorRunAction = "run" | "resume" | "answer" | "decide";

/** One CLI execution started from the editor, persisted under `.outpost/editor/runs`. */
export interface RecipeEditorRun {
  readonly id: string;
  readonly action: RecipeEditorRunAction;
  readonly recipe: string;
  readonly config: string;
  /** Durable recipe run identifier, requested or reported. */
  readonly runId?: string;
  readonly startedAt: string;
  readonly finishedAt?: string;
  /** `interrupted` marks a run whose editor stopped before the process reported. */
  readonly state: "running" | "exited" | "cancelled" | "interrupted";
  readonly exitCode?: number | null;
  /** Report status once the CLI printed one. */
  readonly status?: WorkflowResult["status"];
  readonly tasks: Readonly<Record<string, TaskStatus>>;
  /** Last error line when the CLI failed without a report. */
  readonly message?: string;
}

export interface RecipeEditorRunDetail {
  readonly run: RecipeEditorRun;
  readonly report?: RecipeReport;
  /** Most recent observations, oldest first. */
  readonly events: readonly Observation[];
  readonly stderr: string;
}

export type RecipeEditorRunRequest =
  | {
      readonly action: "run";
      readonly inputs?: Readonly<Record<string, string>>;
      readonly runId?: string;
    }
  | {
      readonly action: "resume";
      /** Editor run whose durable run identifier is resumed. */
      readonly from: string;
      readonly retryIncomplete?: boolean;
    }
  | {
      readonly action: "answer";
      readonly from: string;
      readonly answer: WorkflowAnswer;
    }
  | {
      readonly action: "decide";
      readonly from: string;
      readonly decision: Omit<WorkflowDecision, "proof">;
    };

export type RecipeEditorRunEvent =
  | { readonly type: "run"; readonly run: RecipeEditorRun }
  | {
      readonly type: "observation";
      readonly id: string;
      readonly observation: Observation;
    };

export interface RecipeEditorRunsOptions {
  readonly session: RecipeEditorSession;
  /** Command that starts the Outpost CLI, such as `[node, main.js]`. */
  readonly cli: readonly string[];
}

export interface RecipeEditorRuns {
  list(): Promise<readonly RecipeEditorRun[]>;
  detail(id: string): Promise<RecipeEditorRunDetail>;
  start(request: RecipeEditorRunRequest): Promise<RecipeEditorRun>;
  cancel(id: string): RecipeEditorRun;
  /** Reads durable state with `recipe status`, without acquiring the checkpoint. */
  status(id: string, signal: AbortSignal): Promise<RecipeRunStatus | null>;
  subscribe(listener: (event: RecipeEditorRunEvent) => void): () => void;
  /** Stops the active run and waits for its process to exit. */
  close(): Promise<void>;
}

export type RecipeEditorDurableRun = RecipeEditorRun & {
  readonly runId: string;
};

/** CLI arguments an action adds, and the durable run it addresses. */
export interface RecipeEditorRunCommand {
  readonly runId?: string;
  readonly arguments: readonly string[];
}

export interface RecipeEditorActiveRun {
  run: RecipeEditorRun;
  readonly process: SupervisedProcess;
  readonly finished: Promise<void>;
  cancelled: boolean;
}
