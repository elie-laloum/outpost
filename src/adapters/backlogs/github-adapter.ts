import type { Backlog } from "../../domain/backlog.types.ts";
import { invariant } from "../../domain/errors.ts";
import type { Executor } from "../../infrastructure/process.types.ts";
import { cli } from "./cli.ts";
import { issue } from "./issue.ts";
import type { BacklogSettings } from "./settings.types.ts";

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
