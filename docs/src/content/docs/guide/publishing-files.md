---
title: "Publish selected output files"
description: "Copy selected results to a destination and recover interrupted publication."
---

Use a [directory copy](../working-with-files/) to process files without changing the source during execution. Publish only after checking the command result and closing the sandbox. Writable source mounts change the source immediately and cannot be undone by publication rollback.

## Copy and publish a directory

Open an owned copy of the source directory to retain its files during processing.

```ts title="documents.ts"
import { createWorkspace } from "@elie-laloum/outpost";

export function openDocuments() {
  return createWorkspace({
    source: {
      kind: "directory",
      directory: "./documents",
      access: { mode: "copy" },
    },
    runtime: { directory: "./.outpost", namespace: "documents" },
  });
}
```

Declare selection and authorized deletions for publication back to the source.

```ts title="publication.ts"
import {
  publishWorkspaceOutputs,
  type FileWorkspace,
} from "@elie-laloum/outpost";

export function publishDocuments(workspace: FileWorkspace) {
  return publishWorkspaceOutputs(workspace, {
    paths: ["**/*.json"],
    destination: "./documents",
    policy: "update",
    deleteMissing: true,
  });
}
```

Create `documents/` and save this `process.js` inside it. It writes a JSON inventory you can inspect after publication.

```js title="process.js"
import { readdir, writeFile } from "node:fs/promises";

const files = await readdir(".");
await writeFile("summary.json", JSON.stringify({ files }, null, 2));
```

Save the TypeScript files in the parent directory and run `node process-documents.ts`. On success, `documents/summary.json` contains the copied file list.

```ts title="process-documents.ts"
import { createSandbox } from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";
import { openDocuments } from "./documents.ts";
import { publishDocuments } from "./publication.ts";

await using workspace = await openDocuments();
const sandboxProvider = createDockerSandboxProvider({ image: "node:24-slim" });
await using sandbox = await createSandbox({ workspace, sandboxProvider });
const result = await sandbox.command({
  executable: "node",
  arguments: ["process.js"],
});
if (result.status !== 0) throw new Error(result.stderr || "Processing failed");
await sandbox.close({ preserve: true });
await publishDocuments(workspace);
```

The original source stays unchanged while the copied workspace is used. `create` requires a new destination; `update` checks a destination captured before execution. For publication back to a copied source, the initial copy provides that baseline. Other destinations require `prepareWorkspaceOutputs()` before opening the sandbox.

Paths retain their relative names from the workspace root: selecting `output/result.json` publishes `output/result.json`, without removing `output/`. `deleteMissing` defaults to false. When enabled, it removes only selected files from the initial destination that have corresponding missing outputs; newly appeared and unselected files remain.

Publication validates and stages every output before mutation, journals the plan through Transport and quarantines existing entries on the same filesystem. Installation refuses destinations recreated concurrently. On failure it attempts rollback in reverse order, restoring only entries still matching Outpost's effects. External changes and necessary backups remain recoverable. This is recoverable publication across several operations, without atomic replacement of an entire tree. Ambiguous file/directory changes are refused.

Closing a workspace or sandbox primitive alone does not publish files. Dispatch wrappers publish their declared outputs after success and after sandbox operations stop.

On Windows, permission checks cover the writable bit supported by Node.js; POSIX owner, group and executable permissions are not preserved. Existing Windows access controls still apply.

## Recover an interrupted publication

Inspect the publication first. Replace `PUBLICATION_ID` with the retained journal’s ID; `documents` is this example’s namespace.

```sh
outpost recovery publication inspect --runtime-directory ./.outpost \
  --namespace documents --publication-id PUBLICATION_ID --json
```

Stop the owning processes and confirm they have exited before authorizing recovery. To undo the publication’s effects:

```sh
outpost recovery publication rollback --runtime-directory ./.outpost \
  --namespace documents --publication-id PUBLICATION_ID --processes-stopped
```

Use `finish` instead of `rollback` to complete publication after inspection. Neither command replays a task. If concurrent changes prevent recovery, keep the backups for manual repair.

The destination and backup directory must remain accessible at their original paths: a portable journal does not move those files. If the registry stays locked, inspect `recovery registry inspect` and recover its exact `DEVICE:INODE` revision only after all coordinating processes have stopped.

To restore the workspace itself, follow [file workspace resume](../resuming-file-workspaces/).
