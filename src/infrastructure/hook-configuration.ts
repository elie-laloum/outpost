import type { SandboxLease } from "../domain/sandbox.types.ts";
import type { HookConfigurationEdit } from "./hook-configuration.types.ts";
import { requireSuccess } from "./process.ts";
import { hookConfigurationScript } from "./hook-configuration.constants.ts";

export async function installHookConfiguration(
  sandbox: SandboxLease,
  edit: HookConfigurationEdit,
  signal: AbortSignal,
): Promise<() => Promise<void>> {
  const execute = async (remove: boolean, signal?: AbortSignal) => {
    await requireSuccess(
      {
        executable: "node",
        arguments: ["-e", hookConfigurationScript],
        stdin: JSON.stringify({ home: sandbox.home, edit, remove }),
        deadlineMs: 10_000,
        ...(signal ? { signal } : {}),
      },
      sandbox.invoke.bind(sandbox),
    );
  };
  await execute(false, signal);
  return () => execute(true);
}
