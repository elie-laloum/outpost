import type { Assignment } from "./backlog.types.ts";
import { invariant } from "./errors.ts";

export type { Assignment, Backlog, Issue } from "./backlog.types.ts";

export function readPlan(input: unknown): readonly Assignment[] {
  invariant(
    !!input &&
      typeof input === "object" &&
      "issues" in input &&
      Array.isArray(input.issues),
    "Plan must contain an issues array",
  );
  const ids = new Set<string>(),
    branches = new Set<string>();
  return input.issues.map((entry: unknown) => {
    invariant(
      !!entry &&
        typeof entry === "object" &&
        "id" in entry &&
        typeof entry.id === "string" &&
        entry.id.trim().length > 0 &&
        "branch" in entry &&
        typeof entry.branch === "string" &&
        entry.branch.startsWith("outpost/"),
      "Each assignment needs an issue id and an outpost/ branch",
    );
    invariant(
      !ids.has(entry.id) && !branches.has(entry.branch),
      "Plan contains duplicate issues or branches",
    );
    ids.add(entry.id);
    branches.add(entry.branch);
    return { id: entry.id, branch: entry.branch };
  });
}
