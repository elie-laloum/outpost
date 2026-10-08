import { validateRecipeExpression } from "../../domain/recipes/expressions.ts";
import { validateSpeculationOptions } from "../speculation-validation.ts";
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
  "speculation",
  "integration",
  "queued",
  "gate",
  "interactive",
  "artifactTask",
  "task",
  "workflow",
  "loop",
  "decisionTask",
  "isolated",
  "call",
].map((type) => ({
  name: `${type}Options.options`,
  ...(type === "speculation" ? { experimental: true } : {}),
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
  if (workflow.checkpoint?.resume)
    throw new Error(
      "Recipe checkpoint replay must be authorized with resume({ retryIncomplete: true }) or --retry-incomplete",
    );
  for (const step of document.tasks) {
    const values: Record<string, unknown> = {};
    for (const [field, kind] of Object.entries({
      speculation: "speculation",
      queued: "queued",
      gate: "gate",
      interactive: "interactive",
      artifact: "artifactTask",
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
    if (prepared.isolated?.brief.text !== undefined)
      validateRecipeExpression(prepared.isolated.brief.text, {
        document,
        step,
      });
    if (prepared.isolated)
      await preflightRecipeAgent(
        prepared.isolated.agent,
        prepared.isolated.repository ??
          prepared.isolated.workspace?.repository ??
          process.cwd(),
        prepared.isolated.sandboxProvider?.variables ?? {},
        scope,
      );
    if (prepared.speculation) {
      validateSpeculationOptions(prepared.speculation);
      if (prepared.speculation.durability?.resume)
        throw new Error(
          "Speculation replay requires resume --retry-incomplete",
        );
      if (prepared.speculation.durability && !workflow.checkpoint)
        throw new Error(
          "Durable recipe speculation requires a workflow checkpoint",
        );
      for (const candidate of prepared.speculation.candidates) {
        if (candidate.request.brief.text !== undefined)
          validateRecipeExpression(candidate.request.brief.text, {
            document,
            step,
          });
        await preflightRecipeAgent(
          candidate.agent,
          prepared.speculation.repository,
          prepared.speculation.sandboxProvider.variables ?? {},
          scope,
        );
      }
    }
    if (prepared.interactive)
      await preflightRecipeAgent(
        prepared.interactive.agent,
        prepared.interactive.repository,
        prepared.interactive.sandboxProvider?.variables ?? {},
        scope,
      );
    steps[step.key] = prepared;
  }
  return { workflow, steps };
}
