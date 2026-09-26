---
title: "defineHarnessContextStrategy"
description: "defineHarnessContextStrategy — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Le contrat peut changer avant publication.
:::

## Import

```ts
import { defineHarnessContextStrategy } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit comment un harness personnalisé réécrit son historique avant une requête au modèle. compact reçoit les messages et une aide summarize(), et renvoie une nouvelle liste ou rien ; le moteur la valide, retire le raisonnement rejoué et enregistre une compaction dans la transcription.

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Paramètres et propriétés

| Nom               | Type                                                                                    | Présence | Rôle                                                                                                                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `HarnessContextStrategyOptions`                                                         | Requis   | Nom de la stratégie et fonction compact.                                                                                                                                                     |
| `options.name`    | `string`                                                                                | Requis   | Nom non vide indiqué dans les événements compaction.                                                                                                                                         |
| `options.compact` | `(input: HarnessContextInput) => HarnessContextResult \| Promise<HarnessContextResult>` | Requis   | Renvoie une liste de messages réécrite, ou rien pour garder l’historique. La liste doit commencer et finir par un message utilisateur et garder chaque appel d’outil associé à son résultat. |

## Retour

`HarnessContextStrategy`

## Signature

```ts
export declare function defineHarnessContextStrategy(
  options: HarnessContextStrategyOptions,
): HarnessContextStrategy;
```

## Contrats associés

- [HarnessContextStrategy](../harnesscontextstrategy/)
- [HarnessContextStrategyOptions](../harnesscontextstrategyoptions/)
