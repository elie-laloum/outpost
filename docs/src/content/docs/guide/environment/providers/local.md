---
title: "Run trusted commands on the host"
description: "Use local execution explicitly, with a temporary repository and no container."
---

Use local execution explicitly, with a temporary repository and no container.

<!-- scenario:offline -->

<!-- preparation:offline -->

<details>
<summary>Prepare this example from scratch</summary>

Use Node.js **24+** and npm. Start in a new directory for each example.

```sh
mkdir outpost-example
cd outpost-example
```

```sh
npm init -y
npm install @elie-laloum/outpost
```

Save the example as **example.mts** in this directory. No account, API key or container is needed.

</details>

<!-- /preparation -->

## Try it

Save **example.mts** in `outpost-example/`.

```ts file=example.mts
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createSandbox } from "@elie-laloum/outpost";
import { localSandboxProvider } from "@elie-laloum/outpost/providers/local";

const repository = await mkdtemp(join(tmpdir(), "outpost-local-"));
try {
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd: repository });
  git("init", "-b", "main");
  await writeFile(join(repository, "text.txt"), "hello");
  git("add", ".");
  git(
    "-c",
    "user.name=Workshop",
    "-c",
    "user.email=workshop@example.invalid",
    "commit",
    "-m",
    "initial",
  );
  {
    await using sandbox = await createSandbox({
      repository,
      sandboxProvider: localSandboxProvider(),
    });
    const result = await sandbox.command({
      executable: process.execPath,
      arguments: ["-e", "console.log('host execution')"],
    });
    assert.equal(result.status, 0);
    console.log(result.stdout.trim());
  }
} finally {
  await rm(repository, { recursive: true, force: true });
}
```

```sh
node example.mts
```

## Understand the result

Install Git as well as the Node/npm preparation. The output is `host execution`. The command runs as your OS account: local provides no filesystem or environment isolation. This exercise owns and deletes only its temporary directory. Using a worktree separates Git changes but does not prevent access to unrelated host files.

[Contracts, options and edge cases](../../../behavior/providers/local/).

Any persisted example files remain inside this demonstration directory.
