---
title: "Brief"
description: "Brief — Outpost API"
sidebar:
  order: 10
---

Public contract for **Brief**. See the [prompts and responses guide](../../agents/responses/) for behavior, defaults and examples.

## Import

```ts
import type { Brief } from "@elie-laloum/outpost";
```

## Signature

```ts
export type Brief =
  | {
      readonly text: string;
      readonly file?: never;
      readonly values?: never;
    }
  | {
      readonly file: string;
      readonly text?: never;
      readonly values?: PromptVariables;
    };
```

## Related contracts

- [PromptVariables](../promptvariables/)
