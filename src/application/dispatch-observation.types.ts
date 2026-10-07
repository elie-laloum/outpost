import type { RunReportRenderer } from "./run-report.types.ts";
import type { Usage } from "../domain/agent.types.ts";

export interface ObservedDispatchResult {
  readonly report?: RunReportRenderer;
  readonly text?: string;
  readonly branch?: string;
  readonly commits?: readonly import("../domain/workspace.types.ts").Commit[];
  readonly usage: Usage;
  readonly completed: boolean;
}
