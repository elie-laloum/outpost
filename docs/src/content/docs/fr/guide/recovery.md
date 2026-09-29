---
title: "Récupérer du travail"
description: "Retrouver le travail conservé par Outpost après un échec, le restaurer dans un nouveau dossier et le ramener dans votre dépôt."
---

## Ce qu’Outpost conserve

Un échec ne supprime jamais le travail de l’agent. Outpost le conserve dans le dossier `.outpost` du dépôt cible ou dans votre transport.

| Quoi                    | Où                                                    | Conservé quand                                                                                                                                        |
| ----------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Worktree                | `.outpost/workspaces/`                                | L’exécution a échoué, l’intégration a créé un conflit, ou le worktree est modifié, détaché ou contient des fichiers ignorés (`node_modules`, copies). |
| Transfert distant       | `.outpost/recovery/`                                  | Les changements d’une [sandbox cloud](../cloud-sandboxes/) n’ont pas pu être appliqués à votre checkout.                                              |
| Conversation            | `.outpost/conversations/` ou le stockage de l’agent   | Après chaque tour et en cas d’échec. Voir [Conversations](../conversations/).                                                                         |
| Progression du workflow | `.outpost/storage/` ou votre [transport](../storage/) | Après chaque tâche terminée. Voir [Exécutions durables](../durable-runs/).                                                                            |

Un worktree conservé est un worktree Git ordinaire sur sa branche : ouvrez-le, committez ce que vous gardez et fusionnez la branche.

## Lire l’erreur

[`recoveryDetails()`](../../reference/recoverydetails/) renvoie ce qu’Outpost a attaché à l’erreur : `branch`, `directory`, `commits`, `transcript` et `logReference` lorsqu’ils existent.

```ts
import { dispatch, OutpostError, recoveryDetails } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

try {
  const result = await dispatch({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/upgrade-deps" },
    brief: { text: "Upgrade the test dependencies and commit the change." },
  });
  if (result.retainedDirectory) console.log("Kept:", result.retainedDirectory);
} catch (error) {
  console.error(recoveryDetails(error));
  if (error instanceof OutpostError) console.error(error.code, error.details);
  throw error;
}
```

Deux échecs indiquent aussi leur emplacement dans `error.details`. [Erreurs](../error-handling/) liste tous les codes.

| Échec                                                | Code        | Emplacement                                   |
| ---------------------------------------------------- | ----------- | --------------------------------------------- |
| Les changements distants n’ont pas pu être appliqués | `workspace` | `details.recovery` : le dossier du transfert. |
| L’intégration automatique a échoué                   | `conflict`  | `details.directory` : le worktree conservé.   |

Si l’exécution elle-même a aussi échoué, l’erreur de synchronisation arrive dans une `AggregateError`.

## Restaurer un transfert distant

Un transfert contient deux versions : `previous`, votre checkout avant les changements de la sandbox, et `incoming`, les changements de la sandbox. Restaurez l’une d’elles dans un nouveau dossier, jamais par-dessus votre checkout.

<!-- flow -->

1. **Observer**: Rien n’est modifié.
   - **Inspecter**: Lister les workspaces, les verrous et l’activité enregistrée des sandboxes.
     - `recovery inspect`
   - **Vérifier**: Contrôler les fichiers, les empreintes et l’historique Git du transfert.
     - `recovery verify`
2. **Restaurer**: Reconstruire une version dans un nouveau dossier.
   - **Planifier**: Prévisualiser le commit et les fichiers à restaurer.
     - `recovery restore`
   - **Appliquer**: Créer un checkout détaché à partir du plan.
     - `--apply`
3. **Intégrer**: Vous décidez de ce qui revient.
   - **Comparer**: Examiner le checkout restauré au regard de votre dépôt.
     - git
   - **Rapatrier**: Committer, cherry-picker ou fusionner ce que vous gardez.
     - git

### Inspecter

```sh
npx outpost recovery inspect --repository /projects/app --git --locks --resources
```

| Option                 | Ajoute à l’inventaire                                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `--git`                | Branche, état propre ou modifié, `HEAD` détaché et indicateur `locked` de Git pour chaque worktree.                                      |
| `--locks`              | Les fichiers de verrou, le PID enregistré dans chacun et son statut de possession ; un PID actif ne prouve pas à lui seul la possession. |
| `--resources`          | L’activité enregistrée des sandboxes et sa propriété.                                                                                    |
| `--max-entries NUMBER` | Une limite d’entrées parcourues ; 100 000 par défaut.                                                                                    |
| `--json`               | Le rapport complet en JSON.                                                                                                              |

La commande se termine avec le statut 1 quand l’inventaire est incomplet.

### Vérifier

```sh
npx outpost recovery verify --directory "$TRANSFER" --checksums --restorability --repository /projects/app
```

`$TRANSFER` est le dossier indiqué par `details.recovery`. `--checksums` compare chaque fichier au manifeste du transfert ; `--max-bytes` limite les octets hachés. `--restorability` reconstruit les commits et les patches dans un clone temporaire de `--repository`. La commande se termine avec le statut 1 quand un contrôle échoue.

### Restaurer

