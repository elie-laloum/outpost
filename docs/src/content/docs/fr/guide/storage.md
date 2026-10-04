---
title: "Où vivent les données"
description: "Ce qu’Outpost enregistre entre deux exécutions, quel store l’écrit, et comment le garder sur disque ou le déplacer vers un stockage partagé."
---

## Ce qu’Outpost enregistre

Chaque objet durable passe par un **transport** : une petite interface clé-valeur pour des octets, avec écritures conditionnelles. Les stores donnent leur sens aux objets ; le transport décide où vont les octets.

| Objet                                        | Écrit via                                              | Sans transport fourni |
| -------------------------------------------- | ------------------------------------------------------ | --------------------- |
| [Checkpoints](../durable-runs/)              | `createWorkflowCheckpointStore({ transporter })`       | Obligatoire           |
| [Artefacts](../artifacts/)                   | `createArtifactStore({ transporter })`                 | Obligatoire           |
| [Cache de résultats](../task-cache/)         | `createTaskCacheStore({ transporter })`                | Obligatoire           |
| [Spéculation durable](../speculation/)       | `durability.transporter` de `speculate()`              | Obligatoire           |
| [Journaux](../journals/)                     | `logging.transporter` d’un dispatch ou d’une sandbox   | `.outpost/storage`    |
| Activité des ressources                      | `activityTransport` d’un dispatch ou d’une sandbox     | `.outpost/storage`    |
| Réservations de stockage                     | `transporter` de `reserveRecoveryStorage()`            | `.outpost/storage`    |
| [Conversations archivées](../conversations/) | `createTransportConversations(store, { transporter })` | Non archivées         |
| [Archives de récupération](../recovery/)     | `recoveryTransport` d’un dispatch ou d’une sandbox     | Non archivées         |

## Tout garder sur disque

`createLocalTransport({ directory })` stocke les objets dans un dossier local privé. Passez-lui le `.outpost/storage` du dépôt pour ranger vos stores à côté des journaux et de l’activité qu’Outpost y écrit par défaut.

```ts
import {
  createArtifactStore,
  createLocalTransport,
  createTaskCacheStore,
  createWorkflowCheckpointStore,
} from "@elie-laloum/outpost";

const transporter = createLocalTransport({ directory: ".outpost/storage" });
const checkpoints = createWorkflowCheckpointStore({ transporter });
const artifacts = createArtifactStore({ transporter });
const cache = createTaskCacheStore({ transporter });
```

Rien n’est écrit tant qu’un store n’enregistre pas d’objet. Chaque clé devient alors un fichier, écrit de façon atomique et lisible par son seul propriétaire.

<!-- files -->

- `.outpost/storage/`
  - `objects/`: Un fichier `.object` par clé, regroupé par préfixe.
    - `checkpoints/`: Exécutions de workflow, une par `runId`.
    - `artifacts/`: Octets des artefacts, adressés par empreinte.
    - `task-cache/`: Résultats de tâches en cache.
    - `logs/`: Journaux.
    - `resources/`: Activité des sandboxes ouvertes.
    - `reservations/`: Registre des réservations de stockage.
    - `speculations/`: État de la spéculation durable.
    - `conversations/`: Conversations archivées.
    - `recovery/`: Transferts de récupération archivés.
  - `.outpost/locks/`: Verrous qui sérialisent les écrivains de cette machine.

Le reste du dossier `.outpost` est décrit dans la page [Fonctionnement](../how-it-works/).

## Partager un transport

Passez le même transport aux stores et aux options du dispatch : tous les objets d’une exécution arrivent au même endroit.

```ts
import {
  createLocalTransport,
  createWorkflowCheckpointStore,
  dispatch,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const transporter = createLocalTransport({ directory: "/srv/outpost" });
const checkpoints = createWorkflowCheckpointStore({ transporter });

await dispatch({
  agent: coder,
  sandboxProvider,
  repository,
  brief: { text: "Update the changelog for the last release." },
  logging: { transporter },
  activityTransport: transporter,
  recoveryTransport: transporter,
});
```

