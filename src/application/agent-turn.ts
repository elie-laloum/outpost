import { agentRequest } from "./agent-request.ts";
import { boundedLines } from "./output-lines.ts";
import { stopReason } from "./stop-reason.ts";
import { customTurn } from "./custom-turn.ts";
import type { Agent } from "../domain/agent.types.ts";
import { OutpostError } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { activityWatchdog } from "./activity-watchdog.ts";
import { agentOutput } from "./agent-output.ts";
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
  const start = Date.now();
  const controller = new AbortController();
  const signal = options.signal
    ? AbortSignal.any([options.signal, controller.signal])
    : controller.signal;
  const output = agentOutput(agent, options, markers, pass);
  const watchdog = activityWatchdog(controller, options, pass);
  watchdog.refresh(false);
  const stderr = boundedLines((text, truncated) =>
    notify(options.observe, {
      kind: "stderr",
      text,
      truncated,
      pass,
      at: new Date().toISOString(),
    }),
  );
  let status = 0;
  let preparedConversation: string | undefined;
  try {
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
      throw error;
    }
    notify(
      options.warn,
      "Agent remained active after completion; its command was stopped and trailing output retained",
    );
  } finally {
    stderr.flush();
    if (controller.signal.reason === "completion") output.flush();
    watchdog.close();
  }
  return {
    ...(preparedConversation ? { conversation: preparedConversation } : {}),
    ...output.result(),
    status,
    durationMs: Date.now() - start,
  };
}
