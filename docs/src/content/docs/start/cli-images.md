---
title: "Build and manage images"
description: "Build and manage images — Outpost"
sidebar:
  order: 5
---

Container providers require an image with Git, Node, shell utilities and agent CLIs. Initialization writes a Dockerfile or Containerfile and can build it with `--build`.

```sh
npx outpost image build --engine docker
npx outpost image build --engine podman --file Containerfile --image outpost:custom --uid 1000 --gid 1000
npx outpost image remove --engine podman --image outpost:custom
```

| Flag             | Purpose                                                       |
| ---------------- | ------------------------------------------------------------- |
| `--engine`       | `docker` or `podman`.                                         |
| `--file`         | Alternative build recipe.                                     |
| `--image`        | Image name/tag; use the same value in provider configuration. |
| `--uid`, `--gid` | Numeric build identity matching runtime access requirements.  |
| `--directory`    | Target project directory; current directory by default.       |

The generated image uses Node 24 and includes Git, Python and both supported agent CLIs. Install additional project tools in the generated recipe, then rebuild.

Image removal targets the selected image; it is not a global prune. Outpost does not automatically rebuild an outdated image when starting a job. Rebuild after changing recipes, agent version pins or the desired UID/GID.

If you omit `--build` during initialization, run the build command before your first container dispatch. Cloud and local providers do not use these local image commands.

Default recipes are `Dockerfile` and `Containerfile` in the workflow directory. For an older installation, use `--file .outpost/Dockerfile`. The generated script explicitly retains the workflow image name even when `repository` points elsewhere.
