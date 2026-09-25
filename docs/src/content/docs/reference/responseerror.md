---
title: "ResponseError"
description: "ResponseError — Outpost API"
sidebar:
  order: 10
---

Public contract for **ResponseError**. See the [prompts and responses guide](../../guide/agents/responses/) for behavior, defaults and examples.

## Import

```ts
import { ResponseError } from "@elie-laloum/outpost";
```

## Purpose and behavior

Supply a literal or file brief and validate a tagged model answer before exposing its typed value.

Supply exactly one brief form. Expansion defaults to 30 seconds per original command. Response repairs default to zero. Structured responses require one pass.

[Complete example and detailed rules](../../guide/agents/responses/).

## Parameters and properties

| Name       | Type                                | Presence | Meaning                                                                 |
| ---------- | ----------------------------------- | -------- | ----------------------------------------------------------------------- |
| `tag`      | `string`                            | Required | XML-style delimiter identifier.                                         |
| `raw`      | `string \| undefined`               | Required | See the linked contract and this family's rules for its interpretation. |
| `recovery` | `Readonly<Record<string, unknown>>` | Required | See the linked contract and this family's rules for its interpretation. |
| `code`     | `FaultCode`                         | Required | See the linked contract and this family's rules for its interpretation. |
| `details`  | `Readonly<Record<string, unknown>>` | Required | See the linked contract and this family's rules for its interpretation. |
| `name`     | `string`                            | Required | See the linked contract and this family's rules for its interpretation. |
| `message`  | `string`                            | Required | See the linked contract and this family's rules for its interpretation. |
| `stack`    | `string \| undefined`               | Optional | See the linked contract and this family's rules for its interpretation. |
| `cause`    | `unknown`                           | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export declare class ResponseError extends OutpostError {
  readonly tag: string;
  readonly raw: string | undefined;
  constructor(tag: string, message: string, raw?: string, cause?: unknown);
}
```

## Related contracts

- [OutpostError](../outposterror/)
