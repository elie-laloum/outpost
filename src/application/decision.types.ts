import type { Usage } from "../domain/agent.types.ts";
import type {
  DecideOptions,
  DecisionQuestions,
} from "../domain/decision.types.ts";
import type { TaskContext, TaskOptions } from "../domain/workflow.types.ts";
import type {
  DecisionResult,
  DecisionState,
} from "../domain/decision.types.ts";

export type DecisionTaskOptions<
  Q extends DecisionQuestions = DecisionQuestions,
> = Omit<TaskOptions<DecisionResult<Q>>, "perform" | "gate" | "interaction"> &
  Omit<DecideOptions<Q>, "state" | "signal" | "observation"> & {
    readonly state:
      | DecisionState
      | ((context: TaskContext) => DecisionState | Promise<DecisionState>);
  };

export interface DecisionAccounting {
  account(usage: Usage): void;
}
