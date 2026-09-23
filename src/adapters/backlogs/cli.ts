import { requireSuccess } from "../../infrastructure/process.ts";
import type { Executor } from "../../infrastructure/process.types.ts";
import { resolveVariables } from "../../infrastructure/settings.ts";
import { backlogDefaults } from "./backlog.constants.ts";
import type { BacklogSettings } from "./settings.types.ts";

export function cli(
  program: string,
  settings: BacklogSettings,
  executor?: Executor,
) {
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
          deadlineMs: settings.deadlineMs ?? backlogDefaults.deadlineMs,
          retain: backlogDefaults.retainBytes,
          ...(signal ? { signal } : {}),
        },
        executor,
      )
    ).stdout;
  };
}
