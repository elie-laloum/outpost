---
title: "FileAttachResult"
description: "FileAttachResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileAttachResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                  | Presence | Meaning                                                                                                                                                               |
| --------------- | --------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workspaceInfo` | `FileWorkspaceRecord` | Required | Versioned workspace description retaining ownership, settled generation and recovery references.                                                                      |
| `directory`     | `string`              | Required | Absolute local materialization or source directory; it is not a portable resource identity.                                                                           |
| `status`        | `number`              | Required | Exit code of the process, 0 for success. A nonzero code still resolves the command, so check it.                                                                      |
| `stdout`        | `string`              | Required | Last retain characters of standard output. Empty when an interactive command without terminal streams used the host terminal on the local, Docker or Podman provider. |
| `stderr`        | `string`              | Required | Last retain characters of standard error. Empty in the same host-terminal case, and for a Daytona terminal, whose output is all in stdout.                            |

## Signature

```ts
export interface FileAttachResult extends CommandResult {
  readonly workspaceInfo: FileWorkspaceRecord;
  readonly directory: string;
}
```

## Related contracts

- [CommandResult](../commandresult/)
- [FileWorkspaceRecord](../fileworkspacerecord/)
