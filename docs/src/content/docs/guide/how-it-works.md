---
title: "How Outpost runs a task"
description: "Understand resource lifetimes and what remains after a task."
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="three-choices-for-each-task"></span>
<span id="one-call-to-dispatch"></span>
<span id="keep-an-environment-for-several-operations"></span>
<span id="separate-the-workspace-from-the-sandbox"></span>
<span id="find-the-files-after-a-run"></span>

## Agent, sandbox and workspace

The **agent** receives the task and returns an answer. A CLI harness starts an installed agent CLI; the built-in harness calls a model API with your tools. The **sandbox** runs commands. The **workspace** holds the files and, for Git execution, the branch.

These choices are independent. Changing the agent need not change where it runs. Changing the sandbox need not discard a workspace you own.

## One task, from start to cleanup

A one-shot `dispatch()` owns the resources it creates. This is the lifecycle used by [your first task](../first-request/).

<!-- canvas -->

- **Prepare files**: Open the workspace selected by the repository and branch policy.
  - Outpost
  - → **Open the sandbox**: workspace ready
- **Open the sandbox**: Allocate the environment and prepare the agent’s access and project tools.
  - Outpost
  - → **Run the task**: ready
- **Run the task**: Send the brief, collect activity and wait for completion.
  - Agent
  - → **Collect the result**: process complete
- **Collect the result**: Synchronize remote changes and apply the selected branch policy.
  - Outpost
  - → **Close owned resources**: finished or failed
- **Close owned resources**: Release the sandbox and preserve work required for review or recovery.
  - Outpost

A named branch remains available for review. Automatic integration applies only when the selected branch policy requests it. Dirty or detached worktrees can remain after cleanup. The returned answer is what the agent reports; your own checks decide whether the work is acceptable.

## Keep an environment open

A fresh dispatch does not reuse installed dependencies or temporary sandbox files. Open a [sandbox session](../sandbox-sessions/) for several agent turns and commands on the same files. `await using` closes it when its scope ends, including after an error.

A workspace can outlive that sandbox. Open it yourself when later steps must reuse its branch or files with another environment. Close the current sandbox before opening the next one on that workspace, and close the workspace last. A borrowed resource remains its caller’s responsibility.

One sandbox accepts one operation at a time. Parallel work needs separate sandboxes and workspaces; [multiple repositories](../multiple-repositories/) describes independent ownership across repositories.

## Know where the work remains

Git execution keeps runtime data under the target repository’s `.outpost`, even when your scripts live elsewhere. Native agent conversations can use their own host locations. [Storage](../storage/) explains those locations and which objects can move to a transport.

Directory and ephemeral workspaces keep their files separate from the runtime directory and need no Git repository. [Working without Git](../working-with-files/) covers copies, mounts and snapshots; [publishing files](../publishing-files/) is an explicit operation, not an effect of closing a workspace.

When a task fails, [inspect retained work](../recovery/) before retrying. A failed cleanup can leave resources to recover; a saved checkpoint or snapshot alone does not prove an abandoned process has stopped.
