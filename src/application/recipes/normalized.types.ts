import type { Command } from "../../domain/command.types.ts";
import type { RecipeDocument, RecipeStep } from "../../domain/recipe.types.ts";
import type { WorkflowJson } from "../../domain/workflow/checkpoint.types.ts";
import type { RecipeConditionNode } from "../../domain/recipes/expressions.types.ts";
import type {
  RecipeLoopAttemptAgent,
  RecipeLoopCheckAgent,
  RecipeLoopCommandStep,
} from "../../domain/recipes/loop.types.ts";
import type { RecipeDispatchSettings } from "./agent-components.types.ts";
import type { RecipeSpeculationSettings } from "./advanced-components.types.ts";
import type { RecipeQueuedSettings } from "./service-components.types.ts";
import type {
  RecipeArtifactSettings,
  RecipeGateSettings,
  RecipeInteractiveSettings,
} from "./storage-components.types.ts";
import type {
  RecipeCallSettings,
  RecipeDecisionSettings,
  RecipeIsolatedSettings,
  RecipeLoopSettings,
  RecipeTaskSettings,
} from "./workflow-components.types.ts";

export interface NormalizedRecipeStepBase extends Pick<
  RecipeStep,
  "key" | "after" | "timeoutMs" | "retry" | "when"
> {
  readonly options?: RecipeTaskSettings;
}

export interface NormalizedRecipeLoopAttemptAgent extends Omit<
  RecipeLoopAttemptAgent,
  "dispatch"
> {
  readonly dispatch?: RecipeDispatchSettings;
}

export interface NormalizedRecipeLoopCheckAgent extends Omit<
  RecipeLoopCheckAgent,
  "dispatch" | "done"
> {
  readonly dispatch?: RecipeDispatchSettings;
  readonly done?: RecipeConditionNode;
}

export type NormalizedRecipeLoopAttemptStep =
  NormalizedRecipeLoopAttemptAgent | RecipeLoopCommandStep;

export type NormalizedRecipeLoopCheckStep =
  NormalizedRecipeLoopCheckAgent | RecipeLoopCommandStep;

/** A declarative loop with resolved dispatch options and compiled done conditions. */
export interface NormalizedRecipeLoop {
  readonly maxRounds: number;
  readonly attempt: readonly NormalizedRecipeLoopAttemptStep[];
  readonly check: readonly NormalizedRecipeLoopCheckStep[];
}

export type NormalizedRecipeStep = NormalizedRecipeStepBase &
  (
    | { readonly kind: "command"; readonly command: Command }
    | {
        readonly kind: "agent";
        readonly agent: string;
        readonly brief: string;
        readonly dispatch?: RecipeDispatchSettings;
        readonly quotaResume?: "continue" | "restart";
      }
    | { readonly kind: "value"; readonly value: WorkflowJson }
    | {
        readonly kind: "call";
        readonly call: RecipeCallSettings;
        readonly arguments?: WorkflowJson;
      }
    | { readonly kind: "loop"; readonly loop: RecipeLoopSettings }
    | {
        readonly kind: "declarative-loop";
        readonly loop: NormalizedRecipeLoop;
        readonly quotaResume?: "continue" | "restart";
      }
    | {
        readonly kind: "decision";
        readonly decision: RecipeDecisionSettings;
        readonly state?: WorkflowJson;
      }
    | {
        readonly kind: "isolated";
        readonly isolated: RecipeIsolatedSettings;
        readonly quotaResume?: "continue" | "restart";
      }
    | { readonly kind: "gate"; readonly gate: RecipeGateSettings }
    | {
        readonly kind: "interactive";
        readonly interactive: RecipeInteractiveSettings;
      }
    | {
        readonly kind: "artifact";
        readonly artifact: RecipeArtifactSettings;
        readonly data?: WorkflowJson;
      }
    | {
        readonly kind: "queued";
        readonly queued: RecipeQueuedSettings;
        readonly arguments?: WorkflowJson;
      }
    | {
        readonly kind: "speculation";
        readonly speculation: RecipeSpeculationSettings;
      }
  );

export interface NormalizedRecipe extends Pick<
  RecipeDocument,
  "version" | "name" | "inputs"
> {
  readonly tasks: readonly NormalizedRecipeStep[];
}

export type RecipeStepOf<K extends NormalizedRecipeStep["kind"]> = Extract<
  NormalizedRecipeStep,
  { readonly kind: K }
>;
