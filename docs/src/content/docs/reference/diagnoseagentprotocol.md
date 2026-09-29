---
title: "diagnoseAgentProtocol"
description: "diagnoseAgentProtocol — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { diagnoseAgentProtocol } from "@elie-laloum/outpost";
```

## Purpose and behavior

Decode the synthetic event fixtures bundled for an agent with its adapter and return the report synchronously, one check per fixture. Runs no process: the installed CLI, credentials and model stay unverified.

[Complete example and detailed rules](../../guide/diagnostics/).

## Parameters and properties

| Name    | Type               | Presence | Meaning                                                                                         |
| ------- | ------------------ | -------- | ----------------------------------------------------------------------------------------------- |
| `agent` | `BuiltInAgentName` | Required | Built-in agent whose adapter decodes the fixtures: claude, codex, antigravity, copilot or kimi. |

## Returns

`AgentProtocolReport`

## Signature

```ts
export declare function diagnoseAgentProtocol(
  agent: DoctorAgent,
): AgentProtocolReport;
```

## Related contracts

- [AgentProtocolReport](../agentprotocolreport/)
- [DoctorAgent](../doctoragent/)
