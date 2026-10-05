---
title: "Stocker les données dans S3 ou R2"
description: "Connectez un stockage objet pour partager artefacts, checkpoints et journaux entre machines."
---

## Créer le transport

Installez le SDK AWS à côté d’Outpost pour utiliser un stockage objet compatible S3. Cette dépendance est facultative et se charge depuis le point d’entrée du transport S3.

```sh
npm install @aws-sdk/client-s3
```

```ts
import { S3Client } from "@aws-sdk/client-s3";
import { createWorkflowCheckpointStore } from "@elie-laloum/outpost";
import { createS3Transport } from "@elie-laloum/outpost/transports/s3";

const transporter = createS3Transport({
  client: new S3Client({ region: "eu-west-1" }),
  bucket: "my-private-outpost",
  prefix: "outpost/",
});
const checkpoints = createWorkflowCheckpointStore({ transporter });
```

`transporter` remplace `createLocalTransport()` partout où un [transport](../storage/) est accepté. Chaque objet est rangé sous `outpost/` dans le bucket.

Référence API : [S3TransportOptions](../../reference/s3transportoptions/).

## Préparer le bucket

Créez le bucket au préalable : Outpost ne le crée pas. Le point d’accès doit prendre en charge ces opérations, pas seulement l’envoi et le téléchargement.

<!-- features -->

- **PUT conditionnel** : `If-None-Match: *` pour créer une clé, `If-Match` pour la remplacer.
- **DELETE conditionnel** : `If-Match` à la suppression, dans le mode par défaut `"conditional"`.
- **Listing paginé** : `ListObjectsV2` avec jetons de continuation.

## Le passer aux stockages

Un seul transport sert tous les stockages. Passez-le là où chaque type d’objet doit être conservé.

<!-- tabs -->

```ts title="remote-stores.ts"
import { createS3Transport } from "@elie-laloum/outpost/transports/s3";
import { S3Client } from "@aws-sdk/client-s3";
import {
  createWorkflowCheckpointStore,
  createArtifactStore,
} from "@elie-laloum/outpost";

export const transporter = createS3Transport({
  client: new S3Client({ region: "eu-west-1" }),
  bucket: "my-private-outpost",
  prefix: "outpost/",
});
export const checkpoints = createWorkflowCheckpointStore({ transporter });
export const artifacts = createArtifactStore({ transporter });
```

```ts title="save.ts"
import { dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";
import { transporter } from "./remote-stores.ts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Update the changelog for the last release." },
  logging: { transporter },
  activityTransport: transporter,
  recoveryTransport: transporter,
});
```

<!-- features -->

- [Checkpoints](../durable-runs/) : Reprenez une exécution de workflow depuis une autre machine.
- [Artefacts](../artifacts/) : Partagez les sorties des tâches par référence.
- [Journaux](../journals/) : Conservez le journal du dispatch.
- [Conversations](../conversations/) : Archivez les captures pour les reprendre n’importe où.
- [Archives de récupération](../recovery/) : Sauvegardez les changements distants avant de les appliquer.
- [Activité des sandboxes](../retention/) : Enregistrez les sandboxes en cours d’utilisation.

## Garder les identifiants sur l’hôte

Le `S3Client` s’exécute dans votre processus Node.js. Ses identifiants n’atteignent jamais la sandbox ni l’agent. Configurez-les comme pour tout client du SDK AWS, et fermez le client seulement une fois que tous les stockages qui l’utilisent ont terminé : Outpost ne le ferme jamais.

## Utiliser Cloudflare R2

R2 accepte un DELETE dont le `If-Match` est périmé : un DELETE conditionnel ne peut donc pas arrêter un processus d’écriture concurrent. Choisissez `deleteMode: "tombstone"`.

```ts
import { S3Client } from "@aws-sdk/client-s3";
import { createS3Transport } from "@elie-laloum/outpost/transports/s3";

const transporter = createS3Transport({
  client: new S3Client({
    region: "auto",
    endpoint: "https://<account-id>.r2.cloudflarestorage.com",
  }),
  bucket: "my-private-outpost",
  prefix: "outpost/",
  deleteMode: "tombstone",
});
```

Supprimer une clé écrit un marqueur de suppression par PUT conditionnel. Les lectures et les listings masquent les marqueurs, et recréer la clé remplace son marqueur, toujours sous condition.

Chaque marqueur reste dans le bucket comme un objet facturé de 1 Kio. Créer une clé ajoute une requête HEAD, et lister ajoute une requête HEAD par objet.

:::caution
Tous les processus d’écriture d’un même préfixe doivent utiliser le même `deleteMode` : arrêtez-les tous avant d’en changer. N’expirez ni ne purgez jamais les marqueurs tant qu’un processus d’écriture peut tourner : une purge peut effacer une recréation concurrente.
:::

## Limites

- **Exclusion, pas identité** : Les révisions rejettent les processus d’écriture périmés ; elles n’authentifient pas l’auteur d’une écriture.
- **Pas d’instantané** : Un listing montre les objets actuels, pas une vue cohérente du préfixe.
- **Fichiers locaux maintenus** : Les worktrees Git, la préparation de l’exécution et les conversations natives exigent toujours un système de fichiers local ([Où vivent les données](../storage/)).

API : [createS3Transport](../../reference/creates3transport/) · [S3TransportOptions](../../reference/s3transportoptions/) · [Transport](../../reference/transport/).
