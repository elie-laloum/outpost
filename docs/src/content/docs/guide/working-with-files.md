---
title: "Run without a Git repository"
description: "Process an empty workspace, a directory copy or an explicit mount."
---

:::note[Agent compatibility]
Native CLI agent variants require demonstrated file-mode capabilities and are otherwise refused.
:::

Install Outpost in an ESM project with Node.js 24+. The command example uses Docker and `node:24-slim`; it needs no agent login or Git repository.

Download the image before opening the sandbox; Outpost checks that it is available locally.

```sh
docker pull node:24-slim
```

An `ephemeral` workspace starts empty. A `directory` source copies ordinary files by default, excluding `.git`, `.outpost` and the run's control directory. Copy selection does not apply `.gitignore`. JSON inputs remain parameters; declared directory or snapshot inputs supply files.

New copies, snapshots and publications preserve binary contents, portable permissions, empty directories and relative links whose targets remain inside the selection. Link validation expands captured aliases before processing parent segments; dangling targets and excluded aliases are refused. Traversal does not follow links. Outgoing links and special files are refused. Mounted sources expose their full contents and cannot declare copy selection.

## Run a command in an ephemeral workspace

Create an empty root with local retention to keep its files after closing.

```ts title="empty-workspace.ts"
import { createWorkspace } from "@elie-laloum/outpost";

export function openEmptyWorkspace() {
  return createWorkspace({
    source: { kind: "ephemeral" },
    runtime: { directory: "./.outpost", namespace: "documents" },
    retention: { policy: "local" },
  });
}
```

Run the command and check its exit status.

```ts title="ephemeral.ts"
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";
import { openEmptyWorkspace } from "./empty-workspace.ts";

await using workspace = await openEmptyWorkspace();
await using sandbox = await workspace.sandbox({
  sandboxProvider: createDockerSandboxProvider({ image: "node:24-slim" }),
});
const result = await sandbox.command({
  executable: "node",
  arguments: ["-e", "require('fs').writeFileSync('result.json', '{}')"],
});
if (result.status !== 0) throw new Error(result.stderr);
console.log(workspace.directory);
```

This script creates `result.json` in `workspace.directory`. Local retention keeps that directory after success or failure. Continue with [output publication](../publishing-files/) to copy results to a destination.

TypeScript file workspaces default to `.outpost` under the current directory. Legacy Git execution continues to use `<repository>/.outpost`. File modes do not search for a repository or load environment variables from a data directory's `.env`.

Docker and Podman require Node.js 24+, the selected engine and host `tar` for the existing streamed transfers. The container image is explicit. Git is needed only by Git features or a command the caller chooses to execute. A workflow without sandbox operations can use the workflow engine directly.

## Mount a source explicitly

Declare the exposed subdirectory and explicitly choose whether the sandbox can write to the source.

```ts title="mounted-documents.ts"
import { createWorkspace } from "@elie-laloum/outpost";

export function openMountedDocuments() {
  return createWorkspace({
    source: {
      kind: "directory",
      directory: "./documents",
      access: { mode: "mount", target: "input", readOnly: false },
    },
  });
}
```

The owned working root stays separate; the source appears under `input/`. Set `readOnly: true` to prevent sandbox writes to it. A writable mount changes the source immediately. Sandbox/workspace cleanup neither deletes nor rolls back that source. Publication back to a writable mounted source is refused; publish files produced in the owned root to another destination.

Host-wide locks coordinate overlapping sources and publication destinations across different runtime roots for one host user. Two overlapping mounts are refused when either is writable. Copy capture is refused while an Outpost writer owns the source. Canonical paths, known aliases and parent/child relationships participate in these checks. Locks coordinate cooperating Outpost processes; external edits are detected and preserved.

## Check the execution environment

| Execution environment    | Copy / ephemeral       | Source mount                       |
| ------------------------ | ---------------------- | ---------------------------------- |
| Mounted Docker / Podman  | Yes                    | Read-only or writable              |
| Isolated Docker / Podman | Transfers              | Refused                            |
| Local                    | Host files, unisolated | Refused                            |
| Vercel / Daytona         | Transfers              | Refused                            |
| Firecracker              | Experimental transfers | Refused                            |
| Memory testing           | Scripted commands      | Simulation only; transfers refused |

File dispatch supports the Outpost harness and compatible custom/scripted adapters. Native CLI dispatch, interactive attachment, continuation, repairs and live input require a declared, validated capability for the pinned adapter variant. Undemonstrated native variants are refused. Cloud and Firecracker live validation remains separate. Isolated container/cloud providers do not acquire an automatic abandoned-allocation recovery capability merely because files can be restored.

Branches, commits, Git guards, integration, conflict resolution and speculation remain Git features. File results use `workspaceInfo` and `fileOutputs`; Git results keep mandatory `branch` and `commits`. File agent reports use version 2, while Git reports retain version 1. Use filesystem listing/search explicitly with `createHarnessFileTools({ selection: "filesystem" })` and `createHarnessSearchTools({ selection: "filesystem" })`; existing tool calls default to Git selection.

## Next steps

- [Publish the files you produced](../publishing-files/)

## Continue

- [Preserve and resume files](../resuming-file-workspaces/)
- [Run independent file tasks](../queued-workflows/)

<span id="preserve-and-resume-files"></span>

<span id="run-independent-jobs"></span>

<span id="check-capabilities-and-recover-publication"></span>
