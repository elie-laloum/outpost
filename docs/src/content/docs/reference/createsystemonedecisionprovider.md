---
title: "createSystemOneDecisionProvider"
description: "createSystemOneDecisionProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createSystemOneDecisionProvider } from "@elie-laloum/outpost";
```

## Purpose and behavior

Build a bounded HTTP System One provider shared by Jev and compatible Laya endpoints. Append /systemone to the base URL, use explicit bearer authentication or false, retain native JSON extensions and make no internal retries.

[Complete example and detailed rules](../../guide/decisions/).

## Parameters and properties

| Name                       | Type                               | Presence | Meaning                                                                                                                            |
| -------------------------- | ---------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `options`                  | `SystemOneDecisionProviderOptions` | Required | HTTP endpoint, explicit authentication and request bounds for the System One protocol.                                             |
| `options.baseUrl`          | `string`                           | Required | HTTP(S) base URL including the version prefix, such as /v1; /systemone is appended. Credentials, query and fragment are forbidden. |
| `options.apiKey`           | `string \| false`                  | Required | Explicit nonempty bearer key, or false for an unauthenticated endpoint.                                                            |
| `options.timeoutMs`        | `number \| undefined`              | Optional | Request deadline including response reading, in positive integer milliseconds; defaults to 120000.                                 |
| `options.maxResponseBytes` | `number \| undefined`              | Optional | Positive integer bound on response bytes; defaults to 8 MiB. Oversized responses fail with response.                               |

## Returns

`DecisionProvider`

## Signature

```ts
export declare function createSystemOneDecisionProvider(
  options: SystemOneDecisionProviderOptions,
): DecisionProvider;
```

## Related contracts

- [DecisionProvider](../decisionprovider/)
- [SystemOneDecisionProviderOptions](../systemonedecisionprovideroptions/)
