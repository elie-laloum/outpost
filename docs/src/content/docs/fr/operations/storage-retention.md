---
title: "Rétention et quotas"
description: "Planifier un nettoyage explicite et vérifier les budgets de stockage."
sidebar:
  order: 3
---

Commencez par [inspecter les données conservées](../recovery/).

## Planifier la rétention et nettoyer explicitement

La rétention est explicite. Enregistrez par exemple `retention.json` hors des dossiers de stockage gérés :

```json
{
  "version": 1,
  "scopes": ["clean-workspaces", "closed-logs"],
  "minAgeMs": 604800000,
  "maxBytes": 1073741824,
  "maxWorkspaces": 10
}
```

`minAgeMs` est l’âge minimum observé en millisecondes ; `maxBytes` et `maxWorkspaces` sont des objectifs optionnels non négatifs. Toutes les entrées admissibles assez anciennes sont candidates, même sous les objectifs. Omettre un périmètre protège sa catégorie. Champs inconnus, périmètres non pris en charge et limites invalides sont refusés.

```sh
outpost recovery prune --repository /path/to/repository --policy retention.json
outpost recovery prune --repository /path/to/repository --policy retention.json --json
outpost recovery prune --repository /path/to/repository --policy retention.json --apply
```

Par défaut, aucune suppression : c’est une simulation. `--apply` construit un nouveau plan et revalide chaque candidat avant suppression. L’API accepte aussi un plan relu via `pruneRecoveryRetention(plan)` ; les candidats modifiés sont conservés. Le plan expose catégorie, taille logique, admissibilité, raison, consommation totale et projetée. Artefacts de récupération et enregistrements de propriété sont toujours protégés explicitement et comptent dans le quota. Les quatre catégories `.outpost` standard sont incluses ; logs externes personnalisés, conversations natives, volumes de cache gérés par le moteur et base d’objets Git partagée restent hors périmètre.

`clean-workspaces` exige un worktree enregistré, attaché, propre, sans fichiers ignorés ni verrou Git ou Outpost. Workspaces modifiés, détachés, non enregistrés, illisibles ou inconnus restent protégés. Le nettoyage acquiert le verrou Outpost normal de la branche, vérifie à nouveau branche/HEAD/statut puis utilise une suppression Git non forcée. Toutes les branches et leurs commits non publiés sont conservés ; retirer un worktree ne promet donc pas de libérer ses objets Git. La fermeture normale conserve aussi les fichiers ignorés.

`closed-logs` accepte uniquement les journaux par défaut produits par cette implémentation et fermés avec succès. Un marqueur privé `.jsonl.closed.json` enregistre une empreinte SHA-256 non signée, taille, heure de fermeture et identité du fichier. La planification lit au plus 4 Kio de métadonnées et hache au plus 1 Gio par log ; logs plus gros, modifiés, remplacés, ouverts, anciens ou personnalisés restent protégés. Réouvrir un journal invalide l’ancien marqueur. Le nettoyage acquiert le même verrou que les rédacteurs et revalide le marqueur avant suppression du log et de son marqueur. Ces enregistrements supposent un dépôt fiable et des processus Outpost coopératifs : réécrire données et métadonnées permet de les falsifier. Les rédacteurs externes ne sont pas exclus par ces verrous.

Un inventaire incomplet interdit tout nettoyage et donne le quota `unknown`. Un plan complet donne `within` ou `exceeded` pour le quota projeté ; des données protégées peuvent empêcher de l’atteindre. La simulation termine avec `1` pour un plan incomplet ou hors quota. L’application termine aussi avec `1` si un candidat a changé ou n’a pas pu être supprimé. Ce mécanisme n’est ni une éviction en arrière-plan ni une réservation de capacité. Aucun backup, verrou ou branche Git n’est supprimé automatiquement pour respecter un quota.

## Vérifier l’admission du stockage dans un workflow

L’API publique permet de vérifier une limite avant l’allocation suivante :

```ts
import {
  assertRecoveryQuota,
  planRecoveryRetention,
} from "@elie-laloum/outpost";

const repository = "/path/to/repository";
await assertRecoveryQuota({
  repository,
  maxBytes: 1_073_741_824,
  reserveBytes: 104_857_600,
});
const plan = await planRecoveryRetention({
  repository,
  policy: { version: 1, scopes: ["closed-logs"], minAgeMs: 604_800_000 },
});
console.log(plan.usageBytes, plan.projectedBytes, plan.quota);
```

