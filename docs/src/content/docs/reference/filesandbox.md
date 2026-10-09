---
title: "FileSandbox"
description: "FileSandbox — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileSandbox } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                    | Type                                                                                         | Presence | Meaning                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `diagnose`              | `(options?: SandboxDiagnosticOptions) => Promise<SandboxDiagnosticReport>`                   | Required | Inspect the selected execution mode; Git probes run only for Git workspaces.                           |
| `workspace`             | `FileWorkspace`                                                                              | Required | Open workspace borrowed for this operation; its caller remains responsible for closing it.             |
| `root`                  | `string`                                                                                     | Required | Execution root inside the borrowed sandbox, distinct from its host control directory.                  |
| `command`               | `(command: Command) => Promise<CommandResult>`                                               | Required | Execute the declared command and preserve its actual exit status, cancellation and settled files.      |
| `dispatch`              | `<T = undefined>(options: DispatchOptions<T>) => Promise<FileDispatchResult<T>>`             | Required | Runs an agent against the current files, preserving the workspace across repairs and steering passes.  |
| `resume`                | `<T = undefined>(id: string, options: DispatchOptions<T>) => Promise<FileDispatchResult<T>>` | Required | Continue a captured conversation in the same retained file workspace without recopying initial inputs. |
| `fork`                  | `<T = undefined>(id: string, options: DispatchOptions<T>) => Promise<FileDispatchResult<T>>` | Required | Fork a captured conversation when supported while retaining the current workspace files.               |
| `attach`                | `(options?: AttachOptions) => Promise<FileAttachResult>`                                     | Required | Open an interactive terminal only when the adapter explicitly supports this file-workspace variant.    |
| `close`                 | `(options?: { readonly preserve?: boolean; }) => Promise<Disposal>`                          | Required | Idempotent closure; preserves recoverable work and never removes a borrowed source.                    |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                                                        | Required | Idempotent closure; preserves recoverable work and never removes a borrowed source.                    |

## Signature

```ts
export interface FileSandbox {
  diagnose(
    options?: SandboxDiagnosticOptions,
  ): Promise<SandboxDiagnosticReport>;
  readonly workspace: FileWorkspace;
  readonly root: string;
  command(command: Command): Promise<CommandResult>;
  dispatch<T = undefined>(
    options: DispatchOptions<T>,
  ): Promise<FileDispatchResult<T>>;
  resume<T = undefined>(
    id: string,
    options: DispatchOptions<T>,
  ): Promise<FileDispatchResult<T>>;
  fork<T = undefined>(
    id: string,
    options: DispatchOptions<T>,
  ): Promise<FileDispatchResult<T>>;
  attach(options?: AttachOptions): Promise<FileAttachResult>;
  close(options?: { readonly preserve?: boolean }): Promise<Disposal>;
  [Symbol.asyncDispose](): Promise<void>;
}
```

## Related contracts

- [AttachOptions](../attachoptions/)
- [Command](../command/)
- [CommandResult](../commandresult/)
- [DispatchOptions](../dispatchoptions/)
- [Disposal](../disposal/)
- [FileAttachResult](../fileattachresult/)
- [FileDispatchResult](../filedispatchresult/)
- [FileWorkspace](../fileworkspace/)
