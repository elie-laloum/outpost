---
title: Exécuter des workers distribués
description: Files de tâches durables, workers HTTP, baux et jetons de fencing.
sidebar:
  order: 8
---

Utilisez un coordinateur lorsque les tâches doivent s’exécuter sur plusieurs hôtes. Il conserve les tâches JSON dans SQLite ; chaque worker accepte uniquement les noms de gestionnaires enregistrés dans son propre processus. Installez Outpost et Node.js 24+ sur chaque hôte. Le module intégré `node:sqlite` est chargé uniquement à l’ouverture du stockage.

## Démarrer un coordinateur

Générez un jeton bearer aléatoire partagé, d’au moins 32 caractères sans espaces, et injectez-le avec votre gestionnaire de secrets dans `OUTPOST_QUEUE_TOKEN`. Tous ses détenteurs peuvent soumettre, réclamer, consulter et annuler les tâches. Cette frontière de confiance partagée ne fournit ni autorisation par worker ni isolation entre locataires.

```ts
import { sqliteTaskQueue, serveTaskQueue } from "@elie-laloum/outpost";

const token = process.env.OUTPOST_QUEUE_TOKEN;
if (!token) throw new Error("OUTPOST_QUEUE_TOKEN is required");
const queue = await sqliteTaskQueue("./private/queue.sqlite");
const server = await serveTaskQueue({ queue, token, port: 8787 });
console.log(server.url);

process.once("SIGINT", async () => {
  await server.close();
  queue.close();
});
```

L’adresse par défaut est la boucle locale (`127.0.0.1`). Pour les autres hôtes, placez un proxy inverse HTTPS authentifié devant le serveur ou utilisez un tunnel privé chiffré. Définissez `host` explicitement après avoir configuré cette frontière réseau. Le serveur HTTP ne fournit pas lui-même TLS. Ne placez jamais le jeton dans une URL ou un fichier versionné. Le client refuse les redirections et les identifiants dans l’URL ; les erreurs d’authentification ne renvoient pas les secrets.

Exécutez un service coordinateur avec SQLite sur un **disque local** durable, sans système de fichiers réseau. Les transactions sérialisent les réservations et conservent des jetons de fencing strictement croissants malgré les redémarrages. Le fichier est créé avec des droits réservés au propriétaire lorsque la plateforme le permet. Sauvegardez-le avec un outil adapté à SQLite ou à l’arrêt du coordinateur. Les résultats terminaux constituent l’historique de déduplication : conservez-les tant que leurs workflows peuvent reprendre. La rétention automatique, la réplication et le basculement du coordinateur ne sont pas fournis. Les réservations sélectionnent une tâche admissible via un index de métadonnées sans charger les anciens résultats terminaux. Ce coordinateur SQLite synchrone unique vise un débit modeste.

## Démarrer les workers

Sur chaque hôte, injectez `OUTPOST_QUEUE_URL` (l’URL HTTPS ou celle du tunnel local) et le même jeton. Enregistrez `worker.ts`, puis lancez `node worker.ts`. Remplacez cette petite opération JSON par du code applicatif de confiance qui alloue explicitement son sandbox et ses identifiants.

```ts
import { httpTaskQueue, runQueueWorker } from "@elie-laloum/outpost";

const url = process.env.OUTPOST_QUEUE_URL;
const token = process.env.OUTPOST_QUEUE_TOKEN;
if (!url || !token) throw new Error("Queue URL and token are required");
const queue = httpTaskQueue({ url, token });
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
await runQueueWorker({
  queue,
  worker: process.env.WORKER_ID ?? "worker-1",
  signal: stop.signal,
  leaseMs: 30_000,
  handlers: {
    double(input, { signal }) {
      signal.throwIfAborted();
      if (typeof input !== "number") throw new Error("Expected a number");
      return { value: input * 2 };
    },
  },
});
```

Chaque worker exécute un gestionnaire à la fois ; lancez plusieurs processus avec des identifiants distincts pour obtenir de la concurrence. Les gestionnaires reçoivent l’entrée JSON et `{ signal, job }`, dont `job.id` et `job.fence`. Aucune fonction JavaScript, commande shell, dépôt ou information d’authentification n’est transféré implicitement. Validez les entrées et configurez explicitement les sandboxes, l’accès aux dépôts et le transfert des résultats sur chaque worker.

Les battements renouvellent le bail à chaque tiers de sa durée. Choisissez une durée supérieure aux latences et blocages attendus de la boucle événementielle. Un bail expiré permet une nouvelle réservation. La perte de propriété, l’annulation, l’échéance ou l’arrêt du worker annule le signal du gestionnaire. Celui-ci doit le respecter et attendre son nettoyage ; Outpost ne peut pas interrompre de force du JavaScript arbitraire. Une erreur de transport arrête le worker, qu’un superviseur peut relancer ; les baux inachevés restent réattribuables.

