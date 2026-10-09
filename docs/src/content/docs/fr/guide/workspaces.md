---
title: "Workspaces"
description: "Choisir une source Git, un dossier ou une racine éphémère et gérer son cycle de vie."
---

Un workspace fournit les fichiers de travail ; une sandbox exécute les commandes et les agents. Choisissez la source selon les fichiers disponibles et la manière de récupérer les changements.

## Choisir une source

| Source                   | Utilisation                                       | Récupérer les changements                               |
| ------------------------ | ------------------------------------------------- | ------------------------------------------------------- |
| `git`                    | Dépôt existant, historique et branches            | Conserver une branche ou intégrer ses commits           |
| `directory` avec copie   | Traiter un dossier en gardant sa source intacte   | Publier les fichiers sélectionnés vers une destination  |
| `directory` avec montage | Exposer la source sous un sous-répertoire déclaré | Les écritures d'un montage inscriptible sont immédiates |
| `ephemeral`              | Commencer avec une racine vide                    | Publier les fichiers produits ou conserver un snapshot  |

Les appels Git existants conservent leurs defaults. Les sources de dossier et éphémères sont implémentées localement et non publiées. Utilisez `createWorkspace()` pour ouvrir une source déclarée, `workspaceSource` pour laisser un wrapper allouer la ressource, ou `workspace` pour emprunter une ressource déjà ouverte. Les callbacks, décisions et workflows JSON sans fichiers utilisent directement le moteur de workflows.

## Séparer workspace et sandbox

Un workspace sert une seule sandbox à la fois et peut être réutilisé après sa fermeture. Fermez la sandbox avant le workspace. Une sandbox qui emprunte un workspace laisse sa fermeture au caller ; les wrappers qui allouent leurs ressources gèrent leur cycle de vie. La page [Fonctionnement](../how-it-works/) détaille cette propriété.

## Workspaces Git

Git est requis pour ces sources. Les branches, commits, guards, intégration et résolution de conflits suivent les contrats existants.

### Choisir le dépôt de travail

Passez `repository` pour choisir le dépôt Git utilisé par la tâche. Vos scripts de workflow peuvent se trouver ailleurs ; calculez le chemin du dépôt à partir du dossier du script pour pouvoir le lancer depuis n’importe quel répertoire courant.

```ts
import { reportValue } from "./reporter.ts";
import { resolve } from "node:path";
import { dispatch } from "@elie-laloum/outpost";
import { coder, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository: resolve(import.meta.dirname, "../application"),
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/update-deps" },
  brief: { text: "Update the outdated dependencies and commit the change." },
});
reportValue(result.branch, result.commits.length);
// Example output: outpost/update-deps 1
```

Le script affiche `outpost/update-deps` et le nombre de commits. Un chemin relatif se résout depuis le répertoire courant : le résoudre depuis `import.meta.dirname` permet de lancer le script de n’importe où.

### Choisir la stratégie de branche

Gardez le travail sur une branche nommée pour examiner les commits avant de les fusionner. Choisissez l’intégration automatique si une tâche réussie doit fusionner ses commits dans votre branche de départ.

Référence API : [BranchPolicy](../../reference/branchpolicy/).

### Refuser les changements commités indésirables

