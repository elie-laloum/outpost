---
title: "Délais et annulation"
description: "Délais et annulation — Outpost"
sidebar:
  order: 10
---

Utilisez `AbortSignal` pour une annulation pilotée par l’appelant et les délais pour borner l’exécution. Ils concernent des étapes distinctes.

| Option             | Défaut                                                              | Portée                                                         |
| ------------------ | ------------------------------------------------------------------- | -------------------------------------------------------------- |
| `idleMs`           | 600 000 ms                                                          | Silence maximal avant la fin ; toute sortie le réinitialise.   |
| `idleWarningMs`    | 60 000 ms                                                           | Intervalle d’avertissement pendant le silence.                 |
| `settleMs`         | 60 000 ms                                                           | Grâce après un marqueur de fin ; toute sortie la réinitialise. |
| `deadlineMs`       | 3 600 000 ms                                                        | Limite absolue par commande d’agent.                           |
| `expansionMs`      | 30 000 ms                                                           | Chaque commande incluse dans un brief.                         |
| `limits.copyMs`    | 60 000 ms pour les copies ; 120 000 ms pour les transferts distants | Copies sélectionnées et surcharge des transferts.              |
| `limits.gitMs`     | 30 000 ms                                                           | Préparation Git du workspace.                                  |
| `limits.collectMs` | 30 000 ms                                                           | Collecte des commits.                                          |
| `limits.mergeMs`   | 30 000 ms                                                           | Intégration sur l’hôte.                                        |

Les limites acceptées doivent être finies et strictement positives ; zéro ne désactive pas la surveillance. Choisissez une valeur suffisamment grande lorsque nécessaire.

```ts
import {
  agent as composeAgent,
  dispatch,
  codexHarness,
} from "@elie-laloum/outpost";

await dispatch({
  agent: composeAgent({ harness: codexHarness({}) }),
  brief: { text: "Examine le dépôt et résume tes observations." },
  signal: AbortSignal.timeout(120_000),
  deadlineMs: 90_000,
});
```

Le `signal` ponctuel couvre préparation et exécution. Celui de `createSandbox` couvre la préparation ; transmettez ensuite un signal à chaque opération. L’annulation d’une commande arrête son groupe de processus sur les backends compatibles sans détruire l’environnement réutilisable.

Le nettoyage et la récupération peuvent continuer après l’annulation pour collecter les changements et libérer les ressources. La raison d’annulation originale est conservée ; `recoveryDetails(error)` donne le contexte associé. Les délais des tâches de workflow sont coopératifs : votre JavaScript doit respecter `context.signal`.
