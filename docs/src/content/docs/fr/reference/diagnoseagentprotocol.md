---
title: "diagnoseAgentProtocol"
description: "diagnoseAgentProtocol — Outpost API"
sidebar:
  order: 10
---

Contrat public de **diagnoseAgentProtocol**. Consultez le [guide diagnostics](../../operations/doctor/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [AgentProtocolReport](../agentprotocolreport/)
- [DoctorAgent](../doctoragent/)
