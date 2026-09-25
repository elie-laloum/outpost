---
title: "Exécuter des commandes de confiance sur l’hôte"
description: "Choisissez explicitement l’exécution locale, avec un dépôt temporaire et sans conteneur."
---

Choisissez explicitement l’exécution locale, avec un dépôt temporaire et sans conteneur.

<!-- scenario:offline -->

<!-- preparation:offline -->

<details>
<summary>Préparer cet exemple depuis zéro</summary>

Utilisez Node.js **24+** et npm. Commencez dans un nouveau dossier pour chaque exemple.

```sh
mkdir outpost-example
cd outpost-example
```

```sh
npm init -y
npm install @elie-laloum/outpost
```

Enregistrez l’exemple sous **example.mts** dans ce dossier. Aucun compte, clé API ou conteneur n’est nécessaire.

</details>

<!-- /preparation -->

## Essayer

Enregistrez le fichier **example.mts** dans `outpost-example/`.

```ts file=example.mts
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createSandbox } from "@elie-laloum/outpost";
import { local } from "@elie-laloum/outpost/providers/local";

const repository = await mkdtemp(join(tmpdir(), "outpost-local-"));
try {
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd: repository });
  git("init", "-b", "main");
  await writeFile(join(repository, "text.txt"), "hello");
  git("add", ".");
  git(
    "-c",
    "user.name=Workshop",
    "-c",
    "user.email=workshop@example.invalid",
    "commit",
    "-m",
    "initial",
  );
  {
    await using sandbox = await createSandbox({
      repository,
      provider: local(),
    });
    const result = await sandbox.command({
      executable: process.execPath,
      arguments: ["-e", "console.log('host execution')"],
    });
    assert.equal(result.status, 0);
    console.log(result.stdout.trim());
  }
} finally {
  await rm(repository, { recursive: true, force: true });
}
```

```sh
node example.mts
```

## Comprendre le résultat

Installez Git en plus de la préparation Node/npm. La sortie est `host execution`. La commande tourne sous votre compte système : local n’isole ni fichiers ni environnement. L’exercice possède et supprime uniquement son dossier temporaire. Un worktree sépare les changements Git sans interdire l’accès aux autres fichiers hôtes.

[Contrats, options et cas particuliers](../../../../reference/behavior/providers/local/).

Les fichiers persistants éventuels restent dans ce dossier de démonstration.
