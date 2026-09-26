---
title: "CustomHarness"
description: "CustomHarness — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Le streaming n’est pas encore disponible ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { CustomHarness } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                                                                 | Présence  | Rôle                                                                                                                |
| --------------- | -------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------- |
| `kind`          | `"custom"`                                                           | Requis    | Discriminant d’exécution : custom.                                                                                  |
| `modelProvider` | `ModelProvider`                                                      | Requis    | Transport de requêtes que le moteur appelle à chaque étape ; il valide le modèle de l’agent à la composition.       |
| `instructions`  | `readonly HarnessInstructions[]`                                     | Requis    | Sources d’instructions normalisées, résolues au début de chaque passe.                                              |
| `tools`         | `readonly HarnessTool<unknown>[]`                                    | Requis    | Liste d’outils aplatie et figée, envoyée au modèle dans l’ordre de déclaration.                                     |
| `limits`        | `ResolvedHarnessLimits`                                              | Requis    | Limites normalisées ; maxSteps vaut 100 par défaut.                                                                 |
| `toolExecution` | `Required<HarnessToolExecution>`                                     | Requis    | Réglages d’exécution des outils normalisés, valeurs par défaut appliquées.                                          |
| `hooks`         | `readonly HarnessHook<import("./hook.types.ts").HarnessHookPhase>[]` | Requis    | Hooks figés du harness.                                                                                             |
| `permissions`   | `HarnessPermissions \| undefined`                                    | Optionnel | Règles de permission évaluées avant les hooks before-tool, si elles sont définies.                                  |
| `context`       | `HarnessContextStrategy \| undefined`                                | Optionnel | Stratégie de contexte du harness, si elle est définie.                                                              |
| `conversations` | `false \| ConversationStore \| undefined`                            | Optionnel | Store de conversations configuré, ou false si l’enregistrement est désactivé ; absent signifie le store par défaut. |
| `skills`        | `readonly HarnessSkill[]`                                            | Requis    | Skills du harness ; leurs outils et load_skill font partie de la liste d’outils.                                    |
| `cache`         | `boolean`                                                            | Requis    | Indique si chaque requête demande au fournisseur de mettre en cache le préfixe de la conversation.                  |

## Signature

```ts
export interface CustomHarness {
  readonly kind: "custom";
  readonly modelProvider: ModelProvider;
  readonly instructions: readonly HarnessInstructions[];
  readonly tools: readonly HarnessTool[];
  readonly limits: ResolvedHarnessLimits;
  readonly toolExecution: Required<HarnessToolExecution>;
  readonly hooks: readonly HarnessHook[];
  readonly permissions?: HarnessPermissions;
  readonly context?: HarnessContextStrategy;
  readonly conversations?: ConversationStore | false;
  readonly skills: readonly HarnessSkill[];
  readonly cache: boolean;
}
```

## Contrats associés

- [ConversationStore](../conversationstore/)
- [HarnessContextStrategy](../harnesscontextstrategy/)
- [HarnessHook](../harnesshook/)
- [HarnessInstructions](../harnessinstructions/)
- [HarnessPermissions](../harnesspermissions/)
- [HarnessSkill](../harnessskill/)
- [HarnessTool](../harnesstool/)
- [HarnessToolExecution](../harnesstoolexecution/)
- [ModelProvider](../modelprovider/)
- [ResolvedHarnessLimits](../support-resolvedharnesslimits/)
