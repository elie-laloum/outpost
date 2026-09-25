---
title: "Planifier la rétention sans supprimer du travail"
description: "Réservez une marge coopérative, puis examinez un plan de rétention du dépôt de démonstration."
---

Réservez une marge coopérative, puis examinez un plan de rétention du dépôt de démonstration.

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
import { resolve } from "node:path";
import {
  planRecoveryRetention,
  reserveRecoveryStorage,
} from "@elie-laloum/outpost";

const repository = resolve(import.meta.dirname, "../repository");
await using reservation = await reserveRecoveryStorage({
  repository,
  maxBytes: 1_073_741_824,
  reserveBytes: 1_048_576,
});
const plan = await planRecoveryRetention({
  repository,
  policy: { version: 1, scopes: ["closed-logs"], minAgeMs: 604_800_000 },
});
console.log({
  usageBytes: plan.usageBytes,
  projectedBytes: plan.projectedBytes,
  quota: plan.quota,
});
```

```sh
node example.mts
```

## Comprendre le résultat

Ce script ne supprime rien. Il nécessite Git mais pas de conteneur actif ; utilisez `--no-build` dans la préparation pour cette seule page. La réservation est libérée à la sortie de portée. Les données protégées peuvent maintenir l’usage au-dessus d’un objectif. Les réservations coordonnent les écrivains coopératifs sans quota disque physique. Appliquer un plan relu est une opération explicite séparée.

[Contrats, options et cas particuliers](../../behavior/operations/storage-retention/).

Pour recommencer, utilisez un nouveau dossier de démonstration. Les branches nommées conservent les commits ; les worktrees sales restent disponibles pour récupération. Les scripts ne poussent aucun commit.
