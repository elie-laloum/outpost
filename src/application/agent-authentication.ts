import type {
  AgentAdapter,
  GeneratedCredential,
} from "../domain/agent.types.ts";
import type { Variables } from "../domain/command.types.ts";
import type { SandboxLease, SandboxProvider } from "../domain/sandbox.types.ts";
import { readHostCredential } from "../infrastructure/host-credentials.ts";
import { requireSuccess } from "../infrastructure/process.ts";
import { credentialInstaller } from "./credential-installer.constants.ts";

export async function authenticateAgent(
  adapter: AgentAdapter,
  variables: Variables,
  lease: SandboxLease,
  placement: SandboxProvider["placement"],
  signal: AbortSignal,
): Promise<Variables> {
  const plan = adapter.credentials?.(variables);
  if (!plan) return {};
  if (placement === "host") return plan.variables;
  const files: GeneratedCredential[] = [...plan.files];
  const derived: Record<string, string> = {};
  for (const credential of plan.host) {
    const content = await readHostCredential(credential);
    if ("file" in credential.destination)
      files.push({ path: credential.destination.file, content });
    else derived[credential.destination.variable] = content;
  }
  const invoke = lease.invoke.bind(lease);
  if (files.length)
    await requireSuccess(
      {
        executable: "node",
        arguments: ["-e", credentialInstaller],
        stdin: JSON.stringify({ home: lease.home, files }),
        signal,
      },
      invoke,
    );
  const credentials = Object.freeze({ ...plan.variables, ...derived });
  for (const command of plan.commands)
    await requireSuccess(
      { ...command, variables: { ...variables, ...credentials }, signal },
      invoke,
    );
  return credentials;
}
