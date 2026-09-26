---
title: "ModelResult"
description: "ModelResult — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : blocs de contenu normalisés, raison d’arrêt et usage renvoyés aux harness personnalisés. Pas encore de streaming ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { ModelResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                        | Présence  | Rôle                                                                                                                                                                                                                        |
| ------------ | ------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`       | `string`                                    | Requis    | Blocs de texte concaténés de la réponse ; vide quand le modèle a seulement appelé des outils.                                                                                                                               |
| `content`    | `readonly ModelContentBlock[] \| undefined` | Optionnel | Blocs de réponse normalisés dans l’ordre du modèle : texte, appels d’outils et raisonnement opaque à rejouer tel quel dans les requêtes suivantes. Les fournisseurs intégrés le renvoient toujours.                         |
| `stopReason` | `ModelStopReason \| undefined`              | Optionnel | Raison de l’arrêt du modèle : end, tool-calls, max-tokens ou refusal. Un résultat max-tokens peut contenir un texte tronqué ou des appels d’outils incomplets.                                                              |
| `usage`      | `Usage \| undefined`                        | Optionnel | Comptes de tokens déclarés par le service, si présents. Une consommation absente reste absente ; un détail de cache absent vaut zéro. Ce n’est ni une estimation de facturation ni une déclaration automatique au workflow. |

## Signature

```ts
export interface ModelResult {
  readonly text: string;
  readonly content?: readonly ModelContentBlock[];
  readonly stopReason?: ModelStopReason;
  readonly usage?: Usage;
}
```

## Contrats associés

- [ModelContentBlock](../modelcontentblock/)
- [ModelStopReason](../modelstopreason/)
- [Usage](../usage/)
