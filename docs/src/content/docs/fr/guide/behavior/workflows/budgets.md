---
title: "Limiter la consommation d’un workflow"
description: "Limites partagées de tentatives et de tokens observés entre les tâches."
sidebar:
  order: 4
---

Configurez `WorkflowOptions.budget` pour chaque exécution. Les admissions et le comptage sont partagés entre tâches concurrentes, dépendances et nouvelles tentatives ; chaque appel à `start()` possède ses propres compteurs.

```ts
import { task, workflow, WorkflowBudgetExceeded } from "@elie-laloum/outpost";

const inspect = task({
  key: "inspect",
  perform(context) {
    context.reportUsage({ input: 100, cached: 20, output: 25 });
    return "Résultat local synthétique";
  },
});
const result = await workflow("bounded", [inspect]).start({
  concurrency: 2,
  budget: { attempts: 4, usage: { input: 10_000, output: 2_000 } },
});
console.log(result.usage.attempts, result.usage.tokens);
for (const error of result.errors) {
  if (error instanceof WorkflowBudgetExceeded)
    console.log(error.dimension, error.limit, error.observed);
}
result.unwrap();
```

## Admission et annulation

`attempts` limite les appels à `perform`, nouvelles tentatives et tâches de commande comprises. Une condition fausse ne consomme aucune tentative. La dernière tentative admise peut réussir. Si une admission supplémentaire dépasserait la limite, les tâches en attente sont annulées et les opérations déjà admises se terminent normalement. Un workflow nécessitant cette admission refusée termine en `failed`, même avec `stopOnError: false`. Les conditions précèdent l’admission ; évitez d’y effectuer du travail payant. Les passes internes et les tours de réparation de réponse structurée appartiennent à la même tentative de tâche ; la limite ne borne pas leurs appels au modèle.

`usage` accepte des limites indépendantes pour `input`, `cached`, `cacheCreated` et `output`. Atteindre ou dépasser un compteur configuré annule le signal du workflow, empêche les nouvelles tentatives et annule les tâches actives de façon coopérative. La tâche qui rapporte la consommation est aussi annulée, même si elle allait réussir. Le planificateur attend la fin et le nettoyage de toutes les opérations admises. Les tâches personnalisées doivent respecter `context.signal` ; le code JavaScript qui ignore l’annulation ne peut pas être arrêté de force.

Les limites sont des entiers sûrs positifs ou nuls. Zéro empêche la première tentative. Une limite ne provoque un échec que si une admission ou un rapport de consommation l’atteint ; un workflow vide réussit. Une limite absente ne restreint rien. Une annulation externe conserve le statut `cancelled` ; un budget épuisé seul produit `failed`, avec `WorkflowBudgetExceeded` dans `errors` et dans `WorkflowFailure.result` après `unwrap()`.

## Éléments comptabilisés

`agentTask` et `isolatedTask` transmettent automatiquement les incréments de consommation normalisés du flux, y compris ceux des tentatives échouées. Les totaux des résumés réconcilient chaque passe en ajoutant uniquement les différences positives. Le résultat final réussi complète les éventuels manques. Un résumé issu du transcript inférieur au flux ne retranche jamais les tokens déjà observés ; le total du workflow peut donc dépasser `DispatchResult.usage`. Chaque nouvelle tentative possède son comptage par passe. Les erreurs des observateurs n’arrêtent pas le comptage et ne modifient pas le résultat.

Le code d’une `task` générique rapporte des **incréments** par `context.reportUsage(usage)`, une seule fois par incrément, pendant la tentative active. Ne répétez pas un total cumulatif et ne recomptez pas le résultat d’une `agentTask`/`isolatedTask`. Les conditions et les tentatives terminées ne peuvent rien rapporter. Les rapports après annulation restent comptés pendant le nettoyage de la tentative. Les commandes consomment des admissions mais n’ont aucun comptage automatique du modèle. Un workflow imbriqué possède son budget ; un dispatch direct dans une tâche personnalisée nécessite un rapport explicite ou les wrappers de tâches.

`result.usage` est un instantané immuable contenant `attempts` et `tokens`. `Usage` conserve les compteurs propres aux agents : les entrées en cache peuvent déjà être comprises dans `input`. Aucun total combiné ni conversion monétaire inventée n’est fourni.

Ce sont des **limites de consommation observée, pas des plafonds de facturation garantis**. Un agent peut ne rapporter qu’en fin de tour, omettre la consommation en cas d’échec ou avoir plusieurs requêtes actives à la limite. Concurrence et annulation peuvent dépasser le seuil. Configurez séparément les contrôles du fournisseur pour un plafond de facturation.

Consultez [les métriques de workflow et OpenTelemetry](../../../advanced/telemetry/) pour suivre ces compteurs.
