import type { Issue } from "../../domain/backlog.types.ts";
import { invariant } from "../../domain/errors.ts";

export function issue(input: unknown): Issue {
  invariant(
    !!input && typeof input === "object",
    "Tracker returned an invalid issue",
  );
  const item = input as Record<string, unknown>;
  invariant(
    (typeof item.id === "string" || typeof item.number === "number") &&
      typeof item.title === "string",
    "Tracker issue needs an id and a title",
  );
  return {
    id: String(item.number ?? item.id),
    title: item.title,
    body: String(item.body ?? item.description ?? ""),
  };
}
