---
title: "Choose a recipe workspace"
description: "Start empty, copy or mount files, or keep work on a Git branch."
---

Keep the `recipe.yaml` from [your first recipe](../yaml-recipes/). Change `outpost.yaml` to choose where its tasks read and write. Paths are relative to that configuration file.

| Starting files             | Workspace                             | What happens to changes                          |
| -------------------------- | ------------------------------------- | ------------------------------------------------ |
| Empty directory            | `ephemeral`                           | Publish selected outputs to keep them            |
| Existing directory, copied | `directory` with `access: copy`       | Source stays unchanged; publish selected outputs |
| Mounted directory          | `directory` with `access.mode: mount` | A writable mount changes the source immediately  |
| Git repository             | `git` with `branch.mode: named`       | A separate worktree keeps the branch for review  |

## Keep generated files

Add this top-level `outputs` block to the tutorial's `outpost.yaml`. After a successful run, `results/hello.txt` contains the generated greeting.

```yaml title="outpost.yaml — outputs"
outputs:
  - paths: [hello.txt]
    destination: ./results
    policy: create
```

`create` refuses an existing destination. Use a fresh destination for another run, or choose `update` explicitly. Publication checks for concurrent edits and preserves recovery data on conflicts; see [publishing files](../publishing-files/).

## Start from a directory

Create `documents` beside the configuration, then replace `outpost.yaml` with this file. Tasks work in a copy; the original documents stay unchanged. The tutorial's greeting is published to `results`.

```yaml title="outpost.yaml"
version: 3
workspace:
  kind: directory
  directory: ./documents
  access: copy
sandbox:
  provider: local
outputs:
  - paths: [hello.txt]
    destination: ./results
    policy: create
```

Only selected outputs are published. To start empty again, replace the whole `workspace` block with `workspace: { kind: ephemeral }`.

## Use one Git branch

For a repository at `./project` with a `main` branch, use this configuration. Outpost creates or opens the named branch in a managed worktree. All ordinary command and agent tasks share it.

```yaml title="outpost.yaml"
version: 3
workspace:
  kind: git
  repository: ./project
  branch:
    mode: named
    name: feature/hello
    from: main
sandbox:
  provider: local
```

`from` selects the starting commit when the branch is created. `named` retains the worktree without merging it into your checkout; `integrate` requests integration after success, and `current` works directly in the selected checkout. Always choose the policy explicitly. File `outputs` are not available for a Git workspace.

Use a distinct branch name for independent work. For several branches in the same recipe, use [isolated tasks](../recipe-workflows/#work-on-separate-branches); changing agent roles alone does not create separate workspaces.

## Mount a directory in a container

This complete configuration mounts `documents` read-only at `documents` inside the workspace. Docker must be running; it can download the public `node:24` image. Use commands that read `documents/...`; the tutorial can still write its greeting at the workspace root.

```yaml title="outpost.yaml"
version: 3
workspace:
  kind: directory
  directory: ./documents
  access:
    mode: mount
    target: documents
    readOnly: true
sandbox:
  provider: docker
  image: node:24
```

Set `readOnly: false` only to modify source files immediately. Output-publication rollback cannot undo those writes. Source mounts require a compatible provider; `local` does not support them. See [working with files](../working-with-files/) for mount behavior.

## Run an agent on files

File workspaces also accept [native CLI agents](../recipe-configuration/) whose adapters declare the required capabilities. Prepare the matching [agent image](../agent-images/) and explicit authentication, then select that agent role in your recipe. Unsupported repairs, continuation or interactive modes are refused. See the [validated capability table](../working-with-files/#native-cli-validation-status) before choosing an agent.

## Keep state between invocations

For checkpoints and conversation restoration, follow [durable recipes](../recipe-durability/). File configuration uses `runtime.directory` for state and `runtime.namespace` for its identity. Retention and portable snapshots are described in [resuming file workspaces](../resuming-file-workspaces/).
