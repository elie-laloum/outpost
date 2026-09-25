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

## Rôle et comportement

Rejoue les fixtures d’événements intégrées dans l’adapter choisi et rapporte la compatibilité de décodage avec la version CLI enregistrée. Ne lance pas le CLI installé, ne valide pas les identifiants et ne teste pas de modèle réel.

[Exemple complet et règles détaillées](../../guide/operations/doctor/).

## Paramètres et propriétés

| Nom     | Type          | Présence | Rôle                                                                               |
| ------- | ------------- | -------- | ---------------------------------------------------------------------------------- |
| `agent` | `DoctorAgent` | Requis   | Identifiant du CLI d’agent à rapporter ou diagnostiquer : claude, codex ou gemini. |

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
