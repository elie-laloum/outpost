---
title: "StandardValidator"
description: "StandardValidator — Outpost API"
sidebar:
  order: 10
---

Public contract for **StandardValidator**. See the [prompts and responses guide](../../agents/responses/) for behavior, defaults and examples.

## Import

```ts
import type { StandardValidator } from "@elie-laloum/outpost";
```

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
