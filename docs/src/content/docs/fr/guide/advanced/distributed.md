---
title: "Exécuter une tâche via un worker HTTP"
description: "Exécutez une vraie file SQLite, un coordinateur HTTP et un worker sur loopback avant de séparer les hôtes."
---

Exécutez une vraie file SQLite, un coordinateur HTTP et un worker sur loopback avant de séparer les hôtes.

<!-- scenario:offline -->

<!-- preparation:offline -->

<details>
<summary>Préparer cet exemple depuis zéro</summary>

Utilisez Node.js **24+** et npm. Commencez dans un nouveau dossier pour chaque exemple.

```sh
mkdir outpost-example
cd outpost-example
```

```sh
npm init -y
npm install @elie-laloum/outpost
```

Enregistrez l’exemple sous **example.mts** dans ce dossier. Aucun compte, clé API ou conteneur n’est nécessaire.

</details>

<!-- /preparation -->

## Essayer

Enregistrez le fichier **example.mts** dans `outpost-example/`.

```ts file=example.mts
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdir } from "node:fs/promises";
import {
  sqliteTaskQueue,
  serveTaskQueue,
  httpTaskQueue,
  runQueueWorker,
  queuedTask,
  workflow,
} from "@elie-laloum/outpost";

await mkdir("state", { recursive: true });
const storage = await sqliteTaskQueue("./state/jobs.sqlite");
const token = randomBytes(32).toString("hex");
const server = await serveTaskQueue({ queue: storage, token, port: 0 });
const queue = httpTaskQueue({ url: server.url, token });
const stop = new AbortController();
const worker = runQueueWorker({
  queue,
  worker: "text-worker",
  signal: stop.signal,
  handlers: {
    slug(input) {
      if (typeof input !== "string") throw new Error("Expected text");
      return { value: input.trim().toLowerCase().replace(/\s+/g, "-") };
    },
  },
});
try {
  const convert = queuedTask({
    key: "slug",
    queue,
    handler: "slug",
    input: () => "Hello World",
    decode(value) {
      if (typeof value !== "string")
        throw new Error("Expected a string result");
      return value;
    },
  });
  const result = await workflow("queued-text", [convert]).start({
    signal: AbortSignal.timeout(10_000),
  });
  result.unwrap();
  assert.equal(result.value(convert), "hello-world");
  console.log(result.value(convert));
} finally {
  stop.abort();
  await worker;
  await server.close();
  storage.close();
}
```

```sh
node example.mts
```

## Comprendre le résultat

Le worker renvoie `hello-world`. Cet exercice utilise HTTP et SQLite, mais tous les composants tournent sur votre ordinateur. Le serveur et le worker s’arrêtent dans `finally` ; la base reste dans `state/`. Des hôtes séparés nécessitent HTTPS authentifié ou un tunnel chiffré. Les baux empêchent les validations de résultats périmées, sans garantir des effets externes exactement une fois.

[Contrats, options et cas particuliers](../../../reference/behavior/workflows/distributed/).

Les fichiers persistants éventuels restent dans ce dossier de démonstration.
