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

La récupération peut inclure workspace, conversation, commits, transcript et log selon l’étape atteinte. Les worktrees modifiés sont conservés ; les workspaces propres possédés sont supprimés après un échec au démarrage si aucune allocation fournisseur n’a commencé ou si le bail obtenu a été libéré avec succès. Les branches nommées survivent à la suppression d’un worktree propre.

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

C’est une observation locale du PID, pas une preuve de propriété ou d’activité du verrou. Les anciens enregistrements n’identifient ni l’hôte ni la date de démarrage du processus ; systèmes de fichiers partagés, espaces de PID et réutilisation des PID peuvent rendre cette observation trompeuse. Les nouveaux enregistrements permettent aussi l’observation de propriété décrite ci-dessous. Un PID absent n’autorise pas une suppression. L’inspection n’acquiert, ne libère et ne supprime aucun verrou existant ; `activity` reste `"unverified"`.

Le JSON ajoute `locks: { scope: "local-pid", complete, entries, issues }`. Chaque entrée possède `name`, `path`, `state`, un `pid` valide lorsqu’il est disponible et une `reason` pour les résultats unknown/skipped. `locks.complete` concerne seulement les entrées listées ; un résultat inconnu le rend faux et le CLI termine avec `1`. Des PID présents/absents ne font pas échouer l’inspection à eux seuls. L’inventaire et la vérification Git optionnelle conservent leurs champs de complétude distincts ; toute vérification partielle entraîne le code `1`.

Si votre dépôt ne contient aucun verrou, utilisez cette démonstration depuis les sources :

```sh
node test/fixtures/recovery-locks.ts
```

Elle crée un dépôt Git temporaire, conserve un véritable verrou Outpost et ajoute un enregistrement au PID invalide. Résultat attendu : une entrée `present`, une entrée `unknown | INVALID_PID` et un code d’inspection affiché de `1`. La démonstration elle-même termine avec succès lorsque ce résultat attendu est observé et supprime uniquement son dépôt temporaire.

## Vérifier la structure d’un transfert conservé

Consultez les [contrôles de structure, empreintes et restauration Git](../recovery-verification/).

## Vérifier les empreintes enregistrées du transfert

Les [manifestes SHA-256](../recovery-verification/) sont vérifiés explicitement, séparément de l’applicabilité des patches.

## Procédure de récupération

1. Notez erreur, chemins et branches ; conservez le dossier de récupération.
2. Examinez l’état et l’historique Git du worktree retenu.
3. Inspectez bundles et patches dans un clone séparé avant toute application à un travail important.
4. Résolvez chevauchements ou conflits, puis reprenez avec branche et conversation explicites si nécessaire.

Ne supprimez jamais un verrou actif pour contourner les règles de propriété.

## Observer la propriété locale

L’inspection conserve les champs PID existants et ajoute `ownership: { status, reason }` lorsqu’un PID valide est disponible. Sous Linux, les nouveaux verrous enregistrent l’identifiant haché de la machine, l’identifiant de démarrage, l’espace de PID et les ticks de démarrage du processus. Une correspondance donne `active` ; un processus confirmé absent sur le même hôte, démarrage et espace donne `inactive`. Identités anciennes ou malformées, autres hôtes ou démarrages, processus inaccessibles, espaces différents et PID réutilisés restent `unknown`, avec une raison explicite. Identités et nonces ne sont jamais affichés.

C’est une observation du propriétaire local enregistré, pas un bail distribué, une preuve de travail utile ni une vérification globale d’activité. `activity` reste `unverified` ; `locks.complete` décrit toujours le sondage PID, pas la certitude de propriété. Sans les mécanismes d’identité Linux, la propriété reste inconnue ; acquisition d’un verrou absent et libération vérifiée par nonce fonctionnent sur toutes les plateformes.

L’acquisition ne reprend un verrou existant que si son propriétaire local est confirmé inactif. Verrous inconnus, malformés ou anciens bloquent l’acquisition, même avec un ancien PID absent. Un processus interrompu sur une plateforme sans identité nécessite donc une investigation manuelle. La libération vérifie son nonce et ne supprime pas intentionnellement le verrou d’un nouveau propriétaire. Un PID apparemment périmé ne suffit pas pour supprimer un verrou.

