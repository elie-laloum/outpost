---
title: "Agent images"
description: "Use, customize and verify the official Docker and Podman images for each agent."
---

## Choose an image

Outpost provides one image per agent CLI, plus a `harness` image for the [built-in agent loop](../harness/). Each image contains only what its agent needs, so you build or pull one image per agent you use.

<!-- features -->

- **`harness`**: Node.js, Git, the OpenSSH client and process tools, without any agent CLI.
- **`codex`, `claude`, `copilot`, `kimi`**: The harness tools plus one CLI from npm, installed from a committed lockfile.
- **`antigravity`**: The harness tools plus [Antigravity](../antigravity/), downloaded from a SHA-512 verified archive.
- **Base**: `node:24-bookworm-slim`, pinned by digest.
- **Agent user and home**: The `node` user, renumbered to your UID and GID, with a private `/home/agent` (mode 700) as `HOME`; commands start in `/workspace`.

List the images and the references pinned by your installed Outpost:

```sh
npx outpost image list
```

## Build an image on your machine

Write the official recipe into a directory, then build it for your user. `image eject` writes the `Dockerfile` (`Containerfile` with `--engine podman`), the CLI lockfile and a `.dockerignore`. It writes into the current directory unless you pass `--directory`, and never overwrites files without `--force`.

```sh
npx outpost image eject --image codex --directory images/codex
npx outpost image build --directory images/codex --tag outpost-codex:dev
```

The first build downloads the agent CLI and can take several minutes. Use the tag in your sandbox provider:

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost-codex:dev",
});
```

For Podman, add `--engine podman` to both commands and use `createPodmanSandboxProvider`.

## Add project tools

The ejected recipe is yours. Add system packages and binaries as root, at the marked line before the final `USER` line, then rebuild.

```dockerfile title="images/codex/Dockerfile"
# Add project tools here, as root, before the USER line.
RUN apt-get update && apt-get install -y --no-install-recommends make \
  && rm -rf /var/lib/apt/lists/*
USER $AGENT_UID:$AGENT_GID
```

:::caution
Install tools outside `/home/agent`. Each container mounts a fresh private home there, which hides whatever the image put in it.
:::

Containers run with your UID by default, and the provider refuses an image built for another UID. `image build` uses your IDs; pass `--uid` and `--gid` to build for another user ([`user`](../containers/) on the provider overrides the check).

## Pull a published image

Published images are built and tested by the repository's `Images` workflow for Linux amd64 and arm64, then signed with a GitHub build provenance attestation. They use UID and GID `1000`, which matches the default user on most Linux machines.

```sh
npx outpost image pull --image codex
npx outpost image verify --image codex
```

`image pull` uses the digest recorded by your Outpost release, or the tag matching its version when no digest is recorded. `image verify` requires the [GitHub CLI](https://cli.github.com/) and checks that the digest was built by the official workflow from this repository. If your UID is not `1000`, eject and build the image instead.

:::note
Image publication is implemented but awaits its first verified run. Until `outpost image list` shows a digest, build the image locally as above.
:::

## Keep credentials out of the image

The image holds tools, never sign-ins. At each run, Outpost copies the harness's host login or passes its API key into the private home ([Authentication](../authentication/)).

:::caution
Do not `COPY` `~/.codex`, `~/.claude`, `.env` or keys into the recipe, and do not pass secrets through `ARG` or `ENV`. Image layers keep them for anyone who can pull the image.
:::

## Update the pinned CLIs

Each Outpost release pins one version per CLI, exposed as `agentVersions`. The official recipes and lockfiles install exactly these versions.

```ts
import { agentVersions } from "@elie-laloum/outpost/integrations";

console.log(agentVersions.codex);
// Example output: 0.156.1
```

<!-- check:run -->

The script prints the Codex version pinned by your installed Outpost. After upgrading Outpost, eject the image again with `--force` into a fresh directory, carry over your project lines and rebuild.

## Check the image

`doctor` starts a temporary container with the network disabled. It checks `node`, `git`, the writable home and the agent CLI, and warns when the CLI version differs from the pinned one. An official image name selects its published reference and agent; it uses local images only and does not test sign-in ([Diagnostics](../diagnostics/)).

```sh
npx outpost doctor --agent codex --image outpost-codex:dev
```

## Remove an image

Remove a local image when you no longer need it. Dependency cache volumes are separate and stay in place ([Prepare the environment](../environment-setup/)).

```sh
npx outpost image remove --image outpost-codex:dev
```

## Images on remote sandboxes

[Cloud sandboxes](../cloud-sandboxes/), [Firecracker](../firecracker/) and [private Git](../private-git/) containers install a missing CLI on first use. When the agent's executable is not on `PATH`, Outpost installs its pinned version into the sandbox home. Set `bootstrap: false` on the sandbox options to require the image to provide it.

Docker and Podman with a mounted checkout never install a CLI: the image must contain it.

## Limits

- The base image is pinned by digest, but Debian packages resolve at build time, so two local builds can differ. Published images are the tested bytes.
- Bootstrapping an npm CLI requires `npm` in the remote image.
- `outpost image` does not push images to a registry.

API: [agentVersions](../../reference/agentversions/) · [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [createPodmanSandboxProvider](../../reference/createpodmansandboxprovider/) · [SandboxOptions](../../reference/sandboxoptions/).

UID/GID zero are accepted for explicitly selected root images. Root has more privileges inside the container; choose a nonzero UID for normal agent work. This option does not turn mounted Git metadata into a security boundary.

## Upgrade from the shared image

Outpost 12 removes `outpost init` and the shared `agents` image. Keep your existing TypeScript workflows, install `@elie-laloum/outpost` in their project, and eject/build the image for each CLI they use. Update each sandbox provider’s `image` to the resulting tag. To start a YAML recipe, use `outpost recipe init`.
