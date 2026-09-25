---
title: Authentication
description: Agent access, credential locations and independent cloud credentials.
---

Choose authentication explicitly with `outpost init --agent … --authentication …`. The generated script prepares the selected authentication; constructing an adapter alone does not sign in. Start with the [complete first run](../../../guide/start/quickstart/) or inspect the [CLI contract](../cli/).

| Agent  | CLI authentication | Credential                                                   | Sandbox preparation                                                          |
| ------ | ------------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Codex  | `api-key`          | `OPENAI_API_KEY` declared in the workflow `.env`             | Generated login hook supplies the key over stdin.                            |
| Codex  | `login`            | Host `$CODEX_HOME/auth.json`, otherwise `~/.codex/auth.json` | Explicit file seed copied into the private sandbox home; no keychain export. |
| Claude | `api-key`          | `ANTHROPIC_API_KEY` declared in the workflow `.env`          | Explicit environment variable.                                               |
| Claude | `oauth-token`      | `CLAUDE_CODE_OAUTH_TOKEN` obtained with `claude setup-token` | Explicit environment variable.                                               |
| Gemini | `api-key`          | `GEMINI_API_KEY` declared in the workflow `.env`             | Explicit environment variable; fresh sessions only.                          |

For a Codex account seed, run `codex -c cli_auth_credentials_store='"file"' login` on the host first. The command deliberately chooses file storage. The seed is sensitive: keep it outside version control and do not print it. Account access and API-key billing are different. The examples reject conflicting Claude credentials and Codex account login combined with an API key.

The workflow `.env` is next to the generated script. Empty declarations inherit the corresponding host variable; undeclared host secrets are not forwarded. Library repository defaults instead read `.outpost/.env`. See [configuration precedence](../configuration/). The private sandbox home is ephemeral; conversation persistence does not preserve authentication.

## Cloud allocation is a separate login

Vercel and Daytona credentials authorize sandbox allocation and remain independent of the selected agent credentials. Use the provider's declared connection settings or environment variables; do not add cloud allocation secrets to the agent variables unless that agent actually needs them. The [remote recipe](../../../guide/cookbook/remote/) gives the complete SDK and environment preparation.

## Diagnose a failed login

A successful `doctor` check or sandbox allocation does not prove that a model accepts the credentials. Check the selected mode, declared variable, subscription/API access and the location of a Codex file seed before retrying. A handwritten API program must configure authentication explicitly; the CLI-generated Codex script already includes its login hook.

Detailed contracts and runnable examples: [Codex](../../../guide/agents/connect-codex/), [Claude](../../../guide/agents/connect-claude/), [Gemini](../../../guide/agents/gemini/). Custom Codex model providers require a Responses-compatible endpoint; see the [provider contract](../../behavior/agents/connect-codex/#openai-compatible-model-providers).

Vendor sources: [Codex authentication](https://developers.openai.com/codex/auth/), [Claude authentication](https://code.claude.com/docs/en/authentication), [Claude CLI reference](https://code.claude.com/docs/en/cli-reference).
