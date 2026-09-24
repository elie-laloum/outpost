import { visitAgentEvent } from "../domain/agent-events.ts";
import type { AgentAdapter, Usage } from "../domain/agent.types.ts";
import { OutpostError } from "../domain/errors.ts";
import { addUsage } from "../domain/usage.ts";
import { executionDefaults } from "./execution.constants.ts";
import type { AgentOutput, DispatchOptions } from "./execution.types.ts";
import { notify } from "./observation.ts";

export function agentOutput(
  agent: AgentAdapter,
  options: DispatchOptions<unknown>,
  markers: readonly string[],
  pass: number,
): AgentOutput {
  let pending = "",
    text = "",
    rawTail = "";
  let finalText: string | undefined,
    conversation: string | undefined,
    failure: string | undefined;
  let usage: Usage = { input: 0, cached: 0, output: 0 };
  let completed = false,
    finished = false;
  const handlers: import("../domain/agent.types.ts").AgentEventHandlers = {
    text: (event) => {
      text += event.text;
    },
    result: (event) => {
      finalText = event.text;
    },
    conversation: (event) => {
      conversation = event.id;
    },
    finished: () => {
      finished = true;
    },
    failure: (event) => {
      failure = event.message;
    },
    usage: (event) => {
      usage = addUsage(usage, event.tokens);
    },
  };
  function consume(line: string): void {
    const at = new Date().toISOString();
    notify(options.observe, { kind: "raw", value: line, pass, at });
    for (const event of agent.events(line)) {
      visitAgentEvent(event, handlers);
      if (event.kind !== "raw") notify(options.observe, { ...event, pass, at });
    }
    completed =
      (!agent.requiresFinishedEvent || finished) &&
      markers.some((marker) => (finalText ?? text).includes(marker));
  }
  return {
    get completed() {
      return completed;
    },
    get conversation() {
      return conversation;
    },
    append(chunk) {
      rawTail = (rawTail + chunk).slice(-executionDefaults.rawTailBytes);
      pending += chunk;
      let end: number;
      while ((end = pending.indexOf("\n")) >= 0) {
        consume(pending.slice(0, end));
        pending = pending.slice(end + 1);
      }
      if (pending.length > executionDefaults.eventBytes)
        throw new OutpostError("process", "Agent emitted an oversized event");
    },
    flush() {
      if (pending) consume(pending);
      pending = "";
    },
    result() {
      if (failure) throw new OutpostError("process", failure, { conversation });
      if (agent.requiresFinishedEvent && !finished)
        throw new OutpostError(
          "process",
          "Agent exited without a successful final event",
          { conversation },
        );
      return {
        text: finalText ?? (text || rawTail),
        usage,
        ...(conversation ? { conversation } : {}),
      };
    },
  };
}
