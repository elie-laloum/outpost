---
title: "CustomAgentOptions"
description: "CustomAgentOptions — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name      | Type            | Presence | Meaning                                                                                            |
| --------- | --------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `harness` | `CustomHarness` | Required | Custom callback harness with its configured model provider.                                        |
| `model`   | `string`        | Required | Required nonempty model identifier passed to the provider; availability is checked by the service. |

## Signature

```ts
export interface CustomAgentOptions {
  readonly harness: CustomHarness;
  readonly model: string;
}
```

## Related contracts

- [CustomHarness](../type-customharness/)
