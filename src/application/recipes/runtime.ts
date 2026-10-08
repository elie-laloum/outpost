import { runDurableRecipe } from "./durable-run.ts";
import { inspectRecipeRun } from "./status.ts";
import type { RecipeResumeOptions } from "./durable.types.ts";
import type { RecipeRunOptions } from "./project.types.ts";
import { prepareRecipeWorkflow } from "./workflow-components.ts";
import { runRecipeWorkflow } from "./workflow-run.ts";
import { validateRecipeSchema } from "../../infrastructure/recipes/schema.ts";
import { createSandbox } from "../sandbox.ts";
import { recipeExecutionConfiguration } from "./configuration.ts";
import { resolveRecipeInputs } from "../../domain/recipe-inputs.ts";
import { runRecipe } from "../recipe-run.ts";
import { readRecipeProject } from "./project.ts";
import { createRecipeComponentScope } from "./scope.ts";
import { observationGuards } from "./observation.ts";
import { publishRecipeReport } from "./reports.ts";
import { recipeDiagnostic } from "../recipe-report.ts";
import type { ObservationHub } from "../../domain/observation.types.ts";
import type { RecipeRuntime, RecipeProjectOptions } from "./project.types.ts";
import type { RecipeDispatchSettings } from "./agent-components.types.ts";
import { recipeObject } from "../../domain/recipes/values.ts";

function isDispatchSettings(value: unknown): value is RecipeDispatchSettings {
  return recipeObject(value);
}

export async function createRecipeRuntime(
  options: RecipeProjectOptions,
): Promise<RecipeRuntime> {
  const project = await readRecipeProject(options);
  const stop = new AbortController();
  let active: Promise<unknown> | undefined;
  let closed = false;
  async function execute(
    settings: RecipeRunOptions | RecipeResumeOptions = {},
    resume = false,
  ) {
    if (closed || active)
      throw new Error("Recipe runtime is closed or already running");
    if (resume && project.document.version !== 3)
      throw new Error("Recipe resume requires format 3");
    const inputs = resume
      ? undefined
      : resolveRecipeInputs(project.document.inputs, settings.inputs);
    for (const [name, definition] of Object.entries(project.document.inputs))
      if (definition.schema && inputs)
        validateRecipeSchema(definition.schema, inputs[name], `inputs.${name}`);
    const signal = settings.signal
      ? AbortSignal.any([settings.signal, stop.signal])
      : stop.signal;
    const scope = createRecipeComponentScope(
      project.graph,
      project.registry,
      project.directory,
      signal,
    );
    const execution = (async () => {
      let securedObservation: ObservationHub | undefined;
      try {
        await scope.prepare();
        let observation: ObservationHub | undefined;
        if (project.graph.observation) {
          const value = await scope.resolve(
            project.graph.observation,
            "observation",
          );
          if (!observationGuards.observation(value))
            throw new Error("Invalid recipe observation hub");
          observation = value;
        }
        const configuration = await recipeExecutionConfiguration(
          project,
          scope,
        );
        if (project.document.version === 3) {
          const components = await prepareRecipeWorkflow(
            project.document,
            scope,
          );
          securedObservation = observation?.child({}, [], scope.redactions);
          signal.throwIfAborted();
          if (components.workflow.checkpoint)
            return await runDurableRecipe(
              project,
              configuration,
              components,
              scope,
              settings,
              resume,
              signal,
              securedObservation,
            );
          if (resume || settings.runId)
            throw new Error(
              "Durable execution requires a configured workflow checkpoint",
            );
          return scope.redact(
            await runRecipeWorkflow(
              project.document,
              configuration,
              inputs ?? {},
              components,
              signal,
              securedObservation,
            ),
          );
        }
        const requests: Record<string, RecipeDispatchSettings> = {};
        for (const step of project.document.tasks) {
          if (!step.dispatch) continue;
          const request = await scope.resolve(
            `tasks.${step.key}.dispatch`,
            "dispatchOptions",
          );
          if (!isDispatchSettings(request))
            throw new Error(`Invalid dispatch options: ${step.key}`);
          requests[step.key] = request;
        }
        securedObservation = observation?.child({}, [], scope.redactions);
        observation = securedObservation;
        signal.throwIfAborted();
        const sandbox = await createSandbox({
          ...configuration.sandbox,
          signal,
          ...(observation ? { observation } : {}),
        });
        return scope.redact(
          await runRecipe(
            project.document,
            {
              sandbox,
              ...(configuration.agents ? { agents: configuration.agents } : {}),
              inputs: inputs ?? {},
            },
            signal,
            observation,
            requests,
          ),
        );
      } catch (error) {
        if (error instanceof Error && scope.redactions.length)
          throw new Error(scope.redact(error.message));
        throw error;
      } finally {
        await securedObservation?.close();
        await scope.close();
      }
    })();
    active = execution;
    try {
      const result = await execution;
      const report = {
        ...result,
        ...(scope.observerErrors.length
          ? {
              observerErrors: [
                ...(result.observerErrors ?? []),
                ...scope.redact(
                  scope.observerErrors.map((error) => recipeDiagnostic(error)),
                ),
              ],
            }
          : {}),
      };
      publishRecipeReport(report, project.reports, settings.report);
      return report;
    } finally {
      active = undefined;
    }
  }
  const runtime: RecipeRuntime = {
    run: (settings) => execute(settings),
    resume: (settings) => execute(settings, true),
    async status(runId) {
      if (closed) throw new Error("Recipe runtime is closed");
      const scope = createRecipeComponentScope(
        project.graph,
        project.registry,
        project.directory,
        stop.signal,
      );
      try {
        return await inspectRecipeRun(project, scope, runId);
      } finally {
        await scope.close();
      }
    },
    async close() {
      closed = true;
      stop.abort();
      await active?.catch(() => undefined);
    },
    async [Symbol.asyncDispose]() {
      await runtime.close();
    },
  };
  return runtime;
}
