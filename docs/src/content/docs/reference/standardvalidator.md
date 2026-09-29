---
title: "StandardValidator"
description: "StandardValidator — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StandardValidator } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                                                                                                                                                                                                                                      | Presence | Meaning                                                                                                                            |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `~standard` | `{ readonly validate: (input: unknown) => { readonly value: T; readonly issues?: undefined; } \| { readonly issues: readonly unknown[]; } \| Promise<{ readonly value: T; readonly issues?: undefined; } \| { readonly issues: readonly unknown[]; }>; }` | Required | Standard Schema entry point. Its validate returns { value } or { issues }, directly or as a promise; any issue rejects the answer. |

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
