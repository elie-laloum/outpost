import { recipeLimits } from "../recipe.constants.ts";

export const recipeEditorLimits = {
  summary: 80,
  tasks: recipeLimits.tasks,
} as const;
