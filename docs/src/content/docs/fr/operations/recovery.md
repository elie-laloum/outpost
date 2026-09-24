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

La commande non publiée `outpost recovery inspect` inventorie `.outpost/recovery`, `.outpost/logs`, `.outpost/locks` et `.outpost/workspaces` dans le checkout choisi. Elle est disponible sur main. Par défaut, elle lit les métadonnées du système de fichiers, sans lire le contenu des transcripts, patches ou verrous, modifier les métadonnées Git, créer de dossiers d’exécution ni supprimer de fichiers.

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

## Inspecter l’état Git des workspaces

Ajoutez `--git` pour inspecter l’état Git des entrées de workspaces inventoriées :

```sh
node src/cli/main.ts recovery inspect --repository /chemin/du/depot --git
node src/cli/main.ts recovery inspect --repository /chemin/du/depot --git --json
```

Les worktrees enregistrés affichent leur branche ou HEAD détachée, commit, état clean/dirty et indicateur de verrou Git. Dirty inclut les changements indexés, non indexés, non suivis et ceux des sous-modules. Les fichiers ignorés sont exclus du statut Git, mais leurs tailles restent dans l’inventaire du stockage. Un worktree propre n’est pas forcément supprimable : fichiers ignorés, commits non publiés et opérations en cours peuvent encore compter. Un verrou de worktree Git est distinct d’un verrou d’opération Outpost et ne prouve pas une activité.

Les dossiers absents du registre des worktrees du dépôt choisi sont signalés `unregistered` ; ils ne sont pas inspectés à travers le dépôt parent. Les entrées autres que des dossiers, dont les liens symboliques, sont `skipped`. Les worktrees enregistrés aux métadonnées Git illisibles ou incohérentes sont `unavailable`, jamais supposés propres. Les dossiers enregistrés mais absents sont hors de cet inventaire, qui liste uniquement les entrées de stockage observées. La commande ne nettoie pas le registre Git.

Cette vérification optionnelle laisse Git lire le contenu des workspaces pour calculer leur état ; contenus, noms des fichiers modifiés et raisons des verrous ne sont pas affichés. Les verrous Git optionnels, fsmonitor et la maintenance automatique sont désactivés. Chaque commande Git dispose de 10 secondes et d’une limite stdout de 1 Mio ; erreurs ou limites atteintes rendent l’inspection Git partielle. Le budget `--max-entries` de l’inventaire ne borne pas le parcours propre à Git. Les deux vérifications restent des observations, pas un instantané atomique ni une vérification d’activité ou d’intégrité.

Le JSON ajoute `git: { complete, workspaces, issues }`. Chaque workspace possède `name`, `path`, `state` et, s’il est enregistré, `head`, `branch` (`null` pour une HEAD détachée), `dirty` et `locked`. Les entrées skipped/unavailable possèdent aussi une `reason`. Le champ racine `complete` décrit l’inventaire du stockage ; `git.complete` décrit les vérifications Git optionnelles des entrées listées. Le code de sortie est `1` si l’une des deux inspections est partielle ; des workspaces modifiés, détachés, verrouillés ou non enregistrés ne font pas échouer l’inspection à eux seuls.

## Inspecter les PID des verrous

Ajoutez `--locks` pour lire les métadonnées des verrous et vérifier si le PID enregistré existe sur l’hôte local :

```sh
node src/cli/main.ts recovery inspect --repository /chemin/du/depot --git --locks
node src/cli/main.ts recovery inspect --repository /chemin/du/depot --locks --json
```

Seuls les fichiers ordinaires parmi les verrous inventoriés sont lus, avec une limite de 4 Kio par enregistrement. Les PID entiers positifs jusqu’à 2 147 483 647 sont sondés avec le signal `0`, qui ne termine pas le processus. Le rapport affiche le PID et `present`, `absent` ou `unknown`. Seul un résultat « processus introuvable » (`ESRCH`) signifie `absent` ; les erreurs de permission et autres échecs restent `unknown`. Les enregistrements malformés, trop grands, illisibles ou changeants sont aussi inconnus. Liens symboliques, dossiers et autres entrées non ordinaires sont ignorés. Le contenu brut et les nonces des verrous ne sont pas affichés.

C’est une observation locale du PID, pas une preuve de propriété ou d’activité du verrou. Les enregistrements actuels n’identifient ni l’hôte ni la date de démarrage du processus : systèmes de fichiers partagés, espaces de PID et réutilisation des PID peuvent rendre cette observation trompeuse. Un PID absent n’autorise pas une suppression. L’inspection n’acquiert, ne libère et ne supprime aucun verrou existant ; `activity` reste `"unverified"`.

