---
title: "Conserver et reprendre un workspace de fichiers"
description: "Conservez un workspace de fichiers pour un processus ultérieur."
---

Conservez un [workspace de fichiers](../working-with-files/) pour un processus ultérieur. Le checkpoint enregistre la progression du workflow ; le snapshot enregistre les fichiers.

## Choisir ce qui sera conservé

- `run` : nettoyer les fichiers possédés après succès.
- `local` : les garder sur cette machine.
- `portable` : conserver aussi des snapshots vérifiés via un transport et un namespace explicites.

Utilisez cette fonction à la place d’`openEmptyWorkspace()` dans l’exemple de workspace de fichiers.

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

Le worker suivant doit pouvoir lire `./conserved`. Sur un autre hôte, utilisez un stockage partagé et gardez le namespace explicite `documents` ; un nom dérivé d’un chemin local ne suffit pas.

## Reprendre le travail enregistré

Après une commande ou un tour d’agent, Outpost synchronise et vérifie les fichiers avant d’enregistrer la fin ou la pause. La reprise locale refuse des fichiers perdus, remplacés ou modifiés. La reprise portable restaure un snapshot vérifié dans un nouveau répertoire possédé. Les sources montées doivent rester accessibles et inchangées : un snapshot ne transforme pas un montage en copie.

Les [tâches interactives](../interactive-tasks/) conservent aussi la conversation et ferment la sandbox avant de poser une question. Leur reprise ne rejoue pas les tours terminés.

Enregistrez ces deux scripts à côté de `portable-workspace.ts`. Cet essai écrit un fichier directement dans le workspace ; il ne nécessite ni agent ni sandbox.

<!-- tabs -->

```ts title="save-files.ts"
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { openPortableWorkspace } from "./portable-workspace.ts";

const workspace = await openPortableWorkspace();
try {
  await writeFile(
    join(workspace.directory, "report.txt"),
    "Ready for review\n",
  );
  const record = await workspace.checkpoint();
  await writeFile("workspace-record.json", JSON.stringify(record));
} finally {
  await workspace.close({ preserve: true });
}
```

```ts title="restore-files.ts"
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  createLocalTransport,
  restoreFileWorkspace,
} from "@elie-laloum/outpost";

const record = JSON.parse(await readFile("workspace-record.json", "utf8"));
await using workspace = await restoreFileWorkspace(record, {
  portable: true,
  runtime: { directory: "./.outpost-restored", namespace: "documents" },
  retention: {
    policy: "portable",
    transporter: createLocalTransport({ directory: "./conserved" }),
  },
});
console.log(workspace.directory);
console.log(await readFile(join(workspace.directory, "report.txt"), "utf8"));
```

Exécutez `node save-files.ts`, puis `node restore-files.ts` depuis le même répertoire. Le second processus affiche le nouveau chemin et `Ready for review`. Conservez `workspace-record.json` et `conserved/` ensemble ; le premier référence le snapshot dans le second.

## Récupérer après une interruption

1. Arrêtez les processus de l’ancien propriétaire et confirmez la libération des éventuelles ressources distantes. Un snapshot ne prouve pas qu’une sandbox distante est arrêtée.
2. Inspectez le workspace avec [inspectFileWorkspace](../../reference/inspectfileworkspace/) et gardez sa révision.
3. Transmettez cet enregistrement et l’autorisation explicite de récupération à [recoverFileWorkspace](../../reference/recoverfileworkspace/). Une révision modifiée est refusée.
4. Récupérez la propriété du checkpoint et autorisez séparément une nouvelle tentative des tâches interrompues, si nécessaire.

Une préparation interrompue conserve son enregistrement et ses fichiers partiels. La restauration ordinaire les refuse ; après arrêt des processus, `adoptInterruptedFiles` accepte explicitement ces fichiers sans relancer la préparation. Accepter une source montée modifiée exige sa propre autorisation. Aucune de ces opérations n’autorise à rejouer le workflow.

Pour une publication interrompue, suivez la [récupération des fichiers publiés](../publishing-files/).
