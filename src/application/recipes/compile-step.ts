import {
  compileCommand,
  compileAgent,
  compileIsolated,
} from "./compile-execution.ts";
import {
  compileValue,
  compileCall,
  compileLoop,
  compileDecision,
} from "./compile-data.ts";
import {
  compileGate,
  compileInteractive,
  compileArtifact,
  compileQueued,
  compileSpeculation,
} from "./compile-durable.ts";
import { unreachableRecipeStep } from "./normalize.ts";
import type { NormalizedRecipeStep } from "./normalized.types.ts";
import type { RecipeCompilationContext } from "./compilation.types.ts";
import type { Task } from "../../domain/workflow.types.ts";

export function compileRecipeStep(
  step: NormalizedRecipeStep,
  context: RecipeCompilationContext,
): Task {
  switch (step.kind) {
    case "command":
      return compileCommand(step, context);
    case "agent":
      return compileAgent(step, context);
    case "isolated":
      return compileIsolated(step, context);
    case "value":
      return compileValue(step, context);
    case "call":
      return compileCall(step, context);
    case "loop":
      return compileLoop(step, context);
    case "decision":
      return compileDecision(step, context);
    case "gate":
      return compileGate(step, context);
    case "interactive":
      return compileInteractive(step, context);
    case "artifact":
      return compileArtifact(step, context);
    case "queued":
      return compileQueued(step, context);
    case "speculation":
      return compileSpeculation(step, context);
    default:
      return unreachableRecipeStep(step);
  }
}
