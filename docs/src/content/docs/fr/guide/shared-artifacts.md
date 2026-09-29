---
title: "Artefacts partagés"
description: "Publier des valeurs typées avec intégrité et filiation."
---

Les artefacts stockent les contenus indépendamment du résultat d’une tâche en mémoire. Transmettez de petites références entre tâches ou processus et lisez le contenu via son contrat versionné.

```ts
import {
  defineJsonArtifact,
  createArtifactStore,
  createLocalTransport,
  publishArtifact,
  readStoredArtifact,
} from "@elie-laloum/outpost";

const report = defineJsonArtifact({
  name: "review-count",
  version: "1",
  schema(value) {
    if (typeof value !== "number" || !Number.isFinite(value))
      throw new Error("Expected a finite count");
    return value;
  },
});
const store = createArtifactStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
const reference = await publishArtifact(store, report, 3, {
  producer: { executionId: "review-42", taskKey: "report", attempt: 1 },
});
console.log(await readStoredArtifact(store, report, reference));
```

<!-- check:run -->

## Choisir un contrat

`defineJsonArtifact()` valide le JSON sans perte à l’encodage et au décodage. `defineBinaryArtifact()` stocke des copies de tableaux d’octets. Un nom et une version identifient le format ; changer le contrat de données doit faire évoluer sa version.

`publishArtifact()` enregistre une empreinte, une taille en octets, un producteur et éventuellement des références parentes ordonnées. La publication est immuable. `readStoredArtifact()` vérifie l’intégrité et décode selon le contrat attendu.

## Utiliser les artefacts dans un workflow

`defineArtifactTask()` publie la sortie d’une tâche et `readArtifact()` consomme une dépendance d’artefact déclarée. Un checkpoint peut stocker cette référence plutôt qu’un gros rapport.

Les empreintes et la filiation détectent les incohérences ; elles n’authentifient pas le producteur. Utilisez un stockage privé et authentifiez le processus autorisé à publier.

API : [defineJsonArtifact](../../reference/definejsonartifact/) · [defineBinaryArtifact](../../reference/definebinaryartifact/) · [publishArtifact](../../reference/publishartifact/) · [readStoredArtifact](../../reference/readstoredartifact/) · [defineArtifactTask](../../reference/defineartifacttask/).
