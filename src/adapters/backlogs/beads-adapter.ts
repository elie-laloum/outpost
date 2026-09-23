import type { Backlog } from "../../domain/backlog.types.ts";
import { invariant } from "../../domain/errors.ts";
import type { Executor } from "../../infrastructure/process.types.ts";
import { cli } from "./cli.ts";
import { issue } from "./issue.ts";
import type { BacklogSettings } from "./settings.types.ts";

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
