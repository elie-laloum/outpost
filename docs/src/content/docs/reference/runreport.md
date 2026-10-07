---
title: "RunReport"
description: "RunReport — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunReport } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name              | Type                          | Presence | Meaning                                                                                                                                                                                                        |
| ----------------- | ----------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`         | `1`                           | Required | JSON snapshot schema version, currently 1.                                                                                                                                                                     |
| `completed`       | `boolean`                     | Required | Whether dispatch matched its completion condition; this does not certify passing tests or successful tools.                                                                                                    |
| `text`            | `string`                      | Required | Final dispatch answer, joined across cold passes and masked by inherited redact patterns. Markdown renders it as literal text.                                                                                 |
| `branch`          | `string`                      | Required | Work branch recorded before the workspace closes; it is not a pull-request URL.                                                                                                                                |
| `commits`         | `readonly Commit[]`           | Required | Commit identities and subjects collected during this dispatch, including every cold pass.                                                                                                                      |
| `durationMs`      | `number`                      | Required | Wall-clock dispatch duration in milliseconds, including preparation, execution, synchronization and owned-resource cleanup; warm dispatch leaves borrowed resources open.                                      |
| `usage`           | `Usage`                       | Required | Cumulative reported token usage, including repairs, steering, fallback attempts and subagents; zero counters alone do not prove no consumption.                                                                |
| `cost`            | `UsageCost \| null`           | Required | Estimate from dispatch prices and cumulative model usage, or null without prices or when calculation fails. complete=false marks known partial charges, never an invoice.                                      |
| `diff`            | `RunReportDiff \| null`       | Required | Net committed diff frozen after synchronization and before workspace cleanup, or null when inspection fails. Excludes uncommitted and untracked files.                                                         |
| `failedTools`     | `readonly RunReportFailure[]` | Required | Up to 100 failed tool-result events in observation order, correlated with tool calls by dispatch, pass, subagent and call ID. Includes shell and non-shell tools; unsupported agent events cannot be inferred. |
| `omittedFailures` | `number`                      | Required | Number of observed failures beyond the 100-entry report limit; these do not appear in failedTools.                                                                                                             |
| `warnings`        | `readonly string[]`           | Required | Collection limitations such as unavailable Git statistics, lost observation events, truncated descriptions or uncomputable cost. These do not change dispatch success.                                         |

## Signature

```ts
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
```

## Related contracts

- [Commit](../commit/)
- [RunReportDiff](../runreportdiff/)
- [RunReportFailure](../runreportfailure/)
- [Usage](../usage/)
- [UsageCost](../usagecost/)
