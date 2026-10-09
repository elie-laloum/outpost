---
title: "Workspaces"
description: "Choose a Git source, a directory or an ephemeral root and manage its lifecycle."
---

A workspace provides working files; a sandbox runs commands and agents. Choose the source according to the available files and how you want to collect changes.

## Choose a source

| Source                 | Use                                                 | Collect changes                               |
| ---------------------- | --------------------------------------------------- | --------------------------------------------- |
| `git`                  | Existing repository, history and branches           | Retain a branch or integrate its commits      |
| `directory` with copy  | Process a directory while keeping its source intact | Publish selected files to a destination       |
| `directory` with mount | Expose the source under a declared subdirectory     | Writable mounts change the source immediately |
| `ephemeral`            | Start with an empty root                            | Publish produced files or retain a snapshot   |

Existing Git calls keep their defaults. Directory and ephemeral sources are implemented locally and unreleased. Use `createWorkspace()` to open a declared source, `workspaceSource` to let a wrapper allocate the resource, or `workspace` to borrow an already open resource. Fileless callbacks, decisions and JSON workflows use the workflow engine directly.

## Separate workspace and sandbox

A workspace serves one sandbox at a time and can be reused after it closes. Close the sandbox before the workspace. A sandbox borrowing a workspace leaves its disposal to the caller; wrappers allocating their own resources manage their lifecycle. [How it works](../how-it-works/) explains this ownership.

## Git workspaces

Git is required for these sources. Branches, commits, guards, integration and conflict resolution follow their existing contracts.

### Point at a checkout

Pass `repository` to select the Git checkout the task will use. Your workflow scripts can live elsewhere; resolve the repository path from the script’s directory when you want it to work from any current directory.

```ts
import { reportValue } from "./reporter.ts";
import { resolve } from "node:path";
import { dispatch } from "@elie-laloum/outpost";
import { coder, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository: resolve(import.meta.dirname, "../application"),
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/update-deps" },
  brief: { text: "Update the outdated dependencies and commit the change." },
});
reportValue(result.branch, result.commits.length);
// Example output: outpost/update-deps 1
```

It prints `outpost/update-deps` and the number of commits. A relative path resolves from the working directory: resolving it from `import.meta.dirname` lets the script run from anywhere.

### Choose where commits land

Keep the work on a named branch to review commits before merging. Choose automatic integration when a successful task should merge its commits into your starting branch.

API reference: [BranchPolicy](../../reference/branchpolicy/).

### Refuse unwanted committed changes

Set a workspace `guard` to reject protected paths or an oversized final committed diff, independently of the agent. This dispatch integrates only when both rules pass. A refusal throws `OutpostError` with code `guard`, releases the sandbox and retains the branch and worktree for review.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Fix the failing tests and commit the fix." },
  branch: { mode: "integrate" },
  guard: {
    protectedPaths: [".github/**", "migrations/**"],
    maxChangedLines: 800,
  },
});
```

The count adds inserted and deleted lines; a total of 800 passes. Detected renames without content changes count zero lines, but both paths are checked. With a line limit, binary changes are refused because Git cannot count their lines. See [DiffGuard](../../reference/diffguard/) for the pattern syntax and options.

The check runs after synchronization and again under the integration lock, before merging the inspected commit. It includes changes inherited through `branch.from`, starting at the common ancestor with the host branch. In `named` mode, it checks from the workspace’s opening commit across successive executions. `current` is refused before execution. Configure `guard` on `openWorkspace()` when supplying an existing workspace; successive agents share its policy.

Only the final committed diff is checked: a protected file modified and then restored is permitted, and uncommitted files are excluded. This is an integration rule, not a filesystem permission. A failed or incomplete inspection also refuses integration. Inspect `error.details` for violations and compared commits, and `recoveryDetails(error)` for the retained branch and directory. Closing the same workspace preserves a refused worktree even without `preserve: true`. A later failed pass does not undo earlier integrations.

### Gate integration on a check

`dispatch()` and `workspace.dispatch()` merge an `integrate` branch as soon as the agent succeeds. To run your own check first, open the workspace yourself and work in a [sandbox session](../sandbox-sessions/).

<!-- tabs -->

```ts title="change.ts"
import type { Workspace } from "@elie-laloum/outpost";
import { sandboxProvider, coder } from "./outpost.config.ts";

