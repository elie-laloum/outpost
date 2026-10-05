---
title: "Build an agent image"
description: "Build and customize the Docker or Podman image used by your agents."
---

## What the image contains

The agent image contains the command-line tools your tasks will use. Generate a Dockerfile or Containerfile, add the tools your project needs and build it under a name such as `outpost:dev`.

<!-- features -->

- **Base**: `node:24-bookworm-slim` with Git, the OpenSSH client, curl, Python 3 and process tools.
- **Agent CLIs**: Claude Code, Codex, Copilot CLI and Kimi Code from npm, [Antigravity](../antigravity/) from a verified archive.
- **Agent user**: The image’s `node` user, renumbered to your UID and GID.
- **Private home**: `/home/agent`, owned by the agent user with mode 700, set as `HOME`.
- **Environment**: Antigravity auto-updates off, Copilot’s cache under `/tmp/.cache`.
- **Working directory**: `/workspace`, where commands start.

## Generate the recipe

The command builds the image and writes its `Dockerfile` in `.outpost-image` (`Containerfile` with Podman). It also writes example workflow files there; you can leave these aside and write your own TypeScript scripts. Add `--no-build` to generate the files without building.

```sh
npx outpost init --yes --directory .outpost-image --image outpost:dev
```

These commands assume Outpost is installed, as in [Installation](../setup/). For Podman, add `--sandbox-provider podman` when generating and `--engine podman` when building.

## Add project tools and rebuild

Add system packages and binaries as root, before the recipe’s final `USER` line.

```dockerfile title=".outpost-image/Dockerfile"
RUN apt-get update && apt-get install -y --no-install-recommends make \
  && rm -rf /var/lib/apt/lists/*
USER $AGENT_UID:$AGENT_GID
```

```sh
npx outpost image build --directory .outpost-image --image outpost:dev
```

| Option           | Default                                  | Effect                                  |
| ---------------- | ---------------------------------------- | --------------------------------------- |
| `--engine`       | `docker`                                 | Build with `docker` or `podman`.        |
| `--image`        | `outpost:<directory name>`               | Tag of the built image.                 |
| `--file`         | `Dockerfile`, `Containerfile` for Podman | Recipe path, relative to the directory. |
| `--directory`    | Current directory                        | Build context and recipe location.      |
| `--uid`, `--gid` | Your user’s IDs                          | IDs given to the agent user.            |

:::caution
Install tools outside `/home/agent`. Each container mounts a fresh private home there, which hides whatever the image put in it.
:::

Containers run with your UID by default, and the provider refuses an image built for another UID. Build on the machine that runs the workflows, or pass `--uid` and `--gid` for the target user ([`user`](../containers/) on the provider overrides the check).

## Keep credentials out of the image

The image holds tools, never sign-ins. At each run, Outpost copies the harness’s host login or passes its API key into the private home ([Authentication](../authentication/)).

:::caution
Do not `COPY` `~/.codex`, `~/.claude`, `.env` or keys into the recipe, and do not pass secrets through `ARG` or `ENV`. Image layers keep them for anyone who can pull the image.
:::

## Update the pinned CLIs

Each Outpost release pins one version per CLI, exposed as `agentVersions`. `init` writes these versions into the recipe.

```ts
import { agentVersions } from "@elie-laloum/outpost";

console.log(agentVersions.codex);
```

<!-- check:run -->

The script prints the Codex version pinned by your installed Outpost. After upgrading Outpost, generate a fresh recipe with `--no-build` in an empty directory, copy its install lines into yours, and rebuild.

## Check the image

`doctor` starts a temporary container with the network disabled. It checks `node`, `git`, the writable home and the agent CLI, and warns when the CLI version differs from the pinned one. It uses the local image only and does not test sign-in ([Diagnostics](../diagnostics/)).

```sh
npx outpost doctor --sandbox-provider docker --agent claude --image outpost:dev
```

## Remove the image

Remove `outpost:dev` when you no longer need this image. This removes the image from the local container engine, independently of the retained Git branches.

```sh
npx outpost image remove --image outpost:dev
```

Add `--engine podman` for Podman. Dependency cache volumes are separate and stay in place ([Prepare the environment](../environment-setup/)).

## Images on remote sandboxes

[Cloud sandboxes](../cloud-sandboxes/), [Firecracker](../firecracker/) and [private Git](../private-git/) containers install a missing CLI on first use. When the agent’s executable is not on `PATH`, Outpost installs its pinned version into the sandbox home. Set `bootstrap: false` on the sandbox options to require the image to provide it.

Docker and Podman with a mounted checkout never install a CLI: the image must contain it.

## Limits

- Pins cover the agent CLIs only. The base image tag and Debian packages resolve at build time, so two builds can differ.
- Bootstrapping an npm CLI requires `npm` in the remote image.
- `outpost image` builds and removes local images; it does not push them to a registry.

API: [agentVersions](../../reference/agentversions/) · [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [createPodmanSandboxProvider](../../reference/createpodmansandboxprovider/) · [SandboxOptions](../../reference/sandboxoptions/).
