---
title: "Your first agent run"
description: "Your first agent run — Outpost"
sidebar:
  order: 2
---

This guide uses Codex and Docker. Start in a committed Git repository after [installing Outpost](../installation/).

## 1. Generate the project files

```sh
npx outpost init --yes --agent codex --provider docker --template blank --build
```

This creates `.outpost` with a starter script, image recipe and environment example, then builds the image. It refuses to overwrite an existing scaffold. For Podman, replace `docker` with `podman`. For Claude Code, replace `codex` with `claude`.

## 2. Declare agent credentials

Copy `.outpost/.env.example` to `.outpost/.env`. Declare `OPENAI_API_KEY` for Codex. For Claude Code, declare `ANTHROPIC_API_KEY` or `CLAUDE_CODE_OAUTH_TOKEN`.

```dotenv
OPENAI_API_KEY=
```

An empty declaration imports the matching process variable. A nonempty file value takes precedence. Your repository-root `.env` is not read. Keep the credentials file untracked. See [environment configuration](../../agents/environment/) for native authentication files and overrides.

## 3. Run the starter

```sh
node .outpost/run.mts "Add input validation, run tests and commit the change"
```

Use `run.ts` instead when your package declares `"type": "module"`; initialization prints the exact command. The image contains both agent CLIs, Git, Node and Python. Add other project tools to the recipe as needed.

## 4. Inspect the result

Review Git status and history, the returned commits and the logs under `.outpost/logs`. A dispatch collects agent changes; the selected branch policy determines whether those commits stay on a separate branch or integrate into the host branch. It does not push your repository to a remote.

To control the lifecycle yourself, read [one-shot dispatch](../../agents/dispatch/) and [branch policies](../../sandboxes/branches/). To automate several steps, continue with [workflows](../../workflows/graph/).
