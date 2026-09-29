---
title: "defineHarnessSubagent"
description: "defineHarnessSubagent — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineHarnessSubagent } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit un outil qui exécute un agent enfant intégré, avec un historique neuf, dans la sandbox empruntée du parent. Le modèle parent envoie { prompt } ; l’outil renvoie un texte JSON avec le texte de l’enfant et l’identifiant de sa conversation, et un échec de l’enfant est traité comme toute erreur d’outil. Les tokens de l’enfant comptent dans l’usage du dispatch et dans chaque budget ancêtre, et les permissions des ancêtres s’appliquent aussi à ses outils.

[Exemple complet et règles détaillées](../../guide/subagents/).

## Paramètres et propriétés

| Nom                   | Type                     | Présence | Rôle                                                                                                                                                                                                  |
| --------------------- | ------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `HarnessSubagentOptions` | Requis   | Nom de l’outil, description montrée au modèle parent et agent enfant intégré. Les clés inconnues sont refusées.                                                                                       |
| `options.name`        | `string`                 | Requis   | Nom d’outil unique présenté au modèle parent, composé de 1 à 64 lettres, chiffres, tirets ou underscores.                                                                                             |
| `options.description` | `string`                 | Requis   | Indique au modèle parent quand déléguer à cet enfant ; envoyée avec le schéma de l’outil.                                                                                                             |
| `options.agent`       | `CustomAgent`            | Requis   | Agent intégré issu de createAgent({ harness: createHarness(…), model }) qui fournit les instructions, outils, limites et permissions de l’enfant. Un agent CLI est refusé avec le code configuration. |

## Retour

`HarnessSubagent`

## Signature

```ts
export declare function defineHarnessSubagent(
  options: HarnessSubagentOptions,
): HarnessSubagent;
```

## Contrats associés

- [HarnessSubagent](../harnesssubagent/)
- [HarnessSubagentOptions](../harnesssubagentoptions/)
