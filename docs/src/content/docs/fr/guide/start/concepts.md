---
title: "Concepts et propriété des ressources"
description: "Concepts et propriété des ressources — Outpost"
sidebar:
  order: 3
---

## Quatre éléments essentiels

| Concept           | Responsabilité                                     | Durée de vie habituelle                |
| ----------------- | -------------------------------------------------- | -------------------------------------- |
| Workspace         | Copie Git, branche, verrous et intégration         | Une fonctionnalité ou plusieurs tâches |
| Sandbox           | Environnement actif rattaché à un workspace        | Une tâche ou une session réutilisable  |
| Adapter d’agent   | Commande du CLI natif et traduction des événements | Configuration réutilisable             |
| Tâche de workflow | Opération typée et dépendances                     | Un nœud du graphe                      |

Pour Claude Code et Codex, une conversation est indépendante : son transcript natif peut survivre à la sandbox et être repris plus tard. Dupliquer une conversation ne duplique pas ses fichiers.

## Choisir le point d’entrée

Utilisez `dispatch` pour une tâche avec nettoyage automatique. Utilisez `createSandbox` pour réutiliser les dépendances installées et l’état de l’environnement. Utilisez `openWorkspace` pour faire intervenir plusieurs environnements ou agents sur une même branche au fil du temps. Utilisez `attach` pour une session interactive native.

`dispatch` et `attach` ferment les ressources qu’ils ont créées. Un workspace fourni par l’appelant reste sous sa responsabilité. Fermez la sandbox avant son workspace. Les handles acceptent `await using` ou un appel explicite et idempotent à `close()`.

Une sandbox accepte une seule opération à la fois. Un workspace ne peut appartenir qu’à une sandbox active à la fois. Pour travailler en parallèle, allouez des workspaces et sandboxes distincts. La concurrence d’un workflow ne supprime pas ces règles.

## Le nettoyage conserve le travail

Fermer un worktree géré et propre supprime son répertoire ; les branches nommées restent. Un worktree contenant des modifications est conservé, avec son chemin dans `retainedDirectory`. Utilisez `close({ preserve: true })` pour conserver aussi un worktree propre. Le mode utilisant la copie courante ne supprime pas votre projet.

Consultez le [cycle de vie](../../environment/lifecycle/), la [récupération](../../operations/recovery/) et les [limites de sécurité](../../operations/security/).

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

## Observer les durées de vie

Enregistrez **example.mts** dans `workflow/`. Deux environnements successifs utilisent la même branche ; aucun identifiant de modèle n’est nécessaire.

```ts file=example.mts
import assert from "node:assert/strict";
import { openWorkspace } from "@elie-laloum/outpost";
import { docker } from "@elie-laloum/outpost/providers/docker";
import { resolve } from "node:path";

await using workspace = await openWorkspace({
  repository: resolve(import.meta.dirname, "../repository"),
  branch: { mode: "named", name: "workshop/shared" },
});
for (const turn of [1, 2]) {
  await using sandbox = await workspace.sandbox({
    provider: docker({ image: "outpost:docs-demo" }),
  });
  const result = await sandbox.command({
    executable: "git",
    arguments: ["branch", "--show-current"],
  });
  assert.equal(result.stdout.trim(), "workshop/shared");
  console.log(turn, result.stdout.trim());
}
```

```sh
node example.mts
```

## Comprendre le résultat

La sortie affiche `1 workshop/shared`, puis `2 workshop/shared`. Le workspace survit à la première sandbox et se ferme après la boucle. La branche nommée reste dans le dépôt de démonstration. Recommencez dans un nouveau dossier.
