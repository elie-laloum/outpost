---
title: "Sandbox"
description: "Sandbox — Outpost API"
sidebar:
  order: 10
---

Public contract for **Sandbox**. See the [sandboxes guide](../../guide/environment/lifecycle/) for behavior, defaults and examples.

## Import

```ts
import type { Sandbox } from "@elie-laloum/outpost";
```

## Purpose and behavior

Acquire an execution environment and reuse it for sequential commands or agent jobs.

Docker is the default provider. Only one operation may own a sandbox at a time. Closing is idempotent; cancellation of one command does not itself destroy a warm sandbox.

[Complete example and detailed rules](../../guide/environment/lifecycle/).

## Parameters and properties

| Name        | Type                                                                                         | Presence | Meaning                                                                 |
| ----------- | -------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `diagnose`  | `(options?: SandboxDiagnosticOptions) => Promise<SandboxDiagnosticReport>`                   | Required | See the linked contract and this family's rules for its interpretation. |
| `workspace` | `Workspace`                                                                                  | Required | Caller-owned Git workspace; excludes new repository/branch choices.     |
| `root`      | `string`                                                                                     | Required | See the linked contract and this family's rules for its interpretation. |
| `dispatch`  | `<T = undefined>(options: DispatchOptions<T>) => Promise<WarmDispatchResult<T>>`             | Required | See the linked contract and this family's rules for its interpretation. |
| `resume`    | `<T = undefined>(id: string, options: DispatchOptions<T>) => Promise<WarmDispatchResult<T>>` | Required | See the linked contract and this family's rules for its interpretation. |
| `fork`      | `<T = undefined>(id: string, options: DispatchOptions<T>) => Promise<WarmDispatchResult<T>>` | Required | See the linked contract and this family's rules for its interpretation. |
| `attach`    | `(options?: AttachOptions) => Promise<AttachResult>`                                         | Required | See the linked contract and this family's rules for its interpretation. |
| `command`   | `(command: Command) => Promise<CommandResult>`                                               | Required | See the linked contract and this family's rules for its interpretation. |
| `close`     | `(options?: { readonly preserve?: boolean; }) => Promise<Disposal>`                          | Required | See the linked contract and this family's rules for its interpretation. |

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
