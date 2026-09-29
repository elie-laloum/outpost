---
title: "HarnessInstructionContext"
description: "HarnessInstructionContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessInstructionContext } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                             | Presence | Meaning                                                                                                                                       |
| --------- | -------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `sandbox` | `SandboxLease`                   | Required | Borrowed sandbox of the turn, for example to read project guidance before the first request.                                                  |
| `signal`  | `AbortSignal`                    | Required | Turn cancellation signal; honor it in asynchronous resolvers.                                                                                 |
| `model`   | `AgentModel`                     | Required | Normalized model of the agent running the turn.                                                                                               |
| `mcp`     | `HarnessMcpContext \| undefined` | Optional | Access to the MCP servers started for this turn, present when the harness declares mcpServers. Skill instruction resolvers do not receive it. |

## Signature

```ts
export interface HarnessInstructionContext {
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
  readonly model: AgentModel;
  readonly mcp?: HarnessMcpContext;
}
```

## Related contracts

- [AgentModel](../agentmodel/)
- [HarnessMcpContext](../harnessmcpcontext/)
- [SandboxLease](../sandboxlease/)
