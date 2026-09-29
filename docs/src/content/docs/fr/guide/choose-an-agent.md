---
title: "Choisir un agent"
description: "Comparez les cinq CLI d’agent et le harness intégré, puis composez un agent avec le modèle voulu."
---

## Les agents

Un agent associe un harness à un modèle. Le harness est ce qui pilote le modèle : l’une des cinq CLI d’agent de code installées dans la sandbox, ou la boucle propre à Outpost.

<!-- features -->

- [Claude Code](../claude-code/): La CLI de code d’Anthropic, avec réorientation en direct et les réglages de modèle les plus complets.
  - compte
  - jeton
  - clé d’API
- [Codex](../codex/): La CLI de code d’OpenAI, avec réorientation en direct et fournisseurs personnalisés compatibles Responses.
  - compte
  - clé d’API
- [GitHub Copilot CLI](../copilot-cli/): La CLI de code de GitHub, facturée sur votre forfait Copilot ; elle reprend une conversation mais sans fork.
  - compte
  - jeton
- [Kimi Code](../kimi-code/): La CLI de code de Moonshot AI ; avec une clé d’API, vous devez nommer le modèle.
  - compte
  - clé d’API
  - modèle requis avec clé d’API
- [Antigravity](../antigravity/): La CLI `agy` de Google ; ses conversations ne continuent que dans leur sandbox ouverte.
  - compte
  - clé d’API
- [Harness intégré](../harness/): La boucle propre à Outpost, qui exécute vos outils sur une API OpenAI ou Anthropic.
  - clé d’API
  - modèle requis
  - `createHarness()`

## Composer un agent

`createAgent()` prend un harness et un modèle facultatif. Chaque CLI a son preset : `createClaudeHarness()`, `createCodexHarness()`, `createCopilotHarness()`, `createKimiHarness()` et `createAntigravityHarness()`.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

