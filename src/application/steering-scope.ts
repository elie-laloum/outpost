import { AsyncLocalStorage } from "node:async_hooks";
import { steeringChannel } from "../domain/steering.ts";
import type {
  Steering,
  SteeringMessage,
  SteeringMode,
} from "../domain/steering.types.ts";
import type { DispatchOptions } from "./execution.types.ts";
import { notify } from "./observation.ts";

const attached = new AsyncLocalStorage<Steering>();

/** Attaches steering for the outermost dispatch; nested dispatch layers share it. */
export async function steeringScope<T>(
  steering: Steering | undefined,
  action: () => Promise<T>,
): Promise<T> {
  if (!steering || attached.getStore() === steering) return action();
  const release = steeringChannel(steering).open();
  try {
    return await attached.run(steering, action);
  } finally {
    release();
  }
}

export function deliverSteering(
  messages: readonly SteeringMessage[],
  mode: SteeringMode,
  pass: number,
  observe: DispatchOptions["observe"],
): void {
  for (const message of messages) {
    notify(observe, {
      kind: "steer",
      text: message.text,
      mode,
      pass,
      at: new Date().toISOString(),
    });
    message.deliver({ mode });
  }
}
