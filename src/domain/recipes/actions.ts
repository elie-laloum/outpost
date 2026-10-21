import { configurationError } from "../configuration-diagnostic.ts";
import { recipeActions } from "./actions.constants.ts";

export function recipeAction(step: object, path: string) {
  const actions = recipeActions.filter((key) => Object.hasOwn(step, key));
  const [action] = actions;
  if (actions.length !== 1 || action === undefined)
    throw configurationError(
      `${path} requires exactly one task action; found ${actions.join(", ") || "none"}`,
      path,
    );
  return action;
}
