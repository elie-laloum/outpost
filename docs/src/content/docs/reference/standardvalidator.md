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

| Name        | Type                                                                                                                                                                                                                                                      | Presence | Meaning                                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `~standard` | `{ readonly validate: (input: unknown) => { readonly value: T; readonly issues?: undefined; } \| { readonly issues: readonly unknown[]; } \| Promise<{ readonly value: T; readonly issues?: undefined; } \| { readonly issues: readonly unknown[]; }>; }` | Required | Standard Schema validation entry point; validate returns a typed value or validation issues, optionally asynchronously. |

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
