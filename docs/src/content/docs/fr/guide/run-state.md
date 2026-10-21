---
title: "Lire l’état d’une exécution"
description: "Enregistrez automatiquement une exécution et consultez-la avec observation.readRun() et observation.watchRun()."
---

Utilisez `createObservation({ transporter })` lorsqu’un terminal, une interface ou un autre processus doit consulter une exécution. Transmettez cet objet à `dispatch()` ou `workflow.start()`. Le moteur enregistre l’exécution et ferme son suivi lorsqu’elle se termine ou se met en attente. Le même objet peut servir à plusieurs exécutions successives ou concurrentes.

## Enregistrer une exécution

Enregistrez les fichiers suivants ensemble. Le transport partagé donne accès au même stockage depuis le programme d’exécution et le lecteur. Construire l’objet observation ne crée aucun enregistrement ni heartbeat : le suivi commence lorsqu’une exécution l’utilise.

```ts title="storage.ts"
import { createLocalTransport } from "@elie-laloum/outpost/core";

export const transporter = createLocalTransport({
  directory: ".outpost/storage",
});
```

Configurez l’objet avec ce transport et les sorties supplémentaires souhaitées. Il emprunte ses sorties et le transport ; leur propriétaire conserve la responsabilité de les fermer si nécessaire.

```ts title="observation.ts"
import { createObservation } from "@elie-laloum/outpost/core";
import { transporter } from "./storage.ts";

export const observation = createObservation({ transporter });
```

## Démarrer un workflow

Enregistrez ce fichier sous `start.ts`, puis lancez `node start.ts`. Le workflow choisit le type d’exécution et possède son suivi. Précisez `runId` lorsqu’un autre processus doit connaître l’identifiant à l’avance. Sinon, l’identifiant du checkpoint est utilisé, ou un nouvel identifiant est généré et renvoyé dans `result.observationId`.

```ts title="start.ts"
import { observation } from "./observation.ts";
import { defineTask, defineWorkflow } from "@elie-laloum/outpost/workflows";

await using ownedObservation = observation;
const check = defineTask({ key: "check", perform: () => "ok" });
const result = await defineWorkflow("nightly", [check]).start({
  observation,
  runId: "nightly_2026_10_21",
});
console.log(result.observationId, result.status);
result.unwrap();
```

Utilisez `result.observationId` avec le client observation ; le champ `runId` existant du résultat reste égal à cet identifiant pour compatibilité. L’option d’entrée conserve le nom `runId`. L’`executionId` d’un workflow identifie son historique d’exécution, tandis que `checkpoint.runId` sélectionne son checkpoint durable. Choisir un autre identifiant d’observation ne rejoue pas les tâches terminées et ne change pas la propriété du checkpoint. Sans session de suivi automatique, `observationId` est absent.

`dispatch({ observation, runId, ... })` emploie la même API pour une requête. Un dispatch imbriqué recevant `context.observation` rejoint la projection du workflow. Transmettez ce contexte dans les tâches personnalisées ; les tâches isolées le font automatiquement. La continuation d’un dispatch autonome constitue une nouvelle exécution et demande un nouvel identifiant.

Avec un transport, un identifiant déjà utilisé fait échouer l’ouverture avant le travail d’exécution. Une erreur de stockage à l’ouverture refuse aussi le démarrage. Une fois le suivi ouvert, les erreurs des destinataires figurent dans `observerErrors` et `observation.errors` sans changer le résultat du travail. Le moteur vide les livraisons et arrête le heartbeat avant de rendre la main. Fermer l’objet partagé attend les suivis actifs sans annuler leurs exécutions ; gardez-le ouvert jusqu’au démarrage de toutes les exécutions prévues.

## Enregistrer un dispatch

Avec la [configuration d’agent](../setup/), enregistrez aussi ce fichier puis lancez `node dispatch.ts`. Le dispatch possède son suivi et rend la main après sa fermeture. Utilisez un nouvel identifiant pour une autre exécution indépendante.

```ts title="dispatch.ts"
import { dispatch } from "@elie-laloum/outpost/core";
import { observation } from "./observation.ts";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await using ownedObservation = observation;
const result = await dispatch({
  runId: "review-123",
  observation,
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/review-123" },
  brief: { text: "Review the code without modifying files." },
});
console.log(result.observationId, result.text);
```

## Lire depuis un autre processus

