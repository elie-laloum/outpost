---
title: "Resolve an integration conflict"
description: "Resolve and verify a merge in a separate workspace."
---

Start from [Check and integrate a branch](../integrating-changes/) and its configuration. Resolve and verify a merge in a separate workspace.

## Resolve merge conflicts with an agent

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
