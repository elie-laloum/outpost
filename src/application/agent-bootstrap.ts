import { posix } from "node:path";
import type { Agent } from "../domain/agent.types.ts";
import { invariant } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { quote, requireSuccess } from "../infrastructure/process.ts";
import { antigravityInstall } from "../providers/antigravity-install.ts";
import { agentInstallers } from "./agent-bootstrap.constants.ts";
import type {
  AgentInstallation,
  AgentInstallations,
  AgentInstaller,
} from "./agent-bootstrap.types.ts";

const installations: AgentInstallations = {
  npm: (installer, home) => {
    const prefix = posix.join(home, ".outpost-tools");
    const scripts = installer.allowScripts
      ? ` --allow-scripts=${installer.package.replace(/@[^@/]+$/, "")}`
      : "";
    return {
      target: posix.join(prefix, "bin", installer.binary),
      install: `npm install --global${scripts} --prefix ${quote(prefix)} ${installer.package}`,
    };
  },
  antigravity: (installer, home) => ({
    target: posix.join(home, installer.installed),
    install: antigravityInstall(posix.join(home, installer.installed)),
  }),
};

function installation(
  installer: AgentInstaller,
  home: string,
): AgentInstallation {
  return installer.kind === "npm"
    ? installations.npm(installer, home)
    : installations.antigravity(installer, home);
}

export async function prepareAdapter(
  agent: Agent,
  runtime: SandboxLease,
  signal: AbortSignal,
): Promise<Agent> {
  if (agent.kind !== "cli") return agent;
  const name = agent.bootstrap ?? agent.conversations;
  if (!name) return agent;
  const installer = Object.hasOwn(agentInstallers, name)
    ? agentInstallers[name]
    : undefined;
  invariant(installer, `Unknown agent bootstrap: ${name}`);
  const { binary } = installer;
  const { target, install } = installation(installer, runtime.home);
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
    request(input) {
      return { ...agent.request(input), executable: path };
    },
  };
}
