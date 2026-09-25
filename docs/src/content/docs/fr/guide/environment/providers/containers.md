---
title: "Choisir Docker ou Podman"
description: "Exécutez la même commande Git avec l’un ou l’autre moteur de conteneur."
---

Exécutez la même commande Git avec l’un ou l’autre moteur de conteneur.

<!-- scenario:sandbox -->

<!-- preparation:sandbox -->

<details>
<summary>Préparer cet exemple depuis zéro</summary>

Utilisez Node.js **24+** et npm. Commencez dans un nouveau dossier pour chaque exemple.

```sh
mkdir outpost-example
cd outpost-example
```

Git est nécessaire. Enregistrez ce fichier sous **prepare.mjs**, puis lancez-le. Il crée un dépôt de démonstration dont le test des espaces échoue volontairement. Il refuse d’écraser un dossier existant.

```js file=prepare.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

const directory = resolve(process.argv[2] ?? "repository");
await mkdir(directory);
const files = {
  "package.json": JSON.stringify(
    {
      name: "text-workshop",
      version: "1.0.0",
      private: true,
      type: "module",
      scripts: { test: "node --test text.test.ts" },
    },
    null,
    2,
  ),
  "package-lock.json": JSON.stringify(
    {
      name: "text-workshop",
      version: "1.0.0",
      lockfileVersion: 3,
      packages: { "": { name: "text-workshop", version: "1.0.0" } },
    },
    null,
    2,
  ),
  "text.ts":
    'export function slug(text: string): string {\n  return text.toLowerCase().replaceAll(" ", "-");\n}\n',
  "text.test.ts":
    'import test from "node:test";\nimport assert from "node:assert/strict";\nimport { slug } from "./text.ts";\ntest("simple words", () => assert.equal(slug("Hello World"), "hello-world"));\ntest("extra whitespace", () => assert.equal(slug("  Hello   World  "), "hello-world"));\n',
  ".gitignore": ".outpost/\nnode_modules/\n.env\n",
};
for (const [name, content] of Object.entries(files))
  await writeFile(resolve(directory, name), content + "\n", { flag: "wx" });
const git = (...args) =>
  execFileSync("git", args, { cwd: directory, stdio: "pipe" });
git("init", "-b", "main");
git("config", "user.name", "Outpost workshop");
git("config", "user.email", "workshop@example.invalid");
git("add", ".");
git("commit", "-m", "Add text workshop with a whitespace regression");
console.log(`Created ${directory}. The whitespace test intentionally fails.`);
```

```sh
node prepare.mjs
```

Démarrez Docker, puis générez un dossier de workflow séparé et construisez son image. Le premier téléchargement/build peut prendre plusieurs minutes ; les exemples suivants peuvent réutiliser l’image avec `--no-build`.

```sh
npx @elie-laloum/outpost init --yes --directory workflow --repository ../repository --image outpost:docs-demo --install
cd workflow
```

Cet exemple exécute uniquement des commandes dans le conteneur ; aucun identifiant d’agent n’est nécessaire.

</details>

<!-- /preparation -->

## Essayer

Enregistrez le fichier **example.mts** dans `workflow/`.

```ts file=example.mts
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createSandbox } from "@elie-laloum/outpost";
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";
import { podmanSandboxProvider } from "@elie-laloum/outpost/providers/podman";

const engine = process.argv[2] ?? "docker";
if (engine !== "docker" && engine !== "podman")
  throw new Error("Choose docker or podman");
const factory =
  engine === "docker" ? dockerSandboxProvider : podmanSandboxProvider;
await using sandbox = await createSandbox({
  repository: resolve(import.meta.dirname, "../repository"),
  sandboxProvider: factory({
    image: "outpost:docs-demo",
    cpus: 1,
    memoryMb: 1024,
  }),
  branch: { mode: "named", name: "workshop/engine" },
});
const result = await sandbox.command({
  executable: "git",
  arguments: ["branch", "--show-current"],
});
assert.equal(result.status, 0);
assert.equal(result.stdout.trim(), "workshop/engine");
console.log(result.stdout.trim());
```

```sh
node example.mts
```

## Comprendre le résultat

Docker est le défaut de cette préparation. Pour Podman, choisissez `--sandbox-provider podman` à l’initialisation puis lancez `node example.mts podman` ; les moteurs ont des stores d’images séparés. Outpost ne bascule pas vers l’hôte en cas d’échec. Montages et métadonnées Git modifiables ne constituent pas une frontière contre du code hostile. Le home privé est éphémère.

[Contrats, options et cas particuliers](../../../behavior/providers/containers/).

Pour recommencer, utilisez un nouveau dossier de démonstration. Les branches nommées conservent les commits ; les worktrees sales restent disponibles pour récupération. Les scripts ne poussent aucun commit.
