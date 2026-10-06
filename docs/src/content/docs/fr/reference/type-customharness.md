---
title: "Harness"
description: "Harness — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Harness } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                                       | Présence  | Rôle                                                                                                                                                   |
| --------------- | ------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `routing`       | `HarnessModelRouting \| undefined`         | Optionnel | Configuration validée de routage par étape conservée par le harness intégré.                                                                           |
| `kind`          | `"custom"`                                 | Requis    | Discriminant d’exécution : custom.                                                                                                                     |
| `modelProvider` | `ModelProvider`                            | Requis    | Fournisseur de modèles appelé à chaque étape et pour chaque résumé.                                                                                    |
| `instructions`  | `readonly HarnessInstructions[]`           | Requis    | Sources d’instructions résolues au début de chaque tour, suivies du catalogue des skills quand des skills sont définies.                               |
| `tools`         | `readonly HarnessTool<unknown>[]`          | Requis    | Liste aplatie des outils envoyée au modèle : outils déclarés, puis outils des skills et load_skill. Les outils MCP s’ajoutent au début de chaque tour. |
| `limits`        | `ResolvedHarnessLimits`                    | Requis    | Limites normalisées ; maxSteps vaut 100 par défaut.                                                                                                    |
| `toolExecution` | `Required<HarnessToolExecution>`           | Requis    | Réglages d’exécution des outils, défauts appliqués : concurrency 4, deadlineMs 300000, onError return-to-model.                                        |
| `hooks`         | `readonly HarnessHook<HarnessHookPhase>[]` | Requis    | Hooks figés du harness.                                                                                                                                |
| `permissions`   | `HarnessPermissions \| undefined`          | Optionnel | Règles de permission évaluées avant les hooks before-tool, si elles sont définies.                                                                     |
| `context`       | `HarnessContextStrategy \| undefined`      | Optionnel | Stratégie de contexte du harness, si elle est définie.                                                                                                 |
| `conversations` | `false \| ConversationStore \| undefined`  | Optionnel | Store de conversations configuré, ou false si l’enregistrement est désactivé ; absent signifie le store par défaut.                                    |
| `skills`        | `readonly HarnessSkill[]`                  | Requis    | Skills du harness ; leurs outils et load_skill font partie de la liste d’outils.                                                                       |
| `cache`         | `boolean`                                  | Requis    | Indique si chaque requête demande au fournisseur de mettre en cache le préfixe de la conversation.                                                     |
| `mcpServers`    | `McpServers \| undefined`                  | Optionnel | Serveurs MCP validés, démarrés à chaque tour, lorsqu’ils sont définis.                                                                                 |

## Signature

```ts
export interface Harness {
  readonly routing?: HarnessModelRouting;
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
  readonly mcpServers?: McpServers;
}
```

## Contrats associés

- [ConversationStore](../conversationstore/)
- [HarnessContextStrategy](../harnesscontextstrategy/)
- [HarnessHook](../harnesshook/)
- [HarnessInstructions](../harnessinstructions/)
- [HarnessModelRouting](../harnessmodelrouting/)
- [HarnessPermissions](../harnesspermissions/)
- [HarnessSkill](../harnessskill/)
- [HarnessTool](../harnesstool/)
- [HarnessToolExecution](../harnesstoolexecution/)
- [McpServers](../mcpservers/)
- [ModelProvider](../modelprovider/)
- [ResolvedHarnessLimits](../support-resolvedharnesslimits/)
