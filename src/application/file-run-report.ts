import { invariant } from "../domain/errors.ts";
import type { FileDispatchResult } from "./file-sandbox.types.ts";
import type { FileRunReport } from "../domain/run-report.types.ts";
import type { RunReportRenderer } from "./run-report.types.ts";

const snapshots = new WeakMap<RunReportRenderer, FileRunReport>();

export function fileRunReportData<T>(
  result: Pick<
    FileDispatchResult<T>,
    "completed" | "text" | "workspaceInfo" | "fileOutputs" | "usage" | "turns"
  >,
): FileRunReport {
  return {
    version: 2,
    completed: result.completed,
    text: result.text,
    workspaceInfo: result.workspaceInfo,
    fileOutputs: result.fileOutputs,
    usage: result.usage,
    durationMs: result.turns.reduce(
      (total, turn) => total + turn.durationMs,
      0,
    ),
    cost: null,
    failedTools: [],
    omittedFailures: 0,
    warnings: [],
  };
}

export function createFileRunReport(data: FileRunReport): RunReportRenderer {
  const snapshot = structuredClone(data);
  const report: RunReportRenderer = (options = {}) => {
    if (options.format === undefined || options.format === "json")
      return JSON.stringify(snapshot, null, 2) + "\n";
    invariant(
      options.format === "markdown",
      "Run report format must be markdown or json",
    );
    return `${snapshot.completed ? "Completed" : "Incomplete"} file execution\n\n${snapshot.text}\n\nWorkspace: ${snapshot.workspaceInfo.id}\nMode: ${snapshot.workspaceInfo.kind}\nGeneration: ${snapshot.workspaceInfo.generation}\nPublished outputs: ${snapshot.fileOutputs.length}\n`;
  };
  snapshots.set(report, snapshot);
  return report;
}

export function fileRunReportSnapshot(
  report: RunReportRenderer,
): FileRunReport | undefined {
  const snapshot = snapshots.get(report);
  return snapshot ? structuredClone(snapshot) : undefined;
}
