import type { Observation } from "../domain/observation.types.ts";
import type {
  RunReportFailure,
  RunReportOptions,
} from "../domain/run-report.types.ts";

export interface RunReportEvents {
  observe(value: Observation): void;
  readonly failures: readonly RunReportFailure[];
  readonly omittedFailures: number;
  readonly warnings: readonly string[];
}

export interface RunReportTool {
  readonly name: string;
  readonly command: string | null;
}

export type RunReportRenderer = (options?: RunReportOptions) => string;
