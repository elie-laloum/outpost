import type { CliAgent } from "../domain/agent.types.ts";
import { OutpostError } from "../domain/errors.ts";
import type { QuotaFault } from "../domain/quota.types.ts";
import type { AgentOutput } from "./execution.types.ts";

export function agentQuota(agent: CliAgent, output: AgentOutput) {
  let stderr: string | undefined;
  const recognized = (text: string | undefined) =>
    text !== undefined && agent.quota?.(text) === true ? text : undefined;
  function signal(): QuotaFault | undefined {
    const message =
      recognized(output.failure) ?? output.quota?.message ?? stderr;
    if (message === undefined) return undefined;
    const resetAt = output.quota?.resetAt;
    return { message, ...(resetAt === undefined ? {} : { resetAt }) };
  }
  return {
    observe(line: string): void {
      stderr ??= recognized(line.trim() || undefined);
    },
    /** Reclassifies a failed agent process that reported a quota signal. */
    classify(error: unknown): unknown {
      const quota = signal();
      if (
        !quota ||
        !(error instanceof OutpostError) ||
        error.code !== "process"
      )
        return error;
      const classified = new OutpostError(
        "quota",
        quota.message,
        {
          ...error.details,
          agent: agent.name,
          ...(quota.resetAt === undefined ? {} : { resetAt: quota.resetAt }),
        },
        error,
      );
      classified.recovery = error.recovery;
      return classified;
    },
  };
}
