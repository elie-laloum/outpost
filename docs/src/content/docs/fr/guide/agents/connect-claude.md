---
title: "Connecter Claude explicitement"
description: "Choisissez une méthode de connexion Claude, puis vérifiez-la par une petite requête réelle."
---

Choisissez une méthode de connexion Claude, puis vérifiez-la par une petite requête réelle.

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

Choisissez **une** des configurations ci-dessous pour **workflow/.env**. `account` copie dans le home privé de la sandbox la connexion déjà faite sur l’hôte ; `usage` facture une clé API. Les déclarations de clés vides héritent de la variable d’environnement correspondante ; vous pouvez aussi renseigner sa valeur dans ce fichier ignoré par Git. Outpost ne lit jamais un trousseau système.

**Codex — compte** : lancez d’abord `codex -c cli_auth_credentials_store='"file"' login` sur l’hôte pour que la connexion soit enregistrée dans `auth.json`.

```dotenv
OUTPOST_AGENT=codex
OUTPOST_AUTH=account
```

**Codex — clé API**

```dotenv
OUTPOST_AGENT=codex
OUTPOST_AUTH=usage
OPENAI_API_KEY=
```

**Claude — compte** : lancez `claude`, puis `/login`, sur l’hôte. Sur macOS, cette connexion reste dans le trousseau : utilisez plutôt le jeton d’abonnement.

```dotenv
OUTPOST_AGENT=claude
OUTPOST_AUTH=account
```

**Claude — jeton d’abonnement** : obtenez un jeton avec `claude setup-token` sur l’hôte et déclarez-le ci-dessous.

```dotenv
OUTPOST_AGENT=claude
OUTPOST_AUTH=account-token
CLAUDE_CODE_OAUTH_TOKEN=
```

**Claude — clé API**

```dotenv
OUTPOST_AGENT=claude
OUTPOST_AUTH=usage
ANTHROPIC_API_KEY=
```

**Antigravity, GitHub Copilot et Kimi Code** acceptent les mêmes valeurs lorsqu’ils les prennent en charge : voir [Antigravity](../connect-antigravity/), [Copilot](../connect-copilot/) et [Kimi Code](../connect-kimi/). Les clés API Kimi exigent aussi `OUTPOST_MODEL`.

Enregistrez **runtime.mts** à côté de l’exemple. Cette configuration complète lit uniquement les variables déclarées, sélectionne l’agent et son authentification, puis laisse Outpost préparer le home privé de la sandbox. L’exemple appelle `configuration()` pour utiliser votre choix. Les réglages `OUTPOST_` appartiennent à ce script pédagogique, pas à l’API Outpost.

```ts file=runtime.mts
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseEnv } from "node:util";
import {
  agent as composeAgent,
  antigravityHarness,
  claudeHarness,
  codexHarness,
  copilotHarness,
  kimiHarness,
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

const factories = {
  codex: codexHarness,
  claude: claudeHarness,
  antigravity: antigravityHarness,
  copilot: copilotHarness,
  kimi: kimiHarness,
};
const tokens: Record<string, string> = {
  claude: "CLAUDE_CODE_OAUTH_TOKEN",
  copilot: "COPILOT_GITHUB_TOKEN",
};

function authenticationFor(name: string, choice: string): AgentAuthentication {
  if (choice === "account-token" && tokens[name])
    return { account: { variable: tokens[name] } };
  if (choice === "account" || choice === "usage") return choice;
  throw new Error(`Unsupported OUTPOST_AUTH for ${name}: ${choice}`);
}

export async function configuration(
  name = settings.OUTPOST_AGENT ?? "codex",
  authentication = settings.OUTPOST_AUTH ?? "account",
) {
  if (!Object.hasOwn(factories, name))
    throw new Error(`Choose ${Object.keys(factories).join(", ")}`);
  return {
    repository,
    agent: composeAgent({
      harness: factories[name as keyof typeof factories]({
        authentication: authenticationFor(name, authentication),
      }),
      ...(settings.OUTPOST_MODEL ? { model: settings.OUTPOST_MODEL } : {}),
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

## Essayer

Enregistrez le fichier **example.mts** dans `workflow/`.

```ts file=example.mts
import { dispatch } from "@elie-laloum/outpost";
import { configuration } from "./runtime.mts";
const runtime = await configuration();
if (runtime.agent.name !== "claude")
  throw new Error("Select claude in workflow/.env");
const result = await dispatch({
  ...runtime,
  branch: { mode: "named", name: "workshop/login" },
  brief: {
    text: "Read text.ts and answer with its exported function name. Do not edit.",
  },
  deadlineMs: 120_000,
});
console.log(result.text);
```

```sh
node example.mts
```

## Comprendre le résultat

Sélectionnez un profil Claude dans la préparation. Une réponse réussie doit identifier `slug` ; cela appelle réellement le modèle. Une allocation de conteneur réussie ne vérifie pas les identifiants d’agent.

Avec `account`, Outpost copie uniquement l’entrée `claudeAiOauth` du `.credentials.json` de l’hôte dans le home privé de la sandbox ; `account-token` transmet `CLAUDE_CODE_OAUTH_TOKEN` et `usage` transmet `ANTHROPIC_API_KEY`. Déclarer à la fois un jeton et une clé API est rejeté, car la clé API serait prioritaire. Accès par abonnement et facturation API restent distincts. Le home privé de la sandbox reste éphémère, et les conversations capturées ne conservent pas la connexion. Le [manuel d’authentification](../../manual/authentication/) couvre toutes les formes, les trousseaux et le renouvellement des jetons de rafraîchissement.

[Contrats, options et cas particuliers](../../behavior/agents/connect-claude/).

Pour recommencer, utilisez un nouveau dossier de démonstration. Les branches nommées conservent les commits ; les worktrees sales restent disponibles pour récupération. Les scripts ne poussent aucun commit.
