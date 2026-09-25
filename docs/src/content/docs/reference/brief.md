---
title: "Brief"
description: "Brief — Outpost API"
sidebar:
  order: 10
---

Public contract for **Brief**. See the [prompts and responses guide](../../guide/agents/responses/) for behavior, defaults and examples.

## Import

```ts
import type { Brief } from "@elie-laloum/outpost";
```

## Purpose and behavior

Supply a literal or file brief and validate a tagged model answer before exposing its typed value.

Supply exactly one brief form. Expansion defaults to 30 seconds per original command. Response repairs default to zero. Structured responses require one pass.

[Complete example and detailed rules](../../guide/agents/responses/).

## Parameters and properties

| Name     | Type                                                                 | Presence | Meaning                                                                 |
| -------- | -------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `text`   | `string \| undefined`                                                | Optional | Text content; see the owning operation for its source.                  |
| `file`   | `string \| undefined`                                                | Optional | See the linked contract and this family's rules for its interpretation. |
| `values` | `Readonly<Record<string, string \| number \| boolean>> \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

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
