import type { Backlog, Issue } from "../domain/backlog.ts";
import { invariant } from "../domain/errors.ts";
import { requireSuccess, type Executor } from "../infrastructure/process.ts";
import { resolveVariables } from "../infrastructure/settings.ts";

export interface BacklogSettings {
  readonly directory?: string;
  readonly label?: string;
  readonly deadlineMs?: number;
}

function issue(input: unknown): Issue {
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

function cli(program: string, settings: BacklogSettings, executor?: Executor) {
  const directory = settings.directory ?? process.cwd();
  return async (args: readonly string[], signal?: AbortSignal) => {
    signal?.throwIfAborted();
    const variables = await resolveVariables(directory);
    return (
      await requireSuccess(
        {
          executable: program,
          arguments: args,
          directory,
          variables,
          deadlineMs: settings.deadlineMs ?? 60_000,
          retain: 16_777_216,
          ...(signal ? { signal } : {}),
        },
        executor,
      )
    ).stdout;
  };
}

export function githubBacklog(
  settings: BacklogSettings = {},
  executor?: Executor,
): Backlog {
  const run = cli("gh", settings, executor);
  const identifier = (id: string) => {
    invariant(
      /^[1-9]\d*$/.test(id),
      "GitHub issue id must be a positive number",
    );
    return id;
  };
  return {
    async list(signal) {
      const endpoint = `repos/{owner}/{repo}/issues?state=open&per_page=100${settings.label ? `&labels=${encodeURIComponent(settings.label)}` : ""}`;
      const pages: unknown = JSON.parse(
        await run(["api", endpoint, "--paginate", "--slurp"], signal),
      );
      invariant(
        Array.isArray(pages) && pages.every(Array.isArray),
        "Invalid GitHub issue pages",
      );
      return pages
        .flat()
        .filter((item) => !item.pull_request)
        .map(issue);
    },
    async get(id, signal) {
      return issue(
        JSON.parse(
          await run(
            ["issue", "view", identifier(id), "--json", "number,title,body"],
            signal,
          ),
        ),
      );
    },
    async close(id, signal) {
      await run(
        ["issue", "close", identifier(id), "--reason", "completed"],
        signal,
      );
    },
  };
}

export function beadsBacklog(
  settings: BacklogSettings = {},
  executor?: Executor,
): Backlog {
  const run = cli("bd", settings, executor);
  const identifier = (id: string) => {
    invariant(/^[\w][\w.-]*$/.test(id), "Invalid Beads issue id");
    return id;
  };
  return {
    async list(signal) {
      const data: unknown = JSON.parse(
        await run(
          [
            "ready",
            "--json",
            "--limit",
            "0",
            ...(settings.label ? ["--label", settings.label] : []),
          ],
          signal,
        ),
      );
      invariant(Array.isArray(data), "Invalid Beads backlog");
      return data.map(issue);
    },
    async get(id, signal) {
      const data = JSON.parse(
        await run(["show", identifier(id), "--json"], signal),
      );
      return issue(Array.isArray(data) ? data[0] : data);
    },
    async close(id, signal) {
      await run(["close", identifier(id)], signal);
    },
  };
}
