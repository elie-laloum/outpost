---
title: "CustomAgentOptions"
description: "CustomAgentOptions — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name      | Type            | Presence | Meaning                                                                                                                                                                      |
| --------- | --------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `harness` | `CustomHarness` | Required | Custom callback harness with its configured model provider.                                                                                                                  |
| `model`   | `ModelSpec`     | Required | Required model name or AgentModel object. The model provider validates reasoning and output limits when the agent is composed; model availability is checked by the service. |

## Signature

```ts
export interface CustomAgentOptions {
  readonly harness: CustomHarness;
  readonly model: ModelSpec;
}
```

## Related contracts

- [CustomHarness](../type-customharness/)
- [ModelSpec](../modelspec/)
