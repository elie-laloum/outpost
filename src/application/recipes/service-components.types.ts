import type { QueuedTaskOptions } from "../queued-task.types.ts";
import type { CronOptions } from "../../domain/cron.types.ts";
import type { QueueWorkerOptions } from "../queue-worker.types.ts";
import type {
  RunSchedulesOptions,
  TriggerSchedule,
} from "../schedules.types.ts";
import type {
  TriggerServerOptions,
  TriggerRoute,
} from "../../infrastructure/trigger-server.types.ts";
import type { QueueServerOptions } from "../../infrastructure/task-queue-http.types.ts";
import type { TriggerEvent } from "../../domain/trigger.types.ts";
import type { TriggerJob } from "../../domain/trigger-job.types.ts";
import type { WorkflowJson } from "../../domain/workflow/checkpoint.types.ts";
import type { RecipeRunOptions } from "./project.types.ts";

export interface RecipeService {
  start(signal: AbortSignal): Promise<void>;
}
export interface RecipeSqliteOptions {
  readonly file: string;
}
export interface RecipeCronOptions extends CronOptions {
  readonly expression: string;
}
export type RecipeWorkerOptions = Omit<QueueWorkerOptions, "signal">;
export type RecipeScheduleOptions = Omit<RunSchedulesOptions, "signal">;
export type RecipeQueueServerOptions = QueueServerOptions;
export type RecipeTriggerServerOptions = Omit<
  TriggerServerOptions,
  "routes"
> & { readonly routes: readonly RecipeTriggerRoute[] };
export interface RecipeTriggerRoute extends Omit<TriggerRoute, "on"> {
  readonly on: RecipeTriggerMapper;
}
export interface RecipeJobOptions {
  readonly file: string;
  readonly config: string;
  readonly retryIncomplete?: boolean;
}
export type RecipeTriggerMapper = (
  event: TriggerEvent,
) => TriggerJob | undefined | Promise<TriggerJob | undefined>;
export interface RecipeTriggerMapperOptions {
  readonly handler: string;
  readonly runIdPrefix?: string;
  readonly kinds?: readonly string[];
  readonly actions?: readonly string[];
  readonly input?: WorkflowJson;
}
export interface RecipeScheduleDeclaration extends Omit<
  TriggerSchedule,
  "input"
> {
  readonly input?: WorkflowJson | TriggerSchedule["input"];
}

export interface RecipeServeOptions {
  readonly service: string;
  readonly signal?: AbortSignal;
}
export interface RecipeEnqueueOptions extends Pick<
  RecipeRunOptions,
  "inputs" | "signal"
> {
  readonly queue: string;
  readonly handler: string;
  readonly runId: string;
  readonly id?: string;
  readonly idempotencyKey?: string;
  readonly deadline?: number;
}

export type RecipeQueuedSettings = Pick<
  QueuedTaskOptions<unknown>,
  "queue" | "handler" | "deadline" | "pollMs"
> &
  Partial<Pick<QueuedTaskOptions<unknown>, "input" | "decode">>;
