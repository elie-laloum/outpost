---
title: "Commandes de récupération"
description: "Inspectez les données conservées avant de les restaurer ou de les supprimer."
---

Inspectez les données conservées avant de les restaurer ou de les supprimer. Le [guide de récupération](../recovery/) explique l’ordre des opérations ; cette page détaille les options des commandes.

## `outpost recovery inspect`

Examinez les workspaces, les transferts conservés et l’activité enregistrée dans le `.outpost` d’un dépôt. Cette commande lit l’inventaire sans le modifier.

```sh
outpost recovery inspect [--repository PATH | --runtime-directory PATH] [--max-entries N] [--git] [--locks] [--resources] [--json]
```

| Option                | Par défaut                     | Valeurs et effet                                                         |
| --------------------- | ------------------------------ | ------------------------------------------------------------------------ |
| `--repository`        | Checkout du répertoire courant | Dépôt dont le `.outpost` est listé.                                      |
| `--runtime-directory` | Aucun                          | Répertoire de contrôle d’un workspace de fichiers ; inspection sans Git. |
| `--max-entries`       | `100000`                       | Arrête l’inventaire après ce nombre d’entrées.                           |
| `--git`               | Désactivé                      | Ajoute la branche, le HEAD et l’état modifié de chaque workspace.        |
| `--locks`             | Désactivé                      | Ajoute les PID et la propriété des verrous locaux.                       |
| `--resources`         | Désactivé                      | Ajoute l’activité de sandbox enregistrée.                                |
| `--json`              | Désactivé                      | Rapport JSON.                                                            |

Il ne modifie rien. Il sort avec `1` quand l’inventaire est partiel.

## `outpost recovery verify`

Vérifiez un transfert conservé avant de le restaurer. Vous pouvez comparer les sommes de contrôle et tester l’application de ses patchs dans un clone temporaire.

```sh
outpost recovery verify --directory TRANSFER [--checksums [--max-bytes N]] [--restorability --repository PATH] [--json]
```

| Option            | Par défaut | Valeurs et effet                                                             |
| ----------------- | ---------- | ---------------------------------------------------------------------------- |
| `--directory`     | Requis     | Répertoire du transfert conservé.                                            |
| `--checksums`     | Désactivé  | Compare les fichiers au manifeste de sommes de contrôle du transfert.        |
| `--max-bytes`     | 1 Gio      | Octets vérifiés par `--checksums`, qu’il requiert.                           |
| `--restorability` | Désactivé  | Applique les patchs du transfert dans un clone temporaire de `--repository`. |
| `--repository`    | Aucun      | Checkout utilisé par `--restorability` ; les deux vont ensemble.             |
| `--json`          | Désactivé  | Rapport JSON.                                                                |

Il ne modifie aucun fichier. Il sort avec `1` quand un contrôle échoue ou reste incomplet.

## `outpost recovery restore`

Restaurez l’état sauvegardé de la machine ou les modifications reçues de la sandbox dans un nouveau répertoire. Consultez d’abord le plan, puis ajoutez `--apply` lorsque vous êtes prêt à créer la copie.

```sh
outpost recovery restore --directory TRANSFER --repository PATH --destination NEW_PATH --side previous|incoming [--max-bytes N] [--apply] [--json]
```

| Option          | Par défaut | Valeurs et effet                                                                               |
| --------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| `--directory`   | Requis     | Répertoire du transfert conservé.                                                              |
| `--repository`  | Requis     | Checkout auquel appartient le transfert.                                                       |
| `--destination` | Requis     | Nouveau répertoire hors du dépôt ; il ne doit pas exister.                                     |
| `--side`        | Requis     | `previous` (état de l’hôte avant synchronisation) ou `incoming` (modifications de la sandbox). |
| `--max-bytes`   | 1 Gio      | Taille maximale acceptée pour le contenu conservé.                                             |
| `--apply`       | Désactivé  | Crée la destination ; sans elle, affiche le plan.                                              |
| `--json`        | Désactivé  | Plan ou résultat en JSON.                                                                      |

La copie restaurée est un checkout détaché. Le transfert reste en place ; examinez la copie avant de l’intégrer.

## `outpost recovery prune`

Prévisualisez les suppressions choisies par votre politique de rétention JSON. Ajoutez `--apply` pour supprimer ces entrées après avoir examiné le plan.

```sh
outpost recovery prune --policy FILE [--repository PATH] [--apply] [--json]
```

| Option         | Par défaut                     | Valeurs et effet                                                     |
| -------------- | ------------------------------ | -------------------------------------------------------------------- |
| `--policy`     | Requis                         | Fichier de politique JSON, 64 Kio au plus ([format](../retention/)). |
| `--repository` | Checkout du répertoire courant | Dépôt dont le `.outpost` est nettoyé.                                |
| `--apply`      | Désactivé                      | Supprime les candidats ; sans elle, simple essai à blanc.            |
| `--json`       | Désactivé                      | Plan et résultat en JSON.                                            |

Il sort avec `1` quand l’inventaire est incomplet, que la taille projetée dépasse la limite de la politique, ou que `--apply` a dû garder un candidat. Les branches et les artefacts de récupération sont toujours conservés.

## `outpost recovery publication`

Inspectez une publication interrompue avant de choisir de la terminer ou de revenir sur ses écritures. Ces commandes ne rejouent pas les tâches. Utilisez le namespace et l’identifiant de publication signalés par l’erreur.

```sh
outpost recovery publication inspect --runtime-directory .outpost --namespace documents --publication-id ID --json
outpost recovery publication finish --runtime-directory .outpost --namespace documents --publication-id ID --processes-stopped --json
outpost recovery publication rollback --runtime-directory .outpost --namespace documents --publication-id ID --processes-stopped --json
```

`--processes-stopped` atteste que vous avez arrêté les processus propriétaires ; il ne les arrête pas. `rollback` annule seulement les écritures encore reconnues : il ne supprime pas une modification concurrente et ne revient jamais sur les effets d’un montage modifiable. Gardez les sauvegardes en cas de refus.

Pour le transport d’un projet YAML, ajoutez `--file recipe.yaml --config outpost.yaml`. Avec ces deux options, `--run-id ID` actualise aussi l’état de publication du rapport de la recette concernée, sans autoriser le rejeu des tâches.

## `outpost recovery workspace`

L’inspection retourne l’état et la révision du workspace. Arrêtez son propriétaire et libérez toute allocation distante avant la récupération.

```sh
outpost recovery workspace inspect --runtime-directory .outpost --namespace documents --workspace-id ID --json
outpost recovery workspace recover --runtime-directory .outpost --namespace documents --workspace-id ID --revision REVISION --processes-stopped --allocation-released --json
```

`--revision` protège contre un changement depuis l’inspection. `--adopt-files` accepte explicitement les fichiers d’une préparation interrompue ; `--adopt-source` accepte un changement de source montée ; `--portable` demande une restauration portable. Ne les ajoutez pas pour contourner un refus sans examiner le travail conservé. `--file` et `--config` sélectionnent le transport du projet YAML. La [reprise du workflow](../durable-runs/) reste une opération distincte.

## `outpost recovery registry`

Ces commandes inspectent le verrou de coordination des chemins locaux puis libèrent la révision examinée. Arrêtez tous les processus qui utilisent ce registre avant de confirmer.

```sh
outpost recovery registry inspect --json
outpost recovery registry recover --revision REVISION --processes-stopped --json
```
