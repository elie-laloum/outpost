---
title: "Container images"
description: "Build an image with your agent and project tools."
---

Generate an image recipe with `outpost init`. Docker and Podman projects build their image by default.

```sh
npx outpost init --yes --sandbox-provider docker --image outpost:dev
```

## Rebuild after customization

Add project tools to the generated recipe, then rebuild using the same image name as your provider configuration.

```sh
npx outpost image build --engine docker --image outpost:dev
```

Use `--file` for a custom recipe and `--directory` for another build context. `--uid` and `--gid` control the generated container user configuration where supported by the build.

## Keep state out of the image

Install binaries and system packages in the image. Supply account credentials at runtime through the harness. The private agent home is ephemeral and must have the correct user ownership; do not bake a host login into an image layer.

The generated npm CLI versions are pinned by Outpost. Antigravity uses an installer fetching the current release. Provide your own pinned image when reproducibility requires a reviewed Antigravity binary.

`outpost image remove` removes the selected image. Dependency cache volumes have a separate lifetime.

API: [agentVersions](../../reference/agentversions/).