export const reviewer = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
  model: { name: "opus", reasoning: "high" },
});
```

Passez l’agent à `dispatch()` dans `agent`. `authentication` choisit entre votre compte et une clé d’API ; voir [Authentification](../authentication/).

## Sélectionner un modèle

`model` est un nom (`"opus"`) ou un objet `{ name, reasoning, maxOutputTokens }`. Omettez-le pour utiliser le modèle par défaut de la CLI. Le harness intégré n’a pas de défaut et en exige un.

Le harness vérifie les réglages à l’appel de `createAgent()` : un niveau `reasoning` ou un `maxOutputTokens` qu’il ne sait pas appliquer lève une erreur dès ce moment, avant toute exécution. Le service décide à l’exécution si votre compte peut utiliser le modèle. Le tableau ci-dessous indique les réglages acceptés par chaque agent.

## Comparer les capacités

| Capacité                                               | [Claude Code](../claude-code/) | [Codex](../codex/)                                     | [Copilot CLI](../copilot-cli/)        | [Kimi Code](../kimi-code/) | [Antigravity](../antigravity/) | [Harness intégré](../harness/)                           |
| ------------------------------------------------------ | ------------------------------ | ------------------------------------------------------ | ------------------------------------- | -------------------------- | ------------------------------ | -------------------------------------------------------- |
| [Connexion au compte](../authentication/)              | Oui                            | Oui                                                    | Oui                                   | Oui                        | Oui                            | Non                                                      |
| [Variable de jeton de compte](../authentication/)      | Oui                            | Non                                                    | Oui                                   | Non                        | Non                            | Non                                                      |
| [Clé d’API](../authentication/)                        | Oui                            | Oui                                                    | Non                                   | Oui, avec un modèle        | Oui                            | Oui                                                      |
| `reasoning` du modèle                                  | `low` à `max`                  | `low` à `max`                                          | Non                                   | Non                        | Non                            | Anthropic : `none`, `low` à `max` ; OpenAI : tout niveau |
| `maxOutputTokens` du modèle                            | Oui                            | Non                                                    | Non                                   | Non                        | Non                            | Anthropic : obligatoire ; OpenAI : facultatif            |
| [Capture de la conversation](../conversations/)        | Oui                            | Oui                                                    | Oui                                   | Oui                        | Non                            | Oui                                                      |
| [Reprise à chaud](../conversations/) (même sandbox)    | Oui                            | Oui                                                    | Oui                                   | Oui                        | Oui                            | Oui                                                      |
| [Reprise à froid](../conversations/) (autre sandbox)   | Oui                            | Oui                                                    | Oui                                   | Oui                        | Non                            | Oui                                                      |
| [Fork](../conversations/)                              | Oui                            | Oui                                                    | Non                                   | Oui                        | Non                            | Oui                                                      |
| [Réparation de réponse](../typed-responses/)           | Oui                            | Oui                                                    | Oui                                   | Oui                        | Oui                            | Oui                                                      |
| [Réorientation](../steering/)                          | `injected`                     | `injected`                                             | `resumed`                             | `resumed`                  | `resumed`                      | `injected`                                               |
| [Serveurs MCP](../mcp-servers/)                        | Oui                            | Oui                                                    | Oui                                   | Oui                        | Oui                            | Oui                                                      |
| [OAuth MCP](../mcp-oauth/)                             | Connexion de l’hôte            | Connexion de l’hôte                                    | Non                                   | Connexion de l’hôte        | Non                            | Identifiants client                                      |
| [Suivi de la consommation](../budgets/)                | Fin de tour                    | Fin de tour ; chaque réponse du modèle avec `steering` | Chaque message, total après la sortie | Après la sortie            | Fin de tour                    | Chaque réponse du modèle                                 |
| [Heure de réinitialisation du quota](../quota-pauses/) | Si elle est fournie            | Non                                                    | Non                                   | Non                        | Non                            | Depuis `Retry-After`                                     |

<!-- features -->

- **Capture**: `saveConversations: false` sur Claude Code ou Codex ne laisse que la reprise à chaud ; `conversations: false` sur le harness intégré supprime reprise, fork et réparation.
  - `saveConversations`
  - `conversations`
- **Réparation**: `dispatch()` refuse `repairs` supérieur à 0 pour un agent qui ne peut pas continuer sa conversation.
  - `repairs`
- **Consommation**: `usage.complete === false` signale des compteurs minimaux ; ceux de Kimi n’arrivent qu’après la sortie de la CLI.
  - `usage.complete`

## Donner des outils MCP aux agents

Chaque harness accepte `mcpServers` : des commandes stdio ou des points d’accès HTTP, avec des secrets transmis par nom de variable. Voir [Serveurs MCP](../mcp-servers/) et [Connexion aux serveurs MCP](../mcp-oauth/).

## Se replier sur un autre agent

`createFallbackAgent([...], { on })` confie un dispatch au candidat suivant quand une limite d’usage ou une panne arrête l’agent courant. Voir [Agents de secours](../fallback-agents/).

## Travailler sans CLI

`createHarness()` pilote directement l’API d’un modèle, avec les outils, permissions et sous-agents que vous déclarez. Il n’installe aucune CLI et exige un [fournisseur de modèle](../model-providers/). Voir [Harness intégré](../harness/).

API : [createAgent](../../reference/createagent/) · [AgentOptions](../../reference/agentoptions/) · [ModelSpec](../../reference/modelspec/) · [AgentModel](../../reference/agentmodel/) · [createClaudeHarness](../../reference/createclaudeharness/) · [createCodexHarness](../../reference/createcodexharness/) · [createCopilotHarness](../../reference/createcopilotharness/) · [createKimiHarness](../../reference/createkimiharness/) · [createAntigravityHarness](../../reference/createantigravityharness/) · [createHarness](../../reference/createharness/) · [createFallbackAgent](../../reference/createfallbackagent/).
