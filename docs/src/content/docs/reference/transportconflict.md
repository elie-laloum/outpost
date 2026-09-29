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

Thrown when a conditional write or removal, or a read pinned to a revision, finds another revision or no object; key names the object. Re-read the object before deciding whether to retry.

[Complete example and detailed rules](../../guide/storage/).

## Parameters and properties

| Name      | Type                  | Presence | Meaning                                                                                     |
| --------- | --------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `key`     | `string`              | Required | Logical key whose expected revision did not match the stored object.                        |
| `name`    | `string`              | Required | Error class name used to distinguish this failure from other JavaScript errors.             |
| `message` | `string`              | Required | Human-readable explanation of the failure.                                                  |
| `stack`   | `string \| undefined` | Optional | JavaScript stack trace for the error, when available.                                       |
| `cause`   | `unknown`             | Optional | Underlying failure this error wraps; quotaFault() and unavailableFault() follow this chain. |

## Signature

```ts
export declare class TransportConflict extends Error {
  readonly key: string;
  constructor(key: string);
}
```
