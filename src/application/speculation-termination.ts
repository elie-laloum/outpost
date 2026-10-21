import { terminationCode } from "../domain/termination.ts";
import type { TerminationCode } from "../domain/termination.types.ts";
import type { SpeculationResult } from "./speculation.types.ts";

export function speculationTerminationCode(
  status: SpeculationResult["status"],
  error?: unknown,
  saved?: TerminationCode,
): TerminationCode | undefined {
  if (status === "aborted") return "aborted";
  if (status === "quota") return "quota";
  if (status !== "budget-exhausted") return undefined;
  return saved ?? (error === undefined ? "limit" : terminationCode(error));
}

export function validSpeculationTermination(
  status: unknown,
  code: unknown,
): boolean {
  if (code === undefined) return true;
  if (status === "aborted") return code === "aborted";
  if (status === "quota") return code === "quota";
  if (status === "budget-exhausted")
    return code === "limit" || code === "usage-unavailable";
  return false;
}
