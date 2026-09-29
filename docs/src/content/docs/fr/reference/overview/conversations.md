---
title: "Conversations — Vue d’ensemble"
description: "Capturez la conversation native d’un agent après chaque tour, puis restaurez-la dans une sandbox pour la reprendre ou la bifurquer."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Quels agents reprennent et bifurquent

Une continuation froide restaure la conversation capturée dans une nouvelle sandbox ; une continuation chaude réutilise la sandbox ouverte qui l’a exécutée. Chaque preset CLI utilise par défaut son store natif, remplaçable par son réglage `conversations`.

| Agent                             | Store par défaut               | Reprise froide | Reprise chaude          | Fork                                             |
| --------------------------------- | ------------------------------ | -------------- | ----------------------- | ------------------------------------------------ |
| Claude Code                       | `createClaudeConversations()`  | Oui            | Oui                     | Oui, `--fork-session`                            |
| Codex                             | `createCodexConversations()`   | Oui            | Oui                     | Oui, `codex exec fork`                           |
| Kimi Code                         | `createKimiConversations()`    | Oui            | Oui                     | Oui, `kimi fork` avant le tour                   |
| GitHub Copilot CLI                | `createCopilotConversations()` | Oui            | Oui                     | Refusé avec le code `configuration`              |
| Harness intégré (`createHarness`) | `createHarnessConversations()` | Oui            | Oui                     | Oui, nouveau transcript amorcé avec l’historique |
| Antigravity                       | Aucun ; un store est refusé    | Non            | Même sandbox uniquement | Refusé avec le code `configuration`              |

:::note
Un fork copie la conversation, pas le worktree. Donnez-lui sa propre branche pour garder ses commits à part.
:::

## Choisir un store

Chaque store implémente `locate` (retrouver une capture sur l’hôte), `capture` (la copier hors de la sandbox après un tour) et `restore` (l’écrire dans la sandbox suivante en réécrivant les chemins `cwd` enregistrés).

| Fonction                                      | Conserve                                              | Copie sur l’hôte                                                                                      | À utiliser pour                            |
| --------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `createTranscriptConversations(layout)`       | Un fichier JSONL par conversation                     | Fixée par le layout : Claude `~/.claude/projects/<clé>/`, Codex `~/.codex/sessions/<aaaa>/<mm>/<jj>/` | Une CLI qui écrit un fichier de transcript |
| `createSessionBundleConversations(profile)`   | Un dossier de session regroupé en un bundle JSON      | `.outpost/conversations/<format>/<id>.json` dans le dépôt                                             | Une CLI qui conserve un dossier de session |
| `createHarnessConversations()`                | Le transcript du harness intégré                      | `.outpost/conversations/harness/<id>.jsonl` dans le dépôt                                             | `createHarness()` ; restore ne fait rien   |
| `createTransportConversations(base, options)` | Les captures du store de base, archivées en snapshots | Matérialisée sous `.outpost/recovery/conversations` lors de `locate`                                  | Reprendre sur une autre machine            |

L’option `conversationHome` de `dispatch()` ou `createSandbox()` remplace `~`, ou le dépôt pour les bundles, comme racine des copies sur l’hôte.

:::caution
Les captures contiennent toute la conversation, y compris le contenu des fichiers lus par l’agent. Les archives de transport ne sont ni chiffrées ni authentifiées.
:::

## Points d’entrée

Guide : [Conversations](../../../guide/conversations/) · [Formats de conversation natifs](../../../guide/conversation-formats/) · [Où vivent les données](../../../guide/storage/)

- [createClaudeConversations](../../createclaudeconversations/)
- [createCodexConversations](../../createcodexconversations/)
- [createKimiConversations](../../createkimiconversations/)
- [createCopilotConversations](../../createcopilotconversations/)
- [createTranscriptConversations](../../createtranscriptconversations/)
- [createSessionBundleConversations](../../createsessionbundleconversations/)
- [createHarnessConversations](../../createharnessconversations/)
- [createTransportConversations](../../createtransportconversations/)
- [conversations](../../conversations/)
- [ConversationStore](../../conversationstore/)
- [NativeConversationStore](../../nativeconversationstore/)
- [ConversationRecord](../../conversationrecord/)
