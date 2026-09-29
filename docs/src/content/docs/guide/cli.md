---
title: "CLI commands"
description: "Generate projects, manage images and inspect recovery state."
---

The CLI prepares workflow projects and operates their environment. Agent requests run from the generated script or your TypeScript application.

## Create a project

```sh
npx @elie-laloum/outpost init --yes --directory ./automation --repository ../application --agent codex --sandbox-provider docker --install
```

`--directory` selects the workflow directory. `--repository` selects the target Git checkout independently; a relative path is resolved by the generated workflow from its directory. `--yes` makes setup headless. `--install` installs project dependencies.

| Option                        | Purpose                                                                  |
| ----------------------------- | ------------------------------------------------------------------------ |
| `--agent`                     | `codex`, `claude`, `antigravity`, `copilot` or `kimi`.                   |
| `--sandbox-provider`          | `docker`, `podman`, `local`, `vercel` or `daytona`.                      |
| `--authentication`            | `account`, supported `account-token`, or `usage`.                        |
| `--model`                     | Explicit model; required for Kimi API access and custom Codex endpoints. |
| `--base-url`, `--api-key-env` | Custom Codex Responses endpoint and key variable.                        |
| `--manager`                   | npm, pnpm, yarn or bun for the generated project.                        |
| `--image`                     | Container image name.                                                    |
| `--no-build`                  | Skip the default Docker/Podman image build.                              |

## Generated files

The project contains the execution script, brief, environment declarations, ignore rules and provider recipe. Existing manifests and ignore rules are preserved. Explicit CommonJS manifests use `run.mts`; other projects use `run.ts`.

## Operations

Use `doctor` for [preflight checks](../diagnostics/), `image build/remove` for [images](../agent-images/) and `recovery inspect/verify/restore/prune` for [recovery](../recovery/). `--json` selects machine-readable reports on supported diagnostic and recovery commands. Each command has its own `--help`.
