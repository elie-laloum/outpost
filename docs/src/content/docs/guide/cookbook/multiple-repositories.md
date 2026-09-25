---
title: "Coordinate two repositories"
description: "Pass the first repository’s result into a task operating on another repository."
---

Pass the first repository’s result into a task operating on another repository.

<!-- scenario:agent -->

<!-- preparation:agent -->

<details>
<summary>Prepare this example from scratch</summary>

Use Node.js **24+** and npm. Start in a new directory for each example.

```sh
mkdir outpost-example
cd outpost-example
```

Git is required. Save this file as **prepare.mjs**, then run it. It creates a disposable repository with a deliberately failing whitespace test. It refuses to overwrite an existing directory.

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

Start Docker, then generate a separate workflow directory and build its image. The first download/build can take several minutes; later examples can reuse the image by adding `--no-build`.

```sh
npx @elie-laloum/outpost init --yes --directory workflow --repository ../repository --image outpost:docs-demo --install
cd workflow
```

Choose **one** of these configurations for **workflow/.env**. Empty key declarations inherit the matching environment variable; alternatively set its value in this ignored file. Account access and API billing are separate. The CLI-generated `run.ts` already configures Codex login; do not add a second login hook.

**Codex — API key**

```dotenv
OUTPOST_AGENT=codex
OUTPOST_AUTH=api-key
OPENAI_API_KEY=
```

**Codex — account**: run `codex -c cli_auth_credentials_store='"file"' login` on the host first. This explicitly selects a file credential seed instead of exporting a keychain.

```dotenv
OUTPOST_AGENT=codex
OUTPOST_AUTH=login
```

**Claude — API key**

```dotenv
OUTPOST_AGENT=claude
OUTPOST_AUTH=api-key
ANTHROPIC_API_KEY=
```

**Claude — subscription**: obtain a token with `claude setup-token` on the host and declare it below.

```dotenv
OUTPOST_AGENT=claude
OUTPOST_AUTH=oauth-token
CLAUDE_CODE_OAUTH_TOKEN=
```

Save **runtime.mts** next to the example. This complete configuration reads only declared variables, selects the agent and initializes its private sandbox home. The example calls `configuration()` to use your choice. These two `OUTPOST_` settings belong to this teaching script, not the Outpost API.

```ts file=runtime.mts
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { parseEnv } from "node:util";
import {
  agent as composeAgent,
  codexHarness,
  claudeHarness,
  geminiHarness,
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
  const factories = {
    codex: codexHarness,
    claude: claudeHarness,
    gemini: geminiHarness,
  };
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
      harness: factories[name]({ authentication: selected }),
    }),
    sandboxProvider: dockerSandboxProvider({
      image: "outpost:docs-demo",
      variables,
    }),
    hooks: {} as LifecycleHooks,
  };
}
```

Agent runs make real model calls. Account/model access and response time depend on your provider. See the official [Codex authentication](https://developers.openai.com/codex/auth/) and [Claude authentication](https://code.claude.com/docs/en/authentication) documentation.

</details>

<!-- /preparation -->

## Prerequisites and effects

Before running, return to `outpost-example/` and execute `node prepare.mjs repository-two`, then return to `workflow/`. Each task owns its repository, branch, logs and resources. The dependency passes text explicitly; it does not copy commits or files. If the second task fails, commits in the first repository remain. No shared transaction or automatic push spans both.

## Try it

Save **example.mts** in `workflow/`.

```ts file=example.mts
import { resolve } from "node:path";
import { isolatedTask, workflow } from "@elie-laloum/outpost";
import { configuration } from "./runtime.mts";
const runtime = await configuration();

const first = isolatedTask({
  key: "first",
  request: () => ({
    ...runtime,
    branch: { mode: "named", name: "workshop/first" },
    brief: {
      text: "Fix whitespace in text.ts, test and commit. Summarize the change.",
    },
    deadlineMs: 300_000,
  }),
});
const second = isolatedTask({
  key: "second",
  after: [first],
  request: (context) => ({
    ...runtime,
    repository: resolve(import.meta.dirname, "../repository-two"),
    branch: { mode: "named", name: "workshop/second" },
    brief: {
      text: `Apply an equivalent fix to this independent repository. First result: ${context.value(first).text}. Test and commit.`,
    },
    deadlineMs: 300_000,
  }),
});
const result = await workflow("two-repositories", [first, second]).start();
result.unwrap();
console.log(result.value(first).commits, result.value(second).commits);
```

```sh
node example.mts
```

## Understand the result

Check the output and effects described before the code.

To start again, use a new demonstration directory. Named branches retain commits; dirty worktrees remain available for recovery. Scripts do not push commits.
