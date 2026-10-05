---
title: "Nettoyer les données enregistrées"
description: "Examinez une politique de conservation et supprimez les données admissibles en préservant le travail récupérable."
---

## Prévisualiser une politique

Commencez par examiner une politique de conservation sans l’appliquer. Le rapport indique quelles données d’exécution peuvent être supprimées et lesquelles restent protégées. Appliquez la politique après avoir consulté ce résultat.

```json title="retention.json"
{
  "version": 1,
  "scopes": ["closed-logs"],
  "minAgeMs": 604800000,
  "maxBytes": 1073741824
}
```

```sh
npx outpost recovery prune --policy retention.json --repository /projects/app
```

Sans `--apply`, la commande se contente d’afficher son plan : une ligne par entrée de `.outpost`, puis la taille projetée.

```text
Outpost retention dry run — "/projects/app"
CANDIDATE "logs/5b0e…/index" | ELIGIBLE | 48213 bytes
RETAIN "/projects/app/.outpost/workspaces/fix-tests-3f9c2a61d0b4" | SCOPE_NOT_SELECTED | 18432 bytes
Observed 912004 logical bytes; projected 863791; projected quota within. Branches and recovery artifacts are retained.
```

`--json` affiche `{ dryRun, plan }` à la place. `--repository` vaut par défaut le répertoire courant.

## L’appliquer

Chaque candidat est revérifié juste avant sa suppression. Celui qui a changé depuis le plan est conservé, avec la raison `PLAN_CHANGED`. La sortie ajoute une ligne `REMOVED` par entrée supprimée.

```sh
npx outpost recovery prune --policy retention.json --repository /projects/app --apply
```

La commande se termine avec le statut 1 si l’inventaire est incomplet, si ce qui reste dépasse `maxBytes` ou `maxWorkspaces`, ou si un candidat n’a pas pu être supprimé.

## Écrire la politique

Référence API : [RecoveryRetentionPolicy](../../reference/recoveryretentionpolicy/).

`maxBytes` et `maxWorkspaces` ne rendent jamais d’autres entrées éligibles : ils vous disent si la politique libère assez de place.

## Comprendre pourquoi une entrée reste

Référence API : [RecoveryRetentionEntry](../../reference/recoveryretentionentry/).

## Nettoyer depuis le code

`planRecoveryRetention()` construit le même plan que la prévisualisation. `pruneRecoveryRetention()` l’applique et renvoie ce qu’il a supprimé et conservé.

```ts
import {
  planRecoveryRetention,
  pruneRecoveryRetention,
} from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";

const plan = await planRecoveryRetention({
  repository,
  policy: {
    version: 1,
    scopes: ["clean-workspaces", "closed-logs", "task-cache"],
    minAgeMs: 7 * 24 * 60 * 60 * 1000,
  },
});
console.log(plan.quota, plan.projectedBytes);

const result = await pruneRecoveryRetention(plan);
console.log(result.removed, result.retained);
```

Pour des données conservées dans un [transport](../storage/) distant, passez `transporter` à `planRecoveryRetention()` et `{ transporter }` à `pruneRecoveryRetention()`. Seuls `closed-logs` et `task-cache` s’y appliquent.

## Nettoyer ce que la rétention conserve

<!-- features -->

- **Branches nommées** : Supprimer un worktree conserve sa branche. Effacez celles déjà fusionnées avec `git branch -d outpost/fix-tests`.
- **Worktrees modifiés** : Committez, copiez ou jetez les fichiers après un examen avec [Récupérer du travail](../recovery/). `git -C <worktree> clean -fdX` ne supprime que les fichiers ignorés.
- **Volumes de cache** : Ils survivent aux sandboxes et aux images. Supprimez-les avec le moteur de conteneurs, label `io.outpost.cache=true` ([Préparer l’environnement](../environment-setup/)).

Un worktree redevenu propre est supprimé à la prochaine exécution d’une politique `clean-workspaces`.

## Réserver du stockage entre processus

Une réservation retient des octets dans `.outpost` avant qu’une tâche ne les écrive. Elle est refusée si l’usage actuel, les réservations actives et la nouvelle demande dépassent `maxBytes`.

```ts
import { reserveRecoveryStorage } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";

await using reservation = await reserveRecoveryStorage({
  repository,
  maxBytes: 10 * 1024 ** 3,
  reserveBytes: 2 * 1024 ** 3,
});
// Écrivez jusqu’à 2 Gio ; la réservation est libérée en fin de portée.
```

Référence API : [RecoveryQuotaOptions](../../reference/recoveryquotaoptions/) et [RecoveryStorageReservationOptions](../../reference/recoverystoragereservationoptions/).

Une réservation refusée rejette avec le code `configuration` ; un `assertRecoveryQuota()` en échec rejette avec le code `workspace` ([Erreurs](../error-handling/)).

## Limites

- Les réservations coordonnent les processus d’écriture qui les utilisent. Ce n’est pas un quota du système de fichiers : tout autre processus peut encore écrire dans `.outpost`.
- La réservation d’un processus mort reste dans le registre (`reservations/ledger` dans le transport) et continue de compter. Retirez son entrée seulement après avoir vérifié que son propriétaire s’est arrêté, par une écriture conditionnelle (`ifRevision`) dans le même transport.
- La rétention ne supprime jamais les branches, checkpoints, artefacts, conversations, transferts de récupération ni verrous.
- Un transport distant ne peut pas utiliser le périmètre `clean-workspaces` ni `maxWorkspaces`.
- Ne supprimez pas `.outpost` à la main : il peut contenir la seule copie d’un travail inachevé.

API : [planRecoveryRetention](../../reference/planrecoveryretention/) · [pruneRecoveryRetention](../../reference/prunerecoveryretention/) · [RecoveryRetentionPolicy](../../reference/recoveryretentionpolicy/) · [RecoveryRetentionPlan](../../reference/recoveryretentionplan/) · [reserveRecoveryStorage](../../reference/reserverecoverystorage/) · [assertRecoveryQuota](../../reference/assertrecoveryquota/) · [WorkspaceOptions](../../reference/workspaceoptions/).
