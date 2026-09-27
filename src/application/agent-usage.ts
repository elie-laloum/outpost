import type { AgentAdapter, Usage } from "../domain/agent.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import type { AgentOutput, DispatchOptions } from "./execution.types.ts";
import { executionDefaults } from "./execution.constants.ts";
import { notify } from "./observation.ts";

export function warnUsage(
  options: DispatchOptions<unknown>,
  pass: number,
  message: string,
): void {
  notify(options.warn, message);
  notify(options.observe, {
    kind: "warning",
    message,
    pass,
    at: new Date().toISOString(),
  });
}

async function readAgentUsage(
  lease: SandboxLease,
  agent: AgentAdapter,
  conversation: string,
  signal?: AbortSignal,
): Promise<Usage | undefined> {
  const command = agent.usageCommand?.(conversation);
  if (!command) return;
  const result = await lease.invoke({
    ...command,
    ...(signal ? { signal } : {}),
    deadlineMs: Math.min(
      command.deadlineMs ?? executionDefaults.usageMs,
      executionDefaults.usageMs,
    ),
  });
  return result.status === 0 ? agent.usageResult?.(result.stdout) : undefined;
}

export async function prepareAgentUsage(
  lease: SandboxLease,
  agent: AgentAdapter,
  output: AgentOutput,
  continuation: DispatchOptions<unknown>["continuation"],
  signal: AbortSignal,
): Promise<void> {
  if (agent.usage !== "session" || !continuation) return;
  let baseline: Usage | undefined;
  if (!continuation.fork) {
    try {
      baseline = await readAgentUsage(lease, agent, continuation.id, signal);
    } catch {
      signal.throwIfAborted();
    }
  }
  output.setUsageBaseline(baseline);
}

export async function collectAgentUsage(
  lease: SandboxLease,
  agent: AgentAdapter,
  output: AgentOutput,
  options: DispatchOptions<unknown>,
  pass: number,
  completed: boolean,
): Promise<void> {
  if (agent.usage === undefined) return;
  if (agent.usage === "session" && !output.finalUsage && output.conversation) {
    try {
      const tokens = await readAgentUsage(lease, agent, output.conversation);
      if (tokens) output.recordUsage(tokens, true);
    } catch {
      warnUsage(
        options,
        pass,
        `${agent.name}: session token usage could not be collected`,
      );
    }
  }
  if (
    !output.reportedUsage ||
    !completed ||
    (agent.usage === "session" && !output.finalUsage)
  )
    output.recordUsage({ input: 0, cached: 0, output: 0, complete: false });
  if (output.usage.complete === false)
    warnUsage(
      options,
      pass,
      `${agent.name}: token usage is incomplete; reported counters are a lower bound. Use budget.attempts with task timeouts or dispatch deadlines.`,
    );
}
