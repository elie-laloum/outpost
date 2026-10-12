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

| Name         | Type                                             | Presence | Meaning                                                                                                                                                                                                                                       |
| ------------ | ------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tag`        | `string`                                         | Required | Tag name without angle brackets. Dispatch automatically requests exactly one final tagged answer; the brief does not need to contain the tag.                                                                                                 |
| `repairs`    | `number`                                         | Required | Correction turns allowed after an invalid answer, 0 unless the options set it. Each resumes the same conversation and asks only for the corrected tag. [Exact injected text and customization limits](../responsespec/#outpost-instructions). |
| `format`     | `"text" \| "json" \| undefined`                  | Optional | Answer content format used by automatic instructions: json requests raw JSON conforming to jsonSchema; text requests text. Omit for a custom contract that needs generic tagged output.                                                       |
| `jsonSchema` | `Readonly<Record<string, unknown>> \| undefined` | Optional | Captured input JSON Schema included in the prompt when format is json; required for that format. Describes the JSON before schema validation and any transformation.                                                                          |
| `read`       | `(text: string) => Promise<T>`                   | Required | Extract the last complete &lt;tag>…&lt;/tag> pair from a text, trim it and parse it. Rejects with ResponseError when no complete pair exists or its content is rejected.                                                                      |

<span id="outpost-instructions"></span>

## Instructions added by Outpost

Templates below preserve the English text sent to the model. `${…}` marks runtime substitutions, not brief template syntax.

### Final-answer format

Passing `response` to dispatch appends this block after the rendered brief and any steering messages collected at the start of the turn. This also applies to continuation, fork and repair turns. The contract overrides conflicting answer-format instructions while retaining the task instructions.

```text
Final response format:
If earlier instructions specify a conflicting response format, use this format instead. Keep following the task instructions.
End your answer with exactly one <${tag}>...</${tag}> block. Do not write anything after the closing tag.
```

`tag` comes from the response contract. For `format: "text"`, the next line is:

```text
Put the requested text inside the response tag.
```

For `format: "json"`, the following text and the input schema are appended:

```text
Put valid JSON inside the response tag, without a Markdown code fence. The JSON must conform to this input schema:
${schemaJSON}
```

`schemaJSON` is `JSON.stringify(schema, null, 2)` for the captured input JSON Schema. With `format` omitted, only the common block is sent. These additions are not expanded as brief variables or shell commands.

There is no option to replace or disable this wording while keeping `response`. `tag`, `format` and `jsonSchema` change its dynamic content. A dispatch without `response` receives none of these format instructions.

### Response repair

When `read()` throws `ResponseError`, a repair attempt is available and the failed turn has a conversation ID, dispatch resumes that conversation with this message instead of the original brief:

```text
Correct the response inside <${tag}> and </${tag}>.
Validation failure: ${error.message}
Previous content: ${previousContent}
Cause: ${cause}
Further repair attempts after this one: ${remainingAttempts}.
Do not edit files, run commands or continue implementation. Only return the corrected response.
```

`previousContent` is `error.raw`, falling back to `No complete tagged response was returned.`. `cause` is the cause's error message, otherwise its JSON serialization, falling back to `unspecified`. `remainingAttempts` counts repairs available after the new attempt. The final-answer block above is appended again, after any steering messages collected for that turn.

`repairs` controls the attempt count; it does not replace the repair prompt. `repairs: 0` disables repair turns. The built-in harness exposes only read-only tools during a repair; the instruction itself does not enforce a filesystem restriction for every CLI agent.

Implementation: [response-instructions.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/domain/response-instructions.ts) · [execution.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/application/execution.ts) · [steering-turns.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/application/steering-turns.ts).

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
