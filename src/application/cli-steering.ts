import { PassThrough } from "node:stream";
import type { AgentAdapter, AgentLiveInput } from "../domain/agent.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { steeringInbox } from "../domain/steering.ts";
import type { SteeringInbox } from "../domain/steering.types.ts";
import type { CliSteering, CliTurnState } from "./cli-steering.types.ts";
import type { DispatchOptions } from "./execution.types.ts";
import { deliverSteering } from "./steering-scope.ts";

const inactive = Object.freeze<CliSteering>({
  liveInput: false,
  command: (command) => command,
  observe: () => undefined,
  start: () => undefined,
  close: () => undefined,
});

/** Selects how a CLI turn receives steering: live stdin, or interruption before resuming. */
export function cliSteering(
  agent: AgentAdapter,
  lease: SandboxLease,
  options: DispatchOptions<unknown>,
  pass: number,
  state: CliTurnState,
): CliSteering {
  const inbox = steeringInbox(options.steering);
  if (!inbox) return inactive;
  if (agent.liveInput && lease.liveInput)
    return liveSteering(agent.liveInput, inbox, options, pass);
  if (agent.resumable !== false) return interruptingSteering(inbox, state);
  return inactive;
}

function liveSteering(
  protocol: AgentLiveInput,
  inbox: SteeringInbox,
  options: DispatchOptions<unknown>,
  pass: number,
): CliSteering {
  const input = new PassThrough();
  let written = 1,
    consumed = 0,
    open = true;
  let unsubscribe: () => void = () => undefined;
  const end = () => {
    if (!open) return;
    open = false;
    input.end();
  };
  const flush = () => {
    if (!open) return;
    const messages = inbox.take();
    for (const message of messages) input.write(protocol.encode(message.text));
    written += messages.length;
    deliverSteering(messages, "injected", pass, options.observe);
  };
  return {
    liveInput: true,
    command: (command) => ({ ...command, input }),
    start() {
      unsubscribe = inbox.subscribe(flush);
      flush();
    },
    observe(event) {
      if (
        event.kind === "raw" &&
        typeof event.value === "string" &&
        !event.truncated &&
        protocol.consumed(event.value)
      )
        consumed++;
      // The agent keeps reading stdin after a turn; close it once every message was consumed.
      if (event.kind === "failure") end();
      if (event.kind === "finished" && consumed >= written) end();
    },
    close() {
      unsubscribe();
      end();
    },
  };
}

function interruptingSteering(
  inbox: SteeringInbox,
  state: CliTurnState,
): CliSteering {
  let requested = false;
  let unsubscribe: () => void = () => undefined;
  const attempt = () => {
    if (requested && !state.completed() && state.conversation())
      state.interrupt();
  };
  const request = () => {
    if (!inbox.size) return;
    requested = true;
    attempt();
  };
  return {
    liveInput: false,
    command: (command) => command,
    start() {
      unsubscribe = inbox.subscribe(request);
      request();
    },
    observe(event) {
      if (event.kind === "conversation") attempt();
    },
    close() {
      unsubscribe();
    },
  };
}
