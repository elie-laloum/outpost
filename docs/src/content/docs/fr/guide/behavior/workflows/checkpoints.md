---
title: Reprendre un workflow depuis des checkpoints
description: Persister les résultats et reprendre explicitement les tâches interrompues.
sidebar:
  order: 5
---

Les checkpoints sont optionnels. Ils conservent les valeurs des tâches terminées, l'identité d'exécution, les états et les compteurs cumulés de tentatives et de tokens après un redémarrage. Recréez le graphe avec les mêmes clés de tâches et dépendances avant la reprise.

```ts
import {
  fileWorkflowCheckpointStore,
  task,
  workflow,
} from "@elie-laloum/outpost";

const inspect = task({
  key: "inspect",
  perform: () => ({ ready: true }),
});
const delivery = workflow("delivery", [inspect]);
const result = await delivery.start({
  checkpoint: {
    store: fileWorkflowCheckpointStore({ directory: ".outpost/workflows" }),
    runId: "delivery-ticket-42",
    version: "implementation-and-inputs-v1",
  },
});
result.unwrap();
console.log(result.value(inspect).ready);
```

Le répertoire est résolu depuis le répertoire courant. Utilisez un chemin absolu si le lancement change de répertoire. Un identifiant de run désigne une seule exécution persistante ; choisissez un nouvel identifiant pour un travail indépendant. Un run terminé restitue ses valeurs sauvegardées sans réexécuter les tâches. Sans `checkpoint`, chaque `start()` reste une nouvelle exécution.

## Redémarrage et politique de rejeu

Par défaut, un checkpoint interrompu ou en échec est refusé avant toute tâche. Une [approbation ou pause](../../../advanced/approvals/) propre peut être rouverte sans autorisation de rejeu ; les demandes en attente et les refus définitifs restent inchangés. Définissez `checkpoint.resume: "retry-incomplete"` pour autoriser le rejeu des tâches qui n'ont pas réussi. Les tâches réussies restent terminées ; les autres, y compris celles ignorées à cause de dépendances, redeviennent en attente et leurs conditions sont réévaluées. Un graphe entièrement terminé ou en pause propre conserve ses tâches ignorées conditionnellement. Les décisions acceptées et les étapes refusées ne sont jamais rejouées.

L'identifiant d'exécution et `context.attempt`, cumulatif et commençant à un, survivent aux redémarrages. Chaque rejeu dispose d'un nouveau cycle selon la politique de retry de la tâche ; les budgets de tentatives et de tokens du workflow incluent les exécutions précédentes. Les enregistrements conservent les tentatives ; le rejeu remplace les derniers champs de début, fin et erreur.

Une tâche interrompue peut avoir effectué un effet externe avant la sauvegarde de son résultat. Utilisez des opérations idempotentes ou une réconciliation externe avant d'autoriser son rejeu. Les checkpoints ne garantissent pas des effets exécutés exactement une fois. Les résultats sont persistés avant le démarrage des tâches dépendantes ; un échec d'écriture arrête la planification, annule les tâches actives et attend leur nettoyage avant de libérer l'exclusivité.

`reportUsage()` met une écriture en file d'attente. La fin d'une tâche attend sa persistance. Dans une tâche longue, `await context.checkpoint?.()` attend explicitement l'écriture de la tentative et de l'usage déclaré. Un arrêt brutal peut perdre l'usage non encore persisté ; l'usage jamais déclaré par un fournisseur externe ne peut pas être reconstruit.

## Identité et contrat des résultats

L'identité sauvegardée inclut le nom du workflow, les clés et dépendances, la configuration des retries et délais, la présence des conditions, le type/message/acteurs des étapes de décision et la `version` fournie. Changez `version` dès que les implémentations, conditions, prédicats de retry ou entrées changent : les fonctions et variables capturées ne peuvent pas être identifiées fiablement. Une différence de version ou de graphe échoue avant exécution ; utilisez un nouvel identifiant pour le workflow modifié.

Les résultats doivent être des valeurs JSON sans perte, ou `undefined` au premier niveau pour les tâches sans résultat. Les `undefined` imbriqués, tableaux creux, accesseurs, fonctions, instances de classes, symboles, cycles, nombres non finis, zéro négatif et `BigInt` provoquent un échec de tâche. Convertissez dates et objets métier en données simples dans `perform()` puis reconstruisez-les dans les tâches dépendantes. Stockez les gros artefacts séparément et retournez une référence.

## Stockage et exclusivité

`WorkflowCheckpointStore` est un port du domaine. `acquire(runId)` retourne un lease exclusif avec `read`, `write` et `release` ; les adaptateurs doivent conserver l'exclusivité jusqu'à la fin des écritures et remplacer les snapshots atomiquement. `read` retourne `undefined` pour un nouveau run ; les snapshots persistés sont versionnés et validés avant toute tâche.

L'adaptateur fichier écrit des fichiers privés (0600) via des fichiers temporaires, synchronisation et remplacement atomique, avec synchronisation du répertoire parent sur POSIX. Chaque checkpoint est limité à 16 Mio. Les verrous de processus locaux refusent les propriétaires concurrents, récupèrent les propriétaires confirmés morts et refusent les propriétaires incertains. Cet adaptateur cible un système de fichiers local et des processus locaux ; ce n'est pas un verrou distribué ou pour système de fichiers réseau. Les checkpoints peuvent contenir des résultats sensibles ; protégez leur répertoire et excluez-le des fichiers suivis. Les données sont conservées jusqu'à leur suppression explicite.

Consultez les [politiques d'exécution](../../../workflows/execution/) et les [budgets d'usage](../../../workflows/budgets/) pour l'annulation, les retries et les limites d'admission.

Un `DispatchResult` complet contient des fonctions de continuation et ne peut pas être sauvegardé directement. Appelez `dispatch` dans une tâche, transmettez son signal et déclarez sa consommation, puis retournez des données simples comme `result.value`. Une tâche d’artefact peut publier ces données et retourner une référence JSON ; voir les [artefacts typés](../../../advanced/artifacts/).

La reprise automatique d’un verrou inactif exige l’identité de processus Linux. Sur les plateformes qui ne la fournissent pas, notamment macOS et Windows, un propriétaire interrompu reste incertain et bloque le redémarrage. Après avoir vérifié indépendamment qu’aucun runner ne détient encore le checkpoint, conservez son JSON et retirez uniquement le verrou indiqué par le conflit avant de réessayer.
