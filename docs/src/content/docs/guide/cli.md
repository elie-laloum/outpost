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

## Continue

- [Recipe command options](../recipe-cli/)
- [Recovery command options](../recovery-cli/)

<span id="outpost-recipe-run"></span>
<span id="outpost-recipe-status-resume-answer-and-decide"></span>
<span id="outpost-recipe-enqueue-and-serve"></span>
<span id="outpost-recipe-init"></span>
<span id="outpost-recipe-validate"></span>
<span id="outpost-recipe-list-and-outpost-recipe-fetch"></span>

<span id="outpost-recovery-inspect"></span>
<span id="outpost-recovery-verify"></span>
<span id="outpost-recovery-restore"></span>
<span id="outpost-recovery-prune"></span>
