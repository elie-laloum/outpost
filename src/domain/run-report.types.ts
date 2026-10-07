import type { Usage } from "./agent.types.ts";
import type { UsageCost } from "./pricing.types.ts";
import type { Commit } from "./workspace.types.ts";

export interface RunReportOptions {
  readonly format?: "markdown" | "json";
}

export interface RunReportFile {
  readonly paths: readonly string[];
  readonly added: number;
  readonly removed: number;
  readonly binary: boolean;
}

export interface RunReportDiff {
  readonly baseline: string;
  readonly head: string;
  readonly files: readonly RunReportFile[];
  readonly filesChanged: number;
  readonly added: number;
  readonly removed: number;
  readonly binaryFiles: number;
}

export interface RunReportFailure {
  readonly tool: string;
  readonly command: string | null;
  readonly preview: string;
  readonly pass: number | null;
  readonly subagentId: string | null;
}

export interface RunReport {
  readonly version: 1;
  readonly completed: boolean;
  readonly text: string;
  readonly branch: string;
  readonly commits: readonly Commit[];
  readonly durationMs: number;
  readonly usage: Usage;
  readonly cost: UsageCost | null;
  readonly diff: RunReportDiff | null;
  readonly failedTools: readonly RunReportFailure[];
  readonly omittedFailures: number;
  readonly warnings: readonly string[];
}
