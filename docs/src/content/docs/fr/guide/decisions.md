---
title: "Évaluer une décision typée"
description: "Utiliser Jev ou un serveur Laya compatible pour des choix, scores et probabilités oui/non typés."
---

## Déclarer les questions

`defineDecision()` valide et fige les questions. `choice` sélectionne une option nommée, `score` évalue des niveaux ordonnés et `noul` renvoie la probabilité du oui. La déclaration conserve les clés des réponses et les valeurs littérales des choix dans TypeScript.

```ts title="decision.ts"
import { defineDecision } from "@elie-laloum/outpost";

export const routing = defineDecision({
  questions: {
    route: {
      type: "choice",
      instructions: "Choose the depth needed for the next step.",
      criteria: { fast: "Routine execution", deep: "Complex reasoning" },
    },
    difficulty: {
      type: "score",
      instructions: "Assess difficulty.",
      criteria: ["Routine", "Moderate", "Complex"],
    },
    safe: { type: "noul", instructions: "Is the next action read-only?" },
  },
});
```

Les niveaux de score sont indexés de 0 au nombre de niveaux moins un. Les distributions, confidences et probabilités oui/non proviennent du service ; Outpost les valide sans les recalculer. `noul.criteria`, facultatif, décrit les résultats `true` et `false`.

Des services comme Laya arrondissent les probabilités et les scores à quatre décimales. La validation accepte l’erreur d’arrondi cumulée lors du contrôle des sommes et des scores pondérés, tout en conservant chaque valeur native sans renormalisation. Les sommes et scores incohérents restent des erreurs.

## Connecter Jev ou Laya

Un seul provider implémente le protocole System One. Son URL de base inclut `/v1` ; Outpost ajoute `/systemone`. Votre processus Node.js utilise cette adresse et ces identifiants indépendamment de la sandbox.

```ts title="decision-provider.ts"
import { createSystemOneDecisionProvider } from "@elie-laloum/outpost";

export const provider = createSystemOneDecisionProvider({
  baseUrl: process.env.SYSTEM_ONE_BASE_URL ?? "http://127.0.0.1:8000/v1",
  apiKey: process.env.SYSTEM_ONE_API_KEY ?? false,
  timeoutMs: 10_000,
});
```

Configurez l’endpoint et une clé non vide pour un service authentifié. `apiKey: false` choisit explicitement un endpoint sans authentification, comme un serveur Laya local. Les providers ne lisent pas les identifiants automatiquement. Consultez l’[API Jev](https://docs.typesafe.ai/api) et le [serveur Laya](https://github.com/NandhaKishorM/laya/blob/main/laya/serve.py) pour installer le service.

## Évaluer l’état courant

Fournissez du texte, un objet ou un tableau contenant du JSON sans perte. Les cycles, dates, propriétés indéfinies, tableaux creux, nombres non finis et hooks de sérialisation sont refusés avant la requête.

```ts title="evaluate.ts"
import { decide } from "@elie-laloum/outpost";
import { routing } from "./decision.ts";
import { provider } from "./decision-provider.ts";
import { reportValue } from "./reporter.ts";

const result = await decide({
  provider,
  model: "jev-latest",
  decision: routing,
  state: { goal: "Fix a parser", lastTool: "Two regression tests failed" },
});
const route: "fast" | "deep" = result.answers.route.choice;
reportValue(route, result.answers.difficulty.score, result.answers.safe.noul);
```

Exécutez `node evaluate.ts` avec le service disponible. Le résultat contient le provider, le modèle réellement renvoyé, l’usage normalisé et les métadonnées disponibles. Le provider HTTP conserve la réponse JSON native dans `metadata`, dont le routage et les diagnostics d’entrée Laya. Les modèles de décision sont des noms ; les réglages de génération et de raisonnement appartiennent aux modèles conversationnels.

## Traiter les entrées incomplètes et les erreurs

Une troncature signalée échoue avec le code `response` et `details.truncated: true`. Utilisez `allowTruncated: true` seulement si votre application accepte une évaluation partielle. L’absence de `truncated` ne prouve pas que le service a traité l’entrée entière.

Les requêtes n’ont aucune nouvelle tentative interne. HTTP 429 produit `quota` ; un délai dépassé produit `timeout` ; les pannes réseau et statuts HTTP indisponibles conservent leur classification. Un JSON, des réponses ou un usage invalides produisent `response`. L’annulation se propage. Les valeurs par défaut sont un délai de 120 secondes et une réponse limitée à 8 MiB.

## Ajouter une tâche de workflow

`defineDecisionTask()` utilise les mécanismes existants de dépendance, condition, nouvelle tentative, délai et cache. Elle évalue sa fonction d’état avec `TaskContext` et n’alloue aucune sandbox. Les tâches dépendantes reçoivent des réponses typées via `context.value(triage)`.

```ts title="triage.ts"
import { defineDecisionTask, defineTask } from "@elie-laloum/outpost";
import { provider } from "./decision-provider.ts";
import { routing } from "./decision.ts";

export const input = defineTask({
  key: "input",
  perform: () => ({ goal: "Fix a parser" }),
});
export const triage = defineDecisionTask({
  key: "triage",
  after: [input],
  provider,
  model: "jev-latest",
  decision: routing,
  state: (context) => context.value(input),
  timeoutMs: 10_000,
});
```

Incluez les deux tâches dans un [workflow](../task-dependencies/). Un checkpoint terminé restaure le résultat sans nouvelle évaluation ; une tentative interrompue exige toujours une autorisation explicite de replay. Les clés et versions du cache doivent couvrir l’état et la configuration de décision : questions, endpoint, modèle et politique de troncature. Un résultat en cache ne consomme aucune tentative ni aucun token.

L’usage des décisions entre dans les budgets du workflow de façon synchrone, y compris l’usage valide d’un résultat ensuite refusé pour troncature. L’usage absent reste incomplet : un budget strict ne peut pas supposer une consommation nulle. Voir les [budgets](../budgets/), les [caches de tâches](../task-cache/) et le [routage de modèles](../model-routing/).

## Exercer le contrat hors ligne

Ce provider de test explicite renvoie une réponse et un reçu d’usage fixes. Exécutez `node offline.ts` pour exercer déclaration, validation et lecture du résultat sans compte de modèle. Cet exemple vérifie le contrat Outpost ; il ne valide pas une inférence réelle Jev ou Laya.

<!-- tabs -->

```ts title="offline-decision.ts"
import { defineDecision } from "@elie-laloum/outpost";

export const readOnly = defineDecision({
  questions: {
    safe: { type: "noul", instructions: "Is the action read-only?" },
  },
});
```

```ts title="fixture-provider.ts"
import type { DecisionProvider } from "@elie-laloum/outpost";

export const fixture: DecisionProvider = {
  name: "offline-fixture",
  request: async () => ({
    model: "fixture",
    answers: { safe: { type: "noul", noul: 0.9 } },
    usage: { input: 3, cached: 0, output: 1 },
  }),
};
```

```ts title="offline.ts"
import { decide } from "@elie-laloum/outpost";
import { readOnly } from "./offline-decision.ts";
import { fixture } from "./fixture-provider.ts";
import { reportValue } from "./reporter.ts";

const result = await decide({
  provider: fixture,
  model: "fixture",
  decision: readOnly,
  state: "Read the test report.",
});
reportValue(result.answers.safe.noul);
// Example output: 0.9
```

<!-- check:run -->

API : [defineDecision](../../reference/definedecision/) · [decide](../../reference/decide/) · [defineDecisionTask](../../reference/definedecisiontask/) · [DecisionProvider](../../reference/decisionprovider/).