Définissez un `guard` sur le workspace pour refuser les chemins protégés ou un diff commité final trop volumineux, indépendamment de l’agent. Ce dispatch intègre uniquement si les deux règles passent. Un refus lève `OutpostError` avec le code `guard`, libère la sandbox et conserve la branche et le worktree pour relecture.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Fix the failing tests and commit the fix." },
  branch: { mode: "integrate" },
  guard: {
    protectedPaths: [".github/**", "migrations/**"],
    maxChangedLines: 800,
  },
});
```

Le compte additionne les lignes ajoutées et supprimées ; un total de 800 est accepté. Les renommages détectés sans changement de contenu comptent zéro ligne, mais les deux chemins sont vérifiés. Avec un seuil de lignes, les changements binaires sont refusés car Git ne peut pas compter leurs lignes. Consultez [DiffGuard](../../reference/diffguard/) pour la syntaxe des motifs et les options.

Le contrôle s’exécute après synchronisation puis sous le verrou d’intégration, avant de fusionner le commit inspecté. Il inclut les changements hérités via `branch.from`, depuis l’ancêtre commun avec la branche hôte. En mode `named`, il vérifie depuis le commit d’ouverture du workspace au fil des exécutions. `current` est refusé avant exécution. Configurez `guard` dans `openWorkspace()` si vous fournissez un workspace existant ; les agents successifs partagent sa politique.

Seul le diff commité final est contrôlé : un fichier protégé modifié puis restauré est accepté, et les fichiers non commités sont exclus. C’est une règle d’intégration, pas une permission sur le système de fichiers. Une inspection échouée ou incomplète refuse aussi l’intégration. Consultez `error.details` pour les violations et les commits comparés, et `recoveryDetails(error)` pour la branche et le répertoire conservés. Fermer le même workspace conserve un worktree refusé même sans `preserve: true`. Une passe ultérieure en échec n’annule pas les intégrations précédentes.

### Conditionner l’intégration à une vérification

`dispatch()` et `workspace.dispatch()` fusionnent une branche `integrate` dès que l’agent réussit. Pour lancer d’abord votre propre vérification, ouvrez le workspace vous-même et travaillez dans une [session de sandbox](../sandbox-sessions/).

<!-- tabs -->

```ts title="change.ts"
import type { Workspace } from "@elie-laloum/outpost";
import { sandboxProvider, coder } from "./outpost.config.ts";

export async function change(workspace: Workspace) {
  await using sandbox = await workspace.sandbox({
    sandboxProvider,
    agent: coder,
  });
  await sandbox.dispatch({
    brief: { text: "Fix the failing tests and commit the fix." },
  });
  const check = await sandbox.command({
    executable: "npm",
    arguments: ["test"],
  });
  if (check.status !== 0) throw new Error(check.stderr || "Tests failed");
}
```

```ts title="integrate.ts"
import { openWorkspace } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";
import { change } from "./change.ts";

export const workspace = await openWorkspace({
  repository,
  branch: { mode: "integrate" },
});
try {
  await change(workspace);
  await workspace.integrate();
} finally {
  await workspace.close();
}
```

`sandbox.dispatch()` ne fusionne jamais : la fusion n’a lieu que si `npm test` réussit. Sinon, la branche non fusionnée reste dans votre dépôt sous `workspace.branch`. `integrate()` ne fait rien dans les autres modes.

### Résoudre les conflits de fusion avec un agent

Activez `onConflict` pour intégrer une branche de fonctionnalité existante via une branche dédiée à la résolution. Fermez toute sandbox du workspace source avant l’appel. `branch.from` choisit le commit à intégrer ; le checkout hôte porte la branche cible. Une fusion sans conflit Git n’exécute ni l’agent ni la commande de vérification.

```ts
import { createAgentConflictResolver } from "@elie-laloum/outpost";
import { coder, sandboxProvider } from "./outpost.config.ts";
import { openWorkspace } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";

await using workspace = await openWorkspace({
  repository,
  branch: { mode: "integrate", from: "feature/to-integrate" },
});

