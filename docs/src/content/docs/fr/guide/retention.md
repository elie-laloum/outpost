---
title: "Nettoyer les données enregistrées"
description: "Examinez une politique de conservation et supprimez les données admissibles en préservant le travail récupérable."
---

Commencez par un aperçu sur le dépôt ou transport qui contient les données. Gardez les éléments de récupération jusqu’à leur inspection. Nettoyer des objets enregistrés ne prouve pas qu’une sandbox ou un worker abandonné s’est arrêté.

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

Une entrée reste si elle est trop récente, active, modifiée depuis l’aperçu ou hors du périmètre choisi. Un worktree avec des fichiers non commités doit être relu et sauvegardé avant nettoyage. Les branches, conversations et données de récupération restent volontairement hors de cette politique ; leur présence n’est pas un échec de suppression.

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
// Example output: within 4096
const result = await pruneRecoveryRetention(plan);
console.log(result.removed, result.retained);
// Example output: [ '/project/.outpost/workspaces/old-run' ] []
```

Pour des données conservées dans un [transport](../storage/) distant, passez `transporter` à `planRecoveryRetention()` et `{ transporter }` à `pruneRecoveryRetention()`. Seuls `closed-logs` et `task-cache` s’y appliquent.

L’élagage Transport supprime les segments des journaux fermés avant leur index. Si une suppression échoue, créez un nouveau plan de rétention et réessayez ; l’index conservé maintient l’éligibilité des objets restants. Un journal partiellement supprimé ne fournit plus un historique lisible complet.

## Nettoyer ce que la rétention conserve

<!-- features -->

- **Branches nommées** : Supprimer un worktree conserve sa branche. Effacez celles déjà fusionnées avec `git branch -d outpost/fix-tests`.
- **Worktrees modifiés** : Committez, copiez ou jetez les fichiers après un examen avec [Récupérer du travail](../recovery/). `git -C <worktree> clean -ndX` prévisualise les fichiers ignorés ; après examen, `git -C <worktree> clean -fdX` ne supprime que les fichiers ignorés.
- **Volumes de cache** : Ils survivent aux sandboxes et aux images. Supprimez-les avec le moteur de conteneurs, label `io.outpost.cache=true` ([Préparer l’environnement](../dependency-caches/)).

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
- La réservation d’un processus mort reste dans le registre (`reservations/ledger` dans le transport) et continue de compter. Utilisez `inspectStorageReservations()` pour identifier son propriétaire, puis `recoverStorageReservation()` avec la révision inspectée et `processesStopped: true` après son arrêt. Une modification concurrente exige une nouvelle inspection.
- La rétention ne supprime jamais les branches, checkpoints, artefacts, conversations, transferts de récupération ni verrous.
- Un transport distant ne peut pas utiliser le périmètre `clean-workspaces` ni `maxWorkspaces`.
- Ne supprimez pas `.outpost` à la main : il peut contenir la seule copie d’un travail inachevé.

API : [planRecoveryRetention](../../reference/planrecoveryretention/) · [pruneRecoveryRetention](../../reference/prunerecoveryretention/) · [RecoveryRetentionPolicy](../../reference/recoveryretentionpolicy/) · [RecoveryRetentionPlan](../../reference/recoveryretentionplan/) · [reserveRecoveryStorage](../../reference/reserverecoverystorage/) · [assertRecoveryQuota](../../reference/assertrecoveryquota/) · [WorkspaceOptions](../../reference/workspaceoptions/).

## Inspecter et récupérer les réservations

Les nouvelles entrées enregistrent l’identifiant d’instance du processus, le nom d’hôte, le PID, la date de création et le dépôt, avec l’identité Linux si disponible. Ces informations identifient le propriétaire sans prouver son activité distante. Choisissez l’entrée exacte et arrêtez son propriétaire avant récupération. Une modification concurrente du registre refuse la récupération et exige une nouvelle inspection. L’exemple utilise le Transport par défaut du dépôt ; utilisez votre Transport d’origine si le stockage est personnalisé.

```ts
import {
  createLocalTransport,
  inspectStorageReservations,
  recoverStorageReservation,
} from "@elie-laloum/outpost";

const transporter = createLocalTransport({
  directory: "/projects/app/.outpost/storage",
});
const inspection = await inspectStorageReservations(transporter);
console.log(inspection);

// À exécuter seulement après confirmation de l’arrêt du propriétaire.
export async function recoverStoppedOwner(id: string) {
  if (!inspection.revision) throw new Error("No reservation ledger");
  await recoverStorageReservation(transporter, {
    id,
    revision: inspection.revision,
    processesStopped: true,
  });
}
```

Le registre écrit le format 2 et lit l’ancien format 1. Les réservations anciennes restent comptabilisées, sans métadonnées de propriétaire ; arrêtez tous les écrivains potentiels avant d’en récupérer une. Arrêtez les écrivains d’ancienne version avant la migration d’un registre partagé : ils ne peuvent pas lire le format 2. Ni la récupération ni la libération ne recréent une réservation retirée ; la récupération préserve les autres entrées par écriture conditionnelle.
