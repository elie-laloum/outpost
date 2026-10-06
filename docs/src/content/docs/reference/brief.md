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

| Name     | Type                                                                              | Presence          | Meaning                                                                                                                                                                                                                        |
| -------- | --------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `text`   | `string \| undefined`                                                             | Variant-dependent | Literal task brief: no placeholders or commands are expanded. Dispatch appends response-format instructions when response is provided.                                                                                         |
| `file`   | `undefined \| string`                                                             | Variant-dependent | Template path resolved from the process working directory and read before each pass. Expands {{NAME}} and !\`command\` fragments in the sandbox. Response-format instructions are appended after rendering and never expanded. |
| `values` | `undefined \| Readonly<Record<string, string \| number \| boolean>> \| undefined` | Optional          | Values for the file's {{NAME}} placeholders, also inserted unquoted into commands. WORK_BRANCH and BASE_BRANCH are reserved; a missing value fails with code prompt and unused values reach warn.                              |

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
