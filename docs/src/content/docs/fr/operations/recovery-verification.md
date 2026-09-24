---
title: "Vérifier une récupération"
description: "Contrôler la structure, les empreintes et les objets Git sans modifier le dépôt."
sidebar:
  order: 2
---

Commencez par [inspecter les données conservées](../recovery/).

## Vérifier la structure d’un transfert conservé

Utilisez la commande `recovery verify`, disponible depuis 3.0.0, sur un dossier de transfert distant précis, celui contenant `state.json` (normalement `.outpost/recovery/<session>/<transfert>`) :

```sh
node src/cli/main.ts recovery verify --directory /chemin/du/transfert/conserve
node src/cli/main.ts recovery verify --directory /chemin/du/transfert/conserve --json
```

Le dossier peut avoir été déplacé et ne doit pas nécessairement appartenir à un checkout Git. Cette commande vérifie le format actuel produit par `backupHost`, pas le dossier de session parent, les magasins de conversations ni les workspaces orphelins. Un transfert interrompu avant la sauvegarde hôte peut légitimement ne pas avoir de `state.json` ; un échec indique une structure incomplète ou non vérifiable, pas une preuve de corruption.

Par défaut, la commande lit uniquement `state.json`, limité à 64 Kio. Elle exige les identifiants de commits `previous` et `next` au même format hexadécimal de 40 ou 64 caractères, ainsi que les tableaux `previousExtras` et `incoming`, limités chacun à 1 000 chemins relatifs uniques. Chemins ou composants vides, composants point, remontées vers un parent, chemins de métadonnées Git et chemins avec racine POSIX/Windows sont refusés avant l’examen des références. Les champs supplémentaires inconnus sont ignorés et jamais affichés.

Elle vérifie ensuite les métadonnées des trois fichiers ordinaires requis `remote.patch`, `previous.patch` et `previous-index.patch`, ainsi que `commits.bundle` lorsque `previous` diffère de `next`. Les patches vides sont valides. Chaque fichier référencé doit exister sous `previous-files` ou `incoming` comme fichier ordinaire ou lien symbolique final. Les liens finaux sont signalés `SYMLINK_PRESENT` sans lire leur cible ; les liens parents et les fichiers state/patch/bundle symboliques sont refusés. Les fichiers non référencés restent hors du contrôle.

Le code `0` signifie que la structure attendue est présente. Le code `1` indique une vérification en échec ou une invocation invalide. Le JSON contient `directory`, `scope: "transfer-structure"`, `complete`, `integrity: "unverified"` et `checks` (`path`, `status`, `code`). Contenus bruts des métadonnées, patches, fichiers et bundles ne sont pas affichés. La vérification n’exécute aucune commande Git et ne modifie aucun fichier.

C’est une observation, pas un instantané atomique ni une preuve qu’une restauration fonctionnera. Contenus des patches/bundles, empreintes, permissions, disponibilité des commits, cohérence entre fichiers et activité restent non vérifiés. Même un bundle malformé peut réussir ce contrôle structurel si son fichier existe. La comparaison aux empreintes enregistrées est disponible séparément ci-dessous ; des vérifications Git isolées sont disponibles ci-dessous. Une restauration applicative complète reste hors de leur périmètre.

Essayez une démonstration temporaire depuis les sources :

```sh
node test/fixtures/recovery-verification.ts
```

Elle construit un transfert synthétique avec tous les fichiers attendus, vérifie le code `0`, retire un fichier référencé puis vérifie le code `1` avec `FILE_UNAVAILABLE`. La démonstration supprime uniquement son dossier temporaire et termine avec succès lorsque les deux résultats attendus sont observés.

## Vérifier les empreintes enregistrées du transfert

Les transferts distants depuis 3.0.0 enregistrent `checksums.json` après la sauvegarde hôte et avant l’application côté hôte. Il contient un manifeste SHA-256 versionné et non signé couvrant `state.json`, les trois patches du transfert, le bundle de commits requis et les fichiers référencés sous `previous-files` et `incoming`. Les fichiers sont hachés par blocs ; les liens symboliques enregistrent une empreinte du texte du lien, jamais du contenu de leur cible. Le manifeste enregistre aussi le type et le nombre d’octets. Les fichiers de session parents comme `initial.bundle` et les autres artefacts restent hors de ce manifeste.

La capture ajoute une lecture de chaque fichier couvert pendant la sauvegarde et publie atomiquement le manifeste terminé. Si elle échoue, la synchronisation s’arrête avant l’application côté hôte et conserve ses fichiers de récupération. La vérification ne crée ni ne répare de manifeste pour une sauvegarde existante.

Demandez explicitement la vérification des empreintes :

```sh
node src/cli/main.ts recovery verify --directory /chemin/du/transfert/conserve --checksums
node src/cli/main.ts recovery verify --directory /chemin/du/transfert/conserve --checksums --max-bytes 268435456 --json
```

