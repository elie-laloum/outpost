import { PassThrough } from "node:stream";
import { OutpostError } from "../domain/errors.ts";
import { observeInputFailure } from "../infrastructure/input-failure.ts";
import type {
  AgentAdapter,
  AgentLiveInput,
  AgentLiveSession,
} from "../domain/agent.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { mainLoopSteering, steeringInbox } from "../domain/steering.ts";
import type {
  PendingSteeringMessage,
  SteeringInbox,
} from "../domain/steering.types.ts";
import type { CliSteering, CliTurnState } from "./cli-steering.types.ts";
import type { DispatchOptions } from "./execution.types.ts";
import { deliverSteering, rejectSubagentSteering } from "./steering-scope.ts";

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
  const pending: PendingSteeringMessage[] = [];
  let finished = false;
  let failed: OutpostError | undefined;
  const rejectMessage = (
    message: PendingSteeringMessage,
    error: OutpostError,
  ) =>
    message.reject(
      new OutpostError(
        "steering",
        error.message,
        { text: message.text },
        error,
      ),
    );
  const reject = (error: OutpostError) => {
    for (const message of pending.splice(0)) rejectMessage(message, error);
  };
  const stopObserving = observeInputFailure(input, (error) => {
    failed = error;
    reject(error);
    if (finished) end();
  });
  let session: AgentLiveSession | undefined;
  let written = 1,
    consumed = 0,
    open = true;
  let unsubscribe: () => void = () => undefined;
  const write = (data: string) => {
    if (open && data) input.write(data);
  };
  const end = () => {
    if (!open) return;
    open = false;
    input.end();
  };
  const flush = () => {
    if (options.steering?.state === "closed") {
      reject(
        new OutpostError(
          "steering",
          "Steering was closed before live input was acknowledged",
        ),
      );
      return;
    }
    rejectSubagentSteering(inbox);
    if (!open || !session) return;
    const messages = inbox.take(mainLoopSteering);
    if (failed) {
      for (const message of messages) rejectMessage(message, failed);
      return;
    }
    pending.push(...messages);
    for (const message of messages) write(session.encode(message.text));
    written += messages.length;
  };
  return {
    liveInput: true,
    command: (command) => ({ ...command, input }),
    start(request) {
      session = protocol.open(request);
      unsubscribe = inbox.subscribe(flush);
      flush();
    },
    observe(event) {
      if (event.kind === "finished") finished = true;
      if (
        session &&
        event.kind === "raw" &&
        typeof event.value === "string" &&
        !event.truncated
      ) {
        const read = session.read(event.value);
        const acknowledged = Math.max(
          0,
          consumed + read.consumed - Math.max(consumed, 1),
        );
        consumed += read.consumed;
        deliverSteering(
          pending.splice(0, acknowledged),
          "injected",
          pass,
          options.observe,
        );
        for (const reply of read.replies) write(reply);
      }
      // The agent keeps reading stdin after a turn; close it once every message was consumed.
      if (event.kind === "failure") end();
      if (event.kind === "finished" && (failed || consumed >= written)) end();
    },
    close() {
      unsubscribe();
      stopObserving();
      reject(
        new OutpostError(
          "steering",
          "The turn ended before live input was acknowledged",
        ),
      );
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
    rejectSubagentSteering(inbox);
    if (!inbox.count(mainLoopSteering)) return;
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
