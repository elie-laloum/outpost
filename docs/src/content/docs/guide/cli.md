---
title: "CLI commands"
description: "Build images, check your environment and inspect recovery data from the terminal."
---

## Choose a command

Use the CLI to build images, check prerequisites and inspect retained work. Write agent tasks in TypeScript and run them with Node.js, as shown in [Your first task](../first-request/).

<!-- features -->

- [`outpost recipe run`](../yaml-recipes/): Runs a local YAML recipe with explicit sandbox and agent bindings.
- [`outpost doctor`](../diagnostics/): Checks the host, the sandbox provider and an image.
- [`outpost image build`](../agent-images/): Builds the agent image from its recipe.
- [`outpost image remove`](../agent-images/): Deletes the agent image.
- [`outpost recovery inspect`](../recovery/): Lists what `.outpost` retains, read-only.
- [`outpost recovery verify`](../recovery/): Checks a retained transfer before you restore it.
- [`outpost recovery restore`](../recovery/): Restores a retained transfer into a new directory.
- [`outpost recovery prune`](../retention/): Deletes old data according to a retention policy.
- [`outpost --help`](#common-options): Lists the commands, or one command’s options.

In a project that depends on `@elie-laloum/outpost`, run `npx outpost <command>`. Elsewhere, run `npx @elie-laloum/outpost <command>`.

## Common options

| Option       | Commands                       | Effect                                         |
| ------------ | ------------------------------ | ---------------------------------------------- |
| `-h, --help` | All                            | Prints the usage and options, then exits.      |
| `--json`     | `doctor`, `recovery`, `recipe` | Writes the report as JSON on stdout.           |
| `-y, --yes`  | `init`                         | Accepts the defaults without prompting.        |
| `--apply`    | `restore`, `prune`             | Performs the change; without it, only preview. |

| Exit code | Meaning                                                                            |
| --------- | ---------------------------------------------------------------------------------- |
| `0`       | Success. `doctor` warnings and skipped checks still exit `0`.                      |
| `1`       | A check failed, a report is incomplete, or the command failed (message on stderr). |
| `130`     | Interrupted with Ctrl+C, or an `init` prompt was cancelled.                        |
| `143`     | Stopped with SIGTERM.                                                              |

## `outpost recipe run`

Run a [local YAML recipe](../yaml-recipes/) with a separate YAML configuration (required), a TypeScript module or a legacy bindings factory. Inputs are checked before configuration loads; declarative configurations also check required agents before allocating a sandbox.

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

Paths are relative to the current directory. Apart from dialogue prompts, successful execution is silent unless observation or reports are declared in configuration version 2. `--json` explicitly requests one final JSON report; failures still print diagnostics on stderr. Text fields are limited to 16,384 characters with a truncation marker. Command diagnostics include the original exit status, stdout and stderr. Successful runs integrate according to the branch policy; the final report is emitted after cleanup. Failed or cancelled workspaces are preserved. Loading, execution or finalization failures exit 1. SIGINT/SIGTERM cancel the run, wait for cleanup and exit 130/143. Keep configuration stdout quiet for parseable JSON output.

## `outpost recipe status`, `resume`, `answer` and `decide`

These commands require format 3, a YAML `--config`, `--file` and `--run-id`. Status reads the checkpoint without acquiring it. Resume continues settled tasks; `--retry-incomplete` explicitly authorizes replay of interrupted tasks. After stopping an abandoned coordinator, `--recover-revision <revision>` fences checkpoint ownership recovery independently of replay and workspace lock recovery.

```sh
outpost recipe status --file recipe.yaml --config outpost.yaml --run-id change --json
outpost recipe resume --file recipe.yaml --config outpost.yaml --run-id change
outpost recipe answer --file recipe.yaml --config outpost.yaml --run-id change --answer answer.json
outpost recipe decide --file recipe.yaml --config outpost.yaml --run-id change --decision decision.json
```

Answer and decide read one native WorkflowAnswer or WorkflowDecision from a bounded JSON file; signed gates require the original proof. `resume --input` must match the persisted inputs; omit it to reload them. Run also accepts `--run-id` for a new checkpoint. Run, resume, answer and decide print a final report only when declared or requested through `--json`; status always prints its requested result. See [durable recipes](../recipe-durability/) for state, ownership and recovery behavior.

Resume, answer and decide accept the same `--interactive`, `--no-interactive` and `--actor` flags. Ctrl+C or closed terminal input while a question is displayed leaves it pending and exits 130; resume asks it again without replaying completed turns. Actor selection declares a trusted local identity, not a login. Unsigned gates display their saved dependency outputs, then offer Leave pending, Approve/Resume or Reject and require a reason. Leaving pending is the default. Signed gates still require `decide` with their existing proofs; terminal input never supplies or bypasses those proofs.

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

`--recipe` selects the catalogue entry and `--file` is the destination. Fetch JSON reports include name, recipe revision, SHA-256 and the saved path. Remote sources and redirects require HTTPS without URL credentials; each resource is limited to 1 MiB and 15 seconds. The catalogue supplies the expected digest, so trust its publisher. See [sharing recipes](../yaml-recipes/#contribute-and-test-a-recipe) for the contribution format.

## `outpost doctor`

Check the host tools and selected sandbox provider. Add `--image` to check a local agent image in a temporary container as well.

```sh
outpost doctor [--sandbox-provider NAME] [--agent NAME] [--image NAME] [--json]
```

| Flag                 | Default  | Values and effect                                                              |
| -------------------- | -------- | ------------------------------------------------------------------------------ |
| `--sandbox-provider` | `docker` | `docker`, `podman`, `local`, `vercel`, `daytona`.                              |
| `--agent`            | `codex`  | `codex`, `claude`, `antigravity`, `copilot`, `kimi`.                           |
| `--image`            | None     | Also checks this local image in a temporary container. Docker and Podman only. |
| `--json`             | Off      | JSON report.                                                                   |

It exits `1` when a check fails. [Diagnostics](../diagnostics/) explains the report.

## `outpost image build`

Build the agent image from the recipe in the chosen directory. Select Docker or Podman and give the result the image name used by your scripts.

```sh
outpost image build [--directory PATH] [--engine docker|podman] [--file PATH] [--image NAME] [--uid N] [--gid N]
```

| Flag             | Default                                         | Values and effect                       |
| ---------------- | ----------------------------------------------- | --------------------------------------- |
| `--directory`    | Current directory                               | Build context holding the recipe.       |
| `--engine`       | `docker`                                        | `docker`, `podman`.                     |
| `--file`         | `Dockerfile` (Docker), `Containerfile` (Podman) | Recipe path, relative to `--directory`. |
| `--image`        | `outpost:<directory name>`                      | Image tag.                              |
| `--uid`, `--gid` | Your user and group IDs (`1000` on Windows)     | IDs of the agent user inside the image. |

The engine’s output streams to the terminal, then the command prints `build: <image>`. A build stops after 30 minutes.

## `outpost image remove`

Remove the local agent image when you no longer need it. Use the engine and image name from the build you want to remove.

```sh
outpost image remove [--directory PATH] [--engine docker|podman] [--image NAME]
```

`--directory`, `--engine` and `--image` take the same defaults as `image build`. The command prints `remove: <image>`.

## `outpost recovery inspect`

Inspect the workspaces, retained transfers and recorded activity under a repository’s `.outpost`. This command reads the inventory without changing it.

```sh
outpost recovery inspect [--repository PATH] [--max-entries N] [--git] [--locks] [--resources] [--json]
```

| Flag            | Default                           | Values and effect                                   |
| --------------- | --------------------------------- | --------------------------------------------------- |
| `--repository`  | Checkout of the current directory | Repository whose `.outpost` is listed.              |
| `--max-entries` | `100000`                          | Stops the inventory after this many entries.        |
| `--git`         | Off                               | Adds each workspace’s branch, HEAD and dirty state. |
| `--locks`       | Off                               | Adds local lock PIDs and ownership.                 |
| `--resources`   | Off                               | Adds recorded sandbox activity.                     |
| `--json`        | Off                               | JSON report.                                        |

It changes nothing. It exits `1` when the inventory is partial.

## `outpost recovery verify`

Verify a retained transfer before restoring it. You can compare checksums and test whether its patches apply in a temporary clone.

```sh
outpost recovery verify --directory TRANSFER [--checksums [--max-bytes N]] [--restorability --repository PATH] [--json]
```

| Flag              | Default  | Values and effect                                                      |
| ----------------- | -------- | ---------------------------------------------------------------------- |
| `--directory`     | Required | Retained transfer directory.                                           |
| `--checksums`     | Off      | Compares the files with the transfer’s checksum manifest.              |
| `--max-bytes`     | 1 GiB    | Bytes checked by `--checksums`, which it requires.                     |
| `--restorability` | Off      | Applies the transfer’s patches in a temporary clone of `--repository`. |
| `--repository`    | None     | Checkout used by `--restorability`; they go together.                  |
| `--json`          | Off      | JSON report.                                                           |

It changes no files. It exits `1` when a check fails or is incomplete.

## `outpost recovery restore`

Restore the saved host state or incoming sandbox changes into a new directory. Preview the plan first, then add `--apply` when you are ready to create the copy.

```sh
outpost recovery restore --directory TRANSFER --repository PATH --destination NEW_PATH --side previous|incoming [--max-bytes N] [--apply] [--json]
```

| Flag            | Default  | Values and effect                                                               |
| --------------- | -------- | ------------------------------------------------------------------------------- |
| `--directory`   | Required | Retained transfer directory.                                                    |
| `--repository`  | Required | Checkout the transfer belongs to.                                               |
| `--destination` | Required | New directory outside the repository; it must not exist.                        |
| `--side`        | Required | `previous` (host state before synchronization) or `incoming` (sandbox changes). |
| `--max-bytes`   | 1 GiB    | Largest retained payload accepted.                                              |
| `--apply`       | Off      | Creates the destination; without it, prints the plan.                           |
| `--json`        | Off      | JSON plan or result.                                                            |

The restored copy is a detached checkout. The transfer stays in place; review the copy before integrating it.

## `outpost recovery prune`

Preview the removals selected by your JSON retention policy. Add `--apply` to delete those entries after reviewing the plan.

```sh
outpost recovery prune --policy FILE [--repository PATH] [--apply] [--json]
```

| Flag           | Default                           | Values and effect                                         |
| -------------- | --------------------------------- | --------------------------------------------------------- |
| `--policy`     | Required                          | JSON policy file, up to 64 KiB ([format](../retention/)). |
| `--repository` | Checkout of the current directory | Repository whose `.outpost` is pruned.                    |
| `--apply`      | Off                               | Deletes the candidates; without it, a dry run.            |
| `--json`       | Off                               | JSON plan and result.                                     |

It exits `1` when the inventory is incomplete, the projected size exceeds the policy’s limit, or `--apply` had to keep a candidate. Branches and recovery artifacts are always kept.

## `outpost init`

This command generates an example project and, with Docker or Podman, prepares its image. The recommended [installation path](../setup/) uses it to build the image; you then write your own TypeScript scripts.

```sh
outpost init [--yes] [--directory PATH] [--repository PATH] [--agent NAME] [--sandbox-provider NAME] [options]
```

In a terminal, `init` prompts for the agent, sandbox provider, package manager and authentication you did not pass. Without a terminal, pass `--yes` or both `--agent` and `--sandbox-provider`.

| Flag                    | Default                                    | Values and effect                                                         |
| ----------------------- | ------------------------------------------ | ------------------------------------------------------------------------- |
| `--directory`           | Current directory                          | Where the project is written.                                             |
| `--repository`          | `.`                                        | Git checkout the workflow edits, relative to `--directory`.               |
| `--agent`               | `codex`                                    | `codex`, `claude`, `antigravity`, `copilot`, `kimi`.                      |
| `--sandbox-provider`    | `docker`                                   | `docker`, `podman`, `local`, `vercel`, `daytona`.                         |
| `--authentication`      | `account` (`usage` with `--base-url`)      | `account`, `usage`; `account-token` for `claude` and `copilot`.           |
| `--model`               | The CLI’s default                          | Model name. Required for Kimi `usage` and for `--base-url`.               |
| `--base-url`            | None                                       | Custom Codex Responses endpoint. Requires `--model` and `usage`.          |
| `--api-key-env`         | `OPENAI_API_KEY`                           | Key variable for `--base-url`.                                            |
| `--manager`             | `packageManager` field, lockfile, or `npm` | `npm`, `pnpm`, `yarn`, `bun`.                                             |
| `--install`             | Off                                        | Installs `@elie-laloum/outpost` and the provider SDK as dev dependencies. |
| `--build`, `--no-build` | Build for `docker` and `podman`            | Builds the image once the files are written.                              |
| `--image`               | `outpost:<directory name>`                 | Image tag built and used by `run.ts` (Docker and Podman).                 |

`init` writes `run.ts`, `brief.md`, `.env.example`, `.gitignore`, the image recipe and, when none exists, `package.json` (optional project generation). It stops before writing if one of these files exists, except `.gitignore`, which it extends.

It then prints the sign-in steps for the chosen [authentication](../authentication/) and the command to run, such as `node run.ts`.

```sh
npx outpost init --yes --directory .outpost-image --image outpost:dev
```

API: [inspectRecovery](../../reference/inspectrecovery/) · [verifyRecoveryTransfer](../../reference/verifyrecoverytransfer/) · [planRecoveryRestore](../../reference/planrecoveryrestore/) · [restoreRecoveryTransfer](../../reference/restorerecoverytransfer/) · [planRecoveryRetention](../../reference/planrecoveryretention/) · [pruneRecoveryRetention](../../reference/prunerecoveryretention/).
