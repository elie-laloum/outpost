import { invariant, OutpostError, positive } from "../domain/errors.ts";
import { secretNames, secretValue } from "../domain/secrets.ts";
import {
  SECRET_MAX_TIMEOUT_MS,
  SECRET_TIMEOUT_MS,
} from "../domain/secrets.constants.ts";
import type {
  FromSecretsOptions,
  SecretSource,
} from "../domain/secrets.types.ts";

export async function fromSecrets(
  source: SecretSource,
  names: readonly string[],
  options: FromSecretsOptions = {},
): Promise<Readonly<Record<string, string>>> {
  invariant(
    source &&
      typeof source.name === "string" &&
      source.name.trim() &&
      typeof source.resolve === "function",
    "Secret source must have a name and resolve method",
  );
  const selected = secretNames(names);
  const timeoutMs = positive(
    options.timeoutMs ?? SECRET_TIMEOUT_MS,
    "Secret timeoutMs",
  );
  invariant(
    timeoutMs <= SECRET_MAX_TIMEOUT_MS,
    "Secret timeoutMs exceeds the supported timer range",
  );
  if (options.signal?.aborted)
    throw new OutpostError("aborted", "Secret resolution was cancelled");
  if (!selected.length) return Object.freeze({});
  const deadline = new AbortController();
  const signal = options.signal
    ? AbortSignal.any([options.signal, deadline.signal])
    : deadline.signal;
  const timer = setTimeout(() => deadline.abort(), timeoutMs);
  let onAbort: (() => void) | undefined;
  let values: Readonly<Record<string, string | undefined>>;
  try {
    const stopped = new Promise<never>((_, reject) => {
      onAbort = () => reject(new Error("Secret resolution stopped"));
      signal.addEventListener("abort", onAbort, { once: true });
    });
    values = await Promise.race([
      source.resolve(selected, { signal }),
      stopped,
    ]);
    signal.throwIfAborted();
  } catch (error) {
    if (signal.aborted)
      throw new OutpostError(
        options.signal?.aborted ? "aborted" : "timeout",
        options.signal?.aborted
          ? "Secret resolution was cancelled"
          : "Secret resolution timed out",
      );
    // Vendor exceptions can contain tokens, request headers or secret payloads.
    if (error instanceof OutpostError && error.code === "configuration")
      throw new OutpostError(
        "configuration",
        "Invalid secret source configuration",
      );
    throw new OutpostError("provider", "Secret resolution failed");
  } finally {
    clearTimeout(timer);
    if (onAbort) signal.removeEventListener("abort", onAbort);
  }
  if (!values || typeof values !== "object" || Array.isArray(values))
    throw new OutpostError(
      "provider",
      "Secret source returned an invalid result",
    );
  const entries = selected.map((name) => {
    let property: PropertyDescriptor | undefined;
    try {
      property = Object.getOwnPropertyDescriptor(values, name);
    } catch {
      throw new OutpostError(
        "provider",
        "Secret source returned an invalid result",
      );
    }
    if (property && !("value" in property))
      throw new OutpostError(
        "provider",
        "Secret source must return data properties",
      );
    if (!property || property.value === undefined)
      throw new OutpostError("provider", `Missing declared secret: ${name}`);
    return [name, secretValue(property.value)] as const;
  });
  return Object.freeze(Object.fromEntries(entries));
}