export async function change(workspace: Workspace) {
  await using sandbox = await workspace.sandbox({
    sandboxProvider,
    agent: coder,
  });
  await sandbox.dispatch({
    brief: { text: "Fix the failing tests and commit the fix." },
  });
  const check = await sandbox.command({
    executable: "npm",
    arguments: ["test"],
  });
  if (check.status !== 0) throw new Error(check.stderr || "Tests failed");
}
```

```ts title="integrate.ts"
import { openWorkspace } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";
import { change } from "./change.ts";

export const workspace = await openWorkspace({
  repository,
  branch: { mode: "integrate" },
});
try {
  await change(workspace);
  await workspace.integrate();
} finally {
  await workspace.close();
}
```

`sandbox.dispatch()` never merges, so the merge happens only when `npm test` passes. Otherwise the unmerged branch stays in your repository under `workspace.branch`. `integrate()` does nothing in the other modes.

### Resolve merge conflicts with an agent

Opt into `onConflict` to integrate an existing feature branch through a dedicated resolution branch. Close any sandbox on the source workspace before calling it. `branch.from` selects the feature commit to integrate; the host checkout is the target branch. A merge without Git conflicts skips the agent and the verification command.

```ts
import { createAgentConflictResolver } from "@elie-laloum/outpost";
import { coder, sandboxProvider } from "./outpost.config.ts";
import { openWorkspace } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";

await using workspace = await openWorkspace({
  repository,
  branch: { mode: "integrate", from: "feature/to-integrate" },
});

const resolution = await workspace.integrate({
  onConflict: createAgentConflictResolver(coder, {
    sandboxProvider,
    verify: { executable: "npm", arguments: ["test"] },
  }),
});
```

Outpost freezes the source and host commits, opens a separate named worktree and prepares the conflicting merge inside the explicit provider's sandbox. The agent must resolve and commit it. Outpost then runs `npm test` on that combined commit, requires status zero and refuses nonignored uncommitted changes or a changed commit during verification. Install the project's test dependencies in the chosen environment first; the strategy does not install them automatically.

Before integrating, Outpost checks that both original branches still point to their frozen commits, that the host checkout is clean, and that the resolution contains both commits. The source workspace's `guard` is enforced again on the final resolution diff. It fast-forwards the host to the exact verified commit under the integration lock. It never pushes.

On failure, cancellation or deadline, the original branches are not moved by the resolver. Both source and resolution worktrees remain; `recoveryDetails(error)` identifies the resolution branch and directory and includes `sourceBranch` and `sourceDirectory`. Inspect these before retrying. Mounted Git metadata is writable by the agent: these checks are integration guarantees for cooperating code, not an adversarial security boundary.

The optional result `resolution` contains the verified commit, command output and the resolution agent's usage. Add that usage to your own workflow accounting: it is separate from the original task. A clean successful resolution worktree may be removed; its branch and captured conversation remain. The total deadline defaults to ten minutes, and the verification command defaults to five minutes within that total. The strategy performs one dispatch without an automatic repair loop.

A custom [`ConflictResolver`](../../reference/conflictresolver/) receives the same separate workspace and must return a verified committed result and close its sandbox. Dirty hosts, changed host branches and diff guard refusals do not invoke it. Deterministic Git, simulated-remote and real Docker tests in mounted and isolated modes cover the strategy; live CLI agent and cloud validation remains pending.

API: [createAgentConflictResolver](../../reference/createagentconflictresolver/) · [IntegrationOptions](../../reference/integrationoptions/) · [ConflictResolution](../../reference/conflictresolution/).

### Reuse one workspace across sandboxes

An open workspace owns the repository, the branch and the copied files. `workspace.dispatch()` and `workspace.sandbox()` start a fresh sandbox on it each time, so two agents can work in turn on the same branch. Passing `workspace` to [`createSandbox()`](../../reference/createsandbox/) or `dispatch()` does the same.

A workspace serves one sandbox at a time. Close the sandbox before the workspace: [How it works](../how-it-works/) shows who closes what.

### Copy ignored files into the worktree

A new worktree holds only committed files. `copies` lists repository-relative files or directories to copy from your checkout, such as an ignored test configuration.

```ts
import { reportValue } from "./reporter.ts";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/e2e" },
  copies: [".env.test"],
  brief: { text: "Run the end-to-end tests and fix what fails." },
});
reportValue(result.retainedDirectory);
// Example output: /project/.outpost/workspaces/…
```

Missing entries are skipped. Cloud sandboxes receive the commits and `copies`; `includeUncommitted: true` also sends the worktree’s uncommitted files ([Cloud sandboxes](../cloud-sandboxes/)). Without it, a copy that no committed `.gitignore` excludes makes the first synchronization fail with code `workspace`.

### Recover retained work

Closing keeps the worktree when it holds uncommitted, untracked or ignored files, or a detached `HEAD`. Its path comes back as `retainedDirectory`. Here, the copied `.env.test` keeps it.

`close({ preserve: true })` keeps it on purpose. Inspect retained work with [Recover work](../recovery/) and prune it with [Retention and cleanup](../retention/).

### Limits

- Integration is a local `git merge` into your checkout. Outpost never pushes: publish from your own delivery process.
- `integrate` needs a checked-out branch, not a detached `HEAD`, and fails with `conflict` if you switch branches before the merge.
- A merge that stops on a conflict fails with `conflict`; resolve or abort it in your checkout. The work branch stays.
- A second task on the same checkout (`current`) or branch fails with `conflict` instead of waiting. Give parallel tasks their own branches.
- A `named` branch checked out in your own checkout fails with `conflict`.
- `copies` requires `named` or `integrate`, and cloud sandboxes reject `current`.
- A sandbox works on one repository: see [Multiple repositories](../multiple-repositories/).

API: [dispatch](../../reference/dispatch/) · [openWorkspace](../../reference/openworkspace/) · [BranchPolicy](../../reference/branchpolicy/) · [WorkspaceOptions](../../reference/workspaceoptions/) · [Workspace](../../reference/workspace/).

## File workspaces

An `ephemeral` workspace starts empty. A `directory` source copies ordinary files by default, excluding `.git`, `.outpost` and the run's control directory. Copy selection does not apply `.gitignore`. JSON inputs remain parameters; declared directory or snapshot inputs supply files.

New copies, snapshots and publications preserve binary contents, portable permissions, empty directories and relative links whose targets remain inside the selection. Link validation expands captured aliases before processing parent segments; dangling targets and excluded aliases are refused. Traversal does not follow links. Outgoing links and special files are refused. Mounted sources expose their full contents and cannot declare copy selection.

### Run a command in an ephemeral workspace

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
```

