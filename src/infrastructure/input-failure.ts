import type { Readable } from "node:stream";
import { OutpostError } from "../domain/errors.ts";

const handlers = new WeakMap<Readable, (error: OutpostError) => void>();

export function observeInputFailure(
  input: Readable,
  handler: (error: OutpostError) => void,
): () => void {
  handlers.set(input, handler);
  return () => handlers.delete(input);
}

export function reportInputFailure(input: Readable, cause: unknown): boolean {
  const handler = handlers.get(input);
  if (!handler) return false;
  handler(
    new OutpostError(
      "steering",
      "Live input delivery could not be confirmed",
      {},
      cause,
    ),
  );
  return true;
}
