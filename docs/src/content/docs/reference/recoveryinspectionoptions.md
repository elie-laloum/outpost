---
title: "RecoveryInspectionOptions"
description: "RecoveryInspectionOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryInspectionOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                     | Presence | Meaning                                                                                                                                                                                         |
| ------------- | ------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport \| undefined` | Optional | Inventory this transport's objects instead of a local repository. Pass the transport given as activityTransport to read its activity records; git or locks then reject with code configuration. |
| `repository`  | `string \| undefined`    | Optional | Git checkout to inspect, default the current directory, resolved to its top-level root. In transport mode, only echoed back as a label.                                                         |
| `maxEntries`  | `number \| undefined`    | Optional | Maximum entries scanned before the inventory is marked incomplete, default 100000. Local resource inspection also stops at 10000 records; a non-positive value rejects with code configuration. |
| `git`         | `boolean \| undefined`   | Optional | Adds the Git state of each workspace under .outpost: registration, HEAD, branch, dirty and locked flags. Local mode only.                                                                       |
| `locks`       | `boolean \| undefined`   | Optional | Adds operation lock files with their owner's status. Local mode only.                                                                                                                           |
| `resources`   | `boolean \| undefined`   | Optional | Adds sandbox activity records with their ownership verdicts, read from .outpost/storage or, with transporter, from that transport.                                                              |

## Signature

```ts
export interface RecoveryInspectionOptions {
  readonly transporter?: Transport;
  readonly repository?: string;
  readonly maxEntries?: number;
  readonly git?: boolean;
  readonly locks?: boolean;
  readonly resources?: boolean;
}
```

## Related contracts

- [Transport](../transport/)
