import { dispatchFields } from "./workflow.constants.ts";
import { recipeObject } from "../../domain/recipes/values.ts";
import { recipeJson } from "../../domain/recipes/expressions.ts";
import type { WorkflowJson } from "../../domain/workflow/checkpoint.types.ts";
export function recipeDispatchProjection(
  value: unknown,
): Readonly<Record<string, WorkflowJson>> {
  if (!recipeObject(value)) throw new Error("Expected a dispatch result");
  return Object.fromEntries(
    dispatchFields.flatMap((key) =>
      value[key] === undefined ? [] : [[key, recipeJson(value[key])]],
    ),
  );
}
