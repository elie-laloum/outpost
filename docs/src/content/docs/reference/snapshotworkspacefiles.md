---
title: "snapshotWorkspaceFiles"
description: "snapshotWorkspaceFiles — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { snapshotWorkspaceFiles } from "@elie-laloum/outpost";
```

## Purpose and behavior

Conserves a bounded verified generation through Transport with binary files, internal links, permissions and empty directories.

[Complete example and detailed rules](../../guide/workspaces/).

## Parameters and properties

| Name          | Type        | Presence | Meaning                                                                                    |
| ------------- | ----------- | -------- | ------------------------------------------------------------------------------------------ |
| `transporter` | `Transport` | Required | Caller-owned Transport used for conservation; no implicit cloud SDK or credential loading. |
| `root`        | `string`    | Required | Execution root inside the borrowed sandbox, distinct from its host control directory.      |
| `prefix`      | `string`    | Required | Transport key prefix under which immutable archive generations are written.                |

## Returns

`Promise<TransportReference>`

## Signature

```ts
export declare function snapshotWorkspaceFiles(
  transporter: Transport,
  root: string,
  prefix: string,
): Promise<TransportReference>;
```

## Related contracts

- [Transport](../transport/)
- [TransportReference](../transportreference/)
