import type { Observation } from "../observation.types.ts";
import type { TaskStatus } from "../workflow.types.ts";

/** Applies the task statuses a workflow observation carries; returns whether it carried any. */
export function applyRecipeTaskStatus(
  tasks: Record<string, TaskStatus>,
  observation: Observation,
): boolean {
  if (observation.event.kind !== "workflow") return false;
  const event = observation.event.event;
  for (const record of event.tasks ?? []) tasks[record.key] = record.status;
  if (event.key && event.status) tasks[event.key] = event.status;
  return !!(event.tasks?.length || (event.key && event.status));
}
