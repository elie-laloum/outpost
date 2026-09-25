import { customTurn } from "./custom-turn.ts";
import type { Agent } from "../domain/agent.types.ts";
import { OutpostError } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { activityWatchdog } from "./activity-watchdog.ts";
import { agentOutput } from "./agent-output.ts";
import { executionDefaults } from "./execution.constants.ts";
import type { DispatchOptions, Turn } from "./execution.types.ts";
import { notify } from "./observation.ts";

export async function turn(
  lease: SandboxLease,
  agent: Agent,
  prompt: string,
  options: DispatchOptions<unknown>,
  continuation: DispatchOptions["continuation"],
  markers: readonly string[],
  pass: number,
): Promise<Turn> {
  if (agent.kind === "custom")
    return customTurn(lease, agent, prompt, options, pass);
  const start = Date.now();
  const controller = new AbortController();
  const signal = options.signal
    ? AbortSignal.any([options.signal, controller.signal])
    : controller.signal;
  const output = agentOutput(agent, options, markers, pass);
  const watchdog = activityWatchdog(controller, options, pass);
  watchdog.refresh(false);
  let status = 0;
  try {
    const command = agent.request({
      text: prompt,
      ...(continuation ? { continuation } : {}),
    });
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
        watchdog.refresh(output.completed);
      },
    });
    status = result.status;
    output.flush();
    if (status !== 0)
      throw new OutpostError("process", `Agent exited with status ${status}`, {
        ...result,
        conversation: output.conversation,
      });
  } catch (cause) {
    options.signal?.throwIfAborted();
    if (controller.signal.reason !== "completion")
      throw controller.signal.reason instanceof OutpostError
        ? controller.signal.reason
        : cause;
    notify(
      options.warn,
      "Agent remained active after completion; its command was stopped and trailing output retained",
    );
  } finally {
    watchdog.close();
  }
  return { ...output.result(), status, durationMs: Date.now() - start };
}
