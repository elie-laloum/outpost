---
title: "Check and integrate a branch"
description: "Run checks before merging and retain rejected work for review."
---

Use this guide after [running work on a branch](../git-workspaces/). Your repository needs a test command and its dependencies in the sandbox. Integration changes the local checkout; Outpost does not push to a remote.

Integration acquires the same host-checkout lock as a `current` workspace. If that workspace is still open, integration fails with code `conflict` and retains the candidate worktree. Close the current workspace before retrying the integration.

## Gate integration on a check

`dispatch()` and `workspace.dispatch()` merge an `integrate` branch as soon as the agent succeeds. To run your own check first, open the workspace yourself and work in a [sandbox session](../sandbox-sessions/).

<!-- tabs -->

```ts title="change.ts"
import type { Workspace } from "@elie-laloum/outpost/workspaces";
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
import { openWorkspace } from "@elie-laloum/outpost/workspaces";
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

## Refuse unwanted committed changes

Set a workspace `guard` to reject protected paths or an oversized final committed diff, independently of the agent. This dispatch integrates only when both rules pass. A refusal throws `OutpostError` with code `guard`, releases the sandbox and retains the branch and worktree for review.

```ts
import { dispatch } from "@elie-laloum/outpost/core";
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

Only the final committed diff is checked. A protected file changed and then restored is accepted; uncommitted files are excluded. This does not restrict filesystem access. A failed or incomplete inspection also refuses integration.

Inspect `error.details` for violations and compared commits, and `recoveryDetails(error)` for the retained branch and directory. Closing the workspace preserves rejected work even without `preserve: true`. A later failure does not undo earlier integrations.

## Resolve merge conflicts with an agent

Opt into `onConflict` to integrate an existing feature branch through a dedicated resolution branch. Close any sandbox on the source workspace before calling it. `branch.from` selects the feature commit to integrate; the host checkout is the target branch. A merge without Git conflicts skips the agent and the verification command.

```ts
import { createAgentConflictResolver } from "@elie-laloum/outpost/workspaces";
import { coder, sandboxProvider } from "./outpost.config.ts";
import { openWorkspace } from "@elie-laloum/outpost/workspaces";
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

Add `instructions` to `createAgentConflictResolver()` for project-specific guidance. It is appended to the [built-in resolution brief documented in the API](../../reference/createagentconflictresolver/#outpost-instructions); it does not replace that brief.

Before integrating, Outpost checks that both original branches still point to their frozen commits, that the host checkout is clean, and that the resolution contains both commits. The source workspace's `guard` is enforced again on the final resolution diff. It fast-forwards the host to the exact verified commit under the integration lock. It never pushes.

On failure, cancellation or deadline, the original branches are not moved by the resolver. Both source and resolution worktrees remain; `recoveryDetails(error)` identifies the resolution branch and directory and includes `sourceBranch` and `sourceDirectory`. Inspect these before retrying. Mounted Git metadata is writable by the agent: these checks are integration guarantees for cooperating code, not an adversarial security boundary.

The optional result `resolution` contains the verified commit, command output and the resolution agent's usage. Add that usage to your own workflow accounting: it is separate from the original task. A clean successful resolution worktree may be removed; its branch and captured conversation remain. The total deadline defaults to ten minutes, and the verification command defaults to five minutes within that total. The strategy performs one dispatch without an automatic repair loop.

A custom [`ConflictResolver`](../../reference/conflictresolver/) receives the same separate workspace and must return a verified committed result and close its sandbox. Dirty hosts, changed host branches and diff guard refusals do not invoke it. Deterministic Git, simulated-remote and real Docker tests in mounted and isolated modes cover the strategy; live CLI agent and cloud validation remains pending.

API: [createAgentConflictResolver](../../reference/createagentconflictresolver/) · [IntegrationOptions](../../reference/integrationoptions/) · [ConflictResolution](../../reference/conflictresolution/).
