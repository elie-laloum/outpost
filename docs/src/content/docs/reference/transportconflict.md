---
title: "TransportConflict"
description: "TransportConflict — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { TransportConflict } from "@elie-laloum/outpost";
```

## Purpose and behavior

A conditional object mutation or pinned read found a different revision. Re-read state before deciding whether a retry is valid; never replace the condition with an unconditional write.

[Complete example and detailed rules](../../guide/operations/storage-transports/).

## Parameters and properties

| Name      | Type                  | Presence | Meaning                                                                         |
| --------- | --------------------- | -------- | ------------------------------------------------------------------------------- |
| `key`     | `string`              | Required | Logical key whose expected revision did not match the stored object.            |
| `name`    | `string`              | Required | Error class name used to distinguish this failure from other JavaScript errors. |
| `message` | `string`              | Required | Human-readable explanation of the failure.                                      |
| `stack`   | `string \| undefined` | Optional | JavaScript stack trace for the error, when available.                           |
| `cause`   | `unknown`             | Optional | Original failure attached to this error.                                        |

## Signature

```ts
export declare class TransportConflict extends Error {
  readonly key: string;
  constructor(key: string);
}
```
