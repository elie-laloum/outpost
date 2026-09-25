---
title: "Core concepts and ownership"
description: "Core concepts and ownership — Outpost"
sidebar:
  order: 3
---

## Four building blocks

| Concept       | Responsibility                                | Typical lifetime            |
| ------------- | --------------------------------------------- | --------------------------- |
| Workspace     | Git checkout, branch, locks and integration   | One feature or several jobs |
| Sandbox       | Running environment attached to one workspace | One job or a warm session   |
| Agent adapter | Native CLI command and event translation      | Reusable configuration      |
| Workflow task | Typed operation and dependencies              | One node in a graph         |

For Claude Code and Codex, a conversation is separate: its native transcript can survive the sandbox and be resumed later. Forking a conversation does not fork its files.

## Pick the right entry point

Use `dispatch` for one job with automatic resource cleanup. Use `createSandbox` to reuse installed dependencies and in-memory environment state. Use `openWorkspace` when multiple environments or agents should work on the same branch over time. Use `attach` to open a native interactive agent session.

`dispatch` and `attach` close resources they created. A caller-supplied workspace remains the caller’s responsibility. Close a sandbox before its workspace. Handles support `await using`, or explicit, idempotent `close()` calls.

One sandbox accepts one operation at a time. One workspace belongs to one active sandbox at a time. For parallel tasks, allocate separate workspaces and sandboxes. Workflow concurrency does not remove these ownership rules.

## Cleanup preserves work

Closing a clean managed worktree removes its directory; named branches remain. Dirty worktrees are retained, and the close result provides `retainedDirectory`. Use `close({ preserve: true })` to keep a clean worktree too. Current-checkout mode does not remove your project directory.

See [resource lifecycle](../../environment/lifecycle/), [recovery](../../operations/recovery/) and [security boundaries](../../operations/security/).

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

## Observe the lifetimes

Save **example.mts** in `workflow/`. Two successive environments use the same branch; no model credentials are needed.

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

## Understand the result

The output shows `1 workshop/shared`, then `2 workshop/shared`. The workspace outlives the first sandbox and closes after the loop. The named branch remains in the demonstration repository. Start again in a new directory.