Lancez ce fichier après l’enregistrement de l’exécution. Un identifiant absent renvoie `undefined` ; le lecteur ne crée aucun enregistrement et ne prend aucun verrou d’exécution. Avec S3, utilisez le même bucket et le même préfixe dans chaque processus. Configurez le [masquage](../redacting-secrets/) sur l’observation productrice ou l’exécution avant la persistance.

```ts title="snapshot.ts"
import { createObservation } from "@elie-laloum/outpost/core";
import { transporter } from "./storage.ts";

await using reader = createObservation({ transporter });
export const run = await reader.readRun("nightly_2026_10_21");
if (run) {
  console.log(run.status, run.tasks, run.dispatches, run.usage);
}
```

`complete: false` indique un trou détecté dans les événements ou un enregistrement actif expiré. `complete: true` signifie qu’aucun trou n’a été détecté ; les derniers événements peuvent néanmoins être perdus. Cette projection est distincte des checkpoints, des budgets et des journaux d’exécution. Elle n’autorise jamais un rejeu, une intégration ou une récupération. Le [rapport d’un dispatch](../run-reports/) terminé fournit son résumé de revue.

## Suivre un curseur

Lisez un état, puis suivez les observations après son `seq`. Conservez le dernier curseur traité pour vous reconnecter. Lancez ce fichier après l’enregistrement : il affiche les événements sauvegardés puis les nouveaux jusqu’à la fin de l’exécution ou l’expiration du heartbeat. La charge utile est de type `unknown` ; validez-la avant d’accéder à ses champs.

```ts title="watch.ts"
import { createObservation } from "@elie-laloum/outpost/core";
import { transporter } from "./storage.ts";

await using reader = createObservation({ transporter });
const run = await reader.readRun("nightly_2026_10_21");
const controller = new AbortController();
if (run) {
  for await (const event of reader.watchRun(run.id, {
    from: run.seq,
    signal: controller.signal,
  })) {
    console.log(event.seq, event.scope.taskKey, event.event);
  }
}
```

Annuler le signal du lecteur arrête seulement l’abonnement, jamais l’exécution. Actualisez l’état avec `readRun()` au besoin. Un segment absent, un enregistrement invalide ou un curseur en avance provoque une erreur explicite. La limite de lecture par objet est de 8 Mio ; [ObservationReadOptions](../../reference/observationreadoptions/) et [ObservationWatchOptions](../../reference/observationwatchoptions/) permettent de la réduire.

## Comprendre les heartbeats et les reprises

Le heartbeat est émis toutes les cinq secondes par défaut, avec suspicion d’abandon après trente secondes. Un transport lent ou une boucle d’événements bloquée peut aussi provoquer cette expiration. La lecture renvoie alors `abandoned` sans modifier le stockage ni autoriser la récupération. Un workflow terminé ou en attente n’a pas besoin de heartbeat.

Lorsqu’un workflow ouvre un checkpoint existant, l’observation reprend sa projection stabilisée sous le `runId` choisi, en conservant le curseur persistant et l’identité d’exécution. Un checkpoint jusque-là non observé peut commencer une nouvelle projection. Une projection non stabilisée ne peut pas être reprise, même après expiration : récupérez explicitement l’exécution et choisissez un nouveau `runId` d’observation. Relancez également l’abonnement après une reprise, car il se termine à chaque état stabilisé.

Les données vivent sous `runs/<id>/` et restent protégées par la planification de rétention. Leur volume augmente avec l’exécution. Un événement ou un état dépassant 8 Mio arrête le destinataire et signale une erreur d’observation. Les tests déterministes couvrent le stockage local ; les tests des fonctions élémentaires utilisent aussi un serveur HTTP simulant S3. La validation sur AWS réel reste distincte.

`createObservationHub()`, `createRunObserver()`, les fonctions indépendantes `readRun()`/`watchRun()` et les callbacks historiques restent disponibles pour les compositions spécialisées. Leurs règles de propriété explicites sont conservées ; le client unifié ne ferme pas les destinataires empruntés à votre place.

L’[exemple 57](https://gitlab.elielaloum.com/elielaloum/outpost/-/tree/main/examples/57-run-state) comprend un lecteur séparé. API : [createObservation](../../reference/createobservation/) · [ObservationClient](../../reference/observationclient/) · [ObservationOptions](../../reference/observationoptions/) · [RunSnapshot](../../reference/runsnapshot/).
