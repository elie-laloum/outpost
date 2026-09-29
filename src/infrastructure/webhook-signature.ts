import { createHmac, timingSafeEqual } from "node:crypto";
import type { BinaryLike } from "node:crypto";
import type { TriggerSecret } from "../domain/trigger.types.ts";

export function webhookSecret(secret: TriggerSecret, name: string) {
  if (typeof secret === "string" && !secret)
    throw new Error(`${name} secret must not be empty`);
  if (typeof secret !== "string" && typeof secret !== "function")
    throw new Error(`${name} secret must be a string or a callback`);
  return async (): Promise<readonly string[]> => {
    const values = typeof secret === "string" ? [secret] : await secret();
    if (
      !Array.isArray(values) ||
      !values.length ||
      values.some((value) => typeof value !== "string" || !value)
    )
      throw new Error(`${name} secret source returned no usable secret`);
    return values;
  };
}

export function sameBytes(left: Buffer, right: Buffer): boolean {
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Compares every candidate without stopping early, so timing does not reveal which key matched. */
export function signatureMatches(
  keys: readonly BinaryLike[],
  content: readonly BinaryLike[],
  expected: readonly Buffer[],
): boolean {
  let matched = false;
  for (const key of keys) {
    const hmac = createHmac("sha256", key);
    for (const part of content) hmac.update(part);
    const digest = hmac.digest();
    for (const signature of expected)
      matched = sameBytes(digest, signature) || matched;
  }
  return matched;
}

export function header(
  headers: Readonly<Record<string, string | undefined>>,
  name: string,
): string {
  const value = headers[name];
  if (!value) throw new Error(`Missing ${name} header`);
  return value;
}

export function timestampWithin(
  seconds: string,
  now: number,
  toleranceMs: number,
): void {
  const value = /^\d{1,12}$/.test(seconds) ? Number(seconds) * 1000 : NaN;
  if (!(Math.abs(now - value) <= toleranceMs))
    throw new Error("Webhook timestamp is outside the accepted window");
}
