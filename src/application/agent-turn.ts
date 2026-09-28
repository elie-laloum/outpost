import {
  collectAgentUsage,
  prepareAgentUsage,
  warnUsage,
} from "./agent-usage.ts";
import { agentRequest } from "./agent-request.ts";
import { boundedLines } from "./output-lines.ts";
import { stopReason } from "./stop-reason.ts";
import { customTurn } from "./custom-turn.ts";
import { replayTurn } from "./replay-turn.ts";
import type { Agent } from "../domain/agent.types.ts";
import { OutpostError } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { activityWatchdog } from "./activity-watchdog.ts";
import { agentOutput } from "./agent-output.ts";
import { agentQuota } from "./agent-quota.ts";
import {
  agentConnectionFailurePattern,
  executionDefaults,
} from "./execution.constants.ts";
import type { DispatchOptions, Turn, TurnContext } from "./execution.types.ts";
import { notify } from "./observation.ts";

export async function turn(
  lease: SandboxLease,
  agent: Agent,
  prompt: string,
  options: DispatchOptions<unknown>,
  continuation: DispatchOptions["continuation"],
  markers: readonly string[],
  pass: number,
  context: TurnContext,
): Promise<Turn> {
  if (agent.kind === "custom")
    return customTurn(lease, agent, prompt, options, pass, {
      ...context,
      continuation,
    });
  if (agent.kind === "replay")
    return replayTurn(lease, agent, prompt, options, pass);
  const start = Date.now();
  const controller = new AbortController();
  const signal = options.signal
    ? AbortSignal.any([options.signal, controller.signal])
    : controller.signal;
  const output = agentOutput(agent, options, markers, pass);
  const quota = agentQuota(agent, output);
  const watchdog = activityWatchdog(controller, options, pass);
  watchdog.refresh(false);
  const stderr = boundedLines((text, truncated) => {
    quota.observe(text);
    notify(options.observe, {
      kind: "stderr",
      text,
      truncated,
      pass,
      at: new Date().toISOString(),
    });
  });
  let status = 0;
  let commandCompleted = false;
  let preparedConversation: string | undefined;
  try {
    if (agent.usage === "session")
      warnUsage(
        options,
        pass,
        `${agent.name}: token usage is collected after the command exits; use budget.attempts and time limits to bound execution before the final counters arrive`,
      );
    if (agent.usage === "unavailable") {
      warnUsage(
        options,
        pass,
        `${agent.name}: token usage is unavailable; use budget.attempts and time limits`,
      );
      output.recordUsage({ input: 0, cached: 0, output: 0, complete: false });
    }
    await prepareAgentUsage(lease, agent, output, continuation, signal);
    signal.throwIfAborted();
    const command = await agentRequest(
      agent,
      {
        text: prompt,
        ...(continuation ? { continuation } : {}),
      },
      (command) =>
        lease.invoke({
          ...command,
          signal,
          deadlineMs: options.deadlineMs ?? executionDefaults.deadlineMs,
        }),
      (id) => {
        preparedConversation = id;
        notify(options.observe, {
          kind: "conversation",
          id,
          pass,
          at: new Date().toISOString(),
        });
      },
    );
    const result = await lease.invoke({
      ...command,
      signal,
      deadlineMs: options.deadlineMs ?? executionDefaults.deadlineMs,
      observe(channel, chunk) {
        if (channel === "stdout") {
          try {
            output.append(chunk);
          } catch (cause) {
            controller.abort(cause);
          }
        }
        if (channel === "stderr") stderr.append(chunk);
        watchdog.refresh(output.completed);
      },
    });
    commandCompleted = true;
    status = result.status;
    output.flush();
    if (status !== 0)
      throw new OutpostError("process", `Agent exited with status ${status}`, {
        ...result,
        conversation: output.conversation ?? preparedConversation,
      });
  } catch (cause) {
    const reason = stopReason(options.signal, controller.signal.reason, cause);
    if (reason)
      notify(options.observe, {
        kind: "stopped",
        reason,
        pass,
        at: new Date().toISOString(),
      });
    options.signal?.throwIfAborted();
    if (controller.signal.reason !== "completion") {
      const error =
        controller.signal.reason instanceof OutpostError
          ? controller.signal.reason
          : cause;
      if (
        error instanceof OutpostError &&
        error.code === "timeout" &&
        output.failure &&
        agentConnectionFailurePattern.test(output.failure)
      ) {
        const diagnosed = new OutpostError(
          error.code,
          `${error.message}. The agent reported a connection failure. Check the model endpoint and network access.`,
          { ...error.details, agentDiagnostic: "connection" },
          error,
        );
        diagnosed.recovery = error.recovery;
        throw diagnosed;
      }
      stderr.flush();
      throw quota.classify(error);
    }
    notify(
      options.warn,
      "Agent remained active after completion; its command was stopped and trailing output retained",
    );
  } finally {
    stderr.flush();
    watchdog.close();
    try {
      output.flush();
    } catch {
      commandCompleted = false;
    }
    await collectAgentUsage(
      lease,
      agent,
      output,
      options,
      pass,
      commandCompleted,
    );
  }
  options.signal?.throwIfAborted();
  let outcome: ReturnType<typeof output.result>;
  try {
    outcome = output.result();
  } catch (error) {
    throw quota.classify(error);
  }
  return {
    ...(preparedConversation ? { conversation: preparedConversation } : {}),
    ...outcome,
    status,
    durationMs: Date.now() - start,
  };
}
