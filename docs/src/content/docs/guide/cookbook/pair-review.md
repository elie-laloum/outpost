---
title: "Have Codex implement and Claude review"
description: "Hand the same files from one agent to another, then verify their final state with tests."
---

Hand the same files from one agent to another, then verify their final state with tests.

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

Choose **one** of these configurations for **workflow/.env**. `account` copies the login you already made on the host into the private sandbox home; `usage` bills an API key. Empty key declarations inherit the matching environment variable; alternatively set its value in this ignored file. Outpost never reads a system keychain.

**Codex — account**: run `codex -c cli_auth_credentials_store='"file"' login` on the host first so the login is stored in `auth.json`.

```dotenv
OUTPOST_AGENT=codex
OUTPOST_AUTH=account
```

**Codex — API key**

```dotenv
OUTPOST_AGENT=codex
OUTPOST_AUTH=usage
OPENAI_API_KEY=
```

**Claude — account**: run `claude`, then `/login`, on the host. On macOS this login stays in the keychain: use the subscription token instead.

```dotenv
OUTPOST_AGENT=claude
OUTPOST_AUTH=account
```

**Claude — subscription token**: obtain a token with `claude setup-token` on the host and declare it below.

```dotenv
OUTPOST_AGENT=claude
OUTPOST_AUTH=account-token
CLAUDE_CODE_OAUTH_TOKEN=
```

**Claude — API key**

```dotenv
OUTPOST_AGENT=claude
OUTPOST_AUTH=usage
ANTHROPIC_API_KEY=
```

**Antigravity, GitHub Copilot and Kimi Code** accept the same values when they support them: see [Antigravity](../../agents/connect-antigravity/), [Copilot](../../agents/connect-copilot/) and [Kimi Code](../../agents/connect-kimi/). Kimi API keys also need `OUTPOST_MODEL`.

Save **runtime.mts** next to the example. This complete configuration reads only declared variables, selects the agent and its authentication, and lets Outpost prepare the private sandbox home. The example calls `configuration()` to use your choice. The `OUTPOST_` settings belong to this teaching script, not the Outpost API.

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

Agent runs make real model calls. Account/model access and response time depend on your provider. See the official [Codex authentication](https://developers.openai.com/codex/auth/) and [Claude authentication](https://code.claude.com/docs/en/authentication) documentation.

</details>

<!-- /preparation -->

## Prerequisites and effects

Declare **both** `OPENAI_API_KEY=` and `ANTHROPIC_API_KEY=` in `workflow/.env` for this two-agent recipe: both agents use `usage` authentication and bill their API keys. The provider receives both declared values. To use host logins instead, pass `"account"` to `configuration()` for each agent after signing in on the host. Agents share files and Git history, but not native conversations. Dependencies serialize the operations. Review may change files, so tests run afterward. Nothing merges automatically. For a sequential version, use `sandbox.dispatch()` twice in the same order and check `sandbox.command()` status.

## Try it

Save **example.mts** in `workflow/`.

```ts file=example.mts
import {
  createSandbox,
  agentTask,
  commandTask,
  workflow,
} from "@elie-laloum/outpost";
import { configuration } from "./runtime.mts";

const author = await configuration("codex", "usage");
const reviewer = await configuration("claude", "usage");
await using sandbox = await createSandbox({
  ...author,
  branch: { mode: "named", name: "workshop/review" },
});
const implement = agentTask({
  key: "implement",
  sandbox,
  request: () => ({
    brief: {
      text: "Fix whitespace handling in text.ts, run npm test and commit.",
    },
    deadlineMs: 300_000,
  }),
});
const review = agentTask({
  key: "review",
  after: [implement],
  sandbox,
  request: (context) => ({
    agent: reviewer.agent,
    brief: {
      text: `Review changes against ${sandbox.workspace.baseline}. Implementation says: ${context.value(implement).text}. Fix defects, test and commit corrections.`,
    },
    deadlineMs: 300_000,
  }),
});
const verify = commandTask({
  key: "verify",
  after: [review],
  sandbox,
  command: { executable: "npm", arguments: ["test"], deadlineMs: 30_000 },
});
const result = await workflow("implement-review-test", [
  implement,
  review,
  verify,
]).start();
result.unwrap();
console.log(result.value(review).text, result.value(verify).status);
```

```sh
node example.mts
```

## Understand the result

Check the output and effects described before the code.

[Contracts, options and edge cases](../../behavior/cookbooks/pair-review/).

To start again, use a new demonstration directory. Named branches retain commits; dirty worktrees remain available for recovery. Scripts do not push commits.
