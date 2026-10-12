import { invariant } from "../domain/errors.ts";
import type { TransferOptions } from "../domain/sandbox.types.ts";
import { requireSuccess } from "../infrastructure/process.ts";
import type { Executor } from "../infrastructure/process.types.ts";
import { containerDefaults } from "./container.constants.ts";
import type { ContainerEngine } from "./container.types.ts";

export async function recoverContainer(
  engine: ContainerEngine,
  executor: Executor,
  resourceId: string,
  options: TransferOptions = {},
): Promise<void> {
  invariant(
    /^outpost-[a-f0-9-]{36}$/.test(resourceId),
    "Invalid recoverable container identity",
  );
  const limits = {
    deadlineMs: options.deadlineMs ?? containerDefaults.cleanupMs,
    ...(options.signal ? { signal: options.signal } : {}),
  };
  const result = await requireSuccess(
    {
      executable: engine,
      arguments: [
        "container",
        "ls",
        "--all",
        "--filter",
        `name=^${resourceId}(-egress)?$`,
        "--format",
        "{{.Names}}",
      ],
      ...limits,
    },
    executor,
  );
  if (!result.stdout.trim()) return;
  const names = result.stdout.trim().split(/\r?\n/);
  invariant(
    names.every(
      (name) => name === resourceId || name === `${resourceId}-egress`,
    ),
    "Recoverable container identity mismatch",
  );
  for (const name of [resourceId, `${resourceId}-egress`]) {
    if (!names.includes(name)) continue;
    await requireSuccess(
      { executable: engine, arguments: ["rm", "--force", name], ...limits },
      executor,
    );
  }
}