const resolution = await workspace.integrate({
  onConflict: createAgentConflictResolver(coder, {
    sandboxProvider,
    verify: { executable: "npm", arguments: ["test"] },
  }),
});
```

Outpost fige les commits source et hôte, ouvre un worktree nommé séparé et prépare la fusion conflictuelle dans la sandbox du provider explicite. L’agent doit la résoudre et la commiter. Outpost exécute ensuite `npm test` sur ce commit combiné, exige le statut zéro et refuse les changements non ignorés non commités ou un commit modifié pendant la vérification. Installez d’abord les dépendances de test du projet dans l’environnement choisi ; la stratégie ne les installe pas automatiquement.

Avant intégration, Outpost vérifie que les deux branches d’origine pointent toujours sur les commits figés, que le checkout hôte est propre et que la résolution contient les deux commits. Le `guard` du workspace source est revérifié sur le diff final de résolution. Outpost avance la branche hôte jusqu’au commit exact vérifié sous le verrou d’intégration. Il ne pousse jamais.

En cas d’échec, d’annulation ou de dépassement du délai, le mécanisme de résolution ne déplace pas les branches d’origine. Les worktrees source et de résolution restent disponibles ; `recoveryDetails(error)` identifie la branche et le dossier de résolution et comprend `sourceBranch` et `sourceDirectory`. Inspectez-les avant de réessayer. Les métadonnées Git montées sont accessibles en écriture à l’agent : ces contrôles sont des garanties d’intégration pour du code coopératif, pas une frontière de sécurité adversariale.

Le résultat optionnel `resolution` contient le commit vérifié, la sortie de commande et l’usage de l’agent de résolution. Ajoutez cet usage à votre comptabilité de workflow : il est séparé de celui de la tâche initiale. Un worktree propre après réussite peut être supprimé ; sa branche et la conversation capturée restent. Le délai total vaut dix minutes par défaut, et celui de vérification cinq minutes à l’intérieur du total. La stratégie effectue un dispatch sans boucle automatique de réparation.

Un [`ConflictResolver`](../../reference/conflictresolver/) personnalisé reçoit le même workspace séparé, doit renvoyer un résultat commité et vérifié et fermer sa sandbox. Un hôte sale, une branche hôte changée ou un refus du garde-fou de diff ne le déclenchent pas. Les tests déterministes Git, distant simulé et Docker réel en modes monté et isolé couvrent la stratégie ; la validation réelle des agents CLI et du cloud reste à effectuer.

API : [createAgentConflictResolver](../../reference/createagentconflictresolver/) · [IntegrationOptions](../../reference/integrationoptions/) · [ConflictResolution](../../reference/conflictresolution/).

### Réutiliser un workspace pour plusieurs sandboxes

Un workspace ouvert possède le dépôt, la branche et les fichiers copiés. `workspace.dispatch()` et `workspace.sandbox()` démarrent à chaque appel une nouvelle sandbox sur ce workspace : deux agents peuvent ainsi travailler à tour de rôle sur la même branche. Passer `workspace` à [`createSandbox()`](../../reference/createsandbox/) ou à `dispatch()` revient au même.

Un workspace sert une seule sandbox à la fois. Fermez la sandbox avant le workspace : la page [Fonctionnement](../how-it-works/) indique qui ferme quoi.

### Copier des fichiers ignorés dans le worktree

Un nouveau worktree ne contient que les fichiers commités. `copies` liste des fichiers ou dossiers, relatifs au dépôt, à copier depuis votre checkout, par exemple une configuration de test ignorée par Git.

```ts
import { reportValue } from "./reporter.ts";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/e2e" },
  copies: [".env.test"],
  brief: { text: "Run the end-to-end tests and fix what fails." },
});
reportValue(result.retainedDirectory);
// Example output: /project/.outpost/workspaces/…
```

Les entrées absentes sont ignorées. Les sandboxes cloud reçoivent les commits et les `copies` ; `includeUncommitted: true` envoie aussi les fichiers non commités du worktree ([Sandboxes cloud](../cloud-sandboxes/)). Sans cette option, une copie qu’aucun `.gitignore` commité n’exclut fait échouer la première synchronisation avec le code `workspace`.

### Récupérer le travail conservé

La fermeture conserve le worktree s’il contient des fichiers non commités, non suivis ou ignorés, ou un `HEAD` détaché. Son chemin revient dans `retainedDirectory`. Ici, le `.env.test` copié suffit à le conserver.

`close({ preserve: true })` le conserve volontairement. Inspectez le travail conservé avec [Récupérer du travail](../recovery/) et élaguez-le avec [Rétention et nettoyage](../retention/).

### Limites

- L’intégration est un `git merge` local dans votre checkout. Outpost ne pousse jamais : publiez depuis votre propre processus de livraison.
- `integrate` exige une branche extraite, pas un `HEAD` détaché, et échoue avec `conflict` si vous changez de branche avant la fusion.
- Une fusion arrêtée par un conflit échoue avec `conflict` ; résolvez-la ou annulez-la dans votre checkout. La branche de travail reste.
- Une deuxième tâche sur le même checkout (`current`) ou la même branche échoue avec `conflict` au lieu d’attendre. Donnez à chaque tâche parallèle sa propre branche.
- Une branche `named` extraite dans votre propre checkout échoue avec `conflict`.
- `copies` exige `named` ou `integrate`, et les sandboxes cloud refusent `current`.
- Une sandbox travaille sur un seul dépôt : voir [Plusieurs dépôts](../multiple-repositories/).

API : [dispatch](../../reference/dispatch/) · [openWorkspace](../../reference/openworkspace/) · [BranchPolicy](../../reference/branchpolicy/) · [WorkspaceOptions](../../reference/workspaceoptions/) · [Workspace](../../reference/workspace/).

## Workspaces de fichiers

Un workspace `ephemeral` commence vide. Une source `directory` copie par défaut les fichiers ordinaires, en excluant `.git`, `.outpost` et le répertoire de contrôle du run. La sélection de copie n'applique pas `.gitignore`. Les entrées JSON restent des paramètres ; les entrées de dossier ou de snapshot explicitement déclarées fournissent des fichiers.

Les nouvelles copies, snapshots et publications préservent les contenus binaires, les permissions portables, les dossiers vides et les liens relatifs dont la cible reste dans la sélection. La validation développe les aliases capturés avant de traiter les segments parents ; les cibles absentes et les aliases exclus sont refusés. Le parcours ne suit pas les liens. Les liens sortants et les fichiers spéciaux sont refusés. Un montage expose toute sa source et ne peut pas déclarer une sélection de copie.

### Exécuter une commande dans un workspace éphémère

Créez une racine vide avec une conservation locale pour retrouver les fichiers après la fermeture.

```ts title="empty-workspace.ts"
import { createWorkspace } from "@elie-laloum/outpost";

