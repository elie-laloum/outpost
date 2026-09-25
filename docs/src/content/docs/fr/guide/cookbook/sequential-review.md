---
title: "Implémenter puis relire, étape par étape"
description: "Faites corriger le défaut par Codex, relire par Claude et vérifier les tests par le programme."
---

Faites corriger le défaut par Codex, relire par Claude et vérifier les tests par le programme.

<!-- scenario:agent -->

<!-- preparation:agent -->

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

Choisissez **une** des configurations ci-dessous pour **workflow/.env**. Les déclarations de clés vides héritent de la variable d’environnement correspondante ; vous pouvez aussi renseigner sa valeur dans ce fichier ignoré par Git. Accès par compte et facturation API sont distincts. Le `run.ts` généré par la CLI configure déjà la connexion Codex ; n’ajoutez pas un second hook.

**Codex — clé API**

```dotenv
OUTPOST_AGENT=codex
OUTPOST_AUTH=api-key
OPENAI_API_KEY=
```

**Codex — compte** : lancez d’abord `codex -c cli_auth_credentials_store='"file"' login` sur l’hôte. Vous sélectionnez explicitement un fichier de connexion sans exporter un trousseau.

```dotenv
OUTPOST_AGENT=codex
OUTPOST_AUTH=login
```

**Claude — clé API**

```dotenv
OUTPOST_AGENT=claude
OUTPOST_AUTH=api-key
ANTHROPIC_API_KEY=
```

**Claude — abonnement** : obtenez un jeton avec `claude setup-token` sur l’hôte et déclarez-le ci-dessous.

```dotenv
OUTPOST_AGENT=claude
OUTPOST_AUTH=oauth-token
CLAUDE_CODE_OAUTH_TOKEN=
```

Enregistrez **runtime.mts** à côté de l’exemple. Cette configuration complète lit uniquement les variables déclarées, sélectionne l’agent et initialise son home privé dans la sandbox. L’exemple appelle `configuration()` pour utiliser votre choix. Les deux réglages `OUTPOST_` appartiennent à ce script pédagogique, pas à l’API Outpost.

```ts file=runtime.mts
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { parseEnv } from "node:util";
import {
  agent as composeAgent,
  codex,
  claude,
  gemini,
  type AgentAuthentication,
  type LifecycleHooks,
} from "@elie-laloum/outpost";
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const settings = parseEnv(
  await readFile(new URL(".env", import.meta.url), "utf8"),
);
export const repository = resolve(import.meta.dirname, "../repository");
export const variables = Object.fromEntries(
  Object.entries(settings)
    .filter(([name]) => !name.startsWith("OUTPOST_"))
    .map(([name, value]) => [name, value || process.env[name] || ""]),
);

export async function configuration(
  name = settings.OUTPOST_AGENT ?? "codex",
  authentication = settings.OUTPOST_AUTH ?? "api-key",
) {
  const factories = { codex, claude, gemini };
  if (!(name === "codex" || name === "claude" || name === "gemini"))
    throw new Error("Choose codex, claude or gemini");
  const supported = {
    codex: ["api-key", "login"],
    claude: ["api-key", "oauth-token"],
    gemini: ["api-key"],
  };
  if (!supported[name].includes(authentication))
    throw new Error(
      `Unsupported authentication for ${name}: ${authentication}`,
    );
  if (
    name === "codex" &&
    authentication === "login" &&
    variables.OPENAI_API_KEY
  )
    throw new Error(
      "Remove OPENAI_API_KEY when using Codex account authentication",
    );
  let selected: AgentAuthentication;
  if (authentication === "login") {
    const credentials = await readFile(
      resolve(
        process.env.CODEX_HOME || resolve(homedir(), ".codex"),
        "auth.json",
      ),
      "utf8",
    );
    JSON.parse(credentials);
    selected = { mode: "login", credentials };
  } else {
    const keys = {
      codex: "OPENAI_API_KEY",
      claude: "ANTHROPIC_API_KEY",
      gemini: "GEMINI_API_KEY",
    };
    const key =
      authentication === "oauth-token" ? "CLAUDE_CODE_OAUTH_TOKEN" : keys[name];
    if (!variables[key]) throw new Error(`Declare ${key} in workflow/.env`);
    if (
      name === "claude" &&
      variables.ANTHROPIC_API_KEY &&
      variables.CLAUDE_CODE_OAUTH_TOKEN
    )
      throw new Error("Choose one Claude authentication method");
    selected =
      authentication === "oauth-token"
        ? { mode: "oauth-token" }
        : { mode: "api-key", environment: key };
  }
  return {
    repository,
    agent: composeAgent({
      harness: factories[name].harness({ authentication: selected }),
    }),
    sandboxProvider: dockerSandboxProvider({
      image: "outpost:docs-demo",
      variables,
    }),
    hooks: {} as LifecycleHooks,
  };
}
```

Les exécutions d’agents appellent réellement les modèles. L’accès au compte/modèle et le temps de réponse dépendent du fournisseur. Consultez les documentations officielles de [connexion Codex](https://developers.openai.com/codex/auth/) et [connexion Claude](https://code.claude.com/docs/en/authentication).

</details>

<!-- /preparation -->

Déclarez `OPENAI_API_KEY=` et `ANTHROPIC_API_KEY=` dans `workflow/.env`. Ce scénario utilise deux agents par clé API ; les deux valeurs déclarées sont transmises au conteneur.

## Essayer

Enregistrez **example.mts** dans `workflow/`.

```ts file=example.mts
import assert from "node:assert/strict";
import { createSandbox } from "@elie-laloum/outpost";
import { configuration } from "./runtime.mts";

const author = await configuration("codex", "api-key");
const reviewer = await configuration("claude", "api-key");
await using sandbox = await createSandbox({
  ...author,
  branch: { mode: "named", name: "workshop/sequential-review" },
});
const implementation = await sandbox.dispatch({
  brief: {
    text: "Fix whitespace handling in text.ts. Run npm test and commit.",
  },
  deadlineMs: 300_000,
});
const review = await sandbox.dispatch({
  agent: reviewer.agent,
  brief: {
    text: `Review changes against ${sandbox.workspace.baseline}. Implementation: ${implementation.text}. Fix defects, test and commit corrections.`,
  },
  deadlineMs: 300_000,
});
const validation = await sandbox.command({
  executable: "npm",
  arguments: ["test"],
  deadlineMs: 30_000,
});
assert.equal(validation.status, 0, validation.stderr || validation.stdout);
console.log(review.text, validation.status);
```

```sh
node example.mts
```

## Comprendre le résultat

Les deux appels sont attendus dans l’ordre. Une erreur arrête la suite. Le programme exécute réellement `npm test` après la revue et exige un code de sortie zéro ; demander à l’agent de tester ne remplace pas ce contrôle. Les agents partagent les fichiers, pas leurs conversations. La sandbox est fermée à la sortie ; la branche nommée et les éventuels changements non commités restent récupérables. Aucun merge ni push automatique. Recommencez dans un nouveau dossier de démonstration.

[La même recette sous forme de workflow](../pair-review/).
