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

export async function createRecipeRuntime(
  options: RecipeProjectOptions,
): Promise<RecipeRuntime> {
  const project = await readRecipeProject(options);
  const stop = new AbortController();
  let active: Promise<unknown> | undefined;
  let closed = false;
  const runtime: RecipeRuntime = {
    async run(settings = {}) {
      if (closed || active)
        throw new Error("Recipe runtime is closed or already running");
      const inputs = resolveRecipeInputs(
        project.document.inputs,
        settings.inputs,
      );
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
                ...(configuration.agents
                  ? { agents: configuration.agents }
                  : {}),
                inputs,
              },
              signal,
              observation,
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
                observerErrors: scope.redact(
                  scope.observerErrors.map((error) => recipeDiagnostic(error)),
                ),
              }
            : {}),
        };
        publishRecipeReport(report, project.reports, settings.report);
        return report;
      } finally {
        active = undefined;
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
