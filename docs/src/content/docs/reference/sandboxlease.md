---
title: "SandboxLease"
description: "SandboxLease — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SandboxLease } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                                                                                | Presence | Meaning                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `fileTransfers` | `FileTransfers \| undefined`                                                        | Optional | Optional manifest and batch-transfer capabilities for remote synchronization.                               |
| `root`          | `string`                                                                            | Required | Repository workspace path inside the execution environment.                                                 |
| `home`          | `string`                                                                            | Required | Agent home path inside the execution environment.                                                           |
| `invoke`        | `(command: Command) => Promise<CommandResult>`                                      | Required | Execute a command in the leased environment and return its actual process exit status and captured streams. |
| `upload`        | `(source: string, destination: string, options?: TransferOptions) => Promise<void>` | Required | Transfer host files or directory contents into the sandbox, honoring transfer cancellation and deadline.    |
| `download`      | `(source: string, destination: string, options?: TransferOptions) => Promise<void>` | Required | Transfer sandbox files or directory contents to the host, preserving supported permissions and links.       |
| `release`       | `() => Promise<void>`                                                               | Required | Dispose of the allocated execution environment; repeated release must be safe.                              |

## Signature

```ts
export interface SandboxLease {
  readonly fileTransfers?: FileTransfers;
  readonly root: string;
  readonly home: string;
  invoke(command: Command): Promise<CommandResult>;
  upload(
    source: string,
    destination: string,
    options?: TransferOptions,
  ): Promise<void>;
  download(
    source: string,
    destination: string,
    options?: TransferOptions,
  ): Promise<void>;
  release(): Promise<void>;
}
```

## Related contracts

- [Command](../command/)
- [CommandResult](../commandresult/)
- [FileTransfers](../filetransfers/)
- [TransferOptions](../transferoptions/)