La vérification des empreintes commence seulement si les contrôles structurels réussissent. Le manifeste doit couvrir exactement les chemins attendus sans doublons ; les chemins inattendus sont refusés avant le hachage. La lecture du manifeste est limitée à 1 Mio. Les empreintes de fichiers et de liens utilisent un budget cumulé de 1 Gio par défaut ; `--max-bytes` le modifie et exige `--checksums`. Les lectures des métadonnées state et manifeste, bornées séparément, sont hors de ce budget. Celui-ci repose sur les tailles observées, sans faire confiance aux tailles du manifeste. Fichiers changeants, entrées non prises en charge et budget épuisé arrêtent la vérification avec un échec explicite. Le hachage utilise des buffers fixes sans charger les sauvegardes entières en mémoire.

Le JSON `integrity` vaut `checksums-match` si toutes les entrées requises correspondent, `checksums-mismatch` si le hachage termine avec une divergence, et `unverified` si les contrôles n’ont pas été demandés ou n’ont pas pu terminer. Un objet optionnel `checksums` contient ses contrôles, son résultat d’intégrité, `bytesChecked` et `maxBytes`. `bytesChecked` compte les octets hachés avec succès. Toute divergence, manifeste absent/illisible/invalide, source indisponible ou limite dépassée fait échouer le contrôle demandé avec le code `1`. Les anciennes sauvegardes sans manifeste gardent le contrôle structurel par défaut ; demander les empreintes produit `CHECKSUMS_UNAVAILABLE`, jamais une correspondance supposée.

Un manifeste non signé concordant détecte une divergence avec les octets enregistrés ; il n’authentifie pas la sauvegarde et ne protège pas contre une réécriture conjointe des données et du manifeste. Il ne prouve pas non plus la validité des objets Git, l’applicabilité des patches, les permissions, la cohérence de capture, l’inactivité ou la réussite d’une restauration. L’empreinte d’un lien ne dit rien du contenu de sa cible. Aucun contenu ni aucune valeur d’empreinte n’est affiché dans le rapport.

Essayez une modification de même taille dans un transfert temporaire :

```sh
node test/fixtures/recovery-checksums.ts
```

Résultats attendus : `checksums-match` et code `0`, puis `CHECKSUM_MISMATCH`, `checksums-mismatch` et code `1` après modification d’un fichier sans changer sa taille. La démonstration nettoie son propre dossier temporaire.

## Vérifier la restauration Git en isolation

Ajoutez un dépôt explicite pour vérifier les objets et l’applicabilité des patches :

```sh
outpost recovery verify --directory /path/to/transfer --restorability --repository /path/to/repository
outpost recovery verify --directory /path/to/transfer --restorability --repository /path/to/repository --checksums --json
```

Ce mode copie les trois patches et le bundle requis, détecte les changements pendant la copie puis crée un clone temporaire avec ses propres objets. Il vérifie et importe `commits.bundle`, contrôle les commits avec `git cat-file` et `git fsck --strict`, puis vérifie et applique chaque patch indépendamment sur son commit enregistré. `previous-index.patch` est appliqué à l’index temporaire. HEAD, index, reflog, fichiers modifiés et enregistrements du dépôt choisi restent inchangés ; les ressources temporaires sont supprimées même en cas d’échec. La base d’objets source doit fournir les prérequis du bundle et les commits qu’il ne contient pas. Les dépôts partiels/promisor, superficiels ou avec des objets alternatifs sont refusés avec `SOURCE_UNSUPPORTED`. La vérification élimine les variables Git héritées, désactive la configuration Git globale/système, les hooks, fsmonitor et la maintenance automatique, et copie les objets locaux sans liens physiques ni réseau. Les filtres smudge configurés sur l’hôte ne sont pas exécutés.

Le JSON indique `scope: "transfer-restorability"`, des contrôles réussis `BUNDLE_OBJECTS_VALID`, `COMMIT_OBJECTS_VALID` et `PATCH_APPLIES`, ou un échec identifié par étape. Il ne reconstruit pas les fichiers supplémentaires, la cohérence index/worktree initiale, les patches de session parents, les dépôts de sous-modules, les dépendances externes ni l’état du provider. Il ne certifie pas une restauration applicative complète. Le contrôle structurel reste le défaut ; les empreintes restent une comparaison d’intégrité non signée distincte. Les commandes Git ont un délai limite, mais l’espace temporaire du clone/checkout n’est pas borné par le budget des empreintes. Utilisez des dépôts fiables et assez d’espace temporaire.

Démonstration autonome depuis les sources :

```sh
node test/fixtures/recovery-storage.ts
```

Elle crée son dépôt temporaire, vérifie un véritable patch, montre la simulation puis la suppression explicite et confirme qu’un artefact protégé empêche un quota de zéro octet. Elle supprime uniquement ses propres ressources temporaires.
