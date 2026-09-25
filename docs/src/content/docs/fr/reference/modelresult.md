---
title: "ModelResult"
description: "ModelResult — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : requêtes texte bornées et exécution de harness fournie par l’appelant. Sans boucle d’outils intégrée, streaming ni persistance native des conversations personnalisées.
:::

## Import

```ts
import type { ModelResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom     | Type                 | Présence  | Rôle                                                                                                                                                                                                                        |
| ------- | -------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`  | `string`             | Requis    | Texte complet de l’assistant, espaces préservés ; les parties output_text de Responses sont concaténées dans l’ordre. Les sorties incomplètes ou non prises en charge échouent sans succès partiel.                         |
| `usage` | `Usage \| undefined` | Optionnel | Comptes de tokens déclarés par le service, si présents. Une consommation absente reste absente ; un détail de cache absent vaut zéro. Ce n’est ni une estimation de facturation ni une déclaration automatique au workflow. |

## Signature

```ts
export interface ModelResult {
  readonly text: string;
  readonly usage?: Usage;
}
```

## Contrats associés

- [Usage](../usage/)
