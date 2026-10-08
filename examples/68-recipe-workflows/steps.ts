import type {
  LoopTaskContext,
  LoopCheckResult,
  WorkflowJson,
} from "../../dist/index.js";

export function summary(files: WorkflowJson) {
  if (!Array.isArray(files)) throw new Error("Expected a file list");
  return { files, count: files.length };
}
export function attempt(context: LoopTaskContext) {
  return { verified: context.round >= 2 };
}
export function check(
  _context: LoopTaskContext,
  result: unknown,
): LoopCheckResult {
  if (
    typeof result === "object" &&
    result !== null &&
    "verified" in result &&
    result.verified === true
  )
    return { done: true };
  return { done: false, feedback: "Verify once more" };
}
