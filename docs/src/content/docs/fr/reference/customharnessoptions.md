---
title: "HarnessOptions"
description: "HarnessOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                                                               | Présence  | Rôle                                                                                                                                                                                                                                                                                                                             |
| --------------- | ------------------------------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `routing`       | `HarnessModelRouting \| undefined`                                 | Optionnel | Routage facultatif par étape déclaré avec defineHarnessModelRouting ; tous les candidats utilisent le provider de modèles du harness.                                                                                                                                                                                            |
| `modelProvider` | `ModelProvider`                                                    | Requis    | Fournisseur de modèles appelé à chaque étape et pour chaque résumé, par exemple createOpenAIModelProvider() ou createAnthropicModelProvider(). Son validate() contrôle le modèle de l’agent quand createAgent() compose l’agent.                                                                                                 |
| `instructions`  | `HarnessInstructionsOption \| undefined`                           | Optionnel | Instructions système en texte, résultat de defineHarnessInstructions() ou de defineMcpPrompt(), ou liste de ces valeurs. Résolues à chaque tour et jointes par des lignes vides ; les résultats vides sont ignorés.                                                                                                              |
| `tools`         | `readonly (HarnessTool<unknown> \| HarnessToolset)[] \| undefined` | Optionnel | Outils et jeux d’outils que le modèle peut appeler. Les jeux imbriqués sont aplatis ; les noms doivent être uniques dans tout le harness, outils de skills et MCP compris.                                                                                                                                                       |
| `limits`        | `HarnessLimits \| undefined`                                       | Optionnel | Bornes par tour sur les étapes, les appels d’outils, la profondeur de délégation et l’usage de tokens. Un dépassement échoue avec le code limit.                                                                                                                                                                                 |
| `toolExecution` | `HarnessToolExecution \| undefined`                                | Optionnel | Parallélisme des outils, délai par appel et politique d’erreur.                                                                                                                                                                                                                                                                  |
| `hooks`         | `readonly HarnessHook<HarnessHookPhase>[] \| undefined`            | Optionnel | Hooks issus de defineHarnessHook, exécutés dans l’ordre de déclaration au sein de chaque phase.                                                                                                                                                                                                                                  |
| `permissions`   | `HarnessPermissions \| undefined`                                  | Optionnel | Règles issues de defineHarnessPermissions(), évaluées avant les hooks before-tool. Elles s’appliquent aussi aux appels d’outils de chaque sous-agent.                                                                                                                                                                            |
| `context`       | `HarnessContextStrategy \| undefined`                              | Optionnel | Stratégie qui peut réécrire l’historique avant chaque requête au modèle, comme truncateToolResults() ou summarizeHistory().                                                                                                                                                                                                      |
| `conversations` | `false \| ConversationStore \| undefined`                          | Optionnel | Store des transcriptions de tours, createHarnessConversations() par défaut, sous .outpost/conversations/harness dans le dépôt. Enveloppez-le avec createTransportConversations() pour un stockage distant ; false désactive la capture, la continuation et les réparations de réponse.                                           |
| `skills`        | `readonly HarnessSkill[] \| undefined`                             | Optionnel | Skills listées dans les instructions système et chargées à la demande par l’outil load_skill ; les noms de skills en double sont refusés.                                                                                                                                                                                        |
| `cache`         | `boolean \| undefined`                                             | Optionnel | Demande au fournisseur de modèles de mettre en cache le préfixe de la conversation à chaque requête, true par défaut. Le fournisseur Anthropic marque le préfixe pour le cache ; OpenAI met en cache les préfixes stables de lui-même.                                                                                           |
| `mcpServers`    | `McpServers \| undefined`                                          | Optionnel | Serveurs MCP indexés par nom, démarrés dans la sandbox empruntée à chaque tour ; leurs outils apparaissent sous la forme mcp__&lt;server>__&lt;tool>, avec des outils de ressources et de prompts quand les serveurs en proposent. La sandbox doit prendre en charge liveInput, et les serveurs oauth: "login" sont refusés.     |
| `profile`       | `AgentProfile \| undefined`                                        | Optionnel | Profil portable issu de defineAgentProfile(). Ses instructions précèdent les instructions locales, ses serveurs MCP fusionnent avec mcpServers sans noms en double et sa politique d’outils intégrés se cumule avec permissions, y compris après les hooks et chez les descendants. Il ne fournit aucune implémentation d’outil. |

## Signature

```ts
export interface HarnessOptions {
  readonly routing?: HarnessModelRouting;
  readonly modelProvider: ModelProvider;
  readonly instructions?: HarnessInstructionsOption;
  readonly tools?: readonly (HarnessTool | HarnessToolset)[];
  readonly limits?: HarnessLimits;
  readonly toolExecution?: HarnessToolExecution;
  readonly hooks?: readonly HarnessHook[];
  readonly permissions?: HarnessPermissions;
  readonly context?: HarnessContextStrategy;
  readonly conversations?: ConversationStore | false;
  readonly skills?: readonly HarnessSkill[];
  readonly cache?: boolean;
  readonly mcpServers?: McpServers;
  readonly profile?: AgentProfile;
}
```

## Contrats associés

- [AgentProfile](../agentprofile/)
- [ConversationStore](../conversationstore/)
- [HarnessContextStrategy](../harnesscontextstrategy/)
- [HarnessHook](../harnesshook/)
- [HarnessInstructionsOption](../harnessinstructionsoption/)
- [HarnessLimits](../harnesslimits/)
- [HarnessModelRouting](../harnessmodelrouting/)
- [HarnessPermissions](../harnesspermissions/)
- [HarnessSkill](../harnessskill/)
- [HarnessTool](../harnesstool/)
- [HarnessToolExecution](../harnesstoolexecution/)
- [HarnessToolset](../harnesstoolset/)
- [McpServers](../mcpservers/)
- [ModelProvider](../modelprovider/)
