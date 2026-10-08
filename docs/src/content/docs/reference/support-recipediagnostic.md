---
title: "RecipeDiagnostic"
description: "RecipeDiagnostic — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name      | Type                            | Presence | Meaning                                                           |
| --------- | ------------------------------- | -------- | ----------------------------------------------------------------- |
| `message` | `string`                        | Required | Bounded error message.                                            |
| `code`    | `string \| undefined`           | Optional | Outpost fault code when the error is an OutpostError.             |
| `status`  | `number \| undefined`           | Optional | Failed process exit status when supplied by the underlying error. |
| `stdout`  | `string \| undefined`           | Optional | Bounded standard output captured for the failed command.          |
| `stderr`  | `string \| undefined`           | Optional | Bounded standard error captured for the failed command.           |
| `cause`   | `RecipeDiagnostic \| undefined` | Optional | Nested cause retained up to the diagnostic depth limit.           |

## Signature

```ts
export interface RecipeDiagnostic {
  readonly message: string;
  readonly code?: string;
  readonly status?: number;
  readonly stdout?: string;
  readonly stderr?: string;
  readonly cause?: RecipeDiagnostic;
}
```
