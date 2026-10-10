---
title: "Publier les fichiers produits"
description: "Restituer les résultats sélectionnés et récupérer une publication interrompue."
---

Travaillez sur une [copie du dossier](../working-with-files/) pour garder la source intacte pendant le traitement. Publiez après avoir vérifié le résultat de la commande et fermé la sandbox. Un montage inscriptible modifie immédiatement la source ; une annulation de publication ne revient pas sur ces effets.

## Copier puis restituer un dossier

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
    runtime: { directory: "./.outpost", namespace: "documents" },
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

Créez `documents/` et enregistrez-y ce script `process.js`. Il écrit un inventaire JSON que vous pourrez examiner après publication.

```js title="process.js"
import { readdir, writeFile } from "node:fs/promises";

const files = await readdir(".");
await writeFile("summary.json", JSON.stringify({ files }, null, 2));
```

Enregistrez les fichiers TypeScript dans le dossier parent et lancez `node process-documents.ts`. En cas de réussite, `documents/summary.json` contient la liste des fichiers copiés.

```ts title="process-documents.ts"
import { createSandbox } from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";
import { openDocuments } from "./documents.ts";
import { publishDocuments } from "./publication.ts";

await using workspace = await openDocuments();
const sandboxProvider = createDockerSandboxProvider({ image: "node:24-slim" });
await using sandbox = await createSandbox({ workspace, sandboxProvider });
const result = await sandbox.command({
  executable: "node",
  arguments: ["process.js"],
});
if (result.status !== 0) throw new Error(result.stderr || "Processing failed");
await sandbox.close({ preserve: true });
await publishDocuments(workspace);
```

La source reste inchangée pendant le travail sur la copie. `create` exige une destination nouvelle ; `update` vérifie une destination capturée avant l'exécution. Pour une publication vers la source copiée, la capture initiale fournit cet état attendu. Les autres destinations nécessitent `prepareWorkspaceOutputs()` avant d'ouvrir la sandbox.

Les chemins relatifs sont conservés depuis la racine du workspace : sélectionner `output/result.json` publie `output/result.json`, sans supprimer `output/`. `deleteMissing` vaut false par défaut. Son activation supprime uniquement les fichiers sélectionnés de la destination initiale dont la sortie correspondante manque ; les fichiers apparus ensuite ou hors sélection restent conservés.

La publication valide et prépare toutes les sorties avant mutation, journalise le plan via Transport et déplace les entrées existantes dans une quarantaine du même filesystem. L'installation refuse une destination recréée entre-temps. En cas d'échec, le rollback suit l'ordre inverse et restaure uniquement les entrées correspondant encore aux effets d'Outpost. Les changements externes et les sauvegardes nécessaires restent récupérables. La publication est récupérable sur plusieurs opérations ; elle ne remplace pas atomiquement un arbre entier. Les transformations ambiguës fichier/dossier sont refusées.

La fermeture d'une primitive de workspace ou de sandbox ne publie rien par elle-même. Les wrappers de dispatch publient leurs sorties déclarées après succès et après arrêt des opérations de sandbox.

## Récupérer une publication interrompue

Inspectez d’abord la publication. Remplacez `PUBLICATION_ID` par l’identifiant du journal conservé ; `documents` est le namespace de cet exemple.

```sh
outpost recovery publication inspect --runtime-directory ./.outpost \
  --namespace documents --publication-id PUBLICATION_ID --json
```

Arrêtez les processus propriétaires et confirmez leur fin avant d’autoriser la récupération. Pour annuler les effets de la publication :

```sh
outpost recovery publication rollback --runtime-directory ./.outpost \
  --namespace documents --publication-id PUBLICATION_ID --processes-stopped
```

Utilisez `finish` à la place de `rollback` pour terminer la publication après examen. Ces commandes ne rejouent aucune tâche. Si des changements concurrents empêchent la récupération, gardez les sauvegardes pour un traitement manuel.

La destination et le répertoire de sauvegarde doivent rester accessibles à leurs chemins d’origine : un journal portable ne déplace pas ces fichiers. Si le registre reste verrouillé, inspectez `recovery registry inspect` et récupérez sa révision exacte `DEVICE:INODE` seulement après l’arrêt de tous les processus qui le coordonnent.

Pour restaurer le workspace lui-même, suivez [la reprise des fichiers](../resuming-file-workspaces/).
