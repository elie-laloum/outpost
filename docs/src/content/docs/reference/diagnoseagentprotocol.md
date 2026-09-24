---
title: "diagnoseAgentProtocol"
description: "diagnoseAgentProtocol — Outpost API"
sidebar:
  order: 10
---

Public contract for **diagnoseAgentProtocol**. See the [diagnostics guide](../../operations/doctor/) for behavior, defaults and examples.

## Import

```ts
import { diagnoseAgentProtocol } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function diagnoseAgentProtocol(
  agent: DoctorAgent,
): AgentProtocolReport;
```

## Related contracts

- [AgentProtocolReport](../agentprotocolreport/)
- [DoctorAgent](../doctoragent/)
