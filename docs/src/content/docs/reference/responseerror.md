---
title: "ResponseError"
description: "ResponseError — Outpost API"
sidebar:
  order: 10
---

Public contract for **ResponseError**. See the [prompts and responses guide](../../agents/responses/) for behavior, defaults and examples.

## Import

```ts
import { ResponseError } from "@elie-laloum/outpost";
```

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
