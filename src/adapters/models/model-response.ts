import { OutpostError } from "../../domain/errors.ts";
import type {
  ModelContentBlock,
  ModelResult,
  ModelStopReason,
} from "../../domain/model.types.ts";

export function requireResponse(condition: unknown): asserts condition {
  if (!condition)
    throw new OutpostError("response", "Invalid or unsupported model response");
}

export function object(value: unknown): Record<string, unknown> {
  requireResponse(
    value !== null && typeof value === "object" && !Array.isArray(value),
  );
  return value as Record<string, unknown>;
}

export function tokens(value: unknown): number {
  requireResponse(
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0,
  );
  return value;
}

export function stopReason(
  reasons: Readonly<Record<string, ModelStopReason>>,
  value: unknown,
): ModelStopReason {
  requireResponse(typeof value === "string" && Object.hasOwn(reasons, value));
  return reasons[value]!;
}

export function toolInput(value: unknown): unknown {
  if (typeof value !== "string") return object(value);
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function modelResult(
  content: readonly ModelContentBlock[],
  reason: ModelStopReason,
  usage: ModelResult["usage"],
): ModelResult {
  const calls = content.filter((block) => block.type === "tool-call").length;
  const texts = content.flatMap((block) =>
    block.type === "text" ? [block.text] : [],
  );
  const normalized = reason === "end" && calls > 0 ? "tool-calls" : reason;
  requireResponse(normalized !== "tool-calls" || calls > 0);
  requireResponse(normalized !== "end" || texts.length > 0);
  return {
    text: texts.join(""),
    content,
    stopReason: normalized,
    ...(usage ? { usage } : {}),
  };
}