Consultez aussi la [rétention et les quotas](../storage-retention/) pour planifier un nettoyage explicite.

## Inspecter l’activité des sandboxes

Les sandboxes créées par `createSandbox`, les méthodes d’un workspace, dispatch ou attach enregistrent leur cycle de vie dans `.outpost/locks/resource-activity`. Inspectez ces enregistrements sans contacter les fournisseurs :

```sh
outpost recovery inspect --repository /path/to/repository --resources --json
```

```ts
import { inspectRecovery } from "@elie-laloum/outpost";

const report = await inspectRecovery({
  repository: "/path/to/repository",
  resources: true,
});
for (const entry of report.resources?.entries ?? []) {
  console.log(entry.record?.phase, entry.record?.operations, entry.ownership);
}
```

Chaque enregistrement contient un identifiant unique du propriétaire de la sandbox, le PID, l’identité Linux du processus lorsqu’elle est disponible, le nom et le placement du fournisseur, le chemin du workspace, les dates et une phase : `allocating`, `ready`, `closing`, `cleanup-failed` ou `allocation-uncertain`. Les dispatchs, attachements, diagnostics et commandes actifs sont listés avec les invocations, uploads, téléchargements et opérations de manifeste ou téléchargement groupé sous-jacents. Les opérations terminées ou échouées ne conservent que le dernier résultat et le dernier échec ; les enregistrements ne contiennent ni commandes, prompts, chemins de transfert, identifiants secrets ni messages d’exception. `completed` signifie que l’appel a retourné ; une commande peut avoir un code de sortie non nul.

Les fichiers (0600) et dossiers (0700) sont privés lorsque la plateforme le permet. Les limites sont de 64 Kio par enregistrement, un compteur actif par type d’opération et 10 000 enregistrements conservés par checkout. L’inscription refuse de dépasser cette limite et ne supprime jamais d’anciens enregistrements pour libérer de la place. Les mises à jour atomiques évitent la lecture d’enregistrements partiellement écrits. L’inscription partage le verrou de mutation des réservations de stockage et les octets d’activité sont comptés dans l’inventaire. Les réservations ne réservent pas une taille maximale fixe pour les futures mises à jour d’activité.

La fermeture réussie supprime son propre enregistrement tout en laissant ouverts les workspaces appartenant à l’appelant. Un échec de nettoyage du fournisseur conserve l’enregistrement et le workspace possédé. Si l’allocation a commencé sans retourner de bail, le nettoyage ne peut pas être confirmé : `allocation-uncertain` conserve l’enregistrement et le workspace possédé, même pour une simple erreur d’allocation. La rétention protège les enregistrements d’activité et les workspaces qu’ils référencent, même si le propriétaire enregistré est inactif ou inconnu. Des enregistrements illisibles empêchent par prudence l’élagage des workspaces propres. L’investigation et le nettoyage éventuel chez le fournisseur restent explicites.

`resources: { scope: "recorded-sandboxes", complete, entries, issues }` est une observation supplémentaire. Chaque entrée inclut l’enregistrement lisible et un statut/motif `ownership` suivant les mêmes règles d’identité locale que l’inspection des verrous. `complete` décrit la lisibilité des enregistrements, pas la certitude de propriété ni l’état du fournisseur. L’inspection est limitée au minimum de `--max-entries` et 10 000 enregistrements, indépendamment du budget d’inventaire du stockage. Les enregistrements malformés, trop volumineux, changeants, symboliques ou illisibles produisent un rapport partiel et un code de sortie CLI 1 ; les propriétaires inactifs ou incertains restent signalés sans suppression. Le champ global `activity` reste `unverified`.

Les appels directs à `provider.acquire()` sont hors de ce registre. Celui-ci ne découvre pas les conteneurs ou ressources cloud non enregistrés, n’expose pas leurs identifiants fournisseur, ne sonde pas leur disponibilité distante, ne fournit pas de baux distribués et ne récupère pas automatiquement les ressources. Un processus inactif peut avoir laissé une sandbox distante facturable ; inspectez le compte du fournisseur avant de décider quoi supprimer.
