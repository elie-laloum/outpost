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
  harness: claudeHarness({ reasoning: "high", permissions: "acceptEdits" }),
  model: "sonnet",
});
const implementer = composeAgent({
  harness: codexHarness({
    reasoning: "high",
    approvalReviewer: "auto_review",
  }),
});
console.log(reviewer.name, implementer.name, agentVersions);
```

| Option              | Claude Code                                                              | Codex                            |
| ------------------- | ------------------------------------------------------------------------ | -------------------------------- |
| `model`             | Nom de modèle du CLI, facultatif                                         | Nom de modèle du CLI, facultatif |
| `reasoning`         | `low`, `medium`, `high`, `xhigh`, `max`                                  | `low`, `medium`, `high`, `xhigh` |
| `permissions`       | `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions` | Sans objet                       |
| `approvalReviewer`  | Sans objet                                                               | `user` ou `auto_review`          |
| `variables`         | Variables de cet adapter                                                 | Variables de cet adapter         |
| `saveConversations` | `true` par défaut                                                        | `true` par défaut                |

Sans `model`, le CLI installé choisit son défaut. La disponibilité des modèles et niveaux de raisonnement dépend du CLI et de votre compte. `agentVersions` expose les versions épinglées utilisées par les images générées ; reconstruisez les anciennes images lorsque ces versions changent.

Les défauts non interactifs évitent de bloquer sur une demande de permission et s’appuient sur la frontière d’exécution choisie. Sélectionnez les permissions avec soin pour l’exécution locale. L’attachement interactif utilise le comportement natif du terminal.

L’image générée contient Claude Code, Codex et [Gemini CLI](../../../agents/gemini/). Gemini possède sa propre configuration et prend en charge les sessions nouvelles sans continuation native. L’exécution locale exige leur installation et leur authentification sur l’hôte. Les providers distants peuvent installer le CLI sélectionné s’il manque, sauf avec `bootstrap: false`. Les identifiants d’agent sont distincts de ceux du provider.

Voir [l’environnement](../../../agents/environment/), [les conversations](../../../agents/conversations/) et [les adapters personnalisés](../../../extend/agents/).

Pour les options de Gemini et les limites des nouvelles sessions, voir [Exécuter Gemini CLI](../../../agents/gemini/).
