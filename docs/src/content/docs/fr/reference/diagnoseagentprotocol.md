---
title: "diagnoseAgentProtocol"
description: "diagnoseAgentProtocol — Outpost API"
sidebar:
  order: 10
---

Contrat public de **diagnoseAgentProtocol**. Consultez le [guide diagnostics](../../guide/operations/doctor/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { diagnoseAgentProtocol } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inspecter les prérequis hôtes, une sandbox possédée ou les fixtures de protocole. Les diagnostics sont des observations ; ils ne prouvent pas l’accès au compte ou au modèle.

Les contrôles distinguent capacités absentes, en échec et non prises en charge. Le diagnostic de sandbox utilise son verrou d’opération et ne devient pas propriétaire de sa fermeture.

[Exemple complet et règles détaillées](../../guide/operations/doctor/).

## Paramètres et propriétés

| Nom     | Type          | Présence | Rôle                              |
| ------- | ------------- | -------- | --------------------------------- |
| `agent` | `DoctorAgent` | Requis   | Adapter natif de l’agent de code. |

## Retour

`AgentProtocolReport`

## Signature

```ts
export declare function diagnoseAgentProtocol(
  agent: DoctorAgent,
): AgentProtocolReport;
```

## Contrats associés

- [AgentProtocolReport](../agentprotocolreport/)
- [DoctorAgent](../doctoragent/)
