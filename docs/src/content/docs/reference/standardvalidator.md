---
title: "StandardValidator"
description: "StandardValidator — Outpost API"
sidebar:
  order: 10
---

Public contract for **StandardValidator**. See the [prompts and responses guide](../../guide/agents/responses/) for behavior, defaults and examples.

## Import

```ts
import type { StandardValidator } from "@elie-laloum/outpost";
```

## Purpose and behavior

Supply a literal or file brief and validate a tagged model answer before exposing its typed value.

Supply exactly one brief form. Expansion defaults to 30 seconds per original command. Response repairs default to zero. Structured responses require one pass.

[Complete example and detailed rules](../../guide/agents/responses/).

## Parameters and properties

| Name        | Type                                                                                                                                                                                                                                                      | Presence | Meaning                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `~standard` | `{ readonly validate: (input: unknown) => { readonly value: T; readonly issues?: undefined; } \| { readonly issues: readonly unknown[]; } \| Promise<{ readonly value: T; readonly issues?: undefined; } \| { readonly issues: readonly unknown[]; }>; }` | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface StandardValidator<T> {
  readonly "~standard": {
    readonly validate: (input: unknown) =>
      | {
          readonly value: T;
          readonly issues?: undefined;
        }
      | {
          readonly issues: readonly unknown[];
        }
      | Promise<
          | {
              readonly value: T;
              readonly issues?: undefined;
            }
          | {
              readonly issues: readonly unknown[];
            }
        >;
  };
}
```
