---
title: "fromSecrets"
description: "fromSecrets — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { fromSecrets } from "@elie-laloum/outpost";
```

## Purpose and behavior

Resolve an explicit selection at startup into a frozen string mapping. Reject invalid declarations before reading, missing or invalid values after reading, and sanitize source errors without their causes. Bound the complete call with a deadline and optional cancellation, without changing process.env, writing values to disk, closing clients or caching values.

[Complete example and detailed rules](../../guide/secret-sources/).

## Parameters and properties

| Name                | Type                              | Presence | Meaning                                                                                                                                                                                         |
| ------------------- | --------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`            | `SecretSource`                    | Required | Named port implementation that resolves only the requested names on the host; its errors are sanitized and its client remains caller-owned.                                                     |
| `names`             | `readonly string[]`               | Required | Unique environment variable identifiers to resolve. The call snapshots the array; an empty array returns a frozen empty object without invoking the source.                                     |
| `options`           | `FromSecretsOptions \| undefined` | Optional | Deadline and cancellation for the entire startup resolution, including all selected names.                                                                                                      |
| `options.timeoutMs` | `number \| undefined`             | Optional | Positive safe integer deadline for the complete resolution, default 30000 ms; at most 2147483647. Expiry rejects with code timeout and signals the source.                                      |
| `options.signal`    | `AbortSignal \| undefined`        | Optional | Signal supplied to the source for this resolution. HTTP Vault, AWS and Azure cancel requests; other built-in SDK adapters check it between reads while fromSecrets stops waiting independently. |

## Returns

`Promise<Readonly<Record<string, string>>>`

## Signature

```ts
export declare function fromSecrets(
  source: SecretSource,
  names: readonly string[],
  options?: FromSecretsOptions,
): Promise<Readonly<Record<string, string>>>;
```

## Related contracts

- [FromSecretsOptions](../fromsecretsoptions/)
- [SecretSource](../secretsource/)
