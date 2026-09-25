---
title: "Independent workspaces"
description: "Independent workspaces — Outpost"
sidebar:
  order: 2
---

Create a workspace separately when it should outlive individual sandboxes. It owns the branch, worktree, copy inputs and Git lock.

```ts
import {
  agent as composeAgent,
  openWorkspace,
  codexHarness,
  claudeHarness,
} from "@elie-laloum/outpost";

await using workspace = await openWorkspace({
  branch: { mode: "named", name: "feature/shared" },
  copies: [".env.test"],
  label: "validation",
});
await workspace.dispatch({
  agent: composeAgent({ harness: codexHarness({}) }),
  brief: { text: "Implement the feature and commit." },
});
await workspace.dispatch({
  agent: composeAgent({ harness: claudeHarness({}) }),
  brief: { text: "Review the change and commit corrections." },
});
```

`workspace.dispatch()` creates and closes its sandbox but leaves the workspace open. `workspace.sandbox()` returns a warm environment. `workspace.attach()` opens a native terminal session. `workspace.integrate()` applies an integration workspace’s commits to the host branch.

## Configuration

`repository` defaults to the current directory and accepts a directory inside a repository. `copies` lists repository-relative inputs copied before workspace hooks. Use it for ignored configuration that a newly created worktree needs. Never copy a credential simply because it exists in the host project.

`label` names generated branches/directories. `hooks.workspaceReady` runs when the workspace opens; other hooks are passed to later sandboxes. `limits` configures Git/copy deadlines. See [hooks](../../../environment/hooks/) and [WorkspaceOptions](../../../../reference/workspaceoptions/).

Passing `workspace` to `createSandbox` or `dispatch` excludes `repository`, `branch` and `copies` in that call: the workspace already owns those choices. Only one sandbox may own it at a time. Close that sandbox before closing the workspace.

Workspace records expose `repository`, `directory`, `branch`, `baseBranch`, `baseline`, `gitDirectories` and `policy`. These identify where changes happened and which revision started the work; they do not imply the files are still present after disposal.
