import { triggerDeliveryPattern } from "./trigger.constants.ts";
import type { TriggerEvent } from "./trigger.types.ts";
import type { WorkflowJson } from "./workflow/checkpoint.types.ts";

export function triggerDelivery(value: unknown): string {
  if (typeof value !== "string" || !triggerDeliveryPattern.test(value))
    throw new Error("Trigger delivery identifier is missing or invalid");
  return value;
}

export function triggerEvent(event: TriggerEvent): TriggerEvent {
  if (typeof event.kind !== "string" || !event.kind)
    throw new Error("Trigger event kind is missing");
  return Object.freeze({ ...event, delivery: triggerDelivery(event.delivery) });
}

/** Reads a nested payload field without trusting the payload's shape. */
export function payloadField(
  payload: WorkflowJson | undefined,
  ...path: readonly string[]
): WorkflowJson | undefined {
  let value = payload;
  for (const key of path) {
    if (!value || typeof value !== "object" || Array.isArray(value))
      return undefined;
    value = Object.hasOwn(value, key) ? Reflect.get(value, key) : undefined;
  }
  return value;
}

export function payloadString(
  payload: WorkflowJson | undefined,
  ...path: readonly string[]
): string | undefined {
  const value = payloadField(payload, ...path);
  return typeof value === "string" && value ? value : undefined;
}

export function payloadNumber(
  payload: WorkflowJson | undefined,
  ...path: readonly string[]
): number | undefined {
  const value = payloadField(payload, ...path);
  return typeof value === "number" && Number.isSafeInteger(value)
    ? value
    : undefined;
}