Le JSON ajoute `locks: { scope: "local-pid", complete, entries, issues }`. Chaque entrée possède `name`, `path`, `state`, un `pid` valide lorsqu’il est disponible et une `reason` pour les résultats unknown/skipped. `locks.complete` concerne seulement les entrées listées ; un résultat inconnu le rend faux et le CLI termine avec `1`. Des PID présents/absents ne font pas échouer l’inspection à eux seuls. L’inventaire et la vérification Git optionnelle conservent leurs champs de complétude distincts ; toute vérification partielle entraîne le code `1`.

Si votre dépôt ne contient aucun verrou, utilisez cette démonstration depuis les sources :

```sh
node test/fixtures/recovery-locks.ts
```

Elle crée un dépôt Git temporaire, conserve un véritable verrou Outpost et ajoute un enregistrement au PID invalide. Résultat attendu : une entrée `present`, une entrée `unknown | INVALID_PID` et un code d’inspection affiché de `1`. La démonstration elle-même termine avec succès lorsque ce résultat attendu est observé et supprime uniquement son dépôt temporaire.

## Vérifier la structure d’un transfert conservé

Utilisez la commande non publiée `recovery verify` sur un dossier de transfert distant précis, celui contenant `state.json` (normalement `.outpost/recovery/<session>/<transfert>`) :

```sh
node src/cli/main.ts recovery verify --directory /chemin/du/transfert/conserve
node src/cli/main.ts recovery verify --directory /chemin/du/transfert/conserve --json
```

Le dossier peut avoir été déplacé et ne doit pas nécessairement appartenir à un checkout Git. Cette commande vérifie le format actuel produit par `backupHost`, pas le dossier de session parent, les magasins de conversations ni les workspaces orphelins. Un transfert interrompu avant la sauvegarde hôte peut légitimement ne pas avoir de `state.json` ; un échec indique une structure incomplète ou non vérifiable, pas une preuve de corruption.

La commande lit uniquement `state.json`, limité à 64 Kio. Elle exige les identifiants de commits `previous` et `next` au même format hexadécimal de 40 ou 64 caractères, ainsi que les tableaux `previousExtras` et `incoming`, limités chacun à 1 000 chemins relatifs uniques. Chemins ou composants vides, composants point, remontées vers un parent, chemins de métadonnées Git et chemins avec racine POSIX/Windows sont refusés avant l’examen des références. Les champs supplémentaires inconnus sont ignorés et jamais affichés.

Elle vérifie ensuite les métadonnées des trois fichiers ordinaires requis `remote.patch`, `previous.patch` et `previous-index.patch`, ainsi que `commits.bundle` lorsque `previous` diffère de `next`. Les patches vides sont valides. Chaque fichier référencé doit exister sous `previous-files` ou `incoming` comme fichier ordinaire ou lien symbolique final. Les liens finaux sont signalés `SYMLINK_PRESENT` sans lire leur cible ; les liens parents et les fichiers state/patch/bundle symboliques sont refusés. Les fichiers non référencés restent hors du contrôle.

Le code `0` signifie que la structure attendue est présente. Le code `1` indique une vérification en échec ou une invocation invalide. Le JSON contient `directory`, `scope: "transfer-structure"`, `complete`, `integrity: "unverified"` et `checks` (`path`, `status`, `code`). Contenus bruts des métadonnées, patches, fichiers et bundles ne sont pas affichés. La vérification n’exécute aucune commande Git et ne modifie aucun fichier.

C’est une observation, pas un instantané atomique ni une preuve qu’une restauration fonctionnera. Contenus des patches/bundles, empreintes, permissions, disponibilité des commits, cohérence entre fichiers et activité restent non vérifiés. Même un bundle malformé peut réussir ce contrôle structurel si son fichier existe. L’intégrité complète du contenu et la validation d’une restauration restent planifiées.

Essayez une démonstration temporaire depuis les sources :

```sh
node test/fixtures/recovery-verification.ts
```

Elle construit un transfert synthétique avec tous les fichiers attendus, vérifie le code `0`, retire un fichier référencé puis vérifie le code `1` avec `FILE_UNAVAILABLE`. La démonstration supprime uniquement son dossier temporaire et termine avec succès lorsque les deux résultats attendus sont observés.

## Procédure de récupération

1. Notez erreur, chemins et branches ; conservez le dossier de récupération.
2. Examinez l’état et l’historique Git du worktree retenu.
3. Inspectez bundles et patches dans un clone séparé avant toute application à un travail important.
4. Résolvez chevauchements ou conflits, puis reprenez avec branche et conversation explicites si nécessaire.

Ne supprimez jamais un verrou actif pour contourner les règles de propriété.
