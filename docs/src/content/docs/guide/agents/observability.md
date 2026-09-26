---
title: "Follow progress and usage"
description: "See agent events while a task runs and inspect the recorded token usage afterward."
---

See agent events while a task runs and inspect the recorded token usage afterward.

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

**Antigravity, GitHub Copilot and Kimi Code** accept the same values when they support them: see [Antigravity](../connect-antigravity/), [Copilot](../connect-copilot/) and [Kimi Code](../connect-kimi/). Kimi API keys also need `OUTPOST_MODEL`.

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

## Try it

Save **example.mts** in `workflow/`.

```ts file=example.mts
import { dispatch, reporter } from "@elie-laloum/outpost";
import { configuration } from "./runtime.mts";
const runtime = await configuration();

const result = await dispatch({
  ...runtime,
  branch: { mode: "named", name: "workshop/observe" },
  brief: {
    text: "Read text.ts and explain the whitespace bug. Do not edit files. Print <outpost>done</outpost>.",
  },
  observe: reporter(),
  warn: (message) => console.error(message),
  deadlineMs: 300_000,
});
console.log({
  usage: result.usage,
  logReference: result.logReference,
  text: result.text,
});
```

```sh
node example.mts
```

## Understand the result

The reporter shows progress; `usage` reports available raw token counts, not a currency estimate. Logs belong to the target repository’s `.outpost`. Observer failures do not change execution outcomes. Agent text and logs can contain source code or sensitive output: choose what you retain or export.

[Contracts, options and edge cases](../../behavior/agents/observability/).

To start again, use a new demonstration directory. Named branches retain commits; dirty worktrees remain available for recovery. Scripts do not push commits.

## Create your own reporter

A plain `observe(event)` callback already supports custom integrations. Use `createReporter()` when you want typed handlers by event kind and ordered asynchronous writes. `reporter()` remains the ready-made terminal display.

Reuse the preparation above, then install Winston in `workflow/`:

```sh
npm install winston@3
```

Save **reporter.mts** for the reusable handlers:

```ts file=reporter.mts
import type { FileHandle } from "node:fs/promises";
import { createReporter } from "@elie-laloum/outpost";

export function applicationReporter(
  logger: { info(message: string): unknown },
  file: FileHandle,
) {
  return createReporter(
    {
      phase(event) {
        logger.info(event.name);
      },
      tool(event) {
        console.log(event.name, event.input);
      },
      async text(event) {
        await file.write(event.text);
      },
    },
    { onError: (error) => console.error("Reporter:", error) },
  );
}
```

Save **custom.mjs** to connect Winston, the console and a file:

```js file=custom.mjs
import { open } from "node:fs/promises";
import { finished } from "node:stream/promises";
import winston from "winston";
import { dispatch } from "@elie-laloum/outpost";
import { configuration } from "./runtime.mts";
import { applicationReporter } from "./reporter.mts";

const runtime = await configuration();
const file = await open("agent-text.log", "a", 0o600);
const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});
const report = applicationReporter(logger, file);
try {
  await dispatch({
    ...runtime,
    branch: { mode: "named", name: "workshop/custom-reporter" },
    brief: { text: "Summarize this repository. Do not edit files." },
    observe: report,
  });
} finally {
  try {
    await report.flush();
  } finally {
    const logsFinished = finished(logger, { readable: false });
    logger.end();
    await Promise.all([file.close(), logsFinished]);
  }
}
```

```sh
node custom.mjs
```

Phase messages appear through Winston, tool calls through `console.log`, and text fragments are appended to `agent-text.log`. Unhandled event kinds are ignored. `flush()` waits for previously received events before you close the file and logger. Winston has its own [log completion lifecycle](https://github.com/winstonjs/winston#awaiting-logs-to-be-written-in-winston).

Handlers run serially and may return promises. Dispatch does not await them. A slow destination can grow the in-memory queue; the helper neither drops events nor slows the agent. Handler errors call `onError` and do not prevent later events from running; every `flush()` rejects with the first handler error after draining its snapshot. Diagnostic errors are isolated. The helper never closes your destinations.

For dispatch spans and metrics, use the separate `telemetry` option described in [OpenTelemetry](../../advanced/telemetry/).