This script creates `result.json` in `workspace.directory`. Local retention keeps that directory after success or failure. The next section explains publication to a destination.

TypeScript file workspaces default to `.outpost` under the current directory. Legacy Git execution continues to use `<repository>/.outpost`. File modes do not search for a repository or load environment variables from a data directory's `.env`.

Docker and Podman require Node.js 24+, the selected engine and host `tar` for the existing streamed transfers. The container image is explicit. Git is needed only by Git features or a command the caller chooses to execute. A workflow without sandbox operations can use the workflow engine directly.

### Copy and publish a directory

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
    runtime: { directory: "./.outpost" },
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

Place your processing script `process.js` in `documents/`, then run this file with Node.js 24+ after installing Outpost.

```ts title="process-documents.ts"
import { createSandbox } from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";
import { openDocuments } from "./documents.ts";
import { publishDocuments } from "./publication.ts";

await using workspace = await openDocuments();
const sandboxProvider = createDockerSandboxProvider({ image: "node:24-slim" });
await using sandbox = await createSandbox({ workspace, sandboxProvider });
await sandbox.command({ executable: "node", arguments: ["process.js"] });
await sandbox.close({ preserve: true });
await publishDocuments(workspace);
```

The original source stays unchanged while the copied workspace is used. `create` requires a new destination; `update` checks a destination captured before execution. For publication back to a copied source, the initial copy provides that baseline. Other destinations require `prepareWorkspaceOutputs()` before opening the sandbox.

Paths retain their relative names from the workspace root: selecting `output/result.json` publishes `output/result.json`, without removing `output/`. `deleteMissing` defaults to false. When enabled, it removes only selected files from the initial destination that have corresponding missing outputs; newly appeared and unselected files remain.

Publication validates and stages every output before mutation, journals the plan through Transport and quarantines existing entries on the same filesystem. Installation refuses destinations recreated concurrently. On failure it attempts rollback in reverse order, restoring only entries still matching Outpost's effects. External changes and necessary backups remain recoverable. This is recoverable publication across several operations, without atomic replacement of an entire tree. Ambiguous file/directory changes are refused.

