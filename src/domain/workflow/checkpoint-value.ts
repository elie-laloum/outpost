import { losslessJson } from "../lossless-json.ts";
import type { WorkflowCheckpointValue } from "./checkpoint.types.ts";

export function checkpointValue(value: unknown): WorkflowCheckpointValue {
  if (value === undefined) return { kind: "undefined" };
  return {
    kind: "json",
    value: losslessJson(value, { label: "Checkpoint outputs" }),
  };
}
