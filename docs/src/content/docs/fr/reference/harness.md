---
title: "AgentHarness"
description: "AgentHarness — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { AgentHarness } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom             | Type                                       | Présence          | Rôle                                                                                                                                                                                                   |
| --------------- | ------------------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `kind`          | `"cli" \| "custom"`                        | Requis            | Discriminant d’exécution : cli or custom.                                                                                                                                                              |
| `bind`          | `(model?: AgentModel) => AgentAdapter`     | Selon la variante | Construit l’adapter pour un modèle facultatif sans lancer la CLI ; createAgent() l’appelle. Les réglages de modèle, formes d’authentification et options MCP non pris en charge lèvent une erreur ici. |
| `routing`       | `HarnessModelRouting \| undefined`         | Selon la variante | Configuration validée de routage par étape conservée par le harness intégré.                                                                                                                           |
| `modelProvider` | `ModelProvider`                            | Selon la variante | Fournisseur de modèles appelé à chaque étape et pour chaque résumé.                                                                                                                                    |
| `instructions`  | `readonly HarnessInstructions[]`           | Selon la variante | Sources d’instructions résolues au début de chaque tour, suivies du catalogue des skills quand des skills sont définies.                                                                               |
| `tools`         | `readonly HarnessTool<unknown>[]`          | Selon la variante | Liste aplatie des outils envoyée au modèle : outils déclarés, puis outils des skills et load_skill. Les outils MCP s’ajoutent au début de chaque tour.                                                 |
| `limits`        | `ResolvedHarnessLimits`                    | Selon la variante | Limites normalisées ; maxSteps vaut 100 par défaut.                                                                                                                                                    |
| `toolExecution` | `Required<HarnessToolExecution>`           | Selon la variante | Réglages d’exécution des outils, défauts appliqués : concurrency 4, deadlineMs 300000, onError return-to-model.                                                                                        |
| `hooks`         | `readonly HarnessHook<HarnessHookPhase>[]` | Selon la variante | Hooks figés du harness.                                                                                                                                                                                |
| `permissions`   | `HarnessPermissions \| undefined`          | Selon la variante | Règles de permission évaluées avant les hooks before-tool, si elles sont définies.                                                                                                                     |
| `context`       | `HarnessContextStrategy \| undefined`      | Selon la variante | Stratégie de contexte du harness, si elle est définie.                                                                                                                                                 |
| `conversations` | `false \| ConversationStore \| undefined`  | Selon la variante | Store de conversations configuré, ou false si l’enregistrement est désactivé ; absent signifie le store par défaut.                                                                                    |
| `skills`        | `readonly HarnessSkill[]`                  | Selon la variante | Skills du harness ; leurs outils et load_skill font partie de la liste d’outils.                                                                                                                       |
| `cache`         | `boolean`                                  | Selon la variante | Indique si chaque requête demande au fournisseur de mettre en cache le préfixe de la conversation.                                                                                                     |
| `mcpServers`    | `McpServers \| undefined`                  | Selon la variante | Serveurs MCP validés, démarrés à chaque tour, lorsqu’ils sont définis.                                                                                                                                 |

## Signature

```ts
export type AgentHarness = CliHarness | Harness;
```

## Contrats associés

- [CliHarness](../cliharness/)
- [Harness](../type-customharness/)
