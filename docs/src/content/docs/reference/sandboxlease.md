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

| Name            | Type                                                                                | Presence | Meaning                                                                                                                                                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fileTransfers` | `FileTransfers \| undefined`                                                        | Optional | Manifest and batch capabilities for remote synchronization: Outpost downloads only changed files and verifies their SHA-256. Without it, files move one by one through upload() and download(); Vercel and Daytona provide it.                      |
| `liveInput`     | `boolean \| undefined`                                                              | Optional | True when invoke() streams Command.input to the running process. CLI steering reaches a running turn only on such a lease, otherwise Outpost stops and resumes the agent; built-in harness MCP servers require it. Every built-in provider sets it. |
| `root`          | `string`                                                                            | Required | Repository directory inside the sandbox; commands run there when Command.directory is unset.                                                                                                                                                        |
| `home`          | `string`                                                                            | Required | Agent home inside the sandbox, where Outpost installs credentials, CLI settings and native conversations. The local provider uses your host home.                                                                                                   |
| `invoke`        | `(command: Command) => Promise<CommandResult>`                                      | Required | Runs a command in the sandbox and resolves when the process exits, with its real status, even nonzero, and the retained stdout and stderr. signal and deadlineMs stop the process and its descendants without closing the sandbox.                  |
| `upload`        | `(source: string, destination: string, options?: TransferOptions) => Promise<void>` | Required | Transfer host files or directory contents into the sandbox, honoring transfer cancellation and deadline.                                                                                                                                            |
| `download`      | `(source: string, destination: string, options?: TransferOptions) => Promise<void>` | Required | Transfer sandbox files or directory contents to the host, preserving supported permissions and links.                                                                                                                                               |
| `release`       | `() => Promise<void>`                                                               | Required | Destroys the environment and stops its running commands. Outpost calls it when the sandbox closes; a second call must resolve without error.                                                                                                        |

## Signature

```ts
export interface SandboxLease {
  readonly fileTransfers?: FileTransfers;
  /** Whether invoke accepts Command.input as live stdin for a running process. */
  readonly liveInput?: boolean;
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
