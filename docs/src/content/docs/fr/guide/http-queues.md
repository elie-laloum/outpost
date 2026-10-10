---
title: "Partager une file par HTTP"
description: "Relier producteurs et workers à une file accessible par HTTP."
---

Utilisez une file HTTP lorsque producteurs et workers ne peuvent pas ouvrir la même base locale. Vous exposez la file du guide [Exécuter des jobs](../job-queues/) ; les traitements restent exécutés par les workers. Pour un accès distant, placez un proxy TLS devant le serveur. Le jeton autorise toutes les opérations de la file, sans séparation par locataire ou traitement.

## Exposer une file via HTTP

`serveTaskQueue()` place n’importe quelle file derrière un point d’accès HTTP. `createHttpTaskQueue()` est un client de file pour les producteurs et workers situés sur d’autres machines.

```ts title="queue-server.ts"
import { createSqliteTaskQueue, serveTaskQueue } from "@elie-laloum/outpost";

const token = process.env.OUTPOST_QUEUE_TOKEN;
if (!token) throw new Error("Set OUTPOST_QUEUE_TOKEN");

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const server = await serveTaskQueue({ queue, token, port: 8788 });
console.log(`Queue at ${server.url}`);
// Example output: Queue at http://127.0.0.1:8788
```

Sur une autre machine, `createHttpTaskQueue({ url, token })` renvoie une file à passer à `runQueueWorker()` ou à utiliser avec `enqueue()`. Le jeton compte de 32 à 512 caractères, sans espace. Le serveur écoute sur `127.0.0.1` sauf si vous définissez `host` ; `await server.close()` l’arrête, et vous fermez vous-même la file sous-jacente.

Pour faire tourner les jetons, donnez à `token` une fonction, lue à chaque requête. Celle du serveur renvoie les jetons acceptés ; une liste vide ou une erreur refuse toutes les requêtes.

1. Autorisez l’ancien et le nouveau token sur le serveur.
2. Faites passer les clients au nouveau token, y compris pour renouveler les réservations et terminer les jobs.
3. Retirez l’ancien token du serveur une fois tous les clients migrés.

## Essayer depuis un client

Lancez `node queue-server.ts` et le `worker.ts` de [Jobs et workers](../job-queues/) depuis le même répertoire : ils ouvrent la même base SQLite. Dans un troisième terminal, donnez le même `OUTPOST_QUEUE_TOKEN` au client puis lancez `node submit-http.ts`. Réexécutez-le après le traitement pour lire la valeur `3`. Pour cet essai local, aucun proxy n’est nécessaire.

```ts title="submit-http.ts"
import { createHttpTaskQueue } from "@elie-laloum/outpost";

const token = process.env.OUTPOST_QUEUE_TOKEN;
if (!token) throw new Error("Set OUTPOST_QUEUE_TOKEN");
const queue = createHttpTaskQueue({ url: "http://127.0.0.1:8788", token });
await queue.enqueue({ id: "http-count-1", handler: "count", input: [1, 2, 3] });
console.log(await queue.get("http-count-1"));
```
