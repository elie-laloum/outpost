import type { AgentFeatures } from "../../domain/agent.types.ts";
import type { FileAgentCapability } from "../../domain/execution-plan.types.ts";

/** One harness an agent component may run, as far as static inspection can tell. */
export interface RecipeAgentCandidatePlan {
  readonly component: string;
  /** Built-in CLI agent name; absent for extension and custom harnesses, checked at execution. */
  readonly harness?: string;
  readonly fileWorkspaces?: AgentFeatures["fileWorkspaces"];
  /** Whether conversations can be captured and resumed in file workspaces. */
  readonly continuation?: boolean;
}

/** An agent component used by recipe tasks, with what those tasks require of it. */
export interface RecipeAgentPlan {
  readonly component: string;
  readonly tasks: readonly string[];
  readonly requires: readonly FileAgentCapability[];
  readonly candidates: readonly RecipeAgentCandidatePlan[];
}

/** Tasks that use one agent component while a plan is collected. */
export interface RecipeAgentUse {
  readonly tasks: string[];
  readonly requires: Set<FileAgentCapability>;
}
