import { invariant, OutpostError } from "./errors.ts";
import type {
  PendingSteeringMessage,
  Steering,
  SteeringChannel,
  SteeringDelivery,
  SteeringInbox,
  SteeringState,
} from "./steering.types.ts";

export type {
  Steering,
  SteeringDelivery,
  SteeringMode,
  SteeringState,
} from "./steering.types.ts";

const channels = new WeakMap<Steering, SteeringChannel>();

/** Creates a controller that sends instructions to a running dispatch. */
export function createSteering(): Steering {
  let state: SteeringState = "idle";
  let pending: PendingSteeringMessage[] = [];
  const listeners = new Set<() => void>();
  const rejectPending = (message: string) => {
    const undelivered = pending;
    pending = [];
    for (const entry of undelivered)
      entry.reject(new OutpostError("steering", message, { text: entry.text }));
  };
  const inbox: SteeringInbox = {
    get size() {
      return pending.length;
    },
    take() {
      const taken = pending;
      pending = [];
      return taken;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  const steering: Steering = Object.freeze({
    get state() {
      return state;
    },
    send(text: string): Promise<SteeringDelivery> {
      if (typeof text !== "string" || !text.trim())
        return Promise.reject(
          new OutpostError(
            "configuration",
            "Steering text must be a nonempty string",
          ),
        );
      if (state === "closed")
        return Promise.reject(
          new OutpostError("steering", "Steering is closed", { text }),
        );
      return new Promise<SteeringDelivery>((resolve, reject) => {
        pending.push({
          text,
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
