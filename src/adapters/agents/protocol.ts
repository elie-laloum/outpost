export function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

export function numberOrZero(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

export function decodeRecord(
  line: string,
): Record<string, unknown> | undefined {
  try {
    return asRecord(JSON.parse(line));
  } catch {
    return undefined;
  }
}
