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

Définit un outil sérialisé exécutant un agent enfant intégré avec un historique neuf dans la sandbox empruntée du parent. Le parent fournit { prompt } ; le résultat est un texte JSON contenant text et un identifiant conversation optionnel. Les tokens enfants comptent une seule fois dans le dispatch et dans chaque budget ancêtre ; annulation et permissions déclaratives se propagent. L’outil ne peut pas être exécuté hors du runtime du harness.

[Exemple complet et règles détaillées](../../guide/harness/).

## Paramètres et propriétés

| Nom                   | Type                     | Présence | Rôle                                                                                                                                                                |
| --------------------- | ------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `HarnessSubagentOptions` | Requis   | Nom, description visible du modèle et agent enfant intégré composé explicitement. Définir l’outil ne l’exécute pas.                                                 |
| `options.name`        | `string`                 | Requis   | Nom d’outil unique présenté au modèle parent, composé de 1 à 64 lettres, chiffres, tirets ou underscores.                                                           |
| `options.description` | `string`                 | Requis   | Explique quand le parent doit déléguer à cet enfant ; transmis avec le schéma de l’outil.                                                                           |
| `options.agent`       | `CustomAgent`            | Requis   | Agent intégré créé avec createAgent({ harness: createHarness(...), model }) ; définit les instructions, outils et limites de l’enfant. Les agents CLI sont refusés. |

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
