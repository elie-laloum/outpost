---
title: "workflowCheckpointStore"
description: "workflowCheckpointStore — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { workflowCheckpointStore } from "@elie-laloum/outpost";
```

## Purpose and behavior

Build a checkpoint store whose ownership token and checkpoint share one conditional object. Acquisition rejects an existing owner. Release preserves values and usage. Ownership does not expire automatically; after a crash, stop the old runner and explicitly recover its observed revision before resuming.

[Complete example and detailed rules](../../guide/operations/storage-transports/).

## Parameters and properties

| Name                  | Type                    | Presence | Meaning                                                                                                                    |
| --------------------- | ----------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `TransportStoreOptions` | Required | Transport that owns checkpoint envelopes and their exclusive run ownership records.                                        |
| `options.transporter` | `Transport`             | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |

## Returns

`WorkflowCheckpointStore`

## Signature

```ts
export declare function workflowCheckpointStore(
  options: TransportStoreOptions,
): WorkflowCheckpointStore;
```

## Related contracts

- [TransportStoreOptions](../transportstoreoptions/)
- [WorkflowCheckpointStore](../workflowcheckpointstore/)
