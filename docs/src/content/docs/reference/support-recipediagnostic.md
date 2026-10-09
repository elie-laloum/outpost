---
title: "RecipeDiagnostic"
description: "RecipeDiagnostic — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name               | Type                            | Presence | Meaning                                                                                            |
| ------------------ | ------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `publicationId`    | `string \| undefined`           | Optional | Identifier of the publication journal retained after failure; tasks retain their completed status. |
| `publicationState` | `string \| undefined`           | Optional | Separate rollback or recovery state for failed publication, independent of task completion.        |
| `message`          | `string`                        | Required | Bounded error message.                                                                             |
| `code`             | `string \| undefined`           | Optional | Outpost fault code when the error is an OutpostError.                                              |
| `status`           | `number \| undefined`           | Optional | Failed process exit status when supplied by the underlying error.                                  |
| `stdout`           | `string \| undefined`           | Optional | Bounded standard output captured for the failed command.                                           |
| `stderr`           | `string \| undefined`           | Optional | Bounded standard error captured for the failed command.                                            |
| `cause`            | `RecipeDiagnostic \| undefined` | Optional | Nested cause retained up to the diagnostic depth limit.                                            |

## Signature

```ts
export interface RecipeDiagnostic {
  readonly publicationId?: string;
  readonly publicationState?: string;
  readonly message: string;
  readonly code?: string;
  readonly status?: number;
  readonly stdout?: string;
  readonly stderr?: string;
  readonly cause?: RecipeDiagnostic;
}
```
