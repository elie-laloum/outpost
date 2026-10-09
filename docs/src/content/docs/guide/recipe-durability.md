---
title: Durable YAML recipes
description: Persist recipe work, request human input and resume by run ID.
---

Format-3 recipes use the existing workflow checkpoint engine. Declare storage in the required local configuration, then select it from the shareable recipe. A paused execution releases its sandbox and retains its Git workspaces, completed task outputs, conversations and cumulative usage. [Recipe workflows](../recipe-workflows/) explains task composition.

## Configure persistent storage

A local transport stores state on the host. An S3 transport can replace it through `type: s3` and its native options; declared SDK clients remain local extensions. `stores` contains checkpoint stores, `caches` contains task caches, and `artifactStores` stores artifact content. Each accepts a transport reference. See [transports](../object-storage/) for storage ownership and remote validation limits.

```yaml title="outpost.yaml — storage"
version: 2
repository: ./repository
sandbox: { provider: local }
branch: { mode: integrate }
transports:
  state: { type: local, directory: ./.outpost/state }
stores:
  checkpoint:
    type: transport
    transporter: { $ref: transports.state }
```

Choose a stable run ID and checkpoint version. `recipe run --run-id` can override the ID for a new execution; an existing ID requires `recipe resume`. The runtime adds a digest of the recipe, inputs, relevant configuration and extension versions to the checkpoint identity. Resolved secrets are excluded. Reports and observation declarations can change between invocations.

```yaml title="recipe.yaml — checkpoint"
version: 3
name: reviewed-change
workflow:
  checkpoint:
    store: { $ref: stores.checkpoint }
    runId: reviewed-change
    version: "1"
tasks:
  - key: review
    gate:
      kind: approval
      prompt: Accept the change?
      actors: [maintainer]
```

## Inspect and resume

Apart from terminal dialogue prompts, a successful run or resume stays silent unless you declare reports or request `--json`. Status is an explicit consultation and always prints its result. A paused or waiting invocation returns a nonzero CLI exit status; inspect its final report to distinguish the state from a failure. Completed tasks are not replayed.

```sh
outpost recipe run --file recipe.yaml --config outpost.yaml --json
outpost recipe status --file recipe.yaml --config outpost.yaml \
  --run-id reviewed-change --json
outpost recipe resume --file recipe.yaml --config outpost.yaml \
  --run-id reviewed-change --json
```

Shared and isolated durable sandboxes use runtime-owned workspaces. On resume, Outpost checks the recorded repository, directory, branch, Git metadata and original diff baseline before execution. Missing or changed workspaces are refused. Providers must be able to open a fresh sandbox over that retained host workspace; filesystem synchronization preserves the files supported by the provider's existing transfer contract. Borrowed workspaces cannot be restored automatically. Interactive tasks use their native named-workspace and portable-conversation requirements.

Interrupted tasks require `resume --retry-incomplete`. After a coordinator crash, first stop the previous coordinator and inspect the checkpoint. `--recover-revision <revision>` explicitly clears its owner only if that revision still matches; it does not recover Git locks or authorize task replay. Resolve retained workspace locks through the existing [recovery procedures](../recovery/). Heartbeat expiry alone authorizes neither action. An allocation interrupted before its workspace record was saved requires explicit recovery; the runtime never creates an empty replacement.

## Submit human decisions and answers

`recipe decide --decision decision.json` resumes with one native [WorkflowDecision](../../reference/workflowdecision/). Copy the execution, task and request IDs from the paused report; supply a trusted authorized actor and a reason. For signed gates, include the original signature proof and configure `workflow.decisionVerifier` with an `ed25519` verifier referencing a local approver-key callback. The engine verifies actor, request, expiry and signature before changing state.

```sh
outpost recipe decide --file recipe.yaml --config outpost.yaml \
  --run-id reviewed-change --decision decision.json --json
```

An `interactive` task accepts [InteractiveAgentTaskOptions](../../reference/interactiveagenttaskoptions/) except its key and dependencies. Its agent must support portable capture and resume. `recipe answer --answer answer.json` submits one native [WorkflowAnswer](../../reference/workflowanswer/) containing the execution, task, request, actor and answer value. Accepted answers and completed turns persist between processes.

```yaml title="recipe.yaml — interactive task"
- key: clarify
  interactive:
    repository: ./repository
    sandboxProvider: { $ref: sandboxProviders.container }
    agent: { $ref: agents.interviewer }
    brief: Clarify the requested change before implementing it.
    actors: [maintainer]
```

## Answer directly in the terminal

Run and resume display pending questions automatically when stdin and stderr are terminals. The CLI collects each answer and resumes the workflow using its saved request IDs, conversation and workspace. No custom runner or answer file is needed. A single declared actor is selected automatically; multiple actors offer a choice. See the [CLI flags](../cli/#outpost-recipe-run) to choose an actor explicitly.

```sh
outpost recipe run --file recipe.yaml --config outpost.yaml
# After cancelling at a question:
outpost recipe resume --file recipe.yaml --config outpost.yaml \
  --run-id reviewed-change
```

Ctrl+C leaves the question persisted and releases checkpoint ownership. Resume presents it again without replaying completed turns. Only dialogue answers are collected automatically; approval gates keep their existing decision and signature checks.

The offline example in `examples/72-recipe-cli-dialogue/` asks for a name and passes it to the next step. Run its YAML files with `outpost recipe run --file examples/72-recipe-cli-dialogue/recipe.yaml --config examples/72-recipe-cli-dialogue/outpost.yaml` after building the local CLI.

For automation or an HTTP client, use `--no-interactive` or `--json`, inspect `inputRequests` in the report and submit `recipe answer --answer answer.json`. The HTTP application authenticates its caller and supplies an authorized actor; a submitted actor name alone is not authentication. `--interactive --json` explicitly combines terminal questions on stderr with one final JSON report on stdout.

## Keep artifacts, caches and quota accounting

An `artifact` action selects a named artifact store and contract; `data` builds its JSON value. JSON contracts declare `jsonSchema`, with an optional local validator. A `binary` contract uses a local `produce` callback. Outputs contain artifact references and lineage, so dependent tasks can retain provenance without embedding bytes in checkpoints. `examples/69-recipe-durability/` runs an offline approval and artifact scenario across processes.

```yaml title="recipe.yaml — artifact"
- key: evidence
  artifact:
    store: { $ref: artifactStores.results }
    contract: { $ref: artifacts.evidence }
  data: { checked: true, files: [src/index.ts] }
```

Task `options.cache` uses the native cache contract and a declared key callback. Cache hits consume no attempt or usage and cannot replay effects. Workflow budgets and `onQuota: { action: pause }` retain cumulative native accounting. Agent and isolated tasks can declare `quotaResume: continue` or `restart`; continuation requires a captured conversation and supported restoration.

A `run` observation sink persists the shared hub's execution projection. Declare its `transporter`, `id` and `kind: workflow`; set `resume: true` only for a settled projection being resumed. Use a new observation ID after explicit recovery of an unsettled coordinator. The checkpoint remains the execution authority; sink errors do not change outcomes. Tests cover local Git, process interruption, signed decisions, dialogues, caches and artifacts without paid calls. Live cloud/S3 restoration remains unvalidated.
