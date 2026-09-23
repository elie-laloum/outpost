---
title: "Environment and authentication"
description: "Environment and authentication — Outpost"
sidebar:
  order: 3
---

Outpost reads **only `.outpost/.env`** as its project environment file. It does not import the repository-root `.env`.

```dotenv
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GH_TOKEN=
PROJECT_MODE=test
```

## Precedence

1. A nonempty `.outpost/.env` value is used directly.
2. An empty declaration inherits the matching host process value, if available.
3. Explicit provider or adapter `variables` override the project values.

The same name cannot be declared by both provider and adapter. Put shared environment in the provider and agent-specific credentials in the adapter. A warm sandbox resolves each job’s adapter variables independently. Isolated environments import only declared process variables; `local()` runs as your host process and is not an environment isolation boundary.

## Credential choices

Use `OPENAI_API_KEY` for Codex, and `ANTHROPIC_API_KEY` or `CLAUDE_CODE_OAUTH_TOKEN` for Claude Code. For native CLI authentication, explicitly mount the required authentication file or directory at the correct agent-home path. Prefer read-only mounts when the CLI supports them. Do not mount your entire home just to expose one credential.

GitHub backlog operations use host `gh`: authenticate it or declare `GH_TOKEN`. Vercel/Daytona credentials authenticate sandbox allocation separately from model calls. A successful provider connection does not prove the agent is authenticated.

Environment maps contain strings. Avoid putting secret values into command arguments, source files or prompt templates. Generated `.env.example` files list variable names, never real secrets. Logs and native transcripts can still contain sensitive content emitted by your task.

See [mounts](../../providers/containers/) and [security boundaries](../../operations/security/).

## Connect an account

Follow [Claude Code account setup](../connect-claude/) or [Codex account setup](../connect-codex/) for subscription login, API keys and container authentication. Merely declaring OPENAI_API_KEY does not initialize a Codex login; use the documented setup hook.
