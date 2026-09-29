---
title: "AttachResult"
description: "AttachResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AttachResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                  | Presence | Meaning                                                                                                                                                                                               |
| ------------------- | --------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `commits`           | `readonly Commit[]`   | Required | Commits made during the session, newest first, as oid and subject.                                                                                                                                    |
| `branch`            | `string`              | Required | Work branch of the session.                                                                                                                                                                           |
| `directory`         | `string`              | Required | Host worktree directory of the session.                                                                                                                                                               |
| `status`            | `number`              | Required | Exit code of the process, 0 for success. A nonzero code still resolves the command, so check it.                                                                                                      |
| `stdout`            | `string`              | Required | Last retain characters of standard output. Empty when an interactive command without terminal streams used the host terminal on the local, Docker or Podman provider.                                 |
| `stderr`            | `string`              | Required | Last retain characters of standard error. Empty in the same host-terminal case, and for a Daytona terminal, whose output is all in stdout.                                                            |
| `retainedDirectory` | `string \| undefined` | Optional | Worktree kept on close: set when preserve was requested, or when it has a detached HEAD or uncommitted, untracked or ignored files. Absent when the worktree was removed, and always in current mode. |

## Signature

```ts
export interface AttachResult extends CommandResult, Disposal {
  readonly commits: readonly Commit[];
  readonly branch: string;
  readonly directory: string;
}
```

## Related contracts

- [CommandResult](../commandresult/)
- [Commit](../commit/)
- [Disposal](../disposal/)
