import type { Task, Workflow, WorkflowOptions } from "./workflow.types.ts";
import { validate } from "./workflow/validation.ts";
import { schedule } from "./workflow/workflow-scheduler.ts";

export type {
  Retry,
  Task,
  TaskContext,
  TaskOptions,
  TaskRecord,
  TaskStatus,
  Workflow,
  WorkflowEvent,
  WorkflowOptions,
  WorkflowResult,
} from "./workflow.types.ts";
export { WorkflowFailure } from "./workflow/failure.ts";
export { task } from "./workflow/task.ts";

export function workflow(name: string, tasks: readonly Task[]): Workflow {
  if (!name.trim()) throw new Error("Workflow name cannot be empty");
  const graph = Object.freeze([...tasks]);
  validate(graph);
  return Object.freeze({
    name,
    tasks: graph,
    start: (options: WorkflowOptions = {}) => schedule(name, graph, options),
    diagram() {
      const ids = new Map(graph.map((item, index) => [item, `n${index}`]));
      return [
        "flowchart LR",
        ...graph.flatMap((item) => [
          `  ${ids.get(item)}["${item.key}"]`,
          ...item.after.map(
            (dependency) => `  ${ids.get(dependency)} --> ${ids.get(item)}`,
          ),
        ]),
      ].join("\n");
    },
  });
}
