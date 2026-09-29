import type { CliAgent } from "../domain/agent.types.ts";
import { OutpostError } from "../domain/errors.ts";
import type { QuotaFault } from "../domain/quota.types.ts";
import type { AgentOutput } from "./execution.types.ts";

/** Classifies a failed CLI turn from the adapter's quota and outage signals. */
export function agentFailure(agent: CliAgent, output: AgentOutput) {
  let quotaLine: string | undefined;
  let unavailableLine: string | undefined;
  const matching = (
    text: string | undefined,
    matches: ((text: string) => boolean) | undefined,
  ) => (text !== undefined && matches?.(text) === true ? text : undefined);
  function quota(): QuotaFault | undefined {
    const message =
      matching(output.failure, agent.quota) ??
      output.quota?.message ??
      quotaLine;
    if (message === undefined) return undefined;
    const resetAt = output.quota?.resetAt;
    return { message, ...(resetAt === undefined ? {} : { resetAt }) };
  }
  const unavailable = () =>
    matching(output.failure, agent.unavailable) ?? unavailableLine;
  const reclassify = (
    error: OutpostError,
    code: OutpostError["code"],
    message: string,
    details: Record<string, unknown>,
  ) => {
    const classified = new OutpostError(
      code,
      message,
      { ...error.details, agent: agent.name, ...details },
      error,
    );
    classified.recovery = error.recovery;
    return classified;
  };
  return {
    observe(line: string): void {
      const text = line.trim() || undefined;
      quotaLine ??= matching(text, agent.quota);
      unavailableLine ??= matching(text, agent.unavailable);
    },
    /** Reclassifies a failed agent process that reported a quota or outage signal. */
    classify(error: unknown): unknown {
      if (!(error instanceof OutpostError) || error.code !== "process")
        return error;
      const limit = quota();
      if (limit)
        return reclassify(error, "quota", limit.message, {
          ...(limit.resetAt === undefined ? {} : { resetAt: limit.resetAt }),
        });
      const outage = unavailable();
      return outage
        ? reclassify(error, "process", error.message, { unavailable: outage })
        : error;
    },
    /** Marks a timeout whose agent reported a connection failure as an outage. */
    connection(error: OutpostError): OutpostError {
      return reclassify(
        error,
        error.code,
        `${error.message}. The agent reported a connection failure. Check the model endpoint and network access.`,
        { agentDiagnostic: "connection", unavailable: "connection failure" },
      );
    },
  };
}
