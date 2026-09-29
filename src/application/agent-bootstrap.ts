import { posix } from "node:path";
import type { Agent } from "../domain/agent.types.ts";
import { invariant } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { quote, requireSuccess } from "../infrastructure/process.ts";
import type { AgentDescriptor } from "../adapters/agents/agent-descriptor.types.ts";
import { builtInAgent } from "../adapters/agents/catalog.ts";
import type {
  AgentInstallation,
  AgentInstallations,
} from "./agent-bootstrap.types.ts";

const installations: AgentInstallations = {
  npm: (installer, executable, version, home) => {
    const prefix = posix.join(home, ".outpost-tools");
    const scripts = installer.allowScripts
      ? ` --allow-scripts=${installer.package}`
      : "";
    return {
      target: posix.join(prefix, "bin", executable),
      install: `npm install --global${scripts} --prefix ${quote(prefix)} ${installer.package}@${version}`,
    };
  },
  script: (installer, _executable, _version, home) => ({
    target: posix.join(home, installer.installed),
    install: installer.script(posix.join(home, installer.installed)),
  }),
};

function installation(
  { install, executable, version }: AgentDescriptor,
  home: string,
): AgentInstallation {
  return install.kind === "npm"
    ? installations.npm(install, executable, version, home)
    : installations.script(install, executable, version, home);
}

export async function prepareAdapter(
  agent: Agent,
  runtime: SandboxLease,
  signal: AbortSignal,
): Promise<Agent> {
  if (agent.kind !== "cli") return agent;
  const name = agent.bootstrap;
  if (!name) return agent;
  const descriptor = builtInAgent(name);
  invariant(descriptor, `Unknown agent bootstrap: ${name}`);
  const binary = descriptor.executable;
  const { target, install } = installation(descriptor, runtime.home);
  const installed = await requireSuccess(
    {
      executable: "sh",
      arguments: [
        "-c",
        `if command -v ${binary} >/dev/null 2>&1; then command -v ${binary}; elif test -x ${quote(target)}; then printf '%s\\n' ${quote(target)}; else ${install} >&2 && test -x ${quote(target)} && printf '%s\\n' ${quote(target)}; fi`,
      ],
      signal,
    },
    runtime.invoke.bind(runtime),
  );
  const path = installed.stdout.trim();
  invariant(
    path.startsWith("/") && !path.includes("\n"),
    "Agent bootstrap returned an invalid executable path",
  );
  return {
    ...agent,
    ...(agent.fork
      ? {
          fork: (
            id: string,
            invoke: Parameters<NonNullable<typeof agent.fork>>[1],
          ) =>
            agent.fork!(id, (command) =>
              invoke({ ...command, executable: path }),
            ),
        }
      : {}),
    request(input) {
      return { ...agent.request(input), executable: path };
    },
  };
}
