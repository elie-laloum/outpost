---
title: "SandboxLease"
description: "SandboxLease — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SandboxLease**. Consultez le [guide providers](../../providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { SandboxLease } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface SandboxLease {
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

## Contrats associés

- [Command](../command/)
- [CommandResult](../commandresult/)
- [TransferOptions](../transferoptions/)
