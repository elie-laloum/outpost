import { invariant } from "../domain/errors.ts";
import { speculationLimits } from "./speculation.constants.ts";
import type { SpeculationOptions } from "./speculation.types.ts";

export function validateSpeculationOptions<T>(options: SpeculationOptions<T>) {
  const { candidates } = options;
  invariant(
    options.select === undefined ||
      options.select === "first" ||
      options.select === "best",
    "Speculation select must be first or best",
  );
  invariant(
    options.select === "best"
      ? typeof options.score === "function"
      : options.score === undefined,
    "Speculation score requires select best, and select best requires score",
  );
  invariant(
    candidates.length > 0 && candidates.length <= speculationLimits.candidates,
    `Speculation requires 1 to ${speculationLimits.candidates} candidates`,
  );
  invariant(
    new Set(candidates.map((candidate) => candidate.key)).size ===
      candidates.length &&
      candidates.every((candidate) =>
        /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(candidate.key),
      ),
    "Speculative candidate keys must be unique simple names of 1 to 64 characters",
  );
  const concurrency = options.concurrency ?? speculationLimits.concurrency;
  invariant(
    Number.isSafeInteger(concurrency) &&
      concurrency > 0 &&
      concurrency <= speculationLimits.candidates,
    `Speculation concurrency must be 1 to ${speculationLimits.candidates}`,
  );
  const cleanupMs = options.cleanupMs ?? speculationLimits.cleanupMs;
  invariant(
    Number.isSafeInteger(cleanupMs) &&
      cleanupMs > 0 &&
      cleanupMs <= 2_147_483_647,
    "Speculation cleanupMs must be a positive timer duration",
  );
  if (options.durability) {
    invariant(
      !!options.durability.version.trim(),
      "Speculation durability version must not be empty",
    );
    invariant(
      !!options.sandboxProvider.recover,
      "Sandbox provider does not support durable speculation recovery",
    );
  }
  return { concurrency, cleanupMs };
}
