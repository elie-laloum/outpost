import type { DispatchOptions } from "./execution.types.ts";

/** Dispatch settings that add agent requirements to an inspection. */
export type ExecutionInspectionSettings = Pick<
  DispatchOptions<unknown>,
  "agent" | "continuation" | "response" | "steering"
>;
