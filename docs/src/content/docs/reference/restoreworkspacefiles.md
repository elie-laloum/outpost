---
title: "restoreWorkspaceFiles"
description: "restoreWorkspaceFiles — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { restoreWorkspaceFiles } from "@elie-laloum/outpost";
```

## Purpose and behavior

Materializes and verifies a conserved file snapshot in an exclusive destination; preserves existing archive read compatibility.

[Complete example and detailed rules](../../guide/workspaces/).

## Parameters and properties

| Name          | Type                 | Presence | Meaning                                                                                                 |
| ------------- | -------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport`          | Required | Caller-owned Transport used for conservation; no implicit cloud SDK or credential loading.              |
| `reference`   | `TransportReference` | Required | Transport key and revision identifying the conserved object; conditional revisions fence stale writers. |
| `destination` | `string`             | Required | Host destination preserving selected relative paths; overlap with an active writable source is refused. |

## Returns

`Promise<void>`

## Signature

```ts
export declare function restoreWorkspaceFiles(
  transporter: Transport,
  reference: TransportReference,
  destination: string,
): Promise<void>;
```

## Related contracts

- [Transport](../transport/)
- [TransportReference](../transportreference/)
