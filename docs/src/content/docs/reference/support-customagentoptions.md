---
title: "CustomAgentOptions"
description: "CustomAgentOptions — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name      | Type        | Presence | Meaning                                                                                                                                                                          |
| --------- | ----------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `harness` | `Harness`   | Required | Built-in Outpost harness with its configured model provider.                                                                                                                     |
| `model`   | `ModelSpec` | Required | Model name or { name, reasoning, maxOutputTokens }. The model provider rejects unsupported reasoning or output limits here; the service checks the model name when it is called. |

## Signature

```ts
export interface CustomAgentOptions {
  readonly harness: Harness;
  readonly model: ModelSpec;
}
```

## Related contracts

- [Harness](../type-customharness/)
- [ModelSpec](../modelspec/)
