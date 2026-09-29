import type { AgentAdapter } from "../domain/agent.types.ts";
import type { Variables } from "../domain/command.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { requireSuccess } from "../infrastructure/process.ts";
import { configurationInstaller } from "./configuration-installer.constants.ts";

export async function configureAgent(
  adapter: AgentAdapter,
  variables: Variables,
  lease: SandboxLease,
  signal: AbortSignal,
): Promise<void> {
  const plan = adapter.configuration?.(variables);
  if (!plan?.files.length) return;
  await requireSuccess(
    {
      executable: "node",
      arguments: ["-e", configurationInstaller],
      stdin: JSON.stringify({ home: lease.home, files: plan.files }),
      signal,
    },
    lease.invoke.bind(lease),
  );
}
