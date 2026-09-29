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

| Name     | Type                                                                              | Presence          | Meaning                                                                                                                                                                                                                      |
| -------- | --------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`   | `string \| undefined`                                                             | Variant-dependent | Literal brief sent to the agent unchanged: no placeholders or commands are expanded.                                                                                                                                         |
| `file`   | `undefined \| string`                                                             | Variant-dependent | Path of a template file, resolved from the process working directory and read before each pass. Its {{NAME}} placeholders are filled and each !\`command\` fragment is replaced by the command's stdout, run in the sandbox. |
| `values` | `undefined \| Readonly<Record<string, string \| number \| boolean>> \| undefined` | Optional          | Values for the file's {{NAME}} placeholders, also inserted unquoted into commands. WORK_BRANCH and BASE_BRANCH are reserved; a missing value fails with code prompt and unused values reach warn.                            |

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
