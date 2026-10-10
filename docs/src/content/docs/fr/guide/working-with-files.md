---
title: "Exécuter sans dépôt Git"
description: "Traiter un dossier copié, un montage explicite ou un espace vide."
---

:::note[Compatibilité des agents]
Les variantes d’agents CLI doivent démontrer leur compatibilité avec le mode fichiers ; les autres sont refusées.
:::

Installez Outpost dans un projet ESM avec Node.js 24+. L’exemple de commande utilise Docker et `node:24-slim`, sans connexion à un agent ni dépôt Git.

Téléchargez l’image avant d’ouvrir la sandbox ; Outpost vérifie sa présence locale.

```sh
docker pull node:24-slim
```

Un workspace `ephemeral` commence vide. Une source `directory` copie par défaut les fichiers ordinaires, en excluant `.git`, `.outpost` et le répertoire de contrôle du run. La sélection de copie n'applique pas `.gitignore`. Les entrées JSON restent des paramètres ; les entrées de dossier ou de snapshot explicitement déclarées fournissent des fichiers.

Les nouvelles copies, snapshots et publications préservent les contenus binaires, les permissions portables, les dossiers vides et les liens relatifs dont la cible reste dans la sélection. La validation développe les aliases capturés avant de traiter les segments parents ; les cibles absentes et les aliases exclus sont refusés. Le parcours ne suit pas les liens. Les liens sortants et les fichiers spéciaux sont refusés. Un montage expose toute sa source et ne peut pas déclarer une sélection de copie.

## Exécuter une commande dans un workspace éphémère

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
console.log(workspace.directory);
```

Ce script crée `result.json` dans `workspace.directory`. La conservation `local` garde ce dossier après réussite ou échec. La page [Publier les fichiers produits](../publishing-files/) montre comment copier les résultats vers une destination.

Les workspaces TypeScript de fichiers utilisent par défaut `.outpost` sous le répertoire courant. L'exécution Git legacy conserve `<repository>/.outpost`. Les modes de fichiers ne recherchent pas de dépôt et ne chargent pas les variables d'environnement d'un `.env` du dossier de données.

Docker et Podman nécessitent Node.js 24+, le moteur choisi et `tar` sur l'hôte pour les transferts streamés actuels. L'image de conteneur est explicite. Git est nécessaire uniquement pour les fonctionnalités Git ou une commande choisie par le appelant. Un workflow sans opération de sandbox peut utiliser directement le moteur de workflows.

## Monter une source explicitement

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

## Vérifier l’environnement d’exécution

| Environnement          | Copie / éphémère              | Montage de source                         |
| ---------------------- | ----------------------------- | ----------------------------------------- |
| Docker / Podman montés | Oui                           | Lecture seule ou écriture                 |
| Docker / Podman isolés | Transferts                    | Refus                                     |
| Local                  | Fichiers hôte, sans isolation | Refus                                     |
| Vercel / Daytona       | Transferts                    | Refus                                     |
| Firecracker            | Transferts expérimentaux      | Refus                                     |
| Memory testing         | Commandes scriptées           | Simulation seulement ; transferts refusés |

Le dispatch de fichiers prend en charge le harness Outpost et les adapters custom/scriptés compatibles. Dispatch CLI natif, attachement interactif, continuation, réparation et live input exigent une capacité déclarée et validée pour la variante épinglée de l'adapter. Les variantes natives non démontrées sont refusées. Les validations live cloud et Firecracker restent séparées. La restauration de fichiers n'ajoute pas une récupération automatique d'allocation abandonnée aux fournisseurs isolés ou cloud.

Branches, commits, guards Git, intégration, conflits et spéculation restent des fonctionnalités Git. Les résultats de fichiers utilisent `workspaceInfo` et `fileOutputs` ; les résultats Git conservent `branch` et `commits` obligatoires. Les rapports d'agent de fichiers utilisent la version 2 ; les rapports Git gardent la version 1. Sélectionner explicitement le filesystem avec `createHarnessFileTools({ selection: "filesystem" })` et `createHarnessSearchTools({ selection: "filesystem" })` ; les appels existants de ces outils sélectionnent Git par défaut.

## Pour continuer

- [Publier les fichiers produits](../publishing-files/)

## Pour aller plus loin

- [Conserver et reprendre les fichiers](../resuming-file-workspaces/)
- [Exécuter des tâches de fichiers indépendantes](../queued-workflows/)

<span id="conserver-et-reprendre-les-fichiers"></span>

<span id="exécuter-des-jobs-indépendants"></span>

<span id="vérifier-les-capacités-et-récupérer-une-publication"></span>
