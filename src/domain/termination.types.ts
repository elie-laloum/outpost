import type { FaultCode } from "./errors.types.ts";

export type TerminationCode = FaultCode | "failed" | "usage-unavailable";
