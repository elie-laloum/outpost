---
title: "ResponseSpec"
description: "ResponseSpec — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ResponseSpec } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                                             | Presence | Meaning                                                                                                                                                                                 |
| ------------ | ------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tag`        | `string`                                         | Required | Tag name without angle brackets. Dispatch automatically requests exactly one final tagged answer; the brief does not need to contain the tag.                                           |
| `repairs`    | `number`                                         | Required | Correction turns allowed after an invalid answer, 0 unless the options set it. Each resumes the same conversation and asks only for the corrected tag.                                  |
| `format`     | `"text" \| "json" \| undefined`                  | Optional | Answer content format used by automatic instructions: json requests raw JSON conforming to jsonSchema; text requests text. Omit for a custom contract that needs generic tagged output. |
| `jsonSchema` | `Readonly<Record<string, unknown>> \| undefined` | Optional | Captured input JSON Schema included in the prompt when format is json; required for that format. Describes the JSON before schema validation and any transformation.                    |
| `read`       | `(text: string) => Promise<T>`                   | Required | Extract the last complete &lt;tag>…&lt;/tag> pair from a text, trim it and parse it. Rejects with ResponseError when no complete pair exists or its content is rejected.                |

## Signature

```ts
export interface ResponseSpec<T> {
  readonly tag: string;
  readonly repairs: number;
  readonly format?: "json" | "text";
  readonly jsonSchema?: JsonSchema;
  read(text: string): Promise<T>;
}
```

## Related contracts

- [JsonSchema](../jsonschema/)
