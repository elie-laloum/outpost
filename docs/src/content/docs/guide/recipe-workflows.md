---
title: "Pass data and compose recipe steps"
description: "Use typed inputs, dependency results, conditions and one workspace per branch."
---

Keep `outpost.yaml` from the [local tutorial](../yaml-recipes/) and replace `recipe.yaml` with the first example. These tasks transform data and allocate no sandbox.

## Pass inputs and results

`$input` reads a typed input; `$step` reads a completed task. Every task you read must appear directly in `after`. The input schema checks the object before execution. `when` skips `envelope` when the file list is empty.

```yaml title="recipe.yaml"
version: 3
name: select-files
inputs:
  changes:
    type: object
    description: Files to inspect.
    default: { files: [src/index.ts] }
    schema:
      type: object
      properties:
        files: { type: array, items: { type: string } }
      required: [files]
      additionalProperties: false
tasks:
  - key: select
    value: { $input: changes, path: [files] }
  - key: envelope
    after: [select]
    when:
      ne: [{ $step: select, path: [value] }, []]
    value:
      files: { $step: select, path: [value] }
```

Run with a JSON input. The report's `outputs.envelope.value.files` contains `["a.ts"]`.

```sh
npx outpost recipe run --file recipe.yaml --config outpost.yaml \
  --input 'changes={"files":["a.ts"]}' --json
```

## Choose the kind of reference

Use typed references in data expressions and text interpolation in briefs or command arguments. Interpolated data is expanded once.

| Need                     | Example                               |
| ------------------------ | ------------------------------------- |
| A typed input            | `{ $input: changes, path: [files] }`  |
| A task's JSON value      | `{ $step: select, path: [value] }`    |
| Command output as text   | `"Output: {{ steps.check.stdout }}"`  |
| An agent's final answer  | `"Review: {{ steps.review.text }}"`   |
| An opaque literal object | `{ $literal: { $input: unchanged } }` |

Conditions support `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `exists`, `all`, `any` and `not`. The [editor schema](../recipe-configuration/) suggests their shapes. A result reference passes data; it does not continue an agent conversation.

## Work on separate branches

For two independent changes in `./project`, use these complete files. Prepare the [Codex image and account access](../setup/) first. Each `isolated` task owns a workspace and sandbox; the branches remain separate after completion.

```yaml title="recipe.yaml"
version: 3
name: parallel-changes
workflow:
  concurrency: 2
tasks:
  - key: docs
    isolated:
      repository: ./project
      sandboxProvider: { $ref: sandboxProviders.container }
      agent: { $ref: agents.coder }
      branch: { mode: named, name: feature/docs, from: main }
      brief: { text: Improve the README and commit the changes. }
  - key: tests
    isolated:
      repository: ./project
      sandboxProvider: { $ref: sandboxProviders.container }
      agent: { $ref: agents.coder }
      branch: { mode: named, name: feature/tests, from: main }
      brief: { text: Add regression tests and commit the changes. }
```

The local configuration supplies the shared provider declaration and agent. The top-level workspace selects Git mode; these isolated tasks allocate only their own workspaces, using the repository declared on each task. Relative repository paths start at `outpost.yaml`.

```yaml title="outpost.yaml"
version: 3
workspace:
  kind: git
  repository: ./project
  branch: { mode: named, name: orchestration, from: main }
sandbox: { provider: local }
sandboxProviders:
  container:
    type: docker
    image: outpost-codex:dev
agents:
  coder:
    harness: codex
    authentication: account
```

Run with the same `recipe run` command, omitting `--input`. Use different repository paths for a multi-repository workflow. Integration, when requested, is independent per repository; there is no shared Git transaction.

## Control execution

Add this top-level block to a recipe whose tasks may run concurrently. Task-level `options` can also set retries and deadlines; see [TaskOptions](../../reference/taskoptions/) and [WorkflowOptions](../../reference/workflowoptions/).

```yaml title="recipe.yaml — workflow"
workflow:
  concurrency: 2
  stopOnError: false
  budget: { attempts: 10 }
```

Ordinary command and agent tasks share the configured workspace. Order them with `after`; validation refuses overlapping use of that shared workspace. Use isolated tasks for independent work.

Continue with [local callbacks and loops](../recipe-callbacks/), [structured agent answers](../recipe-harness/) or [checkpoints](../recipe-durability/).

<!-- Retained section anchors for existing bookmarks. -->

<span id="pass-structured-values"></span>
<span id="select-a-condition"></span>
<span id="reuse-typescript-task-contracts"></span>
<span id="run-the-offline-example"></span>
<span id="reuse-a-step-result"></span>
<span id="declare-local-actions"></span>