export function openEmptyWorkspace() {
  return createWorkspace({
    source: { kind: "ephemeral" },
    runtime: { directory: "./.outpost", namespace: "documents" },
    retention: { policy: "local" },
  });
}
```

Exécutez la commande et vérifiez son statut de sortie.

```ts title="ephemeral.ts"
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";
import { openEmptyWorkspace } from "./empty-workspace.ts";

await using workspace = await openEmptyWorkspace();
await using sandbox = await workspace.sandbox({
  sandboxProvider: createDockerSandboxProvider({ image: "node:24-slim" }),
});
const result = await sandbox.command({
  executable: "node",
  arguments: ["-e", "require('fs').writeFileSync('result.json', '{}')"],
});
if (result.status !== 0) throw new Error(result.stderr);
```

Ce script crée `result.json` dans `workspace.directory`. La conservation `local` garde ce dossier après réussite ou échec. La section suivante présente la publication vers une destination.

Les workspaces TypeScript de fichiers utilisent par défaut `.outpost` sous le répertoire courant. L'exécution Git legacy conserve `<repository>/.outpost`. Les modes de fichiers ne recherchent pas de dépôt et ne chargent pas les variables d'environnement d'un `.env` du dossier de données.

Docker et Podman nécessitent Node.js 24+, le moteur choisi et `tar` sur l'hôte pour les transferts streamés actuels. L'image de conteneur est explicite. Git est nécessaire uniquement pour les fonctionnalités Git ou une commande choisie par le caller. Un workflow sans opération de sandbox peut utiliser directement le moteur de workflows.

### Copier puis restituer un dossier

Ouvrez une copie possédée du dossier source pour conserver ses fichiers pendant le traitement.

```ts title="documents.ts"
import { createWorkspace } from "@elie-laloum/outpost";

