---
title: "S3 et R2"
description: "Conservez checkpoints, artefacts, journaux et conversations dans un bucket S3 ou Cloudflare R2, pour les reprendre ou les lire depuis n’importe quelle machine."
---

## Créer le transport

Installez le SDK AWS, une dépendance optionnelle utilisée uniquement par ce transport.

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

| Option       | Défaut           | Rôle                                                                                                          |
| ------------ | ---------------- | ------------------------------------------------------------------------------------------------------------- |
| `client`     | Obligatoire      | Votre `S3Client`, avec région, identifiants et endpoint.                                                      |
| `bucket`     | Obligatoire      | Un bucket privé existant.                                                                                     |
| `prefix`     | Racine du bucket | Préfixe des clés d’Outpost. Laissez les objets étrangers en dehors.                                           |
| `deleteMode` | `"conditional"`  | `"conditional"` supprime par DELETE conditionnel ; `"tombstone"` est destiné à [R2](#utiliser-cloudflare-r2). |

## Préparer le bucket

Créez le bucket au préalable : Outpost ne le crée pas. L’endpoint doit prendre en charge ces opérations, pas seulement l’envoi et le téléchargement.

<!-- features -->

- **PUT conditionnel** : `If-None-Match: *` pour créer une clé, `If-Match` pour la remplacer.
- **DELETE conditionnel** : `If-Match` à la suppression, dans le mode par défaut `"conditional"`.
- **Listing paginé** : `ListObjectsV2` avec jetons de continuation.

## Le passer aux stores

Un seul transport sert tous les stores. Passez-le là où chaque type d’objet doit être conservé.

```ts
import { S3Client } from "@aws-sdk/client-s3";
import {
  createArtifactStore,
  createWorkflowCheckpointStore,
  dispatch,
} from "@elie-laloum/outpost";
import { createS3Transport } from "@elie-laloum/outpost/transports/s3";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const transporter = createS3Transport({
  client: new S3Client({ region: "eu-west-1" }),
  bucket: "my-private-outpost",
  prefix: "outpost/",
});
export const checkpoints = createWorkflowCheckpointStore({ transporter });
export const artifacts = createArtifactStore({ transporter });

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
  - `createWorkflowCheckpointStore()`
- [Artefacts](../artifacts/) : Partagez les sorties des tâches par référence.
  - `createArtifactStore()`
- [Journaux](../journals/) : Conservez le journal du dispatch.
  - `logging.transporter`
- [Conversations](../conversations/) : Archivez les captures pour les reprendre n’importe où.
  - `createTransportConversations()`
- [Archives de récupération](../recovery/) : Sauvegardez les changements distants avant de les appliquer.
  - `recoveryTransport`
- [Activité des sandboxes](../retention/) : Enregistrez les sandboxes en cours d’utilisation.
  - `activityTransport`

## Garder les identifiants sur l’hôte

Le `S3Client` s’exécute dans votre processus Node.js. Ses identifiants n’atteignent jamais la sandbox ni l’agent. Configurez-les comme pour tout client du SDK AWS, et fermez le client seulement une fois que tous les stores qui l’utilisent ont terminé : Outpost ne le ferme jamais.

## Utiliser Cloudflare R2

R2 accepte un DELETE dont le `If-Match` est périmé : un DELETE conditionnel ne peut donc pas arrêter un écrivain concurrent. Choisissez `deleteMode: "tombstone"`.

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
Tous les écrivains d’un même préfixe doivent utiliser le même `deleteMode` : arrêtez-les tous avant d’en changer. N’expirez ni ne purgez jamais les marqueurs tant qu’un écrivain peut tourner : une purge peut effacer une recréation concurrente.
:::

## Limites

- **Exclusion, pas identité** : Les révisions rejettent les écrivains périmés ; elles n’authentifient pas l’auteur d’une écriture.
- **Pas d’instantané** : Un listing montre les objets actuels, pas une vue cohérente du préfixe.
- **Fichiers locaux maintenus** : Les worktrees Git, la préparation de l’exécution et les conversations natives exigent toujours un système de fichiers local ([Où vivent les données](../storage/)).

API : [createS3Transport](../../reference/creates3transport/) · [S3TransportOptions](../../reference/s3transportoptions/) · [Transport](../../reference/transport/).
