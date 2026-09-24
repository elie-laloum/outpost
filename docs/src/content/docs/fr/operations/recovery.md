---
title: "Erreurs et récupération"
description: "Erreurs et récupération — Outpost"
sidebar:
  order: 1
---

Examinez l’erreur originale et ses informations de récupération avant de supprimer un workspace ou de répéter une opération avec effets de bord.

```ts
import {
  dispatch,
  codex,
  OutpostError,
  recoveryDetails,
} from "@elie-laloum/outpost";

try {
  await dispatch({
    agent: codex(),
    brief: { text: "Implémente et teste la correction." },
  });
} catch (error) {
  if (error instanceof OutpostError) console.error(error.code, error.details);
  console.error(recoveryDetails(error));
  throw error;
}
```

`OutpostError` contient `code`, `details` figé, `recovery` et éventuellement `cause`. Les codes sont `configuration`, `process`, `timeout`, `aborted`, `workspace`, `conflict`, `prompt`, `response`, `session` et `provider`. Plusieurs échecs peuvent former un `AggregateError`. Une annulation peut conserver une erreur native ; utilisez `recoveryDetails` sans supposer que toute erreur est un OutpostError.

## Éléments conservés

La récupération peut inclure workspace, conversation, commits, transcript et log selon l’étape atteinte. Les worktrees modifiés sont conservés ; les workspaces propres possédés sont supprimés après un échec au démarrage. Les branches nommées survivent à la suppression d’un worktree propre.

Les dossiers distants peuvent contenir `initial.bundle`/`commits.bundle`, patches binaires, `previous-index.patch`, fichiers non suivis dans `incoming`/`previous-files` et `state.json`. Ils représentent les états précédent et entrant, sans garantir qu’un transfert interrompu est complet.

## Inspecter le stockage conservé

La commande non publiée `outpost recovery inspect` inventorie `.outpost/recovery`, `.outpost/logs`, `.outpost/locks` et `.outpost/workspaces` dans le checkout choisi. Elle est disponible sur main. Elle lit les métadonnées du système de fichiers, sans lire le contenu des transcripts, patches ou verrous, modifier les métadonnées Git, créer de dossiers d’exécution ni supprimer de fichiers.

```sh
node src/cli/main.ts recovery inspect --repository /chemin/du/depot
node src/cli/main.ts recovery inspect --repository /chemin/du/depot --json
```

Utilisez Node.js 24+ depuis les sources. Avec le CLI compilé, utilisez `outpost recovery inspect`. `--repository` utilise le dossier courant par défaut ; un sous-dossier est résolu vers la racine de son checkout Git. Un worktree lié est inspecté comme son propre checkout. Les logs personnalisés et magasins de conversations natifs hors de ces quatre dossiers ne sont pas inclus.

Chaque enfant direct d’un dossier de stockage possède une entrée avec chemin, type, taille logique récursive en octets, nombres de fichiers/dossiers/liens symboliques, modification observée la plus récente et indicateur de complétude. Les liens physiques sont comptés par chemin ; les fichiers creux utilisent leur taille logique. Ces tailles ne représentent ni les blocs alloués ni un stockage physique dédupliqué. Les cibles des liens symboliques sont exclues et les racines de stockage symboliques sont refusées.

L’inventaire est une observation, pas un instantané atomique. Les fichiers peuvent changer pendant le parcours. Des dossiers de stockage absents sont normaux ; chemins inaccessibles, types de fichiers non pris en charge et limites atteintes produisent des problèmes explicites et des totaux partiels. Le budget par défaut est de 100 000 entrées pour les quatre dossiers, dans l’ordre recovery/logs/locks/workspaces, avec une profondeur maximale de 64. `--max-entries NOMBRE` ajuste le budget d’entrées. Les dossiers de catégorie vides ne consomment pas ce budget.

```sh
node src/cli/main.ts recovery inspect --repository /chemin/du/depot --max-entries 1000 --json
```

Un parcours complet termine avec le code `0`. Un parcours partiel termine avec `1` tout en affichant son rapport ; arguments invalides ou checkout Git indisponible terminent aussi avec `1`. Le JSON contient `repository`, `root`, `categories`, `usage`, `issues`, `complete`, `scannedEntries`, `maxEntries` et `activity: "unverified"`. Il expose uniquement des métadonnées. Un inventaire complet ne prouve ni la validité ni l’inactivité des données récupérables. Cette commande ne détermine pas si une suppression est sûre, ne nettoie pas le stockage et n’applique ni rétention ni quotas.

## Procédure de récupération

1. Notez erreur, chemins et branches ; conservez le dossier de récupération.
2. Examinez l’état et l’historique Git du worktree retenu.
3. Inspectez bundles et patches dans un clone séparé avant toute application à un travail important.
4. Résolvez chevauchements ou conflits, puis reprenez avec branche et conversation explicites si nécessaire.

Ne supprimez jamais un verrou actif pour contourner les règles de propriété.
