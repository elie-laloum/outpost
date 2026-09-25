---
title: "Sandbox"
description: "Sandbox — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Sandbox } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                    | Type                                                                                         | Presence | Meaning                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `diagnose`              | `(options?: SandboxDiagnosticOptions) => Promise<SandboxDiagnosticReport>`                   | Required | Probe this sandbox’s commands, agent and optional transfers under its exclusive operation gate.               |
| `workspace`             | `Workspace`                                                                                  | Required | Workspace bound to this sandbox; its ownership determines whether sandbox closure also closes it.             |
| `root`                  | `string`                                                                                     | Required | Repository workspace path inside the execution environment.                                                   |
| `dispatch`              | `<T = undefined>(options: DispatchOptions<T>) => Promise<WarmDispatchResult<T>>`             | Required | Run an agent brief using this sandbox’s existing lease and return a warm result.                              |
| `resume`                | `<T = undefined>(id: string, options: DispatchOptions<T>) => Promise<WarmDispatchResult<T>>` | Required | Continue the given native conversation ID on this sandbox’s existing lease.                                   |
| `fork`                  | `<T = undefined>(id: string, options: DispatchOptions<T>) => Promise<WarmDispatchResult<T>>` | Required | Fork the given native conversation ID and run a new brief on this sandbox’s lease.                            |
| `attach`                | `(options?: AttachOptions) => Promise<AttachResult>`                                         | Required | Attach a real interactive agent terminal to this sandbox’s existing environment.                              |
| `command`               | `(command: Command) => Promise<CommandResult>`                                               | Required | Execute a command on this lease; return nonzero statuses without converting them into workflow task failures. |
| `close`                 | `(options?: { readonly preserve?: boolean; }) => Promise<Disposal>`                          | Required | Wait for owned operations and release the sandbox; close only a workspace owned by this sandbox.              |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                                                        | Required | Close this resource through JavaScript asynchronous resource disposal.                                        |

## Signature

```ts
export interface Sandbox {
  diagnose(
    options?: SandboxDiagnosticOptions,
  ): Promise<SandboxDiagnosticReport>;
  readonly workspace: Workspace;
  readonly root: string;
  dispatch<T = undefined>(
    options: DispatchOptions<T>,
  ): Promise<WarmDispatchResult<T>>;
  resume<T = undefined>(
    id: string,
    options: DispatchOptions<T>,
  ): Promise<WarmDispatchResult<T>>;
  fork<T = undefined>(
    id: string,
    options: DispatchOptions<T>,
  ): Promise<WarmDispatchResult<T>>;
  attach(options?: AttachOptions): Promise<AttachResult>;
  command(command: Command): Promise<CommandResult>;
  close(options?: { readonly preserve?: boolean }): Promise<Disposal>;
  [Symbol.asyncDispose](): Promise<void>;
}
```

## Related contracts

- [AttachOptions](../attachoptions/)
- [AttachResult](../attachresult/)
- [Command](../command/)
- [CommandResult](../commandresult/)
- [DispatchOptions](../dispatchoptions/)
- [Disposal](../disposal/)
- [SandboxDiagnosticOptions](../sandboxdiagnosticoptions/)
- [SandboxDiagnosticReport](../sandboxdiagnosticreport/)
- [WarmDispatchResult](../warmdispatchresult/)
- [Workspace](../workspace/)
