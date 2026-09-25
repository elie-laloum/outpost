---
title: "Run your first agent"
description: "Fix a real test with Codex or Claude, starting from an empty directory."
---

Make the whitespace test pass in a small TypeScript repository. This example starts from an empty folder and uses the CLI before introducing the library.

<details>
<summary>Prepare Node, Git and the demonstration repository</summary>

Install **Node.js 24+**, Git and Docker; start the Docker engine. Create a fresh folder:

```sh
mkdir outpost-first-run
cd outpost-first-run
```

Save the following file as **prepare.mjs**. It initializes a separate `repository/`, with a local demonstration Git identity and an intentionally failing test. It does not change your existing projects.

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

## 1. Choose your agent and access

Choose **one** command below. Each creates `workflow/` separately from `repository/`, installs Outpost and builds `outpost:docs-demo`. Initial installation and image construction can take several minutes. API usage is billed separately from account subscriptions.

**Codex with an API key**

```sh
npx @elie-laloum/outpost init --yes --agent codex --authentication api-key --sandbox-provider docker --directory workflow --repository ../repository --image outpost:docs-demo --install
```

**Codex with your account**

First install the Codex CLI on the host and run `codex -c cli_auth_credentials_store='"file"' login`. The generated script copies that explicit file credential seed into the sandbox’s private home.

```sh
npx @elie-laloum/outpost init --yes --agent codex --authentication login --sandbox-provider docker --directory workflow --repository ../repository --image outpost:docs-demo --install
```

**Claude with an API key**

```sh
npx @elie-laloum/outpost init --yes --agent claude --authentication api-key --sandbox-provider docker --directory workflow --repository ../repository --image outpost:docs-demo --install
```

**Claude with your subscription**

Obtain a subscription token on the host with `claude setup-token`.

```sh
npx @elie-laloum/outpost init --yes --agent claude --authentication oauth-token --sandbox-provider docker --directory workflow --repository ../repository --image outpost:docs-demo --install
```

## 2. Declare the selected credential

For API keys or a Claude subscription, copy `workflow/.env.example` to `workflow/.env` and fill in the variable it names. An empty declaration inherits the same host environment variable. Codex account login instead reads the credential file prepared above; it needs no API key. Keep `.env` untracked.

```sh
cd workflow
```

The generated `run.ts` already initializes Codex API-key authentication inside the sandbox. No additional login hook is needed. See official [Codex authentication](https://developers.openai.com/codex/auth/) and [Claude authentication](https://code.claude.com/docs/en/authentication) for account prerequisites.

## 3. Run the task

```sh
node run.ts "Fix whitespace handling in text.ts so npm test passes. Run tests and commit the fix."
```

This makes real model calls. Output shows progress, then the resulting branch, commits and available conversation. The generated starter uses `branch: { mode: "integrate" }`: successful committed work is merged locally into the demonstration repository. It never pushes to a remote.

## 4. Check the result yourself

```sh
cd ../repository
npm test
git log -2 --oneline
git show --stat
```

Both tests should pass and history should contain a fix commit. If they do not, the task has not achieved the objective even if the agent says it has. Inspect logs under `repository/.outpost/logs`; see [diagnostics](../../operations/troubleshooting/) if execution failed.

The generated files are `package.json`, `run.ts`, `brief.md`, `.env.example`, `.gitignore` and a container recipe. Existing package manifests are preserved; explicit CommonJS manifests get `run.mts`. Start in another folder for a fresh attempt; `init` refuses to overwrite scaffold files.

Next: [understand the generated script](../generated-script/), then [keep changes on a separate branch](../../agents/dispatch/).
