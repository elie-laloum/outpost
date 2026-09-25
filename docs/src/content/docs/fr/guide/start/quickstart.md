---
title: "Lancer votre premier agent"
description: "Corriger un vrai test avec Codex ou Claude depuis un dossier vide."
---

Faites passer le test des espaces dans un petit dépôt TypeScript. Cet exemple part d’un dossier vide et utilise la CLI avant d’introduire la bibliothèque.

<details>
<summary>Préparer Node, Git et le dépôt de démonstration</summary>

Installez **Node.js 24+**, Git et Docker ; démarrez le moteur Docker. Créez un dossier neuf :

```sh
mkdir outpost-first-run
cd outpost-first-run
```

Enregistrez le fichier suivant sous **prepare.mjs**. Il initialise un `repository/` séparé, avec une identité Git locale de démonstration et un test volontairement en échec. Il ne modifie pas vos projets existants.

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

</details>

## 1. Choisir l’agent et l’accès

Choisissez **une** commande ci-dessous. Chacune crée `workflow/` séparément de `repository/`, installe Outpost et construit `outpost:docs-demo`. Installation initiale et construction peuvent prendre plusieurs minutes. L’usage API est facturé séparément des abonnements.

**Codex avec une clé API**

```sh
npx @elie-laloum/outpost init --yes --agent codex --authentication api-key --provider docker --directory workflow --repository ../repository --image outpost:docs-demo --install
```

**Codex avec votre compte**

Installez d’abord la CLI Codex sur l’hôte et lancez `codex -c cli_auth_credentials_store='"file"' login`. Le script généré copie ce fichier de connexion explicite dans le home privé de la sandbox.

```sh
npx @elie-laloum/outpost init --yes --agent codex --authentication login --provider docker --directory workflow --repository ../repository --image outpost:docs-demo --install
```

**Claude avec une clé API**

```sh
npx @elie-laloum/outpost init --yes --agent claude --authentication api-key --provider docker --directory workflow --repository ../repository --image outpost:docs-demo --install
```

**Claude avec votre abonnement**

Obtenez un jeton d’abonnement sur l’hôte avec `claude setup-token`.

```sh
npx @elie-laloum/outpost init --yes --agent claude --authentication oauth-token --provider docker --directory workflow --repository ../repository --image outpost:docs-demo --install
```

## 2. Déclarer l’identifiant choisi

Pour une clé API ou un abonnement Claude, copiez `workflow/.env.example` vers `workflow/.env` et renseignez la variable indiquée. Une déclaration vide hérite de la même variable d’environnement hôte. La connexion par compte Codex lit le fichier préparé précédemment et ne nécessite aucune clé API. Gardez `.env` hors de Git.

```sh
cd workflow
```

Le `run.ts` généré initialise déjà la connexion Codex par clé API dans la sandbox. Aucun hook supplémentaire n’est nécessaire. Consultez les prérequis officiels de [connexion Codex](https://developers.openai.com/codex/auth/) et [connexion Claude](https://code.claude.com/docs/en/authentication).

## 3. Lancer la tâche

```sh
node run.ts "Fix whitespace handling in text.ts so npm test passes. Run tests and commit the fix."
```

Cela appelle réellement le modèle. La sortie montre la progression, puis la branche, les commits et la conversation disponible. Le starter utilise `branch: { mode: "integrate" }` : le travail commité réussi est fusionné localement dans le dépôt de démonstration. Aucun push n’est effectué.

## 4. Vérifier le résultat vous-même

```sh
cd ../repository
npm test
git log -2 --oneline
git show --stat
```

Les deux tests doivent passer et l’historique doit contenir un commit de correction. Sinon, l’objectif n’est pas atteint même si l’agent affirme avoir terminé. Examinez les logs sous `repository/.outpost/logs` ; consultez le [diagnostic](../../operations/troubleshooting/) si l’exécution a échoué.

Les fichiers générés sont `package.json`, `run.ts`, `brief.md`, `.env.example`, `.gitignore` et une recette de conteneur. Un manifeste existant est conservé ; un manifeste explicitement CommonJS produit `run.mts`. Utilisez un autre dossier pour recommencer ; `init` refuse d’écraser le scaffold.

Suite : [comprendre le script généré](../generated-script/), puis [conserver les changements sur une branche séparée](../../agents/dispatch/).
