---
title: "Boucle de modèle"
description: "Laisser Outpost piloter les requêtes de modèle et les outils."
---

:::note[Expérimental]
Le moteur de harness intégré est expérimental. Son contrat peut évoluer indépendamment des harness CLI.
:::

`harness()` configure la boucle d’Outpost : demander une réponse au modèle, valider les appels d’outils, les exécuter dans la sandbox empruntée, puis demander l’étape suivante.

```ts
import {
  agent,
  harness,
  harnessFileTools,
  openaiModelProvider,
} from "@elie-laloum/outpost";

const coder = agent({
  model: process.env.MODEL_NAME ?? "",
  harness: harness({
    modelProvider: openaiModelProvider({
      baseUrl: "https://api.openai.com/v1",
      api: "responses",
      apiKey: process.env.OPENAI_API_KEY ?? "",
    }),
    instructions: "Inspect the repository and answer with evidence.",
    tools: [harnessFileTools()],
    limits: { maxSteps: 12, maxToolCalls: 30 },
  }),
});
```

Définissez `MODEL_NAME` avec un modèle disponible sur votre service, puis passez cet agent à une requête avec votre dépôt et fournisseur de sandbox. Le fournisseur de modèle n’alloue pas de sandbox et n’hérite pas d’une connexion de compte CLI.

## Limites et erreurs

`limits` borne les étapes, appels d’outils et consommation observée. Atteindre une borne échoue avec le code `limit`. `toolExecution` contrôle concurrence, délais par appel et renvoi des erreurs au modèle ou échec du tour. Les callbacks d’outils s’exécutent dans le processus Outpost et doivent utiliser la sandbox fournie pour les opérations du dépôt.

La boucle prend en charge les [politiques d’outils](../tool-policies/), la [gestion du contexte](../history-management/) et les [skills à la demande](../loadable-skills/). Ces réglages configurent la boucle intégrée, pas les mécanismes internes des CLI Codex ou Claude.

API : [harness](../../reference/function-harness/) · [HarnessOptions](../../reference/customharnessoptions/).
