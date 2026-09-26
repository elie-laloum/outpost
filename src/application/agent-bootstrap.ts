import { posix } from "node:path";
import type { Agent } from "../domain/agent.types.ts";
import { invariant } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { quote, requireSuccess } from "../infrastructure/process.ts";
import { agentInstallers } from "./agent-bootstrap.constants.ts";

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
  const prefix = posix.join(runtime.home, ".outpost-tools"),
    target = posix.join(prefix, "bin", binary);
  const scripts = installer.allowScripts
    ? ` --allow-scripts=${installer.package.replace(/@[^@/]+$/, "")}`
    : "";
  const installed = await requireSuccess(
    {
      executable: "sh",
      arguments: [
        "-c",
        `if command -v ${binary} >/dev/null 2>&1; then command -v ${binary}; elif test -x ${quote(target)}; then printf '%s\\n' ${quote(target)}; else npm install --global${scripts} --prefix ${quote(prefix)} ${installer.package} >&2 && printf '%s\\n' ${quote(target)}; fi`,
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
