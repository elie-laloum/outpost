---
title: "Recipe commands"
description: "Use these commands after your first YAML recipe."
---

Use these commands after [your first YAML recipe](../yaml-recipes/). Run `outpost recipe <command> --help` for local help; [common options and exit codes](../cli/) apply.

## `outpost recipe run`

Run a [local YAML recipe](../yaml-recipes/) with a separate YAML configuration (required), a TypeScript module or a legacy bindings factory. Inputs are checked before configuration loads; declarative configurations also check required agents before allocating a sandbox.

For custom integrations, TypeScript/JavaScript [RecipeConfiguration](../../reference/recipeconfiguration/) modules and `(signal: AbortSignal) => RecipeBindings` factories remain supported. A factory returns an already open sandbox: agent roles are checked after allocation, and the factory must clean up if it throws before returning.

```sh
outpost recipe run --file recipe.yaml --config outpost.yaml \
  --input 'goal=Fix the parser' [--json]
```

| Flag               | Default                                    | Effect                                                                                                                                                                           |
| ------------------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--file`           | Required                                   | Local YAML recipe, limited to 1 MiB.                                                                                                                                             |
| `--config`         | Required                                   | Local YAML execution configuration; TypeScript/JavaScript `RecipeConfiguration` modules and factories remain supported.                                                          |
| `--input`          | None                                       | Repeat `name=value` for declared version-2 inputs. Numbers and booleans use JSON scalar syntax.                                                                                  |
| `--json`           | Off                                        | Final report with overall `status`, `workflowStatus`, tasks, bounded `outputs`, `errors`, usage and workspace location.                                                          |
| `--interactive`    | Automatic on a terminal without `--json`   | Collect dialogue answers and explicit unsigned gate decisions on stdin, display their prompts on stderr and resume. Requires terminal stdin and stderr and a YAML configuration. |
| `--no-interactive` | Off                                        | Leave questions pending for a later invocation or an external client.                                                                                                            |
| `--actor`          | Sole declared actor, otherwise a selection | Trusted local actor submitting answers; the engine checks task authorization.                                                                                                    |

With terminal stdin and stderr, run handles interactive questions without a TypeScript runner. Choices use a selection menu; free-text questions use a text prompt. Each answer is persisted before another question is displayed. `--json` disables automatic prompting; explicitly combine `--interactive --json` to keep prompts on stderr and receive one final JSON report on stdout. Without a terminal, execution leaves input requests pending.

Paths are relative to the current directory. Apart from dialogue prompts, successful execution is silent unless observation or reports are declared in configuration version 2. `--json` explicitly requests one final JSON report; failures still print diagnostics on stderr.

Text fields are limited to 16,384 characters with a truncation marker. Command diagnostics include the original exit status, stdout and stderr.

Successful runs integrate according to the branch policy; the final report is emitted after cleanup. Failed or cancelled workspaces are preserved.

Loading, execution or finalization failures exit 1. SIGINT/SIGTERM cancel the run, wait for cleanup and exit 130/143. Keep configuration stdout quiet for parseable JSON output.

## `outpost recipe status`, `resume`, `answer` and `decide`

These commands require format 3, a YAML `--config`, `--file` and `--run-id`. Status reads the checkpoint without acquiring it. Resume continues settled tasks; `--retry-incomplete` explicitly authorizes replay of interrupted tasks. After stopping an abandoned coordinator, `--recover-revision <revision>` fences checkpoint ownership recovery independently of replay and workspace lock recovery.

```sh
outpost recipe status --file recipe.yaml --config outpost.yaml --run-id change --json
outpost recipe resume --file recipe.yaml --config outpost.yaml --run-id change
outpost recipe answer --file recipe.yaml --config outpost.yaml --run-id change --answer answer.json
outpost recipe decide --file recipe.yaml --config outpost.yaml --run-id change --decision decision.json
```

Answer and decide read one native WorkflowAnswer or WorkflowDecision from a bounded JSON file; signed gates require the original proof. `resume --input` must match the persisted inputs; omit it to reload them. Run also accepts `--run-id` for a new checkpoint. Run, resume, answer and decide print a final report only when declared or requested through `--json`; status always prints its requested result. See [durable recipes](../recipe-durability/) for state, ownership and recovery behavior.

Resume, answer and decide accept the same `--interactive`, `--no-interactive` and `--actor` flags. Ctrl+C or closed terminal input while a question is displayed leaves it pending and exits 130; resume asks it again without replaying completed turns.

Actor selection declares a trusted local identity, not a login.

Unsigned gates display their saved dependency outputs, then offer Leave pending, Approve/Resume or Reject and require a reason. Leaving pending is the default.

Signed gates still require `decide` with their existing proofs; terminal input never supplies or bypasses those proofs.

## `outpost recipe enqueue` and `serve`

Enqueue publishes without execution. It requires `--file`, a YAML `--config`, `--queue`, `--handler` and `--run-id`; repeated `--input` values use the recipe's parameter types. `--job-id` overrides the deterministic default ID, `--idempotency-key` preserves an effect key across distinct job IDs, and `--deadline` is an absolute epoch millisecond timestamp. `--json` requests a receipt; success is otherwise silent.

```sh
outpost recipe enqueue --file recipe.yaml --config outpost.yaml \
  --queue jobs --handler review --run-id change-42 --json
outpost recipe serve --file recipe.yaml --config outpost.yaml --service worker
```

Serve requires `--file`, a YAML `--config` and `--service`. It starts only that service, blocks until interrupted and emits no implicit progress or final report. See [recipe services](../recipe-services/) for workers, HTTP queues, cron and verified webhooks.

## `outpost recipe init`

Create a version-2 starter with a required goal, a named agent and a test command. The editor schema comment points to the installed package. Existing files are never overwritten; the parent directory must exist.

```sh
outpost recipe init --file recipe.yaml [--config outpost.yaml] [--json]
```

`--file` is required. `--config` also creates a separate YAML execution configuration. `--json` reports created paths and the schema path. Customize the tools and agent roles before sharing the YAML.

## `outpost recipe validate`

Validate YAML, dependencies and references without importing configuration, resolving input values or allocating a sandbox. Use this in contribution checks and before running a downloaded recipe.

```sh
outpost recipe validate --file recipe.yaml [--config outpost.yaml] [--json]
```

`--file` is required. Optional `--config` validates a YAML configuration and required agent roles without allocating resources or reading declared secret values; executable configuration modules are refused by this command. `--json` reports the recipe name, format version, metadata, declared input definitions, required agent names and ordered task keys. Validation does not execute tools or verify their installation.

## `outpost recipe list` and `outpost recipe fetch`

List the bundled Git catalogue or select a local JSON file / HTTPS catalogue with `--catalog`. Fetch one named recipe into a new local file, verify its SHA-256 and declared identity, and validate its YAML before writing. Existing files are never overwritten; downloading does not execute the recipe.

```sh
outpost recipe list [--catalog https://example.org/catalog.json] [--json]
outpost recipe fetch --recipe review --file review.yaml \
  [--catalog https://example.org/catalog.json] [--json]
```

`--recipe` selects the catalogue entry and `--file` is the destination. Fetch JSON reports include name, recipe revision, SHA-256 and the saved path. Remote sources and redirects require HTTPS without URL credentials; each resource is limited to 1 MiB and 15 seconds. The catalogue supplies the expected digest, so trust its publisher. See [sharing recipes](../sharing-recipes/#contribute-and-test-a-recipe) for the contribution format.