export function openDocuments() {
  return createWorkspace({
    source: {
      kind: "directory",
      directory: "./documents",
      access: { mode: "copy" },
    },
    runtime: { directory: "./.outpost" },
  });
}
```

Déclarez la sélection et les suppressions autorisées pour la restitution vers la source.

```ts title="publication.ts"
import {
  publishWorkspaceOutputs,
  type FileWorkspace,
} from "@elie-laloum/outpost";

export function publishDocuments(workspace: FileWorkspace) {
  return publishWorkspaceOutputs(workspace, {
    paths: ["**/*.json"],
    destination: "./documents",
    policy: "update",
    deleteMissing: true,
  });
}
```

Placez votre script `process.js` dans `documents/`, puis exécutez ce fichier avec Node.js 24+ après avoir installé Outpost.

```ts title="process-documents.ts"
import { createSandbox } from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";
import { openDocuments } from "./documents.ts";
import { publishDocuments } from "./publication.ts";

await using workspace = await openDocuments();
const sandboxProvider = createDockerSandboxProvider({ image: "node:24-slim" });
await using sandbox = await createSandbox({ workspace, sandboxProvider });
await sandbox.command({ executable: "node", arguments: ["process.js"] });
await sandbox.close({ preserve: true });
await publishDocuments(workspace);
```

La source reste inchangée pendant le travail sur la copie. `create` exige une destination nouvelle ; `update` vérifie une destination capturée avant l'exécution. Pour une publication vers la source copiée, la capture initiale fournit cet état attendu. Les autres destinations nécessitent `prepareWorkspaceOutputs()` avant d'ouvrir la sandbox.

Les chemins relatifs sont conservés depuis la racine du workspace : sélectionner `output/result.json` publie `output/result.json`, sans supprimer `output/`. `deleteMissing` vaut false par défaut. Son activation supprime uniquement les fichiers sélectionnés de la destination initiale dont la sortie correspondante manque ; les fichiers apparus ensuite ou hors sélection restent conservés.

La publication valide et prépare toutes les sorties avant mutation, journalise le plan via Transport et déplace les entrées existantes dans une quarantaine du même filesystem. L'installation refuse une destination recréée entre-temps. En cas d'échec, le rollback suit l'ordre inverse et restaure uniquement les entrées correspondant encore aux effets d'Outpost. Les changements externes et les sauvegardes nécessaires restent récupérables. La publication est récupérable sur plusieurs opérations ; elle ne remplace pas atomiquement un arbre entier. Les transformations ambiguës fichier/dossier sont refusées.

La fermeture d'une primitive de workspace ou de sandbox ne publie rien par elle-même. Les wrappers de dispatch publient leurs sorties déclarées après succès et après arrêt des opérations de sandbox.

### Monter une source explicitement

Déclarez le sous-répertoire exposé et choisissez explicitement si la sandbox peut écrire dans la source.

```ts title="mounted-documents.ts"
import { createWorkspace } from "@elie-laloum/outpost";

