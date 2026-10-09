---
title: "FileDispatchResult"
description: "FileDispatchResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileDispatchResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                  | Type                                                                             | Presence | Meaning                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `logReference`        | `TransportReference \| undefined`                                                | Optional | Transport journal reference for this execution; file replay effects are refused when they cannot be reproduced. |
| `observerErrors`      | `readonly unknown[] \| undefined`                                                | Optional | Observer failures collected separately without changing execution outcomes.                                     |
| `transcript`          | `string \| undefined`                                                            | Optional | Captured conversation content or its Transport reference, independent of agent authentication.                  |
| `transcriptReference` | `TransportReference \| undefined`                                                | Optional | Captured conversation content or its Transport reference, independent of agent authentication.                  |
| `fallback`            | `FallbackRecord \| undefined`                                                    | Optional | Explicit fallback attempts and their usage, retaining each captured conversation.                               |
| `workspaceInfo`       | `FileWorkspaceRecord`                                                            | Required | Versioned workspace description retaining ownership, settled generation and recovery references.                |
| `directory`           | `string`                                                                         | Required | Absolute local materialization or source directory; it is not a portable resource identity.                     |
| `fileOutputs`         | `readonly WorkspacePublication[]`                                                | Required | Verified publication results, separate from Git commits and branch integration.                                 |
| `report`              | `(options?: RunReportOptions) => string`                                         | Required | Version-2 file execution report; legacy Git reports keep version 1.                                             |
| `resume`              | `<U = undefined>(options: DispatchOptions<U>) => Promise<FileDispatchResult<U>>` | Required | Continue a captured conversation in the same retained file workspace without recopying initial inputs.          |
| `fork`                | `<U = undefined>(options: DispatchOptions<U>) => Promise<FileDispatchResult<U>>` | Required | Fork a captured conversation when supported while retaining the current workspace files.                        |
| `text`                | `string`                                                                         | Required | Text of every turn of the execution, joined with newlines, including response repair turns.                     |
| `turns`               | `readonly Turn[]`                                                                | Required | Every turn in order, including response repairs and turns resumed by steering.                                  |
| `usage`               | `Usage`                                                                          | Required | Token counters summed over every turn; not a cost.                                                              |
| `conversation`        | `string \| undefined`                                                            | Optional | Native conversation id of the last turn, when the agent reported one.                                           |
| `value`               | `T`                                                                              | Required | Parsed and validated response; undefined without a response option.                                             |
| `completed`           | `boolean`                                                                        | Required | True when the last turn's text contains a completion marker, or when a typed response was validated.            |
| `completion`          | `string \| undefined`                                                            | Optional | Completion marker found in the last turn's text.                                                                |

## Signature

```ts
export interface FileDispatchResult<T> extends Execution<T> {
  readonly logReference?: TransportReference;
  readonly observerErrors?: readonly unknown[];
  readonly transcript?: string;
  readonly transcriptReference?: TransportReference;
  readonly fallback?: FallbackRecord;
  readonly workspaceInfo: FileWorkspaceRecord;
  readonly directory: string;
  readonly fileOutputs: readonly WorkspacePublication[];
  report(options?: RunReportOptions): string;
  resume<U = undefined>(
    options: DispatchOptions<U>,
  ): Promise<FileDispatchResult<U>>;
  fork<U = undefined>(
    options: DispatchOptions<U>,
  ): Promise<FileDispatchResult<U>>;
}
```

## Related contracts

- [DispatchOptions](../dispatchoptions/)
- [Execution](../execution/)
- [FileWorkspaceRecord](../fileworkspacerecord/)
- [WorkspacePublication](../workspacepublication/)
