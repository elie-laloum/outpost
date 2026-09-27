import { asRecord, decodeRecord } from "../../src/adapters/agents/protocol.ts";
import type { CommandResult } from "../../src/domain/command.types.ts";
import {
  cloudFailurePatterns,
  cloudHttpFailures,
  cloudStageCategories,
} from "./cloud-failure.constants.ts";
import type {
  CompatibilityCategory,
  CompatibilityCheck,
  CompatibilityFailureReason,
  CompatibilityStage,
} from "./cloud-compatibility.types.ts";

function reasonFor(
  value: unknown,
  depth = 0,
): CompatibilityFailureReason | undefined {
  if (depth > 5) return undefined;
  if (typeof value === "string") {
    return cloudFailurePatterns.find((rule) => rule.pattern.test(value))
      ?.reason;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const reason = reasonFor(entry, depth + 1);
      if (reason) return reason;
    }
    return undefined;
  }
  if (value === null || typeof value !== "object") return undefined;
  const data = asRecord(value);
  const code = reasonFor(data.code, depth + 1);
  if (code) return code;
  const status =
    data.statusCode ?? data.status ?? asRecord(data.response).status;
  for (const [httpStatus, reason] of Object.entries(cloudHttpFailures)) {
    if (status === Number(httpStatus)) return reason;
  }
  for (const key of ["error", "cause", "errors", "message", "name", "type"]) {
    const reason = reasonFor(data[key], depth + 1);
    if (reason) return reason;
  }
  return undefined;
}

export class CloudCheckError extends Error {
  readonly check: CompatibilityCheck;

  constructor(name: string, category: CompatibilityCategory, cause: unknown) {
    const reason = reasonFor(cause) ?? "contract-failed";
    super(`${name}: ${reason}`, { cause });
    this.check = {
      name,
      status: "fail",
      category: reason === "network-unreachable" ? "network" : category,
      reason,
    };
    if (reason === "authentication-rejected" && category === "model-access")
      this.check = { ...this.check, category: "agent-authentication" };
  }
}

export function cloudFailure(
  cause: unknown,
  stage: CompatibilityStage,
  expired = false,
): CompatibilityCheck {
  const check =
    cause instanceof CloudCheckError
      ? cause.check
      : new CloudCheckError(stage, cloudStageCategories[stage], cause).check;
  return expired ? { ...check, reason: "deadline-exceeded" } : check;
}

export function cloudCommandFailure(
  name: string,
  category: CompatibilityCategory,
  result: CommandResult,
): CloudCheckError {
  const output = `${result.stdout}\n${result.stderr}`;
  const records = output.split(/\r?\n/).map((line) => decodeRecord(line));
  return new CloudCheckError(name, category, [...records, output]);
}