export function openMountedDocuments() {
  return createWorkspace({
    source: {
      kind: "directory",
      directory: "./documents",
      access: { mode: "mount", target: "input", readOnly: false },
    },
  });
}
```

La racine de travail possédée reste distincte ; la source apparaît sous `input/`. `readOnly: true` empêche la sandbox de la modifier. Un montage inscriptible modifie immédiatement la source. Le cleanup de la sandbox ou du workspace ne la supprime pas et n'annule pas ces modifications. La restitution vers une source montée en écriture est refusée ; publier les fichiers produits dans la racine possédée vers une autre destination reste possible.

Les verrous communs à l'hôte coordonnent les sources et les destinations qui se chevauchent, entre différentes racines de runtime pour un même utilisateur. Deux montages qui se chevauchent sont refusés si l'un est inscriptible. La capture d'une copie est refusée lorsqu'un writer Outpost possède la source. Les chemins canoniques, les aliases connus et les relations parent/enfant participent aux contrôles. Ces verrous coordonnent les processus Outpost coopérants ; les modifications externes sont détectées et préservées.

### Conserver et reprendre les fichiers

La conservation `run` nettoie après succès ; `local` conserve aussi les matérialisations réussies ; `portable` conserve des snapshots validés avec un Transport et un namespace explicites. Le checkpoint de workflow conserve la progression, le snapshot conserve des fichiers. Leurs responsabilités restent séparées.

```ts title="portable-workspace.ts"
import { createWorkspace, createLocalTransport } from "@elie-laloum/outpost";

export function openPortableWorkspace() {
  return createWorkspace({
    source: { kind: "ephemeral" },
    runtime: { directory: "./.outpost", namespace: "documents" },
    retention: {
      policy: "portable",
      transporter: createLocalTransport({ directory: "./conserved" }),
    },
  });
}
```

Le Transport local de cet exemple est portable seulement si son stockage reste accessible au worker suivant. Pour un autre hôte, fournir explicitement un Transport partagé. Un namespace dérivé d'un chemin physique local ne suffit pas pour une restauration portable.

Après chaque commande ou tour d'agent terminé, Outpost synchronise les fichiers, conserve et vérifie la génération settled, puis enregistre sa description dans le checkpoint avant de publier la fin ou une pause. La comptabilité ne déclenche pas de snapshot pendant une opération active. La reprise locale vérifie le dossier physique, le marqueur de propriété et la génération settled ; un workspace perdu, remplacé ou modifié est refusé. La reprise portable restaure un snapshot vérifié dans une nouvelle racine possédée. Une source montée doit rester accessible et inchangée ; un snapshot ne convertit jamais un montage en copie.

Les tâches humaines utilisent `defineInteractiveAgentTask()` avec `workspaceSource`, un provider et un harness capable de capturer et reprendre une conversation. Elles conservent fichiers et conversation, ferment la sandbox avant la question et continuent dans un second processus sans rejouer les tours terminés. Les [tâches interactives](../interactive-tasks/) présentent les contrats question/réponse.

Un propriétaire interrompu nécessite une récupération explicite après arrêt de ses processus. `recoverFileWorkspace()` vérifie `expectedRevision` et `processesStopped: true`, avec `allocationReleased`, `adoptInterruptedFiles` ou `adoptMountedSource` optionnels. Inspecter d'abord les révisions avec `inspectFileWorkspace()`. La récupération d'ownership du checkpoint et l'autorisation de rejeu d'une tentative interrompue restent séparées. Un snapshot de fichiers ne prouve pas la destruction d'une sandbox distante à allocation incertaine.

Outpost enregistre une racine possédée avant de copier les entrées ou d’exécuter les hooks de préparation. Une préparation interrompue ou échouée conserve un enregistrement inspectable et ses fichiers partiels ; la restauration ordinaire la refuse. Après arrêt de ses processus, adopter explicitement ces fichiers avec `adoptInterruptedFiles` pour récupérer la ressource. Cette adoption ne relance pas la préparation et n’autorise pas le rejeu d’une tâche.

### Exécuter des jobs indépendants

Cette factory déclare une commande éphémère distincte pour chaque clé de tâche.

```ts title="file-task.ts"
import { defineIsolatedCommandTask } from "@elie-laloum/outpost";
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";