## Soumettre depuis un workflow

```ts
import {
  fileWorkflowCheckpointStore,
  httpTaskQueue,
  queuedTask,
  workflow,
} from "@elie-laloum/outpost";

const url = process.env.OUTPOST_QUEUE_URL;
const token = process.env.OUTPOST_QUEUE_TOKEN;
if (!url || !token) throw new Error("Queue URL and token are required");
const queue = httpTaskQueue({ url, token });
const double = queuedTask({
  key: "double",
  queue,
  handler: "double",
  input: () => 21,
  decode(value) {
    if (typeof value !== "number") throw new Error("Expected a number");
    return value;
  },
});
const result = await workflow("remote-calculation", [double]).start({
  checkpoint: {
    store: fileWorkflowCheckpointStore({ directory: "./private/checkpoints" }),
    runId: "calculation-1",
    version: "double-v1",
  },
});
result.unwrap();
console.log(result.value(double)); // 42
```

`queuedTask` calcule l’identifiant à partir de l’identifiant d’exécution persistant et de la clé de tâche, indépendamment du numéro de tentative. La reprise explicite du checkpoint retrouve cette même tâche après une panne de l’appelant ou une perte de connexion. Conservez des entrées et une éventuelle `deadline` absolue identiques : une soumission répétée avec un contenu, un gestionnaire ou une échéance différents échoue. Les tentatives ordinaires du workflow retrouvent le même échec terminal ; démarrez une nouvelle exécution pour relancer la tâche logique. L’expiration d’un bail peut réattribuer une tâche inachevée sans en créer une autre.

`deadline` est un instant Unix absolu en millisecondes qui limite l’attente et l’exécution même après redémarrage de l’appelant. L’annulation ou le délai du workflow demande l’annulation avec le dernier jeton observé. Une réattribution concurrente peut la refuser et un coordinateur inaccessible ne peut pas l’acquitter : définissez une échéance durable pour les tâches sans supervision. Les échéances sont évaluées lors des opérations du coordinateur, notamment les battements et consultations. Seule l’horloge du coordinateur doit être correcte ; les workers n’ont pas besoin de synchroniser la leur.

## Garanties et consommation

L’exécution est **au moins une fois**. Un worker peut effectuer une action externe puis tomber avant d’en enregistrer le résultat ; son remplaçant peut la répéter. Complétion, renouvellement et annulation refusent les jetons périmés, ce qui protège la file mais pas les systèmes externes. Utilisez l’identifiant logique comme clé d’idempotence et transmettez le jeton aux systèmes capables de refuser les anciens propriétaires. L’annulation révoque la propriété dans la file, sans annuler les effets déjà réalisés.

Le port `TaskQueue` fournit `enqueue`, `get`, `claim`, `renew`, `complete` et `cancel`. `cancel(id, fence)` exige le jeton observé. Les résultats terminaux sont immuables. Les workers renvoient `{ value, usage?, error? }` ; `error` marque un échec logique. Chaque valeur JSON d’entrée ou de sortie est limitée à 256 Kio, les messages à 1 Mio, les identifiants et erreurs à 512 caractères, les baux à 30–300 000 ms. Le délai HTTP par défaut est de 10 secondes. Entrées, résultats et erreurs sont persistés et peuvent contenir des données sensibles ; protégez la base et les clients autorisés.

`queuedTask` transmet la consommation terminale au budget du workflow, y compris pour les résultats en échec. Elle n’est visible qu’à la fin : le budget n’est pas un plafond de facturation distant en temps réel. Les tentatives interrompues, annulées ou révoquées peuvent avoir consommé des ressources non rapportées. Le workflow conserve un reçu par tâche avec la consommation : une nouvelle tentative ou reprise ne compte pas deux fois le même résultat terminal. `TaskContext.reportUsageOnce(receipt, usage)` est également disponible aux adaptateurs durables ; les identifiants sont limités à 512 caractères et chaque tâche à 65 536 reçus. Un contexte personnalisé sans cette méthode facultative utilise le rapport ordinaire et doit dédupliquer lui-même ses rapports. Vérifiez la consommation réelle auprès du fournisseur si nécessaire. Le décodeur doit valider le résultat JSON avant d’exposer sa valeur typée.

## Alternative BullMQ/Redis

L’adaptateur optionnel [BullMQ/Redis](../../../advanced/bullmq/) implémente le même `TaskQueue` sans coordinateur HTTP. Il utilise l’horloge Redis pour les baux et conserve l’état Outpost à côté des jobs BullMQ. Ses connexions se ferment avec `await queue.close()`. Les limites HTTP et la fermeture synchrone SQLite ne s’appliquent pas à cet adaptateur.
