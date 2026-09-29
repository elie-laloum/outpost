---
title: "Harness — Vue d’ensemble"
description: "Choisissez qui exécute la boucle de l’agent, puis composez le harness intégré avec outils, instructions, limites, permissions, hooks et sous-agents."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Choisir un harness

`createAgent({ harness, model })` associe l’un ou l’autre type de harness à un modèle, puis l’agent s’exécute via `dispatch()`.

|                  | Preset CLI (`createClaudeHarness()`, `createCodexHarness()`, …)            | Harness intégré (`createHarness()`)                                                        |
| ---------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Boucle du modèle | La CLI de l’agent, dans la sandbox                                         | Outpost, dans votre processus Node.js : une requête au modèle par étape                    |
| Modèle           | Facultatif ; le modèle par défaut de la CLI s’applique                     | Obligatoire, validé par le fournisseur de modèles                                          |
| Accès au modèle  | Connexion au compte ou clé API, choisie par `authentication`               | Un [fournisseur de modèles](../model-providers/) avec une clé API                          |
| Outils           | Ceux de la CLI                                                             | Uniquement les outils déclarés, exécutés via la sandbox empruntée                          |
| Conversations    | Fichiers de session natifs ; capture, reprise et fork varient selon la CLI | Transcriptions, par défaut sous `.outpost/conversations/harness/` ; reprise et fork        |
| Réorientation    | Entrée en direct (Claude Code, Codex), sinon arrêt puis reprise            | Ajoutée à la boucle en cours avant sa prochaine requête au modèle                          |
| Serveurs MCP     | Écrits dans la configuration native de la CLI                              | Démarrés dans la sandbox à chaque tour ; la sandbox doit prendre en charge `liveInput`     |
| Bornes           | Réglages de la CLI et délais du dispatch                                   | `limits` : étapes, appels d’outils, profondeur de délégation et tokens, avec échec `limit` |

## Composer un harness intégré

Passez chaque brique à `createHarness()`. Les définitions sont validées à leur déclaration et lèvent le code `configuration` sur une entrée invalide.

| Brique       | Déclarée avec                                                                                  | Rôle dans la boucle                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Outils       | `defineHarnessTool()`, `defineHarnessToolset()`, `createHarnessFileTools()` et les autres jeux | Entrée vérifiée par le schéma ; les appels en lecture seule consécutifs s’exécutent en parallèle, les autres seuls        |
| Instructions | Texte, `defineHarnessInstructions()`, `defineMcpPrompt()`                                      | Résolues dans le prompt système au début de chaque tour                                                                   |
| Limites      | `limits`, `toolExecution`                                                                      | Par défaut : 100 étapes, 4 appels en lecture seule en parallèle, 300000 ms par appel d’outil                              |
| Permissions  | `defineHarnessPermissions()`                                                                   | Autorisent ou refusent chaque appel selon l’outil, le chemin ou la commande ; la première règle applicable décide         |
| Hooks        | `defineHarnessHook()`                                                                          | Ajoutent des instructions, réécrivent ou refusent un appel d’outil, remplacent son résultat ou refusent la réponse finale |
| Contexte     | `truncateToolResults()`, `summarizeHistory()`, `defineHarnessContextStrategy()`                | Réécrit l’historique avant chaque requête au modèle                                                                       |
| Skills       | `defineHarnessSkill()`                                                                         | Listées dans le prompt système ; `load_skill` renvoie leurs instructions et débloque leurs outils                         |
| Sous-agents  | `defineHarnessSubagent()`                                                                      | Un outil qui exécute un enfant intégré dans la même sandbox ; ses tokens comptent dans chaque budget ancêtre              |
| Serveurs MCP | `mcpServers`                                                                                   | Ajoutent les outils `mcp__<server>__<tool>` pour le tour                                                                  |

:::caution
Les permissions et les hooks décident de ce que le modèle peut demander ; ils n’isolent rien. La sandbox est la frontière, et des commandes shell peuvent contourner les motifs de commande.
:::

## Points d’entrée

Guide : [Harness intégré](../../../guide/harness/) · [Outils](../../../guide/harness-tools/) · [Permissions et hooks](../../../guide/harness-permissions/)

- [createHarness](../../createharness/)
- [defineHarnessTool](../../defineharnesstool/)
- [defineHarnessToolset](../../defineharnesstoolset/)
- [createHarnessFileTools](../../createharnessfiletools/)
- [defineHarnessPermissions](../../defineharnesspermissions/)
- [defineHarnessHook](../../defineharnesshook/)
- [summarizeHistory](../../summarizehistory/)
- [defineHarnessSkill](../../defineharnessskill/)
- [defineHarnessSubagent](../../defineharnesssubagent/)
- [HarnessOptions](../../customharnessoptions/)
- [HarnessLimits](../../harnesslimits/)
- [CliHarness](../../cliharness/)
