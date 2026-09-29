import { lstat } from "node:fs/promises";
import type {
  AgentAdapter,
  ConfigurationFile,
  HostConfiguration,
} from "../domain/agent.types.ts";
import type { Variables } from "../domain/command.types.ts";
import { OutpostError } from "../domain/errors.ts";
import type { SandboxLease, SandboxProvider } from "../domain/sandbox.types.ts";
import {
  readHostCredential,
  resolveHostPath,
} from "../infrastructure/host-credentials.ts";
import { requireSuccess } from "../infrastructure/process.ts";
import { configurationInstaller } from "./configuration-installer.constants.ts";

export async function configureAgent(
  adapter: AgentAdapter,
  variables: Variables,
  lease: SandboxLease,
  placement: SandboxProvider["placement"],
  signal: AbortSignal,
): Promise<void> {
  const plan = adapter.configuration?.(variables);
  if (!plan) return;
  // On the host the CLI already reads these files from its own home.
  const host =
    placement === "host"
      ? []
      : await Promise.all((plan.host ?? []).map(hostFile));
  const files = [...plan.files, ...host.flat()];
  if (!files.length) return;
  await requireSuccess(
    {
      executable: "node",
      arguments: ["-e", configurationInstaller],
      stdin: JSON.stringify({ home: lease.home, files }),
      signal,
    },
    lease.invoke.bind(lease),
  );
}

async function hostFile(
  configuration: HostConfiguration,
): Promise<readonly ConfigurationFile[]> {
  const path = resolveHostPath(configuration.source);
  const found = await lstat(path).then(
    () => true,
    (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT" || error.code === "ENOTDIR") return false;
      throw error;
    },
  );
  if (!found && configuration.optional) return [];
  if (!found)
    throw new OutpostError(
      "configuration",
      `MCP OAuth login was not found at ${path}. Run ${configuration.login} on the host.`,
      { path },
    );
  const content = await readHostCredential({
    source: configuration.source,
    destination: { file: configuration.path },
    login: configuration.login,
  });
  return [
    {
      path: configuration.path,
      ...(configuration.section === undefined
        ? {}
        : { section: configuration.section }),
      entries: configuration.select(content),
    },
  ];
}
