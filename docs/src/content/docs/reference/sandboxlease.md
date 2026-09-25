---
title: "SandboxLease"
description: "SandboxLease — Outpost API"
sidebar:
  order: 10
---

Public contract for **SandboxLease**. See the [providers guide](../../guide/environment/providers/overview/) for behavior, defaults and examples.

## Import

```ts
import type { SandboxLease } from "@elie-laloum/outpost";
```

## Purpose and behavior

Allocate local containers, explicit host execution or remote sandboxes through dedicated package entry points.

Mounted and host providers default to current branches; remote providers default to integration and reject current. Optional SDKs remain optional. Local execution provides no isolation.

[Complete example and detailed rules](../../guide/environment/providers/overview/).

## Parameters and properties

| Name            | Type                                                                                | Presence | Meaning                                                                 |
| --------------- | ----------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `fileTransfers` | `FileTransfers \| undefined`                                                        | Optional | See the linked contract and this family's rules for its interpretation. |
| `root`          | `string`                                                                            | Required | See the linked contract and this family's rules for its interpretation. |
| `home`          | `string`                                                                            | Required | See the linked contract and this family's rules for its interpretation. |
| `invoke`        | `(command: Command) => Promise<CommandResult>`                                      | Required | See the linked contract and this family's rules for its interpretation. |
| `upload`        | `(source: string, destination: string, options?: TransferOptions) => Promise<void>` | Required | See the linked contract and this family's rules for its interpretation. |
| `download`      | `(source: string, destination: string, options?: TransferOptions) => Promise<void>` | Required | See the linked contract and this family's rules for its interpretation. |
| `release`       | `() => Promise<void>`                                                               | Required | See the linked contract and this family's rules for its interpretation. |

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
