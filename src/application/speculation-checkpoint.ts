import { validateUsage } from "../domain/usage.ts";
import { createHash } from "node:crypto";
import { realpath } from "node:fs/promises";
import { checkpointValue } from "../domain/workflow/checkpoint-value.ts";
import type { WorkflowJson } from "../domain/workflow/checkpoint.types.ts";
import type { SpeculationOptions } from "./speculation.types.ts";
import type { SpeculationCheckpoint } from "./speculation-checkpoint.types.ts";

export async function speculationIdentity<T>(
  options: SpeculationOptions<T>,
): Promise<string> {
  return createHash("sha256")
    .update(
      JSON.stringify({
        repository: await realpath(options.repository),
        version: options.durability?.version,
        provider: options.sandboxProvider.name,
        placement: options.sandboxProvider.placement,
        candidates: options.candidates.map(({ key, request }) => ({
          key,
          brief: request.brief,
          response: request.response?.tag,
        })),
        budget: options.budget,
        ...(options.select === "best" ? { select: "best" } : {}),
      }),
    )
    .digest("hex");
}
function diagnostic(value: unknown): string {
  try {
    return String(value);
  } catch {
    return "Unprintable speculation error";
  }
}

export function encodeSpeculation<T>(
  state: SpeculationCheckpoint<T>,
): WorkflowJson {
  for (const attempt of state.attempts)
    if (attempt.record?.result) checkpointValue(attempt.record.result.value);
  const encoded: unknown = JSON.parse(
    JSON.stringify({
      ...state,
      attempts: state.attempts.map((attempt) => ({
        ...attempt,
        ...(attempt.record
          ? {
              record: {
                ...attempt.record,
                ...(attempt.record.error !== undefined
                  ? { error: diagnostic(attempt.record.error) }
                  : {}),
                ...(attempt.record.result
                  ? {
                      result: {
                        ...attempt.record.result,
                        ...(attempt.record.result.observerErrors
                          ? {
                              observerErrors:
                                attempt.record.result.observerErrors.map(
                                  diagnostic,
                                ),
                            }
                          : {}),
                      },
                    }
                  : {}),
              },
            }
          : {}),
      })),
    }),
  );
  const value = checkpointValue(encoded);
  if (value.kind !== "json") throw new Error("Missing speculation state");
  return value.value;
}
function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function integer(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}
function usage(value: unknown): boolean {
  if (
    !object(value) ||
    !["input", "cached", "output"].every((key) => integer(value[key]))
  )
    return false;
  try {
    validateUsage(value);
    return true;
  } catch {
    return false;
  }
}

