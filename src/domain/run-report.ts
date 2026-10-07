import type { RunReport } from "./run-report.types.ts";

function literal(value: string): string {
  return value
    .replace(/[\\`*_{}\[\]()#+.!|~-]/g, (character) => `\\${character}`)
    .replace(/[&<>]/g, (character) => `&#${character.charCodeAt(0)};`)
    .replace(/[\r\n\t]/g, " ");
}

function backticks(value: string, minimum = 1): string {
  let width = minimum;
  for (const match of value.matchAll(/`+/g))
    width = Math.max(width, match[0].length + 1);
  return "`".repeat(width);
}

function inline(value: string, table = false): string {
  const text = value.replace(/[\r\n\t]/g, " ");
  const fence = backticks(text);
  return `${fence} ${table ? text.replaceAll("|", "\\|") : text} ${fence}`;
}

function preview(value: string): string[] {
  const fence = backticks(value, 3);
  return [
    `  ${fence}text`,
    ...value.split(/\r?\n/).map((line) => `  ${line}`),
    `  ${fence}`,
  ];
}

export function renderRunReport(report: RunReport): string {
  const lines = [
    "## Run report",
    "",
    `- Completion condition: ${report.completed ? "satisfied" : "not satisfied"}`,
    `- Branch: ${inline(report.branch)}`,
    `- Duration: ${(report.durationMs / 1000).toFixed(2)} s`,
    `- Commits: ${report.commits.length}`,
    "",
    "### Summary",
    "",
    ...(report.text
      ? report.text.split(/\r?\n/).map((line) => `> ${literal(line)}`)
      : ["No final answer recorded."]),
    "",
    "### Committed changes",
    "",
  ];
  const diff = report.diff;
  if (diff) {
    lines.push(
      `${diff.filesChanged} ${diff.filesChanged === 1 ? "file" : "files"} · +${diff.added} / −${diff.removed} lines · ${diff.binaryFiles} binary ${diff.binaryFiles === 1 ? "file" : "files"}`,
      "",
    );
    if (diff.files.length) {
      lines.push("| File | Added | Removed |", "| --- | ---: | ---: |");
      for (const file of diff.files)
        lines.push(
          `| ${file.paths.map((path) => inline(path, true)).join(" → ")} | ${file.binary ? "binary" : file.added} | ${file.binary ? "binary" : file.removed} |`,
        );
    }
    if (!diff.files.length) lines.push("No committed changes.");
  }
  if (!diff) lines.push("Diff statistics unavailable.");
  lines.push("", "### Failed commands and tools", "");
  if (!report.failedTools.length) lines.push("No tool failures observed.");
  for (const failure of report.failedTools) {
    const scope = [
      failure.pass === null ? null : `pass ${failure.pass}`,
      failure.subagentId ? `subagent ${inline(failure.subagentId)}` : null,
    ]
      .filter(Boolean)
      .join(", ");
    lines.push(
      `- ${inline(failure.tool)}${scope ? ` (${scope})` : ""}${failure.command ? `: ${inline(failure.command)}` : ""}`,
    );
    if (failure.preview) lines.push("", ...preview(failure.preview));
  }
  if (report.omittedFailures)
    lines.push(`- ${report.omittedFailures} additional failures omitted.`);
  lines.push(
    "",
    "### Consumption",
    "",
    `- Reported tokens: input ${report.usage.input} · cache read ${report.usage.cached} · cache write ${report.usage.cacheCreated ?? 0} · output ${report.usage.output}`,
  );
  if (report.usage.complete === false)
    lines.push("- Token accounting is incomplete.");
  if (report.cost)
    lines.push(
      `- Estimated cost: ${report.cost.amount.toFixed(6)} ${report.cost.currency}${report.cost.complete ? "" : " (partial)"}`,
    );
  if (!report.cost) lines.push("- Estimated cost: unavailable.");
  if (report.warnings.length)
    lines.push(
      "",
      "### Collection warnings",
      "",
      ...report.warnings.map((warning) => `- ${literal(warning)}`),
    );
  return lines.join("\n") + "\n";
}
