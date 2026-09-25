import { posix } from "node:path";
import type { Agent } from "../domain/agent.types.ts";
import { invariant } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { quote, requireSuccess } from "../infrastructure/process.ts";
import { agentPackages } from "./agent-bootstrap.constants.ts";

function isBootstrapAgent(name: string): name is keyof typeof agentPackages {
  return Object.hasOwn(agentPackages, name);
}

export async function prepareAdapter(
  agent: Agent,
  runtime: SandboxLease,
  signal: AbortSignal,
): Promise<Agent> {
  if (agent.kind !== "cli") return agent;
  const executable = agent.bootstrap ?? agent.conversations;
  if (!executable) return agent;
  invariant(
    isBootstrapAgent(executable),
    `Unknown agent bootstrap: ${executable}`,
  );
  const cli = agentPackages[executable];
  const prefix = posix.join(runtime.home, ".outpost-tools"),
    target = posix.join(prefix, "bin", executable);
  const installed = await requireSuccess(
    {
      executable: "sh",
      arguments: [
        "-c",
        `if command -v ${executable} >/dev/null 2>&1; then command -v ${executable}; elif test -x ${quote(target)}; then printf '%s\\n' ${quote(target)}; else npm install --global --allow-scripts=@anthropic-ai/claude-code --prefix ${quote(prefix)} ${cli} >&2 && printf '%s\\n' ${quote(target)}; fi`,
      ],
      signal,
    },
    runtime.invoke.bind(runtime),
  );
  const binary = installed.stdout.trim();
  invariant(
    binary.startsWith("/") && !binary.includes("\n"),
    "Agent bootstrap returned an invalid executable path",
  );
  return {
    ...agent,
    request(input) {
      return { ...agent.request(input), executable: binary };
    },
  };
}
