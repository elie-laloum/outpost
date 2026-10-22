---
title: "ExecutionRequirement"
description: "ExecutionRequirement — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ExecutionRequirement } from "@elie-laloum/outpost/core";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name         | Type                                                                        | Presence          | Meaning                                                                                                                                       |
| ------------ | --------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`       | `"binding" \| "agent"`                                                      | Required          | binding for a workspace binding the sandbox provider must support, agent for a capability an agent must have declared.                        |
| `binding`    | `FileWorkspaceBinding`                                                      | Variant-dependent | With kind binding: the binding the workspace source needs, compared with the provider's workspaces.bindings.                                  |
| `agent`      | `string`                                                                    | Variant-dependent | With kind agent: the name of the agent that must provide the capability.                                                                      |
| `capability` | `"continuation" \| "dispatch" \| "interactive" \| "liveInput" \| "repairs"` | Variant-dependent | With kind agent: the file workspace capability required, such as dispatch for every run or continuation when settings resumes a conversation. |

## Signature

```ts
export type ExecutionRequirement =
  | {
      readonly kind: "binding";
      readonly binding: FileWorkspaceBinding;
    }
  | {
      readonly kind: "agent";
      readonly agent: string;
      readonly capability: FileAgentCapability;
    };
```

## Related contracts

- [FileAgentCapability](../fileagentcapability/)
- [FileWorkspaceBinding](../support-fileworkspacebinding/)
