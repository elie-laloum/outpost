---
title: "FileRunReport"
description: "FileRunReport — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileRunReport } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name              | Type                              | Presence | Meaning                                                                                                                                                                                                        |
| ----------------- | --------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`         | `2`                               | Required | File execution report format version 2, distinct from legacy Git report version 1.                                                                                                                             |
| `workspaceInfo`   | `FileWorkspaceRecord`             | Required | Versioned workspace description retaining ownership, settled generation and recovery references.                                                                                                               |
| `fileOutputs`     | `readonly WorkspacePublication[]` | Required | Verified publication results, separate from Git commits and branch integration.                                                                                                                                |
| `text`            | `string`                          | Required | Final dispatch answer, joined across cold passes and masked by inherited redact patterns. Markdown renders it as literal text.                                                                                 |
| `usage`           | `Usage`                           | Required | Cumulative reported token usage, including repairs, steering, fallback attempts and subagents; zero counters alone do not prove no consumption.                                                                |
| `completed`       | `boolean`                         | Required | Whether dispatch matched its completion condition; this does not certify passing tests or successful tools.                                                                                                    |
| `cost`            | `UsageCost \| null`               | Required | Estimate from dispatch prices and cumulative model usage, or null without prices or when calculation fails. complete=false marks known partial charges, never an invoice.                                      |
| `durationMs`      | `number`                          | Required | Wall-clock dispatch duration in milliseconds, including preparation, execution, synchronization and owned-resource cleanup; warm dispatch leaves borrowed resources open.                                      |
| `failedTools`     | `readonly RunReportFailure[]`     | Required | Up to 100 failed tool-result events in observation order, correlated with tool calls by dispatch, pass, subagent and call ID. Includes shell and non-shell tools; unsupported agent events cannot be inferred. |
| `omittedFailures` | `number`                          | Required | Number of observed failures beyond the 100-entry report limit; these do not appear in failedTools.                                                                                                             |
| `warnings`        | `readonly string[]`               | Required | Collection limitations such as unavailable Git statistics, lost observation events, truncated descriptions or uncomputable cost. These do not change dispatch success.                                         |

## Signature

```ts
export interface FileRunReport extends Omit<
  RunReport,
  "version" | "branch" | "commits" | "diff"
> {
  readonly version: 2;
  readonly workspaceInfo: FileWorkspaceRecord;
  readonly fileOutputs: readonly WorkspacePublication[];
}
```

## Related contracts

- [RunReport](../runreport/)
