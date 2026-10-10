---
title: "Preserve and resume file workspaces"
description: "Keep a file workspace for a later process."
---

Keep a [file workspace](../working-with-files/) for a later process. A checkpoint saves workflow progress; a snapshot saves files.

## Choose what to retain

- `run`: clean up owned files after success.
- `local`: keep them on this machine.
- `portable`: also save verified snapshots through an explicit transport and namespace.

Use this factory in place of `openEmptyWorkspace()` from the file-workspace example.

```ts title="portable-workspace.ts"
import { createWorkspace, createLocalTransport } from "@elie-laloum/outpost";

export function openPortableWorkspace() {
  return createWorkspace({
    source: { kind: "ephemeral" },
    runtime: { directory: "./.outpost", namespace: "documents" },
    retention: {
      policy: "portable",
      transporter: createLocalTransport({ directory: "./conserved" }),
    },
  });
}
```

The next worker must be able to read `./conserved`. For another host, use shared storage and keep the explicit `documents` namespace; a name derived from a local path is insufficient.

## Resume completed work

After a command or agent turn finishes, Outpost synchronizes and verifies its files before recording completion or a pause. Local resume refuses missing, replaced or changed files. Portable resume restores a verified snapshot into a new owned directory. Mounted sources must remain accessible and unchanged: a snapshot does not turn a mount into a copy.

[Interactive tasks](../interactive-tasks/) also retain the conversation and close the sandbox before asking a question. Resuming them does not repeat completed turns.

Save these scripts beside `portable-workspace.ts`. This example writes directly into the workspace and needs no agent or sandbox.

<!-- tabs -->

```ts title="save-files.ts"
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { openPortableWorkspace } from "./portable-workspace.ts";

const workspace = await openPortableWorkspace();
try {
  await writeFile(
    join(workspace.directory, "report.txt"),
    "Ready for review\n",
  );
  const record = await workspace.checkpoint();
  await writeFile("workspace-record.json", JSON.stringify(record));
} finally {
  await workspace.close({ preserve: true });
}
```

```ts title="restore-files.ts"
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  createLocalTransport,
  restoreFileWorkspace,
} from "@elie-laloum/outpost";

const record = JSON.parse(await readFile("workspace-record.json", "utf8"));
await using workspace = await restoreFileWorkspace(record, {
  portable: true,
  runtime: { directory: "./.outpost-restored", namespace: "documents" },
  retention: {
    policy: "portable",
    transporter: createLocalTransport({ directory: "./conserved" }),
  },
});
console.log(workspace.directory);
console.log(await readFile(join(workspace.directory, "report.txt"), "utf8"));
```

Run `node save-files.ts`, then `node restore-files.ts` from the same directory. The second process prints the new path and `Ready for review`. Keep `workspace-record.json` and `conserved/` together: the former references the snapshot in the latter.

## Recover interrupted ownership

1. Stop the previous owner’s processes and confirm any remote allocation has been released. A file snapshot does not prove that a remote sandbox stopped.
2. Inspect the workspace with [inspectFileWorkspace](../../reference/inspectfileworkspace/) and keep its revision.
3. Pass the inspected record and explicit stopped-process authorization to [recoverFileWorkspace](../../reference/recoverfileworkspace/). A changed revision is refused.
4. Recover checkpoint ownership and authorize interrupted-task replay separately when required.

Interrupted preparation retains its record and partial files. Ordinary restoration refuses them; after stopping the processes, `adoptInterruptedFiles` explicitly accepts those files without rerunning preparation. Changing a mounted source needs its own explicit adoption. Neither action authorizes workflow replay.

For a failed publication, follow [publication recovery](../publishing-files/).
