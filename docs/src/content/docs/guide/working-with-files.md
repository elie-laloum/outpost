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

### Native CLI validation status

Live Docker validation covers all four bindings: ephemeral workspaces, directory copies, read-only source mounts and writable source mounts. The declarations below belong to each pinned adapter; no wrapper around `harness.bind` is needed. Git-workspace support and a successful container preflight do not establish file-mode support.

Claude used `claude-haiku-4-5-20251001` with account-token authentication. Codex used `gpt-5.6-luna` with an environment API key through its existing custom Responses-provider variant. Copilot, Kimi (global region) and Antigravity used their local account sessions and native default model selection. These runs do not validate every authentication, model or provider combination.

Interactive validation uses a real terminal with native confirmations. Claude's onboarding preferences and Claude/Codex trust for the temporary directory are prepared in the private home. Fresh homes can still show native setup dialogs; capability declarations do not complete them. Kimi starts interactive sessions without an initial brief, so its first request is typed in the terminal. Antigravity's terminal validation completes native onboarding with optional interaction-data collection disabled, trusts the owned workspace and approves individual tool requests. Its earlier timeouts were caused by unhandled setup and permission dialogs.

| Agent          | Pinned CLI | Dispatch | Repairs  | Continuation | Live input | Interactive |
| -------------- | ---------- | -------- | -------- | ------------ | ---------- | ----------- |
| Claude Code    | 2.1.280    | Declared | Declared | Declared     | Declared   | Declared    |
| Codex          | 0.156.1    | Declared | Declared | Declared     | Declared   | Declared    |
| GitHub Copilot | 1.0.88     | Declared | Declared | Declared     | Declared   | Declared    |
| Kimi Code      | 2.1.1      | Declared | Declared | Declared     | Declared   | Declared    |
| Antigravity    | 1.2.12     | Declared | Declared | Refused      | Refused    | Declared    |

Contributors can use `scripts/cli-file-live.mjs` from the repository to validate one pinned CLI in Docker. Its `--preflight` mode checks the installed version and file bindings without model calls. Its explicit `--live` mode makes paid requests using selected environment credentials or explicitly authorized local account sessions; it is excluded from routine tests and CI. Run dispatch before repairs when validating another variant. A passing preflight or a simulated protocol test is not live capability evidence. See the [validation procedure](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/docs/audit/cli-file-workspaces.md) before running it.

File dispatch captures native conversations under its runtime directory and restores them into the new sandbox's native session location. Synthetic tests cover runtime containment; Claude, Codex and Kimi also demonstrated warm resume and fork, then restore and fork in fresh containers. Copilot demonstrated warm and cold resume; automated fork is unsupported. Antigravity demonstrated warm resume only and has no portable capture, so the general continuation capability remains refused. Copilot injects instructions through its native RPC server; Kimi uses its authenticated loopback server inside the sandbox. Their native hooks and MCP configurations retain the existing print protocol and steering by interruption/resume until those server combinations are validated. Antigravity also uses interruption/resume: its streaming input starts separate turns and does not provide demonstrated in-flight injection. Resume-based steering passed all four file bindings for Copilot, Kimi and Antigravity. See [steering](../steering/) for delivery modes.

Branches, commits, Git guards, integration, conflict resolution and speculation remain Git features. File results use `workspaceInfo` and `fileOutputs`; Git results keep mandatory `branch` and `commits`. File agent reports use version 2, while Git reports retain version 1. Use filesystem listing/search explicitly with `createHarnessFileTools({ selection: "filesystem" })` and `createHarnessSearchTools({ selection: "filesystem" })`; existing tool calls default to Git selection.

## Next steps

- [Publish the files you produced](../publishing-files/)

## Continue

- [Preserve and resume files](../resuming-file-workspaces/)
- [Run independent file tasks](../queued-workflows/)

<span id="preserve-and-resume-files"></span>

<span id="run-independent-jobs"></span>

<span id="check-capabilities-and-recover-publication"></span>
