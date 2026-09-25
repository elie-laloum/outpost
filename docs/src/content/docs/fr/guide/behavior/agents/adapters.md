---
title: "Claude Code et Codex"
description: "Claude Code et Codex — Outpost"
sidebar:
  order: 2
---

Un adapter configure le CLI natif de l’agent. Il est indépendant du provider de sandbox et réutilisable entre les appels.

```ts
import {
  agent as composeAgent,
  claudeHarness,
  codexHarness,
  agentVersions,
} from "@elie-laloum/outpost";

const reviewer = composeAgent({
  harness: claudeHarness({ permissions: "acceptEdits" }),
  model: { name: "sonnet", reasoning: "high", maxOutputTokens: 32_000 },
});
const implementer = composeAgent({
  harness: codexHarness({ approvalReviewer: "auto_review" }),
  model: { name: "gpt-5.5", reasoning: "high" },
});
console.log(reviewer.name, implementer.name, agentVersions);
```

Le modèle appartient à `agent()`, pas au harness. Passez un nom, ou un objet avec `name`, `reasoning` et `maxOutputTokens` :

| Champ du modèle   | Claude Code                                          | Codex                                                              |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------------------------ |
| `name`            | `--model`                                            | `--model`                                                          |
| `reasoning`       | `--effort` : `low`, `medium`, `high`, `xhigh`, `max` | `model_reasoning_effort` : `low`, `medium`, `high`, `xhigh`, `max` |
| `maxOutputTokens` | `CLAUDE_CODE_MAX_OUTPUT_TOKENS`                      | Refusé : Codex n’a pas de limite de sortie                         |

`agent()` refuse un niveau de raisonnement ou une limite de sortie que le CLI choisi ne sait pas exprimer, comme `none` ou `minimal`. Il ne l’ignore ni ne le convertit jamais. Claude Code ramène `CLAUDE_CODE_MAX_OUTPUT_TOKENS` au plafond du modèle ; ne définissez pas aussi cette variable dans `variables`.

| Option du harness   | Claude Code                                                              | Codex                    |
| ------------------- | ------------------------------------------------------------------------ | ------------------------ |
| `permissions`       | `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions` | Sans objet               |
| `approvalReviewer`  | Sans objet                                                               | `user` ou `auto_review`  |
| `variables`         | Variables de cet adapter                                                 | Variables de cet adapter |
| `saveConversations` | `true` par défaut                                                        | `true` par défaut        |

Sans `model`, le CLI installé choisit son défaut. La disponibilité des modèles et les niveaux de raisonnement acceptés par un modèle donné dépendent du CLI et de votre compte. `agentVersions` expose les versions épinglées utilisées par les images générées ; reconstruisez les anciennes images lorsque ces versions changent.

Les défauts non interactifs évitent de bloquer sur une demande de permission et s’appuient sur la frontière d’exécution choisie. Sélectionnez les permissions avec soin pour l’exécution locale. L’attachement interactif utilise le comportement natif du terminal.

L’image générée contient Claude Code, Codex et [Gemini CLI](../../../agents/gemini/). Gemini possède sa propre configuration et prend en charge les sessions nouvelles sans continuation native. L’exécution locale exige leur installation et leur authentification sur l’hôte. Les providers distants peuvent installer le CLI sélectionné s’il manque, sauf avec `bootstrap: false`. Les identifiants d’agent sont distincts de ceux du provider.

Voir [l’environnement](../../../agents/environment/), [les conversations](../../../agents/conversations/) et [les adapters personnalisés](../../../extend/agents/).

Pour les options de Gemini et les limites des nouvelles sessions, voir [Exécuter Gemini CLI](../../../agents/gemini/).
