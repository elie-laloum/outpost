---
title: "inspectWorkspacePublication"
description: "inspectWorkspacePublication — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { inspectWorkspacePublication } from "@elie-laloum/outpost";
```

## Purpose and behavior

Reads and validates a versioned publication journal at its exact Transport revision without changing files.

[Complete example and detailed rules](../../guide/publishing-files/).

## Parameters and properties

| Name          | Type                 | Presence | Meaning                                                                                                 |
| ------------- | -------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport`          | Required | Caller-owned Transport used for conservation; no implicit cloud SDK or credential loading.              |
| `reference`   | `TransportReference` | Required | Transport key and revision identifying the conserved object; conditional revisions fence stale writers. |

## Returns

`Promise<PublicationJournal>`

## Signature

```ts
export declare function inspectWorkspacePublication(
  transporter: Transport,
  reference: TransportReference,
): Promise<PublicationJournal>;
```

## Related contracts

- [PublicationJournal](../publicationjournal/)
- [Transport](../transport/)
- [TransportReference](../transportreference/)
