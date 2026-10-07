import { redactionReplacement } from "./redaction.constants.ts";

export function redactValue<T>(value: T, patterns: readonly RegExp[]): T {
  if (!patterns.length) return structuredClone(value);
  const rules = patterns.map((pattern) => {
    if (!(pattern instanceof RegExp))
      throw new Error("Redaction patterns must be regular expressions");
    return new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, "") + "g");
  });
  const seen = new WeakMap<object, unknown>();
  function text(value: string): string {
    const masked = rules.reduce(
      (result, pattern) => result.replace(pattern, () => redactionReplacement),
      value,
    );
    if (masked !== value || !/^[\[{]/.test(value.trim())) return masked;
    try {
      const parsed: unknown = JSON.parse(value);
      const cleaned = JSON.stringify(visit(parsed));
      return cleaned === JSON.stringify(parsed) ? value : cleaned;
    } catch {
      return masked;
    }
  }
  function visit(value: unknown): unknown {
    if (typeof value === "string") return text(value);
    if (!value || typeof value !== "object") return value;
    if (seen.has(value)) return seen.get(value);
    if (value instanceof Error) {
      const result = new Error(text(value.message));
      seen.set(value, result);
      result.name = text(value.name);
      if (value.stack) result.stack = text(value.stack);
      if (value.cause !== undefined) result.cause = visit(value.cause);
      return result;
    }
    if (value instanceof Date) return new Date(value);
    if (value instanceof RegExp) return new RegExp(value);
    if (value instanceof Map) {
      const result = new Map<unknown, unknown>();
      seen.set(value, result);
      for (const [key, item] of value) result.set(visit(key), visit(item));
      return result;
    }
    if (value instanceof Set) {
      const result = new Set<unknown>();
      seen.set(value, result);
      for (const item of value) result.add(visit(item));
      return result;
    }
    const result: unknown[] | Record<string, unknown> = Array.isArray(value)
      ? []
      : {};
    seen.set(value, result);
    for (const [key, item] of Object.entries(value))
      Object.defineProperty(result, text(key), {
        value: visit(item),
        enumerable: true,
        writable: true,
        configurable: true,
      });
    return result;
  }
  return visit(value) as T;
}
