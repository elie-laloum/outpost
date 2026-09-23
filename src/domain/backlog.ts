import { invariant } from "./errors.ts";

export interface Issue {
  readonly id: string;
  readonly title: string;
  readonly body?: string;
  readonly blockedBy?: readonly string[];
}

export interface Backlog {
  list(signal?: AbortSignal): Promise<readonly Issue[]>;
  get(id: string, signal?: AbortSignal): Promise<Issue>;
  close(id: string, signal?: AbortSignal): Promise<void>;
}

export interface Assignment {
  readonly id: string;
  readonly branch: string;
}

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
