---
title: "diagnoseAgentProtocol"
description: "diagnoseAgentProtocol — Outpost API"
sidebar:
  order: 10
---

Public contract for **diagnoseAgentProtocol**. See the [diagnostics guide](../../guide/operations/doctor/) for behavior, defaults and examples.

## Import

```ts
import { diagnoseAgentProtocol } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect host prerequisites, an owned sandbox or recorded agent protocol fixtures. Diagnostics report observations; they do not prove account or model access.

Checks distinguish unavailable, failed and unsupported capabilities. Sandbox diagnosis uses its existing operation gate and never takes ownership of disposal.

[Complete example and detailed rules](../../guide/operations/doctor/).

## Parameters and properties

| Name    | Type          | Presence | Meaning                      |
| ------- | ------------- | -------- | ---------------------------- |
| `agent` | `DoctorAgent` | Required | Native coding-agent adapter. |

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
