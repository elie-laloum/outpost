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

Décode dans l’adapter de l’agent les fixtures d’événements synthétiques intégrées et renvoie le rapport de façon synchrone, un contrôle par fixture. Aucun processus n’est lancé : la CLI installée, les identifiants et le modèle restent non vérifiés.

[Exemple complet et règles détaillées](../../guide/diagnostics/).

## Paramètres et propriétés

| Nom     | Type               | Présence | Rôle                                                                                            |
| ------- | ------------------ | -------- | ----------------------------------------------------------------------------------------------- |
| `agent` | `BuiltInAgentName` | Requis   | Agent intégré dont l’adapter décode les fixtures : claude, codex, antigravity, copilot ou kimi. |

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
