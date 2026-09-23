import type { Command } from "../domain/command.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { requireSuccess } from "../infrastructure/process.ts";
import { hookDeadlineMs } from "./lifecycle.constants.ts";

export async function hooks(
  commands: readonly Command[],
  directory: string,
  invoke: SandboxLease["invoke"],
  signal?: AbortSignal,
  parallel = false,
): Promise<void> {
  if (parallel) {
    const controller = new AbortController();
    const combined = signal
      ? AbortSignal.any([signal, controller.signal])
      : controller.signal;
    const outcomes = await Promise.allSettled(
      commands.map((command) =>
        hooks([command], directory, invoke, combined).catch((cause) => {
          controller.abort(cause);
          throw cause;
        }),
      ),
    );
    const failure = outcomes.find((outcome) => outcome.status === "rejected");
    if (failure?.status === "rejected") throw failure.reason;
    return;
  }
  for (const command of commands)
    await requireSuccess(
      {
        ...command,
        directory: command.directory ?? directory,
        deadlineMs: command.deadlineMs ?? hookDeadlineMs,
        ...(signal ? { signal } : {}),
      },
      invoke,
    );
}
