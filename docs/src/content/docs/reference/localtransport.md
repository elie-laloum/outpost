---
title: "localTransport"
description: "localTransport — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { localTransport } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a versioned object transport in a private directory. Binary objects use an envelope distinct from legacy file stores. Local process locks serialize conditional mutations; this adapter does not establish distributed NFS ownership.

[Complete example and detailed rules](../../guide/operations/storage-transports/).

## Parameters and properties

| Name                | Type                    | Presence | Meaning                                                                                                                                                           |
| ------------------- | ----------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `LocalTransportOptions` | Required | Private root directory for the versioned local object layout.                                                                                                     |
| `options.directory` | `string`                | Required | Root of the objects and local mutation locks; resolved when the factory is called. Symlink directories are rejected. This layout differs from legacy file stores. |

## Returns

`Transport`

## Signature

```ts
export declare function localTransport(
  options: LocalTransportOptions,
): Transport;
```

## Related contracts

- [LocalTransportOptions](../localtransportoptions/)
- [Transport](../transport/)
