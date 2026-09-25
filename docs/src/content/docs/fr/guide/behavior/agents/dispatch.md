---
title: "Dispatch et résultats"
description: "Dispatch et résultats — Outpost"
sidebar:
  order: 1
---

Utilisez un dispatch ponctuel pour laisser la bibliothèque gérer l’allocation et la fermeture.

```ts
import { dispatch, codex } from "@elie-laloum/outpost";
import { docker } from "@elie-laloum/outpost/providers/docker";

const result = await dispatch({
  repository: "/work/backend",
  agent: codex(),
  provider: docker(),
  branch: { mode: "integrate" },
  brief: { text: "Corrige les tests, vérifie le résultat et crée un commit." },
});
console.log(result.text, result.branch, result.commits);
```

Le `dispatch` de premier niveau exige un agent et un brief. Il combine la [configuration de sandbox](../../../../reference/sandboxoptions/) et les [options de dispatch](../../../../reference/dispatchoptions/). Il ferme les ressources créées ; un workspace fourni reste ouvert.

`repository` sélectionne le dépôt Git local à modifier. Sans cette option, la bibliothèque utilise `process.cwd()`. Pour un chemin indépendant du dossier de lancement, utilisez `resolve(import.meta.dirname, "../backend")` ; voir [choisir un dépôt](../../../environment/repositories/).

## Lire le résultat

| Champ                               | Signification                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| `text`                              | Réponse accumulée ; les événements finaux normalisés priment sur le texte partiel d’un même tour. |
| `value`                             | Réponse validée, ou `undefined` sans spécification de réponse.                                    |
| `turns`                             | Texte, statut, durée, consommation et conversation/transcript disponibles par tour.               |
| `usage`                             | Comptages bruts cumulés des tokens, sans estimation monétaire.                                    |
| `completed`, `completion`           | Présence d’un marqueur de fin configuré et marqueur reconnu.                                      |
| `branch`, `directory`, `commits`    | Identité du workspace et commits collectés (`oid`, `subject`).                                    |
| `conversation`, `transcript`, `log` | Identifiant natif et chemins des artefacts disponibles sur l’hôte.                                |
| `retainedDirectory`                 | Workspace conservé après fermeture, le cas échéant.                                               |
| `resume`, `fork`                    | Nouveau tour à partir de la conversation capturée.                                                |

Un échec du processus agent lève une erreur. Atteindre le nombre de passes sans marqueur retourne `completed: false` ; ce n’est pas un échec de processus. Vérifiez la sortie attendue et les commits avant de considérer le travail comme livré.

`label` apparaît dans le journal et les noms de logs générés. `observe`, `warn` et `diagnostic` apportent de la visibilité ; voir [l’observabilité](../../../agents/observability/). Le guide [des passes](../../../agents/iteration/) explique la réutilisation de l’environnement.
