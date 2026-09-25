---
title: "Inspect the environment you actually own"
description: "Run diagnostics inside a sandbox without making an agent request."
---

Run diagnostics inside a sandbox without making an agent request.

<!-- scenario:sandbox -->

<!-- preparation:sandbox -->

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

This example uses container commands only; no agent credentials are needed.

</details>

<!-- /preparation -->

## Try it

Save **example.mts** in `workflow/`.

```ts file=example.mts
import { createSandbox } from "@elie-laloum/outpost";
import { docker } from "@elie-laloum/outpost/providers/docker";
import { resolve } from "node:path";

await using sandbox = await createSandbox({
  repository: resolve(import.meta.dirname, "../repository"),
  provider: docker({ image: "outpost:docs-demo" }),
  branch: { mode: "named", name: "workshop/commands" },
});

const report = await sandbox.diagnose({ transfers: true });
console.log(report.hasFailures, report.checks);
if (report.hasFailures)
  throw new Error("Inspect the failing diagnostic checks");
```

```sh
node example.mts
```

## Understand the result

The report checks the actual running environment, including a binary transfer probe. It does not authenticate an agent or prove model access. Diagnostics temporarily hold the operation gate and clean their probes, but ownership remains with your script. For preflight checks before allocation, run `npx outpost doctor --provider docker --agent codex --image outpost:docs-demo`.

[Contracts, options and edge cases](../../behavior/operations/doctor/).

To start again, use a new demonstration directory. Named branches retain commits; dirty worktrees remain available for recovery. Scripts do not push commits.
