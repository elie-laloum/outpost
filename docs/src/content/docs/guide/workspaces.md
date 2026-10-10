---
title: "Choose where the agent works"
description: "Choose Git branches, directory copies or an empty workspace."
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="git-workspaces"></span>
<span id="file-workspaces"></span>

A workspace provides working files; a sandbox runs commands and agents. Choose the source according to the available files and how you want to collect changes.

## Choose a source

| Source                 | Use                                                 | Collect changes                               |
| ---------------------- | --------------------------------------------------- | --------------------------------------------- |
| `git`                  | Existing repository, history and branches           | Retain a branch or integrate its commits      |
| `directory` with copy  | Process a directory while keeping its source intact | Publish selected files to a destination       |
| `directory` with mount | Expose the source under a declared subdirectory     | Writable mounts change the source immediately |
| `ephemeral`            | Start with an empty root                            | Publish produced files or retain a snapshot   |

Existing Git calls keep their defaults. Use `createWorkspace()` to open a declared source, `workspaceSource` to let a wrapper allocate the resource, or `workspace` to borrow an already open resource. Fileless callbacks, decisions and JSON workflows use the workflow engine directly.

## Separate workspace and sandbox

A workspace serves one sandbox at a time and can be reused after it closes. Close the sandbox before the workspace. A sandbox borrowing a workspace leaves its disposal to the caller; wrappers allocating their own resources manage their lifecycle. [How it works](../how-it-works/) explains this ownership.

## Next steps

- [Work on a Git branch](../git-workspaces/)
- [Process files without Git](../working-with-files/)
- [Publish selected files](../publishing-files/)
- [Check before merging](../integrating-changes/)

<!-- Retained section anchors for existing bookmarks. -->

<span id="point-at-a-checkout"></span>
<span id="choose-where-commits-land"></span>
<span id="reuse-one-workspace-across-sandboxes"></span>
<span id="copy-ignored-files-into-the-worktree"></span>
<span id="recover-retained-work"></span>
<span id="limits"></span>

<span id="refuse-unwanted-committed-changes"></span>
<span id="gate-integration-on-a-check"></span>
<span id="resolve-merge-conflicts-with-an-agent"></span>

<span id="run-a-command-in-an-ephemeral-workspace"></span>
<span id="mount-a-source-explicitly"></span>
<span id="preserve-and-resume-files"></span>
<span id="run-independent-jobs"></span>
<span id="check-capabilities-and-recover-publication"></span>

<span id="copy-and-publish-a-directory"></span>
