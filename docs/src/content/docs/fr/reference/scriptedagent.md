---
title: "scriptedAgent"
description: "scriptedAgent — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { scriptedAgent } from "@elie-laloum/outpost/testing";
```

## Rôle et comportement

Crée un agent de test au contrat CLI qui consomme une copie des tours dans leur ordre de déclaration, y compris retries, passes et réparations de réponse. Il émet les événements prédéfinis et un usage nul complet par défaut ; épuiser les tours lève le code process. Utilisez explicitement createMemorySandboxProvider. Les identifiants de conversation permettent les réparations et reprises dans la même sandbox ouverte uniquement ; capture, reprise à froid, fork, terminal et entrée en direct sont indisponibles. Chaque test indépendant nécessite un nouvel agent.

[Exemple complet et règles détaillées](../../guide/testing-workflows/).

## Paramètres et propriétés

| Nom             | Type                      | Présence  | Rôle                                                                                                                                              |
| --------------- | ------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`       | `ScriptedAgentOptions`    | Requis    | Copie du nom et des tours ordonnés d’un agent de test. Aucune sandbox n’est allouée avant dispatch ou createSandbox.                              |
| `options.name`  | `string \| undefined`     | Optionnel | Nom d’agent visible dans les observations ; scripted par défaut. Les noms vides sont refusés.                                                     |
| `options.turns` | `readonly ScriptedTurn[]` | Requis    | Séquence non vide consommée une fois par requête d’agent, entre sandboxes, passes, retries et réparations. Recréez l’agent pour la réinitialiser. |

## Retour

`CliAgent`

## Signature

```ts
export declare function scriptedAgent(options: ScriptedAgentOptions): CliAgent;
```

## Contrats associés

- [CliAgent](../cliagent/)
- [ScriptedAgentOptions](../scriptedagentoptions/)
