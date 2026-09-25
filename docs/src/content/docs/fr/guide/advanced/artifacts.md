---
title: "Transmettre un artefact durable entre tâches"
description: "Publiez un contrat validé, puis relisez-le via une dépendance déclarée."
---

Publiez un contrat validé, puis relisez-le via une dépendance déclarée.

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
import { resolve } from "node:path";
import {
  artifact,
  artifactTask,
  fileArtifactStore,
  fileWorkflowCheckpointStore,
  readArtifact,
  task,
  workflow,
} from "@elie-laloum/outpost";

const store = fileArtifactStore({
  directory: resolve(".outpost/artifacts"),
  maxBytes: 1024 * 1024,
});
const api = artifact.json({
  name: "service-api",
  version: "1",
  schema(input: unknown) {
    if (
      !input ||
      typeof input !== "object" ||
      !("endpoint" in input) ||
      typeof input.endpoint !== "string"
    )
      throw new Error("Expected an endpoint string");
    return { endpoint: input.endpoint };
  },
});
const publish = artifactTask({
  key: "publish-api",
  store,
  contract: api,
  produce: () => ({ endpoint: "/users" }),
});
const consume = task({
  key: "consume-api",
  after: [publish],
  async perform(context) {
    const value = await readArtifact(context, publish, api, store);
    return value.endpoint;
  },
});
const result = await workflow("api-contract", [publish, consume]).start({
  checkpoint: {
    store: fileWorkflowCheckpointStore({ directory: resolve(".outpost/runs") }),
    runId: "api-contract-1",
    version: "1",
  },
});
result.unwrap();
if (result.value(consume) !== "/users")
  throw new Error("Unexpected artifact value");
console.log(result.value(consume));
```

```sh
node example.mts
```

## Comprendre le résultat

La sortie est `/users`. La tâche produit une référence JSON tandis que les octets résident dans le store appartenant à l’appelant. La lecture vérifie le contrat et l’intégrité. Empreintes et filiation n’authentifient pas les producteurs. Conservez les objets tant que les résultats sauvegardés les utilisent. Fermer une sandbox ne supprime pas ce store.

[Contrats, options et cas particuliers](../../../reference/behavior/workflows/artifacts/).

Les fichiers persistants éventuels restent dans ce dossier de démonstration.
