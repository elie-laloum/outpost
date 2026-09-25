---
title: "Brief"
description: "Brief — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { Brief } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name     | Type                                                                              | Presence          | Meaning                                                                                       |
| -------- | --------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------- |
| `text`   | `string \| undefined`                                                             | Variant-dependent | Literal brief text; excludes a template file and template values.                             |
| `file`   | `undefined \| string`                                                             | Variant-dependent | Brief template file to load and expand; mutually exclusive with text.                         |
| `values` | `undefined \| Readonly<Record<string, string \| number \| boolean>> \| undefined` | Optional          | Values substituted into placeholders of the file brief; unavailable with literal text briefs. |

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
