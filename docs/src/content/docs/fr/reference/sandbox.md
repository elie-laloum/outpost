---
title: "Sandbox"
description: "Sandbox — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Sandbox**. Consultez le [guide sandboxes](../../sandboxes/lifecycle/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Sandbox } from "@elie-laloum/outpost";
```

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

## Contrats associés

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
