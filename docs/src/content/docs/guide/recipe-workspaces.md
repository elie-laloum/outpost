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

Use a distinct branch name for independent work. For several branches in the same recipe, declare [several workspaces](#use-several-workspaces) or use [isolated tasks](../recipe-workflows/#work-on-separate-branches); changing agent roles alone does not create separate workspaces.

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

## Switch sandboxes on one workspace

Name each sandbox under `sandboxes`, then select one on a task with `sandbox:`. Tasks without `sandbox:` use the top-level `sandbox`. Docker and Podman must be running; both can download the public `node:24` image.

```yaml title="outpost.yaml — sandboxes"
version: 3
workspace: { kind: ephemeral }
sandbox: { provider: local }
outputs:
  - paths: [notes.txt]
    destination: ./results
    policy: create
sandboxes:
  docker: { provider: docker, image: node:24 }
  podman: { provider: podman, image: node:24 }
```

When a task selects another sandbox of the same workspace, Outpost closes the current sandbox and opens the next one on the same files. `review` therefore reads the `notes.txt` that `draft` wrote; a Git worktree keeps uncommitted changes the same way. One sandbox per workspace is open at a time, so order those tasks with `after`.

```yaml title="recipe.yaml — sandboxes"
version: 3
name: two-sandboxes
tasks:
  - key: draft
    sandbox: docker
    command:
      executable: sh
      arguments: [-c, "echo drafted in Docker > notes.txt"]
  - key: review
    sandbox: podman
    after: [draft]
    command:
      executable: sh
      arguments: [-c, "cat notes.txt && echo reviewed in Podman >> notes.txt"]
```

After the run, `results/notes.txt` holds both lines. Only command and agent tasks select a sandbox; isolated tasks keep their own.

## Use several workspaces

Declare more Git or file workspaces under `workspaces`. A sandbox opens the top-level workspace unless its `workspace` references another one.

```yaml title="outpost.yaml — workspaces"
version: 3
workspace:
  kind: git
  repository: ./project
  branch: { mode: named, name: feature/app, from: main }
sandbox: { provider: local }
workspaces:
  docs:
    kind: git
    repository: ./project
    branch: { mode: named, name: feature/docs, from: main }
sandboxes:
  writer:
    workspace: { $ref: workspaces.docs }
    provider: local
```

A task with `sandbox: writer` works on the `feature/docs` worktree; other tasks keep `feature/app`. Two workspaces on one repository need distinct branches. After the run, each workspace is integrated or retained on its own, and the report lists named ones under `workspaces`.

With `workflow.concurrency`, tasks of different workspaces can run at the same time; tasks of one workspace must still be ordered.

### Mix Git and file workspaces

```yaml title="outpost.yaml — Git and file workspaces"
version: 3
workspace:
  kind: git
  repository: ./project
sandbox: { provider: local }
runtime: { directory: .outpost }
workspaces:
  notes:
    kind: ephemeral
    outputs:
      - paths: ["*.md"]
        destination: ./notes
        policy: create
sandboxes:
  writer:
    workspace: { $ref: workspaces.notes }
    provider: local
```

Tasks without `sandbox` work on the Git worktree; tasks with `sandbox: writer` work on the ephemeral files. Each workspace settles with its own kind: Git ones are integrated, file ones publish their `outputs`. Durable runs record both kinds in the same checkpoint.

| Top-level workspace | Declares for the other kind                    |
| ------------------- | ---------------------------------------------- |
| Git                 | `runtime` for the state of its file workspaces |
| Files               | `integration` for its Git workspaces           |

The checks of each kind follow the task's workspace: an agent task in a file workspace needs an agent that supports files and cannot use `{{ WORK_BRANCH }}`. Isolated, interactive and speculation tasks keep the kind of the top-level workspace.

## Run an agent on files

File workspaces also accept [native CLI agents](../recipe-configuration/) whose adapters declare the required capabilities. Prepare the matching [agent image](../agent-images/) and explicit authentication, then select that agent role in your recipe. Unsupported repairs, continuation or interactive modes are refused. See the [validated capability table](../working-with-files/#native-cli-validation-status) before choosing an agent.

## Keep state between invocations

For checkpoints and conversation restoration, follow [durable recipes](../recipe-durability/). File configuration uses `runtime.directory` for state and `runtime.namespace` for its identity. Retention and portable snapshots are described in [resuming file workspaces](../resuming-file-workspaces/).
