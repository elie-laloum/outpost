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

[Exemple complet et règles détaillées](../../guide/diagnostics/).

## Paramètres et propriétés

| Nom     | Type                                                             | Présence | Rôle                                                                                                                    |
| ------- | ---------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `agent` | `import("../adapters/agents/catalog.types.js").BuiltInAgentName` | Requis   | Identifiant du CLI d’agent à rapporter ou diagnostiquer : claude, codex, antigravity (exécutable agy), copilot ou kimi. |

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
