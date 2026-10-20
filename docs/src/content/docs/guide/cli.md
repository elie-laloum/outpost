---
title: "CLI commands"
description: "Check your environment, prepare agent images, run YAML recipes and inspect recovery data from the terminal."
---

## Choose a command

The CLI prepares and checks the environment your scripts or recipes run in. Write agent tasks in TypeScript and run them with Node.js, as shown in [Your first task](../first-request/), or describe them in a [YAML recipe](../yaml-recipes/). The CLI never creates a project on your machine.

<!-- features -->

- [`outpost doctor`](#outpost-doctor): Checks the host, the sandbox provider and an image.
- [`outpost image`](#outpost-image): Lists, pulls, verifies, ejects, builds and removes the [agent images](../agent-images/).
- [`outpost recipe`](../recipe-cli/): Creates, validates, runs and resumes YAML recipes.
- [`outpost recovery`](../recovery-cli/): Inspects and explicitly recovers interrupted state.
- [`outpost --help`](#common-options): Lists the commands by task, or one command's options and examples.

In a project that depends on `@elie-laloum/outpost`, run `npx outpost <command>`. Elsewhere, run `npx @elie-laloum/outpost <command>`.

## Common options

| Option          | Commands      | Effect                                                      |
| --------------- | ------------- | ----------------------------------------------------------- |
| `-h, --help`    | All           | Prints the usage, options and examples, then exits.         |
| `-v, --version` | `outpost`     | Prints the installed Outpost version.                       |
| `--json`        | Most commands | Writes the result as JSON on stdout.                        |
| `--apply`       | Recovery      | Performs the change; without it, the command only previews. |

| Exit code | Meaning                                                                            |
| --------- | ---------------------------------------------------------------------------------- |
| `0`       | Success. `doctor` warnings and skipped checks still exit `0`.                      |
| `1`       | A check failed, a report is incomplete, or the command failed (message on stderr). |
| `130`     | Interrupted with Ctrl+C.                                                           |
| `143`     | Stopped with SIGTERM.                                                              |

## `outpost doctor`

Check the host tools and selected sandbox provider. Add `--image` to check an image in a temporary container as well.

```sh
outpost doctor [--provider NAME] [--agent NAME] [--image NAME] [--timeout MS] [--json]
```

| Flag         | Default  | Values and effect                                                                                                          |
| ------------ | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--provider` | `docker` | `docker`, `podman`, `local`, `vercel`, `daytona`.                                                                          |
| `--agent`    | `codex`  | `codex`, `claude`, `antigravity`, `copilot`, `kimi`. Defaults to the image's agent when `--image` names an official image. |
| `--image`    | None     | Local image reference or official image name, checked in a temporary container. Docker and Podman only.                    |
| `--json`     | Off      | JSON report.                                                                                                               |

It exits `1` when a check fails. [Diagnostics](../diagnostics/) explains the report.

## `outpost image`

Prepare the image your sandbox provider runs. Official names are `harness`, `codex`, `claude`, `antigravity`, `copilot` and `kimi` ([Agent images](../agent-images/)).

| Command                                                                             | Effect                                                                                       |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `image list [--json]`                                                               | Lists the official images and the reference pinned by this release.                          |
| `image pull --image NAME [--engine E]`                                              | Pulls the published image: its recorded digest, or the tag matching this release.            |
| `image verify --image NAME_OR_REFERENCE`                                            | Verifies the GitHub build provenance attestation of a digest. Requires `gh`.                 |
| `image eject --image NAME [--directory D] [--engine E] [--force]`                   | Writes the official recipe, lockfiles and `.dockerignore` into the current directory or `D`. |
| `image build --tag TAG [--directory D] [--engine E] [--file F] [--uid N] [--gid N]` | Builds the recipe in `D` for your UID and GID (`1000` on Windows).                           |
| `image remove --image REFERENCE [--engine E]`                                       | Removes a local image.                                                                       |

`--engine` defaults to `docker`; `podman` writes and builds a `Containerfile`. `eject` refuses to overwrite existing files without `--force`. The engine's output streams to the terminal; a build stops after 30 minutes.

```sh
npx outpost image eject --image claude --directory images/claude
npx outpost image build --directory images/claude --tag outpost-claude:dev
```

## Renamed commands

Earlier names still work and print a deprecation warning. They will be removed in the next major version.

| Earlier name                        | Current name                            |
| ----------------------------------- | --------------------------------------- |
| `--provider`                        | `--provider`                            |
| `recovery verify --directory PATH`  | `recovery transfer verify --path PATH`  |
| `recovery restore --directory PATH` | `recovery transfer restore --path PATH` |
| `recovery registry recover`         | `recovery registry release`             |

`outpost init` was removed: install the package in your own scripts ([Installation](../setup/)), prepare an image with `outpost image`, and create recipe files with `outpost recipe init`.

API: [inspectRecovery](../../reference/inspectrecovery/) · [verifyRecoveryTransfer](../../reference/verifyrecoverytransfer/) · [planRecoveryRestore](../../reference/planrecoveryrestore/) · [restoreRecoveryTransfer](../../reference/restorerecoverytransfer/) · [planRecoveryRetention](../../reference/planrecoveryretention/) · [pruneRecoveryRetention](../../reference/prunerecoveryretention/).

## Continue

- [Recipe command options](../recipe-cli/)
- [Recovery command options](../recovery-cli/)

<span id="outpost-image-build"></span>
<span id="outpost-image-remove"></span>
<span id="outpost-init"></span>
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
