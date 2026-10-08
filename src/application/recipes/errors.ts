import { maxFaultCauseDepth } from "../../domain/errors.constants.ts";
import {
  OutpostError,
  recoveryDetails,
  recordRecovery,
} from "../../domain/errors.ts";
import type { RecipeComponentScope } from "./components.types.ts";

export function recipeRuntimeError(
  error: unknown,
  scope: RecipeComponentScope,
  depth = 0,
): unknown {
  if (!scope.redactions.length) return error;
  if (depth >= maxFaultCauseDepth)
    return new Error("Further error causes omitted");
  if (error instanceof OutpostError) {
    const result = new OutpostError(
      error.code,
      scope.redact(error.message),
      scope.redact(error.details),
      recipeRuntimeError(error.cause, scope, depth + 1),
    );
    recordRecovery(result, scope.redact(recoveryDetails(error) ?? {}));
    return result;
  }
  if (error instanceof AggregateError)
    return new AggregateError(
      error.errors.map((item) => recipeRuntimeError(item, scope, depth + 1)),
      scope.redact(error.message),
    );
  if (error instanceof Error)
    return new Error(scope.redact(error.message), {
      cause: recipeRuntimeError(error.cause, scope, depth + 1),
    });
  return scope.redact(error);
}
