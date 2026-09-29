---
title: "CLI commands"
description: "Every outpost command with its flags, defaults and exit codes: project generation, diagnostics, images and recovery."
---

## Command map

The CLI prepares and maintains the environment. Agent tasks run from your scripts, not from the CLI.

<!-- features -->

- [`outpost init`](../setup/): Generates a workflow project and builds its image.
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

| Option       | Commands             | Effect                                         |
| ------------ | -------------------- | ---------------------------------------------- |
| `-h, --help` | All                  | Prints the usage and options, then exits.      |
| `--json`     | `doctor`, `recovery` | Writes the report as JSON on stdout.           |
| `-y, --yes`  | `init`               | Accepts the defaults without prompting.        |
| `--apply`    | `restore`, `prune`   | Performs the change; without it, only preview. |

| Exit code | Meaning                                                                            |
| --------- | ---------------------------------------------------------------------------------- |
| `0`       | Success. `doctor` warnings and skipped checks still exit `0`.                      |
| `1`       | A check failed, a report is incomplete, or the command failed (message on stderr). |
| `130`     | Interrupted with Ctrl+C, or an `init` prompt was cancelled.                        |
| `143`     | Stopped with SIGTERM.                                                              |

## `outpost init`

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

`init` writes `run.ts`, `brief.md`, `.env.example`, `.gitignore`, the image recipe and, when none exists, `package.json` ([Setup](../setup/) describes each file). It stops before writing if one of these files exists, except `.gitignore`, which it extends.

It then prints the sign-in steps for the chosen [authentication](../authentication/) and the command to run, such as `node run.ts`.

```sh
npx @elie-laloum/outpost init --yes --directory ./automation --repository ../application --agent claude --install
```

## `outpost doctor`

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

```sh
outpost image remove [--directory PATH] [--engine docker|podman] [--image NAME]
```

`--directory`, `--engine` and `--image` take the same defaults as `image build`. The command prints `remove: <image>`.

## `outpost recovery inspect`

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

API: [inspectRecovery](../../reference/inspectrecovery/) · [verifyRecoveryTransfer](../../reference/verifyrecoverytransfer/) · [planRecoveryRestore](../../reference/planrecoveryrestore/) · [restoreRecoveryTransfer](../../reference/restorerecoverytransfer/) · [planRecoveryRetention](../../reference/planrecoveryretention/) · [pruneRecoveryRetention](../../reference/prunerecoveryretention/).
