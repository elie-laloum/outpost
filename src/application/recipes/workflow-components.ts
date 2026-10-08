import { preflightRecipeAgent } from "./agent-preflight.ts";
import { recipeObject } from "../../domain/recipes/values.ts";
import { nativeRecipeSchemas } from "./native-schemas.constants.ts";
import { resolveRecipeOptions } from "./native.ts";
import type { RecipeComponentDefinition } from "../../domain/recipes/component.types.ts";
import type { RecipeDocument } from "../../domain/recipe.types.ts";
import type { RecipeComponentScope } from "./components.types.ts";
import type {
  RecipeWorkflowComponents,
  RecipeWorkflowStepComponents,
} from "./workflow-components.types.ts";

export const workflowOptionComponents: readonly RecipeComponentDefinition[] = [
  "task",
  "workflow",
  "loop",
  "decisionTask",
  "isolated",
  "call",
].map((type) => ({
  name: `${type}Options.options`,
  kind: `${type}Options`,
  schema: nativeRecipeSchemas[`${type}.options`]!,
  accepts: recipeObject,
  create(options, context) {
    return resolveRecipeOptions(this.schema, options, context);
  },
}));

function stepOptions(value: unknown): value is RecipeWorkflowStepComponents {
  return recipeObject(value);
}
function workflowOptions(
  value: unknown,
): value is RecipeWorkflowComponents["workflow"] {
  return recipeObject(value);
}

export async function prepareRecipeWorkflow(
  document: RecipeDocument,
  scope: RecipeComponentScope,
): Promise<RecipeWorkflowComponents> {
  const steps: Record<string, RecipeWorkflowStepComponents> = {};
  const workflow = await scope.resolve("workflow", "workflowOptions");
  if (!workflowOptions(workflow))
    throw new Error("Invalid recipe workflow options");
  for (const step of document.tasks) {
    const values: Record<string, unknown> = {};
    for (const [field, kind] of Object.entries({
      options: "task",
      dispatch: "dispatch",
      loop: "loop",
      decision: "decisionTask",
      isolated: "isolated",
      call: "call",
    })) {
      if (!Object.hasOwn(step, field)) continue;
      values[field] = await scope.resolve(
        `tasks.${step.key}.${field}`,
        `${kind}Options`,
      );
    }
    if (!stepOptions(values))
      throw new Error(`Invalid recipe task: ${step.key}`);
    const prepared: RecipeWorkflowStepComponents = values;
    if (prepared.isolated)
      await preflightRecipeAgent(
        prepared.isolated.agent,
        prepared.isolated.repository ??
          prepared.isolated.workspace?.repository ??
          process.cwd(),
        prepared.isolated.sandboxProvider?.variables ?? {},
        scope,
      );
    steps[step.key] = prepared;
  }
  return { workflow, steps };
}
