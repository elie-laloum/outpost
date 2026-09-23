import type { Task } from "../workflow.types.ts";

export function positive(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 1)
    throw new Error(`${label} must be a positive integer`);
}

export function validate(tasks: readonly Task[]): void {
  const keys = new Set<string>();
  const members = new Set(tasks);
  const visiting = new Set<Task>();
  const visited = new Set<Task>();
  for (const item of tasks) {
    if (keys.has(item.key)) throw new Error(`Duplicate task: ${item.key}`);
    keys.add(item.key);
    for (const dependency of item.after)
      if (!members.has(dependency))
        throw new Error(`${item.key}: missing dependency ${dependency.key}`);
  }
  function visit(item: Task): void {
    if (visiting.has(item)) throw new Error(`Dependency cycle at ${item.key}`);
    if (visited.has(item)) return;
    visiting.add(item);
    item.after.forEach(visit);
    visiting.delete(item);
    visited.add(item);
  }
  tasks.forEach(visit);
}
