import type { RunReport, RunReportDiff } from "../domain/run-report.types.ts";
import { renderRunReport } from "../domain/run-report.ts";
import { collectDiffStatistics } from "../infrastructure/git/diff-statistics.ts";
import type {
  RunReportRenderer,
  RunReportProjection,
} from "./run-report.types.ts";

export function createRunReport(
  data: RunReport,
): RunReportProjection<RunReport> {
  const snapshot = structuredClone(data);
  const report: RunReportRenderer = (options = {}) => {
    if (options.format === "json")
      return JSON.stringify(snapshot, null, 2) + "\n";
    if (options.format === undefined || options.format === "markdown")
      return renderRunReport(snapshot);
    throw new Error("Run report format must be markdown or json");
  };
  return { reportData: structuredClone(snapshot), report };
}

export async function collectRunReportDiff(
  repository: string,
  baseline: string,
  head: string,
  deadlineMs?: number,
): Promise<RunReportDiff> {
  const files = await collectDiffStatistics(
    repository,
    baseline,
    head,
    deadlineMs,
  );
  return {
    baseline,
    head,
    files,
    filesChanged: files.length,
    added: files.reduce((sum, file) => sum + file.added, 0),
    removed: files.reduce((sum, file) => sum + file.removed, 0),
    binaryFiles: files.filter((file) => file.binary).length,
  };
}