Utilisez un dossier ou un préfixe distinct par projet, pour que les règles de rétention et d’accès s’appliquent à un seul ensemble d’objets.

## Sortir le stockage de la machine

Un transport distant conserve les mêmes contrats de store. [S3 et R2](../object-storage/) détaille la configuration ; seule la ligne `transporter` change.

```ts
import { S3Client } from "@aws-sdk/client-s3";
import { createWorkflowCheckpointStore } from "@elie-laloum/outpost";
import { createS3Transport } from "@elie-laloum/outpost/transports/s3";

const client = new S3Client({ region: "eu-west-1" });
const transporter = createS3Transport({
  client,
  bucket: "my-private-outpost",
  prefix: "outpost/",
});
const checkpoints = createWorkflowCheckpointStore({ transporter });

// ... exécutez vos workflows, puis :
client.destroy();
```

Votre application possède le client. Fermer une sandbox ou terminer un workflow ne le ferme jamais : détruisez-le une fois terminées toutes les opérations qui l’utilisent.

## Ce qui reste sur le disque local

Un transport distant déplace les objets stockés, pas le runtime. Ces éléments exigent toujours le système de fichiers de l’hôte.

<!-- features -->

- [Worktrees et verrous](../repository-and-branch/): Les branches sont extraites sous `.outpost/workspaces` et verrouillées sous `.outpost/locks`.
  - Git
- [Conversations natives](../conversations/): L’agent lit son propre stockage ; une copie archivée est restaurée sur disque avant la reprise.
  - Claude Code
  - Codex
  - `.outpost/conversations`
- [Transferts de récupération](../recovery/): Les sauvegardes d’une synchronisation échouée sont écrites localement avant toute archive.
  - `.outpost/recovery`

## Gérer une écriture périmée

Chaque écriture indique la révision qu’elle attend : `ifRevision: null` crée, la `revision` observée remplace ou supprime. Si un autre écrivain a modifié l’objet entre-temps, l’appel lève `TransportConflict` et rien n’est écrit.

```ts
import { createLocalTransport, TransportConflict } from "@elie-laloum/outpost";

const transporter = createLocalTransport({ directory: ".outpost/storage" });
const bytes = (text: string) => new TextEncoder().encode(text);

const first = await transporter.write("notes/today", bytes("v1"), {
  ifRevision: null,
});
await transporter.write("notes/today", bytes("v2"), {
  ifRevision: first.revision,
});
try {
  await transporter.write("notes/today", bytes("v3"), {
    ifRevision: first.revision,
  });
} catch (error) {
  if (error instanceof TransportConflict) console.log("stale:", error.key);
}
```

<!-- check:run -->

Le script affiche `stale: notes/today`. Les stores appliquent la même barrière : un workflow qui a perdu la propriété de son checkpoint échoue à sa prochaine écriture au lieu d’écraser une exécution plus récente. Relisez l’objet avant de décider quoi faire.

## Limites

- Le transport local coordonne les processus d’une seule machine ; il n’assure pas de propriété distribuée sur NFS ou un autre montage partagé.
- Une liste renvoie les objets actuels un par un, pas un instantané cohérent du préfixe.
- Les révisions écartent les écrivains périmés ; elles n’authentifient pas l’auteur d’un objet.
- Les clés sont des segments séparés par `/`, faits de lettres, chiffres, `.`, `_` et `-`, sans point initial, de 512 caractères au plus.

API : [Transport](../../reference/transport/) · [createLocalTransport](../../reference/createlocaltransport/) · [TransportConflict](../../reference/transportconflict/) · [createWorkflowCheckpointStore](../../reference/createworkflowcheckpointstore/) · [createArtifactStore](../../reference/createartifactstore/) · [createTaskCacheStore](../../reference/createtaskcachestore/) · [createTransportConversations](../../reference/createtransportconversations/) · [SandboxOptions](../../reference/sandboxoptions/) · [createS3Transport](../../reference/creates3transport/).
