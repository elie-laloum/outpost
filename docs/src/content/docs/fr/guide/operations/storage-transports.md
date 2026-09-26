---
title: Stocker les données des workflows localement ou sur S3
description: Configurer les transports objet des artefacts, checkpoints, journaux, conversations et états opérationnels.
sidebar:
  order: 7
---

Utilisez un `Transport` pour choisir où Outpost lit et écrit ses données persistantes. Les stores conservent leurs règles métier ; les adaptateurs local et S3 fournissent des objets binaires versionnés et des mutations conditionnelles. Disponible depuis Outpost 4.2.0 ; les configurations par dossier gardent leur comportement.

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

Enregistrez **example.mts** dans le dossier préparé.

```ts file=example.mts
import assert from "node:assert/strict";
import {
  localTransport,
  artifactStore,
  artifact,
  publishArtifact,
  readStoredArtifact,
  workflowCheckpointStore,
  task,
  workflow,
  inspectRecovery,
} from "@elie-laloum/outpost";

const transporter = localTransport({ directory: "./state" });
const store = artifactStore({ transporter });
const contract = artifact.binary({ name: "report", version: "1" });
const reference = await publishArtifact(
  store,
  contract,
  Uint8Array.of(0, 255),
  {
    producer: { executionId: "demo", taskKey: "publish", attempt: 1 },
  },
);
let calls = 0;
const read = task({
  key: "read",
  async perform() {
    calls++;
    return [...(await readStoredArtifact(store, contract, reference))];
  },
});
const graph = workflow("transport-demo", [read]);
const checkpoint = {
  store: workflowCheckpointStore({ transporter }),
  runId: "demo-1",
  version: "1",
};
(await graph.start({ checkpoint })).unwrap();
const before = calls;
const resumed = await graph.start({ checkpoint });
resumed.unwrap();
assert.deepEqual(resumed.value(read), [0, 255]);
assert.equal(calls, before);
const inventory = await inspectRecovery({ transporter });
console.log(
  resumed.value(read),
  "replayed:",
  calls - before,
  "bytes:",
  inventory.usage.bytes,
);
```

```sh
node example.mts
```

## Comprendre le résultat

La sortie contient `[0, 255]` et `replayed: 0`. L’artefact binaire et le checkpoint restent sous `state/` ; une autre invocation rouvre le workflow sans rejouer sa tâche terminée. L’inventaire compte les octets utiles, hors enveloppes du transport et surcoûts du backend.

## Choisir S3

Installez le SDK optionnel avec `npm install @aws-sdk/client-s3`. Enregistrez **transport-s3.mts**, puis remplacez la fabrique locale dans **example.mts** par `import { transporter } from "./transport-s3.mts";`.

```ts file=transport-s3.mts
import { S3Client } from "@aws-sdk/client-s3";
import { s3Transport } from "@elie-laloum/outpost/transports/s3";

export const client = new S3Client({ region: "eu-west-3" });
export const transporter = s3Transport({
  client,
  bucket: "your-existing-private-bucket",
  prefix: "project-a",
});
```

Renseignez le bucket existant et configurez les identifiants du client sur le coordinateur. Relancez `node example.mts` avec ce transport. Le client vous appartient : appelez `client.destroy()` seulement après la fin de tous les stores et opérations. Les identifiants du stockage ne sont pas transmis aux agents.

Le bucket ou endpoint compatible doit prendre en charge PUT et DELETE conditionnels, les lectures complètes et le listing paginé. Un nom d’API compatible ne suffit pas à établir ces garanties. Réservez un préfixe dédié : les enveloppes Outpost ne sont pas interchangeables avec des fichiers quelconques du bucket. Voir les [requêtes conditionnelles AWS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-requests.html).

## Configurer chaque responsabilité

| Responsabilité           | Configuration                                                                                                                                  | Durée de vie et comportement                                                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Artefacts                | `artifactStore({ transporter })` ou `fileArtifactStore({ transporter })`                                                                       | Publication immuable et lectures bornées ; conservés tant que les références sont utiles.                                                                    |
| Checkpoints              | `workflowCheckpointStore({ transporter })` ou `fileWorkflowCheckpointStore({ transporter })`                                                   | Propriété exclusive de l’exécution et écritures conditionnelles.                                                                                             |
| Journaux                 | `logging: { transporter, verbose: true }`                                                                                                      | Chaque dispatch crée son index et sa chaîne d’événements immuables. Lire `result.logReference` avec `readJournal({ transporter, reference })`.               |
| Conversations            | `storage: transportConversations("claude", { transporter, namespace: "project-a" })` sur l’adaptateur d’agent                                  | Capture Claude/Codex, transcripts enfants, restauration et fork. Garder le même espace de noms entre chemins de checkout et machines.                        |
| Archives de récupération | `recoveryTransport: transporter` sur la sandbox                                                                                                | Publie une archive vérifiée avant application des modifications téléchargées. La préparation locale demeure. Les archives survivent à une fermeture réussie. |
| Réservations             | `storageQuota: { transporter, maxBytes, reserveBytes }` sur le workspace, ou `reserveRecoveryStorage({ transporter, maxBytes, reserveBytes })` | Registre partagé d’admission conditionnelle ; libération explicite.                                                                                          |
| Activité des ressources  | `activityTransport: transporter` sur la sandbox                                                                                                | Enregistre les transitions d’opérations à distance ; la fermeture normale supprime l’enregistrement.                                                         |
| Inspection et quotas     | `inspectRecovery({ transporter, resources: true })`, `assertRecoveryQuota({ transporter, maxBytes })`                                          | Observe les contenus et les activités. La propriété d’un PID distant reste non vérifiée.                                                                     |
| Rétention                | `planRecoveryRetention({ transporter, policy })`, puis `pruneRecoveryRetention(plan, { transporter })`                                         | Seuls les journaux fermés explicitement sélectionnés sont éligibles. Composition du groupe et révisions sont revalidées.                                     |

