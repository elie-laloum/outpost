import { inspectRecipeWorkspace } from "../../infrastructure/recipes/workspace.ts";
import { bindRecipeWorkflow } from "./workflow.ts";
import { recipeWorkflowReport } from "./workflow-report.ts";
import { createRecipeDurableResources } from "./durable-resources.ts";
import { openRecipeCheckpoint } from "./durable-session.ts";
import type { RecipeProject, RecipeRunOptions } from "./project.types.ts";
import type { RecipeResumeOptions } from "./durable.types.ts";
import type { RecipeConfiguration } from "../recipe.types.ts";
import type { RecipeWorkflowComponents } from "./workflow-components.types.ts";
import type { RecipeComponentScope } from "./components.types.ts";
import type { ObservationHub } from "../../domain/observation.types.ts";
import type { WorkflowResult } from "../../domain/workflow.types.ts";

export async function runDurableRecipe(
  project: RecipeProject,
  configuration: RecipeConfiguration,
  components: RecipeWorkflowComponents,
  scope: RecipeComponentScope,
  settings: RecipeRunOptions | RecipeResumeOptions,
  resume: boolean,
  signal: AbortSignal,
  observation?: ObservationHub,
) {
  if (!components.workflow.checkpoint)
    throw new Error("Recipe resume requires a configured workflow checkpoint");
  const session = await openRecipeCheckpoint(
    project,
    components.workflow.checkpoint,
    settings,
    resume,
  );
  const resources = createRecipeDurableResources(
    session,
    configuration,
    signal,
    observation,
  );
  try {
    for (const [key, saved] of Object.entries(
      session.previous?.recipe.resources ?? {},
    )) {
      if (saved.state === "closed") continue;
      if (!saved.record || saved.state === "allocating")
        throw new Error(`Recipe workspace ${key} requires explicit recovery`);
      const settings =
        key === "shared"
          ? configuration.sandbox
          : components.steps[key.slice("isolated.".length)]?.isolated;
      if (!settings)
        throw new Error(`Unknown persisted recipe workspace: ${key}`);
      await inspectRecipeWorkspace(saved.record, settings);
    }
    const workflow = bindRecipeWorkflow(
      project.document,
      {
        ...(configuration.agents ? { agents: configuration.agents } : {}),
        inputs: session.inputs,
        acquireSandbox: resources.shared,
        prepareIsolated: resources.isolated,
        releaseIsolated: resources.releaseIsolated,
      },
      {
        ...components,
        workflow: { ...components.workflow, checkpoint: session.options },
      },
    );
    let result: WorkflowResult | undefined;
    const errors: unknown[] = [];
    try {
      result = await workflow.start({
        signal,
        ...(observation ? { observation } : {}),
        ...(resume && "answers" in settings && settings.answers
          ? { answers: settings.answers }
          : {}),
        ...(resume && "decisions" in settings && settings.decisions
          ? { decisions: settings.decisions }
          : {}),
      });
      errors.push(...result.errors);
      await resources.settle(result);
    } catch (error) {
      errors.push(error);
    } finally {
      try {
        await resources.close();
      } catch (error) {
        errors.push(error);
      }
    }
    const report = scope.redact({
      ...recipeWorkflowReport(
        workflow,
        result,
        errors,
        signal,
        resources.workspace(),
      ),
      runId: session.options.runId,
    });
    if (result) await session.saveReport(report);
    return report;
  } finally {
    try {
      await resources.close();
    } finally {
      await session.close();
    }
  }
}
