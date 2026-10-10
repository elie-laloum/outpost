---
title: "Exploiter et relancer les workers"
description: "Après votre premier job, préparez les traitements aux annulations, aux arrêts brutaux et aux exécutions répétées."
---

Après votre [premier job](../job-queues/), préparez les traitements aux annulations, aux arrêts brutaux et aux exécutions répétées.

## Réservation des jobs et nouvelles tentatives

Chaque prise en charge incrémente le `fence` du job : un worker qui a perdu son bail ne peut pas écraser le résultat de son successeur.

| Événement                         | Ce qui se passe                                                                                            |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Le traitement s’exécute           | Le bail dure `leaseMs` (30 s par défaut, de 30 ms à 5 min) et se renouvelle tous les tiers de cette durée. |
| Le worker plante                  | Le bail expire ; un autre worker prend le job avec un nouveau jeton de propriété.                          |
| Renouvellement échoué, job annulé | Le `signal` du traitement est annulé et ce worker n’enregistre aucun résultat.                             |
| Le traitement échoue              | Le job passe à `failed`. La file ne le relance pas : mettez en file un nouvel identifiant.                 |
| `deadline` dépassée               | Le job passe à `cancelled`. `deadline` est un horodatage en millisecondes epoch.                           |

Transmettez `signal` à chaque opération lancée par le traitement, pour que l’annulation et la perte du bail l’arrêtent.

## Dédupliquer les effets avec les clés d’idempotence

Un job peut s’exécuter deux fois : le successeur d’un worker planté relance le traitement. Les traitements qui produisent des effets externes les dédupliquent avec `idempotencyKey`.

```ts
import type { QueueHandler, WorkflowJson } from "@elie-laloum/outpost";

function deliveryHandler(
  deliverOnce: (
    key: string,
    input: WorkflowJson,
    signal: AbortSignal,
  ) => Promise<WorkflowJson>,
): QueueHandler {
  return async (input, { idempotencyKey, signal }) => ({
    value: await deliverOnce(idempotencyKey, input, signal),
  });
}
```

Référence API : [QueueHandlerContext](../../reference/queuehandlercontext/) et [TaskContext](../../reference/taskcontext/).

Une API distante dotée de clés d’idempotence persistantes convient aussi. Un reçu gardé en mémoire, ou écrit séparément de l’effet, est perdu lors d’un plantage. Dérivez une clé par effet quand un traitement en produit plusieurs, et conservez les reçus aussi longtemps qu’un job peut être rejoué.

## Exploiter les workers

<!-- features -->

- **Déployer les traitements d’abord**: Démarrez les workers qui connaissent un traitement avant que les producteurs mettent des jobs en file pour lui.
- **Monter en charge**: Lancez d’autres workers sur la même file, avec un nom `worker` par processus.
- **Arrêter proprement**: Arrêtez les producteurs, annulez le signal du worker, attendez `runQueueWorker()`, puis fermez la file.
- **Récupérer après un plantage**: Vérifiez que l’ancien processus est arrêté, puis démarrez un remplaçant ; il prend le job à l’expiration du bail.
- **Récupérer un job de workflow**: Libérez le checkpoint de l’exécution plantée comme dans [Exécutions durables](../durable-runs/), puis mettez en file un nouvel identifiant de job pour un traitement `retry-incomplete`.
- **Surveiller**: Suivez l’âge des jobs, les jobs échoués, les erreurs de renouvellement de bail et l’espace de stockage.

Un traitement annulé pendant un arrêt laisse son job `active` ; un autre worker le prend à l’expiration du bail. Un job de workflow repris échoue tant que l’exécution plantée possède encore son checkpoint.