export function fileTask(key: string) {
  return defineIsolatedCommandTask({
    key,
    request: () => ({
      workspaceSource: { kind: "ephemeral" },
      sandboxProvider: createLocalSandboxProvider(),
      command: { executable: "node", arguments: ["-p", "process.cwd()"] },
    }),
  });
}
```

Exécutez les deux tâches ensemble ; leurs racines et leurs sandboxes restent distinctes.

```ts title="independent-files.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { fileTask } from "./file-task.ts";

const left = fileTask("left"),
  right = fileTask("right");
await defineWorkflow("independent-files", [left, right]).start({
  concurrency: 2,
});
```

Le provider local utilisé ici exécute directement sur l'hôte, sans isolation. Chaque tâche isolée possédée et chaque job de file reçoit une identité et une racine propres. Une sandbox partagée reste séquentielle. Les wrappers durables utilisent un coordinateur commun de checkpoints de workspaces. Les workspaces empruntés restent sous responsabilité du caller et ne deviennent pas automatiquement restaurables. Les caches de tâches contiennent des résultats JSON ; un hit ne reproduit pas des écritures de fichiers.

### Vérifier les capacités et récupérer une publication

| Environnement          | Copie / éphémère              | Montage de source                         |
| ---------------------- | ----------------------------- | ----------------------------------------- |
| Docker / Podman montés | Oui                           | Lecture seule ou écriture                 |
| Docker / Podman isolés | Transferts                    | Refus                                     |
| Local                  | Fichiers hôte, sans isolation | Refus                                     |
| Vercel / Daytona       | Transferts                    | Refus                                     |
| Firecracker            | Transferts expérimentaux      | Refus                                     |
| Memory testing         | Commandes scriptées           | Simulation seulement ; transferts refusés |

Le dispatch de fichiers prend en charge le harness Outpost et les adapters custom/scriptés compatibles. Dispatch CLI natif, attachement interactif, continuation, réparation et live input exigent une capacité déclarée et validée pour la variante épinglée de l'adapter. Les variantes natives non démontrées sont refusées. Les validations live cloud et Firecracker restent séparées. La restauration de fichiers n'ajoute pas une récupération automatique d'allocation abandonnée aux providers isolés ou cloud.

Branches, commits, guards Git, intégration, conflits et spéculation restent des fonctionnalités Git. Les résultats de fichiers utilisent `workspaceInfo` et `fileOutputs` ; les résultats Git conservent `branch` et `commits` obligatoires. Les rapports d'agent de fichiers utilisent la version 2 ; les rapports Git gardent la version 1. Sélectionner explicitement le filesystem avec `createHarnessFileTools({ selection: "filesystem" })` et `createHarnessSearchTools({ selection: "filesystem" })` ; les appels existants de ces outils sélectionnent Git par défaut.

```sh
outpost recovery inspect --runtime-directory ./.outpost --locks --json
outpost recovery workspace inspect --runtime-directory ./.outpost \
  --namespace documents --workspace-id WORKSPACE_ID --json
outpost recovery publication inspect --runtime-directory ./.outpost \
  --namespace documents --publication-id PUBLICATION_ID --json
outpost recovery publication rollback --runtime-directory ./.outpost \
  --namespace documents --publication-id PUBLICATION_ID --processes-stopped
```

Remplacer `rollback` par `finish` pour terminer une publication interrompue après vérification des préconditions actuelles. Ces actions ne rejouent jamais les tâches. Arrêter les processus propriétaires avant d'autoriser la récupération d'un verrou abandonné. Si l'interruption laisse la coordination du registre occupée, inspecter `recovery registry inspect` et récupérer sa révision exacte `DEVICE:INODE` seulement après arrêt de tous les processus coordinateurs. Conserver les sauvegardes lorsque des modifications concurrentes empêchent la récupération.

Pour une conservation portable, `restoreFileWorkspace()` reçoit le Transport déclaré et peut restaurer le snapshot validé dans une nouvelle matérialisation. La destination et la quarantaine d'une publication doivent rester accessibles ; un journal portable ne déplace pas ces chemins physiques. Cette restauration ne rejoue aucune tâche.