```sh
npx outpost recovery restore --directory "$TRANSFER" --repository /projects/app \
  --destination /projects/app-recovered --side incoming
```

La commande affiche le plan. Relancez-la avec `--apply` pour créer le checkout : un clone de votre dépôt détaché sur le commit restauré, avec les patches et fichiers de la version choisie, sans remote `origin`.

| `--side`   | Restaure                                                                              | Index        |
| ---------- | ------------------------------------------------------------------------------------- | ------------ |
| `incoming` | Les commits, les modifications non committées et les nouveaux fichiers de la sandbox. | Non restauré |
| `previous` | Votre checkout tel qu’il était avant le transfert.                                    | Restauré     |

La destination ne doit pas exister et doit se trouver hors du dépôt, de ses métadonnées Git et du transfert. Le transfert reste en place.

### Comparer et intégrer

```sh
git -C /projects/app-recovered status
git -C /projects/app-recovered switch -c recovered
git -C /projects/app-recovered add -A
git -C /projects/app-recovered commit -m "Recover sandbox changes"
git -C /projects/app fetch /projects/app-recovered recovered:outpost/recovered
```

Le travail est désormais la branche `outpost/recovered` de votre dépôt. Relisez-la et fusionnez-la comme n’importe quelle autre branche.

## Récupérer depuis le code

Chaque commande a sa fonction. `planRecoveryRestore()` renvoie le plan ; `restoreRecoveryTransfer()` vérifie que rien n’a changé depuis, puis l’applique.

```ts
import {
  inspectRecovery,
  planRecoveryRestore,
  restoreRecoveryTransfer,
  verifyRecoveryTransfer,
} from "@elie-laloum/outpost";

const repository = "/projects/app";
const transfer = process.env.TRANSFER!;

const inventory = await inspectRecovery({ repository, git: true, locks: true });
console.log(inventory.git?.workspaces);

const verification = await verifyRecoveryTransfer(transfer, {
  checksums: true,
  restorability: true,
  repository,
});
if (!verification.complete) throw new Error("The transfer failed verification");

const plan = await planRecoveryRestore({
  directory: transfer,
  repository,
  destination: "/projects/app-recovered",
  side: "incoming",
});
const restored = await restoreRecoveryTransfer(plan);
console.log(restored.directory, restored.commit);
```

`inspectRecovery({ transporter })` liste les objets d’un [transport](../storage/) au lieu d’un dépôt local.

## Archiver un transfert à distance

`archiveRecovery()` vérifie un transfert et le téléverse via un transport. `materializeRecoveryArchive()` le télécharge sur n’importe quelle machine et revérifie ses empreintes.

```ts
import {
  archiveRecovery,
  createLocalTransport,
  materializeRecoveryArchive,
} from "@elie-laloum/outpost";

const transporter = createLocalTransport({ directory: "/mnt/shared/outpost" });

const reference = await archiveRecovery({
  transporter,
  directory: process.env.TRANSFER!,
});

const staging = await materializeRecoveryArchive({
  transporter,
  reference,
  destination: "/projects/transfer-copy",
});
console.log(staging);
```

Conservez `reference` (une clé et une révision) pour retrouver l’archive. Passez `staging` comme `--directory` à `outpost recovery restore`, avec un clone du dépôt source.

## Libérer une exécution ou une course arrêtée

Un workflow ou une course de candidats interrompus gardent la propriété de leur checkpoint. Après avoir arrêté l’ancien processus, libérez-la avec `recoverWorkflowCheckpoint()` ([Exécutions durables](../durable-runs/)) ou `recoverSpeculation()` ([Candidats concurrents](../speculation/)).

## Nettoyer ensuite

:::caution
Ne supprimez jamais `.outpost` ni ses dossiers à la main : ils peuvent contenir l’unique copie du travail de l’agent. Retirez ce dont vous n’avez plus besoin avec [Rétention et nettoyage](../retention/).
:::

## Limites

- Les empreintes détectent une altération par rapport à un manifeste non signé ; elles ne prouvent pas qui a produit le transfert.
- La restaurabilité couvre les commits, le bundle et les patches, pas les sous-modules ni les dépendances externes.
- Un transfert n’est restaurable qu’une fois la sauvegarde de l’hôte effectuée : une synchronisation échouée pendant le téléchargement ou la validation ne laisse aucun `state.json`, et le plan de restauration la rejette.
- Un PID de verrou ou une activité enregistrée est une observation. Elle ne prouve pas qu’un processus distant s’est arrêté.
- Un worktree signalé `clean` peut encore contenir des fichiers ignorés, comme des copies ou `node_modules`.
- Une archive contient les fichiers de récupération, pas le dépôt : la restauration exige toujours le dépôt source.

API : [recoveryDetails](../../reference/recoverydetails/) · [inspectRecovery](../../reference/inspectrecovery/) · [verifyRecoveryTransfer](../../reference/verifyrecoverytransfer/) · [planRecoveryRestore](../../reference/planrecoveryrestore/) · [restoreRecoveryTransfer](../../reference/restorerecoverytransfer/) · [archiveRecovery](../../reference/archiverecovery/) · [materializeRecoveryArchive](../../reference/materializerecoveryarchive/).
