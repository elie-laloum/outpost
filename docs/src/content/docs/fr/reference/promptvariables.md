---
title: "PromptVariables"
description: "PromptVariables — Outpost API"
sidebar:
  order: 10
---

Contrat public de **PromptVariables**. Consultez le [guide prompts et réponses](../../guide/agents/responses/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { PromptVariables } from "@elie-laloum/outpost";
```

## Rôle et comportement

Fournir un brief littéral ou fichier et valider une réponse balisée avant d’exposer sa valeur typée.

Fournissez exactement une forme de brief. L’expansion vaut par défaut 30 secondes par commande originale. Les réparations de réponse valent zéro par défaut. Une réponse structurée exige une passe.

[Exemple complet et règles détaillées](../../guide/agents/responses/).

## Signature

```ts
export type PromptVariables = Readonly<
  Record<string, string | number | boolean>
>;
```