Closing a workspace or sandbox primitive alone does not publish files. Dispatch wrappers publish their declared outputs after success and after sandbox operations stop.

### Mount a source explicitly

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

### Preserve and resume files

Use retention `run` for cleanup after success, `local` to retain successful materializations, or `portable` with an explicit Transport and namespace to keep validated snapshots. A workflow checkpoint records progress; a snapshot records files. Their responsibilities remain separate.

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

The local Transport in this example is portable only when its storage remains available to the next worker. For another host, provide a shared Transport explicitly. A namespace derived from a local physical path is insufficient for portable restoration.

At each completed command or agent turn, Outpost synchronizes files, conserves and verifies the settled generation, then records its description in the checkpoint before publishing completion or a pause. Usage accounting does not snapshot files while an operation runs. Local resume checks the physical directory, ownership marker and settled generation; missing, replaced or changed workspaces are refused. Portable resume restores a verified snapshot into a new owned root. Mounted sources must still be accessible and unchanged; a snapshot never converts a mount into a copy.

Human tasks use `defineInteractiveAgentTask()` with `workspaceSource`, a provider and a capture/resume capable harness. They retain files and conversation state, close the sandbox before asking, and continue in a second process without replaying completed turns. See [interactive tasks](../interactive-tasks/) for question/answer contracts.

An interrupted owner requires explicit recovery after stopping its processes. `recoverFileWorkspace()` checks `expectedRevision` and `processesStopped: true`, with optional `allocationReleased`, `adoptInterruptedFiles` or `adoptMountedSource`. Inspect revisions first with `inspectFileWorkspace()`. Checkpoint ownership recovery and authorization to replay an interrupted attempt remain separate. A file snapshot does not prove that an uncertain remote sandbox was disposed.

Outpost registers an owned file root before copying inputs or running preparation hooks. Interrupted or failed preparation retains an inspectable record and partial files; ordinary restoration refuses it. After stopping its processes, explicitly adopt those files with `adoptInterruptedFiles` to recover the resource. Adoption does not rerun preparation or authorize replaying a workflow task.

### Run independent jobs

This factory declares a separate ephemeral command for each task key.

```ts title="file-task.ts"
import { defineIsolatedCommandTask } from "@elie-laloum/outpost";
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";

export function fileTask(key: string) {
  return defineIsolatedCommandTask({
    key,
    request: () => ({
      workspaceSource: { kind: "ephemeral" },
      sandboxProvider: createLocalSandboxProvider(),
      command: { executable: "node", arguments: ["-p", "process.cwd()"] },
    }),
  });
}
```

Run both tasks together; their roots and sandboxes remain distinct.

```ts title="independent-files.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { fileTask } from "./file-task.ts";

const left = fileTask("left"),
  right = fileTask("right");
await defineWorkflow("independent-files", [left, right]).start({
  concurrency: 2,
});
```

The local provider here runs directly on the host without isolation. Each owned isolated task and queued job receives its own identity and root. Shared sandboxes remain sequential. Durable wrappers use a common workspace checkpoint coordinator. Borrowed workspaces remain the caller's responsibility and are not automatically made restorable. Task caches contain JSON results; hits do not reproduce file writes.

### Check capabilities and recover publication

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

```sh
outpost recovery inspect --runtime-directory ./.outpost --locks --json
outpost recovery workspace inspect --runtime-directory ./.outpost \
  --namespace documents --workspace-id WORKSPACE_ID --json
outpost recovery publication inspect --runtime-directory ./.outpost \
  --namespace documents --publication-id PUBLICATION_ID --json
outpost recovery publication rollback --runtime-directory ./.outpost \
  --namespace documents --publication-id PUBLICATION_ID --processes-stopped
```

Replace `rollback` with `finish` to complete an interrupted publication after checking current preconditions. These actions never rerun tasks. Stop the owning processes before authorizing abandoned-lock recovery. If interruption left registry coordination busy, inspect `recovery registry inspect` and recover its exact `DEVICE:INODE` revision only after all coordinating processes stop. Retain backups when concurrent changes prevent recovery.

For portable conservation, `restoreFileWorkspace()` receives the declared Transport and can restore the verified snapshot into a new materialization. A publication's destination and quarantine must remain accessible; a portable journal does not relocate these physical paths. Restoration replays no task.
