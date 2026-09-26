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

This creates `package.json`, `run.ts`, `brief.md`, `.env.example`, `.gitignore` and an image recipe directly in `workflow1`, installs dependencies and builds the image. It refuses to overwrite an existing scaffold. With `--yes`, the defaults are Codex, Docker and `--authentication account`. For Podman, add `--sandbox-provider podman`. For another agent, add `--agent claude`, `copilot`, `kimi` or `antigravity`.

## 2. Declare agent credentials

With the default `account` authentication, sign in on the host first; for Codex, run `codex -c cli_auth_credentials_store='"file"' login`. No variable is needed: Outpost copies that login into the private sandbox home before the first run.

To bill an API key instead, initialize with `--authentication usage`, copy `.env.example` to `.env` and declare the variable it names, such as `OPENAI_API_KEY` for Codex. For Claude Code, `--authentication account-token` declares `CLAUDE_CODE_OAUTH_TOKEN` and `usage` declares `ANTHROPIC_API_KEY`.

```dotenv
OPENAI_API_KEY=
```

An empty declaration imports the matching process variable. A nonempty file value takes precedence. The script reads the workflow directory’s `.env` and passes its declarations to the provider. Keep the credentials file untracked. See the [authentication manual](../../../manual/authentication/) for every form and [environment configuration](../../../agents/environment/) for overrides.

## 3. Run the starter

```sh
node run.ts "Add input validation, run tests and commit the change"
```

The script uses TypeScript, executed directly by Node.js 24+. For existing projects declaring `"type": "commonjs"`, the generated file is `run.mts`; use the command printed by `init`. The image contains the Claude Code, Codex, GitHub Copilot, Kimi Code and Antigravity (`agy`) CLIs, Git, Node and Python. Add other project tools to the recipe as needed.

## 4. Inspect the result

Review Git status and history, the returned commits and the logs under the target repository’s `.outpost/logs`. A dispatch collects agent changes; the selected branch policy determines whether those commits stay on a separate branch or integrate into the host branch. It does not push your repository to a remote.

To control the lifecycle yourself, read [one-shot dispatch](../../../agents/dispatch/) and [branch policies](../../../environment/branches/). To automate several steps, continue with [workflows](../../../workflows/graph/).

For account details, follow [Connect Codex](../../../agents/connect-codex/) or [Connect Claude](../../../agents/connect-claude/). The generated harness already selects its `authentication` form; manual API compositions must select one explicitly, otherwise Outpost prepares no credential.

See [choose a repository](../../../environment/repositories/) for workflow directories, target repositories and relative paths.
