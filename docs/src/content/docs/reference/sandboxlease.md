---
title: "SandboxLease"
description: "SandboxLease — Outpost API"
sidebar:
  order: 10
---

Public contract for **SandboxLease**. See the [providers guide](../../providers/overview/) for behavior, defaults and examples.

## Import

```ts
import type { SandboxLease } from "@elie-laloum/outpost";
```

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
