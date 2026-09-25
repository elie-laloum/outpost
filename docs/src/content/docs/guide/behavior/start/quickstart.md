---
title: "Your first agent run"
description: "Your first agent run — Outpost"
sidebar:
  order: 2
---

This guide uses Codex and Docker. Choose a Git repository with a commit. The workflow will live in a separate directory; see also [installation](../../../start/installation/).

## 1. Generate the project files

```sh
mkdir workflow1
cd workflow1
npx @elie-laloum/outpost init --yes --repository /path1/repository --install --build
```

This creates `package.json`, `run.ts`, `brief.md`, `.env.example`, `.gitignore` and an image recipe directly in `workflow1`, installs dependencies and builds the image. It refuses to overwrite an existing scaffold. For Podman, replace `docker` with `podman`. For Claude Code, replace `codex` with `claude`.

## 2. Declare agent credentials

Copy `.env.example` to `.env`. Declare `OPENAI_API_KEY` for Codex. For Claude Code, declare `ANTHROPIC_API_KEY` or `CLAUDE_CODE_OAUTH_TOKEN`.

```dotenv
OPENAI_API_KEY=
```

An empty declaration imports the matching process variable. A nonempty file value takes precedence. The script reads the workflow directory’s `.env` and passes its declarations to the provider. Keep the credentials file untracked. See [environment configuration](../../../agents/environment/) for native authentication files and overrides.

## 3. Run the starter

```sh
node run.ts "Add input validation, run tests and commit the change"
```

The script uses TypeScript, executed directly by Node.js 24+. For existing projects declaring `"type": "commonjs"`, the generated file is `run.mts`; use the command printed by `init`. The image contains the Claude Code, Codex and Gemini CLIs, Git, Node and Python. Add other project tools to the recipe as needed.

## 4. Inspect the result

Review Git status and history, the returned commits and the logs under the target repository’s `.outpost/logs`. A dispatch collects agent changes; the selected branch policy determines whether those commits stay on a separate branch or integrate into the host branch. It does not push your repository to a remote.

To control the lifecycle yourself, read [one-shot dispatch](../../../agents/dispatch/) and [branch policies](../../../environment/branches/). To automate several steps, continue with [workflows](../../../workflows/graph/).

For account-based access, follow [Connect Codex](../../../agents/connect-codex/) or [Connect Claude](../../../agents/connect-claude/). The CLI already includes the Codex API-key login hook in generated scripts; manual API compositions must configure it explicitly.

See [choose a repository](../../../environment/repositories/) for workflow directories, target repositories and relative paths.