Un adaptateur peut être composé ainsi : `{ ...agent({ harness: claudeHarness() }), storage: transportConversations("claude", { transporter, namespace: "project-a" }) }`. L’authentification native reste indépendante du stockage des transcripts. Un harness personnalisé stocke ses transcriptions de la même façon avec `harness({ conversations: transportConversations("harness", { transporter, namespace: "project-a" }), ... })`.

## Propriété et écritures interrompues

La propriété d’un checkpoint n’expire pas automatiquement. Après un crash, arrêtez d’abord l’ancien exécuteur avec vos propres contrôles de processus ou d’infrastructure. Sa clé est `checkpoints/<SHA-256 du runId>.json` ; inspectez l’objet pour obtenir sa révision, puis appelez `recoverWorkflowCheckpoint({ transporter, runId, revision })`. Cette opération préserve les valeurs et refuse un changement concurrent. La reprise des tâches incomplètes exige toujours `resume: "retry-incomplete"` ; leurs effets externes peuvent se répéter.

Les réservations persistent également jusqu’à libération. Leur `release()` reste utilisable après annulation. Une réservation abandonnée doit être réconciliée explicitement dans le registre versionné `reservations/ledger` après arrêt de son propriétaire ; ne jamais le déduire d’un PID distant. L’admission compte les contenus observés et les réservations en cours : elle peut donc compter prudemment deux fois des octets réservés déjà écrits. Elle coordonne les appelants coopérants, pas les écrivains arbitraires ni un quota physique du bucket.

Une écriture interrompue avant acquittement peut avoir réussi à distance. Relisez sa version avant une nouvelle tentative. Ne remplacez pas les écritures conditionnelles par des écrasements inconditionnels. La publication d’un événement valide son segment avant de faire avancer l’index ; un crash laisse un préfixe validé lisible et peut conserver un segment non référencé. La fermeture attend les écritures en cours et signale leurs échecs. La soumission des événements reste asynchrone.

## Restaurer et conserver les données

Appelez `archiveRecovery({ transporter, directory })` pour archiver explicitement un transfert conservé. L’opération vérifie le snapshot, conserve les blocs avec SHA-256 et publie le manifeste en dernier. Appelez `materializeRecoveryArchive({ transporter, reference, destination })` pour le recréer dans un nouveau dossier local. Utilisez ensuite la [restauration de récupération](../recovery-restoration/) avec le dépôt Git source. Ces archives préservent les données de récupération ; elles ne remplacent pas le dépôt source par une sauvegarde Git autonome. Les matérialisations partielles et sources originales sont conservées en cas d’échec.

Les archives automatiques sont identifiables par leurs objets `recovery/<id>/manifest`. Les transferts locaux conservés contiennent aussi `archive-reference.json` après publication. Des envois interrompus peuvent laisser des blocs non référencés ; la rétention automatique protège les données de récupération.

Les conversations renvoient à la fois une `reference` durable et un vrai `file` local. Les copies capturées ou matérialisées restent sous `.outpost/recovery/conversations` pour que les chemins renvoyés restent lisibles. `transcriptReference` est aussi exposé dans les tours et résultats de dispatch. Ces copies locales nécessitent une rétention indépendante après la fin des lectures.

La rétention du transport protège artefacts, checkpoints, conversations, archives, réservations, ressources et journaux incomplets. Le périmètre pris en charge est `closed-logs` ; nettoyage Git/workspaces et inspection des verrous de processus locaux sont refusés en mode transport. Une suppression partielle peut laisser des segments orphelins protégés et est signalée comme conservée. Listings et quotas sont des observations entre plusieurs objets, pas des snapshots transactionnels.

## Dossiers existants et nouveaux adaptateurs

Fournissez exactement un choix parmi `directory` et `transporter` aux fabriques de compatibilité. Un store par dossier garde son format ; sélectionner un transport crée un autre format et ne migre pas automatiquement les anciens checkpoints ou blobs. `logging.file` et `logging.transporter` sont exclusifs. Les journaux distants exposent `logReference` sans placer d’URI S3 dans `log`.

Implémentez [Transport](../../../reference/transport/) pour ajouter un backend : lectures complètes bornées, clés sûres, révisions opaques nouvelles, conditions atomiques de création/mise à jour, suppression conditionnelle et listing paginé. Gardez les règles de propriété dans les stores. Les verrous de l’adaptateur local sont conçus pour un hôte ; un chemin NFS monté ne crée pas de garanties de propriété distribuée.

Worktrees Git, SQLite, homes des sandboxes, dossiers d’exécution et montages utilisent toujours des systèmes de fichiers. Les tests locaux couvrent les contrats objet et le vrai SDK S3 contre un service HTTP simulé ; les campagnes authentifiées AWS/S3 compatible et NFS restent des validations distinctes.
