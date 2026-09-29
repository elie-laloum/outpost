---
title: "Agents — Vue d’ensemble"
description: "Composez un harness et un modèle en agent, ou ordonnez plusieurs agents en agent de secours pour le dispatch."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Réglages du modèle par harness

`createAgent({ harness, model })` ne démarre rien. Il vérifie `reasoning` et `maxOutputTokens` auprès du harness et lève le code `configuration` pour un réglage que le harness ne sait pas appliquer.

| Harness                                | `model` omis                                            | `reasoning`                    | `maxOutputTokens`                            |
| -------------------------------------- | ------------------------------------------------------- | ------------------------------ | -------------------------------------------- |
| Claude Code                            | Défaut de la CLI                                        | `low` à `max`                  | Transmis via `CLAUDE_CODE_MAX_OUTPUT_TOKENS` |
| Codex                                  | Défaut de la CLI                                        | `low` à `max`                  | Refusé                                       |
| Copilot CLI, Antigravity               | Défaut de la CLI                                        | Refusé                         | Refusé                                       |
| Kimi Code                              | Défaut de la CLI ; un nom est exigé avec l’auth `usage` | Refusé                         | Refusé                                       |
| Harness intégré, fournisseur OpenAI    | Refusé                                                  | Tout niveau, transmis tel quel | Transmis à chaque requête                    |
| Harness intégré, fournisseur Anthropic | Refusé                                                  | `none`, `low` à `max`          | Exigé                                        |

## Quand un agent de secours passe la main

`createFallbackAgent([first, second], { on })` exécute ses candidats dans l’ordre, dans une seule sandbox et un seul workspace, sans réinitialisation. Chaque candidat suivant repart du brief d’origine, sur le travail déjà présent.

| Échec du candidat courant                                        | Résultat                                                                                                                                 |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Code `quota`, avec `quota` dans `on`                             | Candidat suivant ; la tentative est enregistrée dans `result.fallback.attempts`                                                          |
| Panne détectée par `unavailableFault()`, `unavailable` dans `on` | Candidat suivant ; l’erreur garde son code (`process` ou `provider`)                                                                     |
| `timeout` après une erreur de connexion signalée par l’agent     | Compté comme une panne : `unavailable` dans `on` fait passer au candidat suivant                                                         |
| Annulation, autres timeouts, tout autre échec                    | Relancé immédiatement, avec les tentatives précédentes dans `recovery.fallback`                                                          |
| Échec couvert sur le dernier candidat                            | Relancé de la même façon ; si tous les candidats ont atteint un quota, une seule erreur `quota` avec le `resetAt` signalé le plus proche |

:::note
Un agent de secours n’accepte ni `continuation` ni l’attache. Continuez avec `result.resume()` ou `result.fork()`, qui utilisent le candidat retenu.
:::

## Points d’entrée

Guide : [Choisir un agent](../../../guide/choose-an-agent/) · [Agents de secours](../../../guide/fallback-agents/) · [Fournisseurs de modèles](../../../guide/model-providers/)

- [createAgent](../../createagent/)
- [createFallbackAgent](../../createfallbackagent/)
- [Agent](../../type-agent/)
- [AgentOptions](../../agentoptions/)
- [AgentModel](../../agentmodel/)
- [ModelReasoning](../../modelreasoning/)
- [CliAgent](../../cliagent/)
- [CustomAgent](../../customagent/)
- [FallbackAgent](../../type-fallbackagent/)
- [FallbackRecord](../../fallbackrecord/)
- [FallbackAttempt](../../fallbackattempt/)
