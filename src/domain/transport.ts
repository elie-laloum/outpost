import {
  transportKeyMaxLength,
  transportSegmentPattern,
} from "./transport.constants.ts";

export class TransportConflict extends Error {
  readonly key: string;
  constructor(key: string) {
    super(`Transport revision conflict: ${key}`);
    this.name = "TransportConflict";
    this.key = key;
  }
}

export function transportKey(key: string): string {
  if (
    !key ||
    key.length > transportKeyMaxLength ||
    key.split("/").some((part) => !transportSegmentPattern.test(part))
  )
    throw new Error("Invalid transport key");
  return key;
}

export function transportCondition(
  value: unknown,
): asserts value is string | null {
  if (value !== null && (typeof value !== "string" || !value.trim()))
    throw new Error(
      "A transport mutation requires an explicit revision condition",
    );
}
