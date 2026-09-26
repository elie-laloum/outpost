---
title: "Harness"
description: "Harness — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { Harness } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom             | Type                                                                 | Présence          | Rôle                                                                                                                                                                    |
| --------------- | -------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`          | `"cli" \| "custom"`                                                  | Requis            | Discriminant d’exécution : cli or custom.                                                                                                                               |
| `bind`          | `(model?: AgentModel) => AgentAdapter`                               | Selon la variante | Construit l’adaptateur CLI pour un AgentModel normalisé optionnel sans lancer le programme ; un raisonnement ou une limite de sortie non pris en charge est refusé ici. |
| `modelProvider` | `ModelProvider`                                                      | Selon la variante | Transport de requêtes que le moteur appelle à chaque étape ; il valide le modèle de l’agent à la composition.                                                           |
| `instructions`  | `readonly HarnessInstructions[]`                                     | Selon la variante | Sources d’instructions normalisées, résolues au début de chaque passe.                                                                                                  |
| `tools`         | `readonly HarnessTool<unknown>[]`                                    | Selon la variante | Liste d’outils aplatie et figée, envoyée au modèle dans l’ordre de déclaration.                                                                                         |
| `limits`        | `ResolvedHarnessLimits`                                              | Selon la variante | Limites normalisées ; maxSteps vaut 100 par défaut.                                                                                                                     |
| `toolExecution` | `Required<HarnessToolExecution>`                                     | Selon la variante | Réglages d’exécution des outils normalisés, valeurs par défaut appliquées.                                                                                              |
| `hooks`         | `readonly HarnessHook<import("./hook.types.ts").HarnessHookPhase>[]` | Selon la variante | Hooks figés du harness.                                                                                                                                                 |
| `permissions`   | `HarnessPermissions \| undefined`                                    | Selon la variante | Règles de permission évaluées avant les hooks before-tool, si elles sont définies.                                                                                      |
| `context`       | `HarnessContextStrategy \| undefined`                                | Selon la variante | Stratégie de contexte du harness, si elle est définie.                                                                                                                  |
| `conversations` | `false \| ConversationStore \| undefined`                            | Selon la variante | Store de conversations configuré, ou false si l’enregistrement est désactivé ; absent signifie le store par défaut.                                                     |
| `cache`         | `boolean`                                                            | Selon la variante | Indique si chaque requête demande au fournisseur de mettre en cache le préfixe de la conversation.                                                                      |

## Signature

```ts
export type Harness = CliHarness | CustomHarness;
```

## Contrats associés

- [CliHarness](../cliharness/)
- [CustomHarness](../type-customharness/)
