import { invariant, OutpostError } from "./errors.ts";
import type {
  PendingSteeringMessage,
  Steering,
  SteeringChannel,
  SteeringDelivery,
  SteeringFilter,
  SteeringInbox,
  SteeringSendOptions,
  SteeringState,
} from "./steering.types.ts";

export type {
  Steering,
  SteeringDelivery,
  SteeringMode,
  SteeringSendOptions,
  SteeringState,
} from "./steering.types.ts";

/** Messages any loop may take: untargeted or for the main loop. */
export const mainLoopSteering: SteeringFilter = (message) =>
  message.subagent === undefined || message.subagent === null;

/** Messages targeting a built-in subagent run. */
export const subagentSteering: SteeringFilter = (message) =>
  typeof message.subagent === "string";

const channels = new WeakMap<Steering, SteeringChannel>();

/** Creates a controller that sends instructions to a running dispatch. */
export function createSteering(): Steering {
  let state: SteeringState = "idle";
  let pending: PendingSteeringMessage[] = [];
  const listeners = new Set<() => void>();
  const all: SteeringFilter = () => true;
  const take = (accept: SteeringFilter) => {
    const taken = pending.filter(accept);
    pending = pending.filter((entry) => !accept(entry));
    return taken;
  };
  const rejectPending = (message: string, accept = all) => {
    for (const entry of take(accept))
      entry.reject(
        new OutpostError("steering", message, {
          text: entry.text,
          ...(entry.subagent === undefined ? {} : { subagent: entry.subagent }),
        }),
      );
  };
  const inbox: SteeringInbox = {
    count: (accept = all) => pending.filter(accept).length,
    take: (accept = all) => take(accept),
    reject: (accept, reason) => rejectPending(reason, accept),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  const steering: Steering = Object.freeze({
    get state() {
      return state;
    },
    send(
      text: string,
      options: SteeringSendOptions = {},
    ): Promise<SteeringDelivery> {
      if (typeof text !== "string" || !text.trim())
        return Promise.reject(
          new OutpostError(
            "configuration",
            "Steering text must be a nonempty string",
          ),
        );
      const subagent = options.subagent;
      if (
        subagent !== undefined &&
        subagent !== null &&
        (typeof subagent !== "string" || !subagent)
      )
        return Promise.reject(
          new OutpostError(
            "configuration",
            "Steering subagent must be a subagent run id or null",
          ),
        );
      if (state === "closed")
        return Promise.reject(
          new OutpostError("steering", "Steering is closed", { text }),
        );
      return new Promise<SteeringDelivery>((resolve, reject) => {
        pending.push({
          text,
          ...(subagent === undefined ? {} : { subagent }),
          deliver: (delivery) => resolve(Object.freeze({ ...delivery })),
          reject,
        });
        for (const listener of [...listeners]) listener();
      });
    },
    close() {
      state = "closed";
      rejectPending("Steering was closed before the message was delivered");
    },
  });
  channels.set(steering, {
    inbox,
    open() {
      invariant(state !== "closed", "Steering is closed");
      invariant(
        state === "idle",
        "Steering is already attached to a running dispatch",
      );
      state = "active";
      return () => {
        if (state !== "active") return;
        state = "idle";
        rejectPending("The dispatch ended before the message was delivered");
      };
    },
  });
  return steering;
}

export function steeringChannel(steering: Steering): SteeringChannel {
  const channel = channels.get(steering);
  invariant(channel, "steering must be created by createSteering()");
  return channel;
}

export function steeringInbox(
  steering: Steering | undefined,
): SteeringInbox | undefined {
  return steering ? steeringChannel(steering).inbox : undefined;
}