L’admission lève `OutpostError` si la consommation observée plus `reserveBytes` dépasse `maxBytes`, ou si l’inventaire est incomplet. Les quatre catégories, y compris leurs entrées protégées, sont incluses. Elle ne réserve pas d’octets, n’impose pas de quota physique et n’est pas appelée automatiquement par `dispatch` ou les providers. Utilisez `reserveRecoveryStorage` ci-dessous lorsque plusieurs rédacteurs partagent un budget. `maxEntries` borne le parcours ; un inventaire partiel ne constitue jamais une admission réussie.

## Réserver de la capacité entre opérations concurrentes

`reserveRecoveryStorage` sérialise l'admission des processus coopérants utilisant le même checkout du dépôt. Le calcul additionne le stockage local mesuré, les réservations existantes, la marge demandée et les métadonnées de réservation avant d'enregistrer le propriétaire. Tous les participants doivent utiliser le même budget `maxBytes`.

```ts
import { reserveRecoveryStorage } from "@elie-laloum/outpost";

const repository = "/path/to/repository";
await using reservation = await reserveRecoveryStorage({
  repository,
  maxBytes: 1_073_741_824,
  reserveBytes: 104_857_600,
});
// Effectuer les opérations pendant la durée de la réservation.
// reservation.release() permet aussi une libération explicite et idempotente.
```

Pour une gestion automatique, définir `storageQuota` sur `openWorkspace`, `createSandbox`, `dispatch` ou les options de sandbox d'une tâche isolée :

```ts
import { openWorkspace } from "@elie-laloum/outpost";

await using workspace = await openWorkspace({
  repository: "/path/to/repository",
  branch: { mode: "named", name: "reserved-work" },
  storageQuota: {
    maxBytes: 1_073_741_824,
    reserveBytes: 104_857_600,
  },
});
```

La réservation précède l'allocation du workspace. Un échec d'allocation ou de démarrage la libère ; un workspace ouvert la conserve jusqu'à `close()`, y compris entre les opérations de sandboxes réutilisées. Un workspace fourni possède son quota : configurer le workspace lui-même, sans transmettre un second quota à sa sandbox. Fermer une sandbox qui emprunte le workspace ne libère pas sa réservation. Utiliser soit la gestion automatique, soit une réservation manuelle pour les mêmes opérations, afin d'éviter une double réservation.

Les réservations représentent une marge, pas un compteur d'octets consommés : leur montant entier reste comptabilisé en plus du stockage mesuré jusqu'à leur libération. Ce calcul prudent peut refuser l'admission avant que le disque physique soit plein. Fermer un workspace libère sa réservation même si ses fichiers modifiés sont conservés ; ces fichiers restent comptés dans le stockage mesuré. Aucune suppression automatique ne permet de satisfaire un quota.

Les enregistrements privés et versionnés sont stockés dans `.outpost/locks/storage-reservations/` et comptés dans la catégorie protégée des verrous. L'admission attend au maximum cinq secondes la propriété du dépôt et accepte un signal d'annulation. Un inventaire incomplet, des enregistrements corrompus ou des chemins dangereux font refuser l'admission. Les propriétaires actifs ou incertains restent comptabilisés. Lors d'une admission ultérieure, un enregistrement est récupéré uniquement si l'identité locale du processus prouve que son propriétaire est terminé. Cette récupération automatique nécessite actuellement l'identité des processus Linux ; les hôtes, démarrages, espaces de PID inconnus, PID réutilisés et plateformes sans cette identité conservent leurs réservations pour examen manuel. Une écriture interrompue ou illisible du verrou de propriété bloque également l'admission. Ne jamais supprimer un enregistrement incertain sans avoir confirmé indépendamment l'arrêt de son propriétaire.

Il s'agit de réservations logiques du stockage local pour les appelants Outpost coopérants, pas de quotas du système de fichiers. Elles n'empêchent pas une commande active ou un autre processus de dépasser l'estimation et ne couvrent pas les disques cloud, volumes de cache des conteneurs, objets Git partagés ou transcriptions externes. `assertRecoveryQuota` reste une vérification instantanée sans réservation ; utiliser les réservations pour l'admission concurrente.
