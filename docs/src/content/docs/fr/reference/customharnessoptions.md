---
title: "CustomHarnessOptions"
description: "CustomHarnessOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Skills et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { CustomHarnessOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                                                                              | Présence  | Rôle                                                                                                                                                                                                  |
| --------------- | --------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelProvider` | `ModelProvider`                                                                   | Requis    | Transport de requêtes que le moteur appelle à chaque étape ; il valide le modèle de l’agent à la composition.                                                                                         |
| `instructions`  | `HarnessInstructionsOption \| undefined`                                          | Optionnel | Instructions système en texte, résultat de defineHarnessInstructions() ou liste des deux. Résolues à chaque passe et jointes par des lignes vides ; les résultats vides sont ignorés.                 |
| `tools`         | `readonly (HarnessTool<unknown> \| HarnessToolset)[] \| undefined`                | Optionnel | Outils et jeux d’outils que le modèle peut appeler. Les jeux imbriqués sont aplatis ; les noms doivent être uniques dans tout le harness.                                                             |
| `limits`        | `HarnessLimits \| undefined`                                                      | Optionnel | Bornes sur les étapes, les appels d’outils et l’usage de tokens. En atteindre une fait échouer la passe avec le code limit.                                                                           |
| `toolExecution` | `HarnessToolExecution \| undefined`                                               | Optionnel | Concurrence des outils, délai par appel et politique d’erreur.                                                                                                                                        |
| `hooks`         | `readonly HarnessHook<import("./hook.types.ts").HarnessHookPhase>[] \| undefined` | Optionnel | Hooks issus de defineHarnessHook, exécutés dans l’ordre de déclaration au sein de chaque phase.                                                                                                       |
| `permissions`   | `HarnessPermissions \| undefined`                                                 | Optionnel | Règles issues de defineHarnessPermissions, évaluées avant les hooks before-tool.                                                                                                                      |
| `context`       | `HarnessContextStrategy \| undefined`                                             | Optionnel | Stratégie qui peut réécrire l’historique avant chaque requête au modèle, comme truncateToolResults() ou summarizeHistory().                                                                           |
| `conversations` | `false \| ConversationStore \| undefined`                                         | Optionnel | Store des transcriptions de passes ; harnessConversations() par défaut. Utilisez transportConversations("harness", …) pour un stockage distant, ou false pour désactiver continuation et réparations. |
| `cache`         | `boolean \| undefined`                                                            | Optionnel | Demande au fournisseur de mettre en cache le préfixe de la conversation ; true par défaut. OpenAI met en cache les préfixes stables automatiquement.                                                  |

## Signature

```ts
export interface CustomHarnessOptions {
  readonly modelProvider: ModelProvider;
  readonly instructions?: HarnessInstructionsOption;
  readonly tools?: readonly (HarnessTool | HarnessToolset)[];
  readonly limits?: HarnessLimits;
  readonly toolExecution?: HarnessToolExecution;
  readonly hooks?: readonly HarnessHook[];
  readonly permissions?: HarnessPermissions;
  readonly context?: HarnessContextStrategy;
  readonly conversations?: ConversationStore | false;
  readonly cache?: boolean;
}
```

## Contrats associés

- [ConversationStore](../conversationstore/)
- [HarnessContextStrategy](../harnesscontextstrategy/)
- [HarnessHook](../harnesshook/)
- [HarnessInstructionsOption](../harnessinstructionsoption/)
- [HarnessLimits](../harnesslimits/)
- [HarnessPermissions](../harnesspermissions/)
- [HarnessTool](../harnesstool/)
- [HarnessToolExecution](../harnesstoolexecution/)
- [HarnessToolset](../harnesstoolset/)
- [ModelProvider](../modelprovider/)
