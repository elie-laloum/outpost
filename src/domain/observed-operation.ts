import { randomUUID } from "node:crypto";
import type { ObservationHub, ObservationSource } from "./observation.types.ts";

export async function observedOperation<T>(
  hub: ObservationHub | undefined,
  source: ObservationSource,
  name: string,
  action: () => Promise<T>,
): Promise<T> {
  if (!hub) return action();
  const id = randomUUID();
  const started = performance.now();
  hub.emit(source, { kind: "operation", id, name, status: "started" });
  try {
    const result = await action();
    hub.emit(source, {
      kind: "operation",
      id,
      name,
      status: "finished",
      durationMs: performance.now() - started,
    });
    return result;
  } catch (error) {
    hub.emit(source, {
      kind: "operation",
      id,
      name,
      status: "failed",
      durationMs: performance.now() - started,
    });
    throw error;
  }
}
