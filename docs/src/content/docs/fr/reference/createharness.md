---
title: "createHarness"
description: "createHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHarness } from "@elie-laloum/outpost";
```

## Rôle et comportement

Compose le harness intégré : Outpost exécute lui-même la boucle du modèle, appelle le fournisseur de modèles à chaque étape et exécute les outils via la sandbox empruntée. Les options sont validées immédiatement et les clés inconnues refusées ; rien ne s’exécute avant le dispatch d’un agent issu de createAgent({ harness, model }).

[Exemple complet et règles détaillées](../../guide/harness/).

## Paramètres et propriétés

| Nom                     | Type                                                               | Présence  | Rôle                                                                                                                                                                                                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`               | `HarnessOptions`                                                   | Requis    | Réglages du harness intégré : fournisseur de modèles, instructions, outils, limites, exécution des outils, hooks, permissions, stratégie de contexte, skills, conversations, cache et serveurs MCP.                                                                                                                          |
| `options.modelProvider` | `ModelProvider`                                                    | Requis    | Fournisseur de modèles appelé à chaque étape et pour chaque résumé, par exemple createOpenAIModelProvider() ou createAnthropicModelProvider(). Son validate() contrôle le modèle de l’agent quand createAgent() compose l’agent.                                                                                             |
| `options.instructions`  | `HarnessInstructionsOption \| undefined`                           | Optionnel | Instructions système en texte, résultat de defineHarnessInstructions() ou de defineMcpPrompt(), ou liste de ces valeurs. Résolues à chaque tour et jointes par des lignes vides ; les résultats vides sont ignorés.                                                                                                          |
| `options.tools`         | `readonly (HarnessTool<unknown> \| HarnessToolset)[] \| undefined` | Optionnel | Outils et jeux d’outils que le modèle peut appeler. Les jeux imbriqués sont aplatis ; les noms doivent être uniques dans tout le harness, outils de skills et MCP compris.                                                                                                                                                   |
| `options.limits`        | `HarnessLimits \| undefined`                                       | Optionnel | Bornes par tour sur les étapes, les appels d’outils, la profondeur de délégation et l’usage de tokens. Un dépassement échoue avec le code limit.                                                                                                                                                                             |
| `options.toolExecution` | `HarnessToolExecution \| undefined`                                | Optionnel | Parallélisme des outils, délai par appel et politique d’erreur.                                                                                                                                                                                                                                                              |
| `options.hooks`         | `readonly HarnessHook<HarnessHookPhase>[] \| undefined`            | Optionnel | Hooks issus de defineHarnessHook, exécutés dans l’ordre de déclaration au sein de chaque phase.                                                                                                                                                                                                                              |
| `options.permissions`   | `HarnessPermissions \| undefined`                                  | Optionnel | Règles issues de defineHarnessPermissions(), évaluées avant les hooks before-tool. Elles s’appliquent aussi aux appels d’outils de chaque sous-agent.                                                                                                                                                                        |
| `options.context`       | `HarnessContextStrategy \| undefined`                              | Optionnel | Stratégie qui peut réécrire l’historique avant chaque requête au modèle, comme truncateToolResults() ou summarizeHistory().                                                                                                                                                                                                  |
| `options.conversations` | `false \| ConversationStore \| undefined`                          | Optionnel | Store des transcriptions de tours, createHarnessConversations() par défaut, sous .outpost/conversations/harness dans le dépôt. Enveloppez-le avec createTransportConversations() pour un stockage distant ; false désactive la capture, la continuation et les réparations de réponse.                                       |
| `options.skills`        | `readonly HarnessSkill[] \| undefined`                             | Optionnel | Skills listées dans les instructions système et chargées à la demande par l’outil load_skill ; les noms de skills en double sont refusés.                                                                                                                                                                                    |
| `options.cache`         | `boolean \| undefined`                                             | Optionnel | Demande au fournisseur de modèles de mettre en cache le préfixe de la conversation à chaque requête, true par défaut. Le fournisseur Anthropic marque le préfixe pour le cache ; OpenAI met en cache les préfixes stables de lui-même.                                                                                       |
| `options.mcpServers`    | `McpServers \| undefined`                                          | Optionnel | Serveurs MCP indexés par nom, démarrés dans la sandbox empruntée à chaque tour ; leurs outils apparaissent sous la forme mcp__&lt;server>__&lt;tool>, avec des outils de ressources et de prompts quand les serveurs en proposent. La sandbox doit prendre en charge liveInput, et les serveurs oauth: "login" sont refusés. |

## Retour

`Harness`

## Signature

```ts
export declare function createHarness(options: HarnessOptions): Harness;
```

## Contrats associés

- [Harness](../type-customharness/)
- [HarnessOptions](../customharnessoptions/)
