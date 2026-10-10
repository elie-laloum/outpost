---
title: "Compose YAML workflows"
description: "Pass JSON values, select conditions and compose isolated tasks with the existing workflow engine."
---

Extend [your first recipe](../yaml-recipes/) when later steps need structured results or conditions. Save the first block as `recipe.yaml`, change the top-level `version` in your local `outpost.yaml` to `2`, then run `npx outpost recipe run --file recipe.yaml --config outpost.yaml --json`. The `envelope` result contains the selected file names.

## Pass structured values

Recipe format 3 and configuration format 2 extend [YAML recipes](../yaml-recipes/) with JSON inputs and workflow composition. Keep the two files separate. Objects, arrays and null are supported alongside scalar inputs; an optional JSON `schema` validates nested values before extension loading or allocation. A value supplied through `--input 'changes={"files":["a.ts"]}'` retains its type.

```yaml title="recipe.yaml"
version: 3
name: select-files
inputs:
  changes:
    type: object
    description: Files to inspect.
    default: { files: [src/index.ts] }
tasks:
  - key: select
    value: { $input: changes, path: [files] }
  - key: envelope
    after: [select]
    value:
      files: { $step: select, path: [value] }
      source: community
```

`value` constructs a JSON result under the step's `value` field. `$input` and `$step` return typed values; `path` selects own properties or array indexes. `$select: { from: <expression>, path: [...] }` selects from another expression. Ordinary mappings and arrays build new values. `$literal` keeps its entire value opaque, including reference-shaped objects and double braces. Every referenced step must appear directly in `after`.

Text interpolation remains a single pass and accepts only strings, numbers and booleans. Command results expose `stdout`, `stderr` and `status`. Agent and isolated results retain JSON fields such as `text`, `value`, `usage`, conversation and workspace references; runtime methods such as `resume()` are not serialized. Formats 1 and 2 keep their existing behavior.

Text references can select scalar leaves such as `{{ steps.select.value.count }}` or `{{ inputs.changes.summary }}`. Task names containing dots are resolved by their longest declared name.

## Select a condition

Add `when` to skip a task when its condition is false. Dependents of a skipped task follow the existing workflow skip rules. Comparisons preserve JSON types; object equality ignores key ordering. Ordering requires two numbers or two strings. `in` expects an array on the right. `exists` tests a property path without treating missing fields as execution errors.

```yaml title="recipe.yaml — task condition"
when:
  all:
    - exists: { $input: changes, path: [files] }
    - ne: [{ $input: changes, path: [files] }, []]
```

The operators are `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `exists`, `all`, `any` and `not`. A local condition callback can instead use `options.condition`, declared with its generated callback contract. Declare either `when` or the callback.

## Reuse TypeScript task contracts

Task `options` use [TaskOptions](../../reference/taskoptions/), excluding the key, dependency objects and action. Recipe-level `workflow` uses [WorkflowOptions](../../reference/workflowoptions/), with the runtime supplying cancellation and the common observation hub. Retries, timeouts, budgets, error policy and callbacks retain the existing engine's behavior. Configure persistent storage to [resume durable recipes](../recipe-durability/) with their original workspaces.

```yaml title="recipe.yaml — execution policy"
workflow:
  concurrency: 3
  stopOnError: false
  budget: { attempts: 10 }
```

Shared sandbox commands and agents default to sequential execution. If concurrency can overlap two shared tasks, validation refuses the recipe; order them with dependencies or use `isolated` tasks. Data, callback and decision tasks allocate no sandbox. Each isolated request selects its own repository, sandbox provider, agent and branch policy, using [defineIsolatedTask](../../reference/defineisolatedtask/). Concurrent requests for the same borrowed or current workspace are refused.

```yaml title="recipe.yaml — isolated task"
- key: update-library
  isolated:
    repository: ./library
    sandboxProvider: { $ref: sandboxProviders.container }
    agent: { $ref: agents.coder }
    branch: { mode: integrate }
    brief: { text: Update and commit the library documentation. }
```

Paths in native component options resolve relative to the local configuration file. Each isolated repository integrates independently under its own branch policy; there is no transaction spanning repositories.

<span id="declare-local-actions"></span>

For this step, follow [Call local actions from YAML](../recipe-callbacks/).

## Run the offline example

The repository's `examples/68-recipe-workflows` composes structured inputs, a condition, a local transformation and a two-round loop. After building Outpost, run `node --test examples/68-recipe-workflows/index.ts`. The example allocates no sandbox and makes no model call. Functional tests also compare YAML and TypeScript usage and run isolated fixture agents against two real temporary Git repositories; live cloud and paid agent validation remains separate.

## Reuse a step result

An agent exposes `text`; a command exposes `stdout`, `stderr` and numeric `status`. Add every referenced step to `after`, even when another dependency already follows it. Append this task to [your first YAML recipe](../yaml-recipes/) to summarize the review:

```yaml title="recipe.yaml — append to tasks"
- key: summary
  after: [review]
  agent: coder
  brief: "Summarize these findings without editing files: {{ steps.review.text }}"
```

The engine passes the actual result to the next step. CLI reports bound each returned text field to 16,384 characters with an explicit truncation marker. References provide data, not conversation continuation; files remain shared through the sandbox workspace.
