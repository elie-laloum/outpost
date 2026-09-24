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

L’admission lève `OutpostError` si la consommation observée plus `reserveBytes` dépasse `maxBytes`, ou si l’inventaire est incomplet. Les quatre catégories, y compris leurs entrées protégées, sont incluses. Elle ne réserve pas d’octets, n’impose pas de quota physique et n’est pas appelée automatiquement par `dispatch` ou les providers. Sérialisez les admissions avec la propriété de votre workflow lorsque plusieurs rédacteurs partagent un budget. `maxEntries` borne le parcours ; un inventaire partiel ne constitue jamais une admission réussie.
