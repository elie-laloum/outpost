import { defineWorkflow } from "../domain/workflow.ts";
import type {
  Task,
  Workflow,
  WorkflowOptions,
} from "../domain/workflow.types.ts";
import type { RecipeDocument } from "../domain/recipe.types.ts";
import { parseRecipe } from "../infrastructure/recipe.ts";
import { defineAgentTask, defineCommandTask } from "./tasks.ts";
import type { RecipeBindings } from "./recipe.types.ts";

export function defineRecipe(
  source: string,
  bindings: RecipeBindings,
): Workflow {
  return bindRecipe(parseRecipe(source), bindings);
}

export function bindRecipe(
  document: RecipeDocument,
  bindings: RecipeBindings,
): Workflow {
  const tasks = new Map<string, Task>();
  for (const step of document.tasks) {
    const { command, agent: name, brief, after, ...common } = step;
    const dependencies = after.map((key) => {
      const dependency = tasks.get(key);
      if (!dependency) throw new Error(`Unknown recipe dependency: ${key}`);
      return dependency;
    });
    if (command) {
      tasks.set(
        step.key,
        defineCommandTask({
          ...common,
          after: dependencies,
          sandbox: bindings.sandbox,
          command,
        }),
      );
      continue;
    }
    const agent =
      name && Object.hasOwn(bindings.agents ?? {}, name)
        ? bindings.agents?.[name]
        : undefined;
    if (!agent || brief === undefined)
      throw new Error(`Unknown recipe agent: ${name}`);
    tasks.set(
      step.key,
      defineAgentTask({
        ...common,
        after: dependencies,
        sandbox: bindings.sandbox,
        request: () => ({ agent, brief: { text: brief } }),
      }),
    );
  }
  const workflow = defineWorkflow(document.name, [...tasks.values()]);
  return Object.freeze({
    ...workflow,
    start(options: WorkflowOptions = {}) {
      if (options.concurrency !== undefined && options.concurrency !== 1)
        throw new Error(
          "A recipe shares one sandbox and requires concurrency 1",
        );
      return workflow.start({ ...options, concurrency: 1 });
    },
  });
}
