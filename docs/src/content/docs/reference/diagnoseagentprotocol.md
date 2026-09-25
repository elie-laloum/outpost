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

Replay bundled event fixtures through the selected agent adapter and report decoding compatibility with the recorded CLI version. It does not launch the installed CLI, validate credentials or test a live model.

[Complete example and detailed rules](../../guide/operations/doctor/).

## Parameters and properties

| Name    | Type          | Presence | Meaning                                                              |
| ------- | ------------- | -------- | -------------------------------------------------------------------- |
| `agent` | `DoctorAgent` | Required | Agent CLI identifier to report or diagnose: claude, codex or gemini. |

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
