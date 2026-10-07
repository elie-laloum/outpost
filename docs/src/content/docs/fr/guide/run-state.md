---
title: "Lire l’état d’une exécution"
description: "Construire une interface autour d’un ID, d’une fiche persistée et d’un curseur reprenable."
---

## Enregistrer une exécution

Créez un récepteur avec un ID choisi par votre application et attachez-le à un nouveau hub d’observation. Passez ce hub à un seul `dispatch()` ou `start()` de workflow. Le récepteur conserve une fiche et les observations masquées dans votre [transport](../storage/), indépendamment du journal d’exécution. Enregistrez le transport dans `storage.ts` pour qu’un autre processus puisse lire le même emplacement.

```ts title="storage.ts"
import { createLocalTransport } from "@elie-laloum/outpost";

export const transporter = createLocalTransport({
  directory: ".outpost/storage",
});
```

Enregistrez le récepteur dans `observation.ts`. L’appelant possède sa fermeture ; les lecteurs indépendants peuvent aussi importer le module de transport.

```ts title="observation.ts"
import { createRunObserver, createObservationHub } from "@elie-laloum/outpost";
import { transporter } from "./storage.ts";

export const receiver = await createRunObserver({
  transporter,
  id: "nightly_2026_10_07",
  kind: "workflow",
});
export const observation = createObservationHub({ sinks: [receiver] });
```

Utilisez `kind: "dispatch"` pour une requête unique. Attachez le récepteur avant le démarrage. Sa fabrique crée une fiche en cours avant le premier événement ; l’application choisit son ID, distinct de l’`executionId` du workflow. Un ID déjà utilisé échoue par écriture conditionnelle. Gardez le récepteur ouvert jusqu’à la fin, puis fermez-le pour arrêter les heartbeats. Fermer un récepteur inachevé laisse sa fiche expirer.

Pour un résumé lisible d’un dispatch terminé, utilisez son [rapport de run](../run-reports/). Cette projection sert aux lecteurs qui suivent une exécution par ID.

## Démarrer un workflow

Le workflow enregistre les tâches en attente dès le démarrage, les tentatives, pauses, erreurs et consommations cumulées, y compris celles du checkpoint à la reprise. Les dispatchs de ses tâches conservent l’agent, la phase courante, la branche, les commits et la consommation. Transmettez le contexte d’observation du workflow dans les dispatchs de tâches personnalisées ; les [tâches isolées](../multiple-repositories/) le font automatiquement.

```ts title="start.ts"
import { observation, receiver } from "./observation.ts";
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

await using ownedReceiver = receiver;
const check = defineTask({ key: "check", perform: () => "ok" });
const workflow = defineWorkflow("nightly", [check]);
const result = await workflow.start({ observation });
await observation.close();
result.unwrap();
```

Enregistrez ces fichiers ensemble et exécutez `node start.ts`. Le hub vide les livraisons quand le workflow se termine ou se suspend. Les erreurs des récepteurs apparaissent dans `observerErrors` sans modifier le résultat. Inspectez ces erreurs et `receiver.errors` ; un échec de heartbeat arrête le récepteur. Le [masquage](../observability/) s’applique avant persistance lorsqu’il est configuré sur le hub ou l’exécution.

## Lire depuis un autre processus

Donnez au lecteur le même emplacement de transport et le même ID. Il lit une fiche remplacée atomiquement sans prendre de verrou d’exécution. Un ID absent renvoie `undefined`. Avec S3, utilisez le même bucket et préfixe ; aucun accès au système de fichiers hôte ni recherche de PID n’est nécessaire.

```ts title="snapshot.ts"
import { transporter } from "./storage.ts";
import { reportValue } from "./reporter.ts";
import { readRun } from "@elie-laloum/outpost";

export const run = await readRun({ transporter, id: "nightly_2026_10_07" });
if (run) {
  reportValue(
    run.status,
    run.tasks.map((t) => `${t.key}: ${t.status}`),
  );
  reportValue(run.dispatches, run.commits, run.usage, run.errors);
}
```