function output(value: unknown): boolean {
  if (
    !object(value) ||
    typeof value.text !== "string" ||
    typeof value.completed !== "boolean" ||
    !usage(value.usage) ||
    typeof value.branch !== "string" ||
    typeof value.directory !== "string" ||
    !Array.isArray(value.turns) ||
    !Array.isArray(value.commits)
  )
    return false;
  if (
    !value.turns.every(
      (turn) =>
        object(turn) &&
        typeof turn.text === "string" &&
        integer(turn.status) &&
        typeof turn.durationMs === "number" &&
        usage(turn.usage),
    )
  )
    return false;
  if (
    !value.commits.every(
      (commit) =>
        object(commit) &&
        typeof commit.oid === "string" &&
        typeof commit.subject === "string",
    )
  )
    return false;
  for (const key of [
    "conversation",
    "completion",
    "transcript",
    "retainedDirectory",
  ])
    if (value[key] !== undefined && typeof value[key] !== "string")
      return false;
  for (const key of ["logReference", "transcriptReference"]) {
    const reference = value[key];
    if (
      reference !== undefined &&
      (!object(reference) ||
        typeof reference.key !== "string" ||
        typeof reference.revision !== "string")
    )
      return false;
  }
  return true;
}
export function validateSpeculation<T>(
  value: unknown,
  identity: string,
  keys: readonly string[],
  select: SpeculationOptions<T>["select"] = "first",
): asserts value is SpeculationCheckpoint<T> {
  const invalid = () =>
    new Error("Invalid or incompatible speculation checkpoint");
  if (
    !object(value) ||
    value.format !== 1 ||
    value.identity !== identity ||
    typeof value.id !== "string" ||
    !/^[a-f0-9-]{36}$/.test(value.id) ||
    typeof value.finished !== "boolean" ||
    !object(value.before) ||
    typeof value.before.head !== "string" ||
    !/^[a-f0-9]{40,64}$/.test(value.before.head) ||
    typeof value.before.branch !== "string" ||
    typeof value.before.fingerprint !== "string" ||
    typeof value.before.dirty !== "boolean" ||
    !Array.isArray(value.attempts) ||
    !object(value.usage) ||
    !integer(value.usage.attempts) ||
    !usage(value.usage.tokens)
  )
    throw invalid();
  if (
    value.status !== undefined &&
    !["winner", "no-winner", "quota", "aborted", "budget-exhausted"].includes(
      String(value.status),
    )
  )
    throw invalid();
  if (value.error !== undefined && typeof value.error !== "string")
    throw invalid();
  const attempts = new Map<string, number>();
  let admitted = 0,
    winners = 0;
  for (const item of value.attempts) {
    if (
      !object(item) ||
      typeof item.key !== "string" ||
      !keys.includes(item.key) ||
      !integer(item.attempt) ||
      item.attempt !== (attempts.get(item.key) ?? 0) + 1 ||
      item.branch !==
        `outpost/speculation/${value.id}/${item.key}/${item.attempt}` ||
      !["waiting", "running", "validated", "settled"].includes(
        String(item.phase),
      ) ||
      !["pending", "done"].includes(String(item.cleanup))
    )
      throw invalid();
    attempts.set(item.key, item.attempt);
    if (item.phase !== "waiting") admitted++;
    for (const key of ["resourceId", "directory"])
      if (item[key] !== undefined && typeof item[key] !== "string")
        throw invalid();
    if (item.accepted !== undefined && typeof item.accepted !== "boolean")
      throw invalid();
    if (item.phase === "validated" && typeof item.accepted !== "boolean")
      throw invalid();
    const record = item.record;
    if (record !== undefined) {
      if (
        !object(record) ||
        record.key !== item.key ||
        record.branch !== item.branch ||
        ![
          "winner",
          "rejected",
          "failed",
          "quota",
          "cancelled",
          "skipped",
        ].includes(String(record.status)) ||
        (record.status === "quota") !== (record.quota !== undefined)
      )
        throw invalid();
      if (record.quota !== undefined) {
        const quota = record.quota;
        if (
          !object(quota) ||
          typeof quota.message !== "string" ||
          (quota.resetAt !== undefined &&
            (typeof quota.resetAt !== "string" ||
              !Number.isFinite(Date.parse(quota.resetAt))))
        )
          throw invalid();
      }
      if (record.status === "winner") {
        if (
          item.phase !== "settled" ||
          item.accepted !== true ||
          !record.result ||
          typeof record.commit !== "string" ||
          !/^[a-f0-9]{40,64}$/.test(record.commit)
        )
          throw invalid();
        winners++;
      }
      if (record.attempt !== undefined && record.attempt !== item.attempt)
        throw invalid();
      if (
        record.score !== undefined &&
        (typeof record.score !== "number" || !Number.isFinite(record.score))
      )
        throw invalid();
      if (
        select === "best" &&
        item.accepted === true &&
        ["winner", "rejected"].includes(String(record.status)) &&
        record.score === undefined
      )
        throw invalid();
      if (record.cleanup !== undefined && record.cleanup !== item.cleanup)
        throw invalid();
      if (record.result !== undefined && !output(record.result))
        throw invalid();
      for (const key of [
        "directory",
        "retainedDirectory",
        "error",
        "resourceId",
        "commit",
      ])
        if (record[key] !== undefined && typeof record[key] !== "string")
          throw invalid();
      if (
        record.result &&
        object(record.result) &&
        !Object.hasOwn(record.result, "value")
      )
        record.result.value = undefined;
    }
    if (item.phase === "settled" && !record) throw invalid();
  }
  if (
    attempts.size !== keys.length ||
    admitted !== value.usage.attempts ||
    winners > 1 ||
    (value.finished && (value.status === "winner") !== (winners === 1))
  )
    throw invalid();
}
