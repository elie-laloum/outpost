---
title: "createLocalTransport"
description: "createLocalTransport — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createLocalTransport } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a transport that stores each key as one owner-only file under &lt;directory>/objects, created on first write. Per-key lock files serialize mutations between processes on one machine; a mutation that waits more than 30000 ms for its lock rejects. It provides no distributed ownership over NFS or other shared mounts.

[Complete example and detailed rules](../../guide/storage/).

## Parameters and properties

| Name                | Type                    | Presence | Meaning                                                                                                                                                  |
| ------------------- | ----------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `LocalTransportOptions` | Required | Directory that holds the objects and their lock files.                                                                                                   |
| `options.directory` | `string`                | Required | Root directory, resolved when the factory is called; objects go under objects/ and locks under .outpost/locks. A symlinked root rejects the first write. |

## Returns

`Transport`

## Signature

```ts
export declare function createLocalTransport(
  options: LocalTransportOptions,
): Transport;
```

## Related contracts

- [LocalTransportOptions](../localtransportoptions/)
- [Transport](../transport/)