Exécutez `node snapshot.ts` dans un second processus ; il affiche le statut et les champs enregistrés. Pour le helper de rapport standard, consultez l’[observabilité](../observability/). La fiche reflète les observations livrées avec succès. `complete: false` signale des trous détectés dans la séquence ou l’expiration d’une fiche en cours. `complete: true` indique qu’aucun trou n’a été détecté ; des événements finaux peuvent néanmoins être perdus par un récepteur borné. Aucune transaction ne lie cette projection au checkpoint. Elle n’autorise ni rejeu, ni intégration, ni récupération de ressources. Les estimations monétaires apparaissent dans `accounting.cost` si le workflow possède une table de prix.

Les tâches restaurées sans historique d’observation précédent exposent `usage.complete: false` ; le total cumulé du workflow provient toujours de la comptabilité du checkpoint.

## Suivre un curseur

Affichez d’abord la fiche, puis suivez les observations strictement après son `seq`. Les événements sont écrits avant que la fiche publie leur curseur : le lecteur ne suit jamais un événement non publié. La séquence persistée continue après une reprise de workflow suspendu ; elle est distincte de l’`observationSeq` de chaque hub. La charge de l’événement est `unknown` : validez-la avant d’inspecter ses champs dans une interface.

```ts title="watch.ts"
import { transporter } from "./storage.ts";
import { run } from "./snapshot.ts";
import { reportValue } from "./reporter.ts";
import { watchRun } from "@elie-laloum/outpost";

if (run) {
  for await (const event of watchRun({
    transporter,
    id: run.id,
    from: run.seq,
  })) {
    reportValue(event.seq, event.scope.taskKey, event.event);
  }
}
```

Exécutez `node watch.ts` pour afficher la fiche puis les événements suivants. `watchRun()` interroge le transport et termine après avoir livré les événements d’une fiche terminée, suspendue ou abandonnée. Relisez la fiche pour actualiser votre interface ; les heartbeats ne consomment pas de curseur. Conservez le dernier curseur traité pour vous reconnecter. Passez `signal` pour annuler le lecteur sans arrêter l’exécution. Les segments absents, fiches invalides et curseurs en avance échouent explicitement. Les lectures sont bornées à 8 Mio par objet par défaut ; vous pouvez réduire cette limite.

## Interpréter les heartbeats et les reprises

Par défaut, le récepteur actualise son heartbeat toutes les cinq secondes. Une fiche en cours devient `abandoned` à la lecture après trente secondes sans actualisation. Les lecteurs ne persistent jamais ce statut et ne modifient aucune propriété. Un stockage lent, une panne réseau ou une boucle d’événements bloquée peut aussi faire expirer le heartbeat : il s’agit d’un abandon présumé, pas d’une preuve d’arrêt du processus. Un workflow suspendu, en attente d’entrée ou terminé n’a pas besoin de heartbeat.

Pour reprendre explicitement un checkpoint de workflow terminé ou suspendu, créez un nouveau récepteur avec le même ID, `kind: "workflow"` et `resume: true`, puis attachez un nouveau hub. Consommation des tâches, historique des dispatchs et curseurs sont conservés. L’identité d’exécution du checkpoint doit correspondre. Les révisions empêchent les écritures concurrentes. Une projection encore en cours, même avec un heartbeat expiré, ne peut pas être reprise : récupérez explicitement l’exécution et observez la reprise sous un nouvel ID.

Les fiches vivent sous `runs/<id>/` et restent protégées par la rétention. Le stockage des événements croît avec l’exécution ; le récepteur s’arrête et signale une erreur lorsqu’une fiche ou un événement dépasse 8 Mio. Réglez la verbosité des charges brutes et des modèles selon votre interface. Les tests déterministes couvrent le stockage local et une fixture HTTP S3 ; la validation AWS réelle reste à effectuer.

L’[exemple 57](https://gitlab.elielaloum.com/elielaloum/outpost/-/tree/main/examples/57-run-state) inclut un processus lecteur distinct. API : [createRunObserver](../../reference/createrunobserver/) · [readRun](../../reference/readrun/) · [watchRun](../../reference/watchrun/) · [RunSnapshot](../../reference/runsnapshot/).
