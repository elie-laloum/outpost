---
title: "Connect your Codex account"
description: "Connect your Codex account — Outpost"
sidebar:
  order: 4
---

Choose ChatGPT account access (`account`) or an OpenAI API key (`usage`) with the `authentication` option of `codexHarness()`. Outpost never forwards your browser session or reads the OS keychain. Install the native CLI on the host for account login; generated images already contain it. The [authentication manual](../../../manual/authentication/) gives the complete contract for every agent.

## Sign in on your computer

Run `codex login`, complete the browser flow, then run `codex login status`. On a headless device, `codex login --device-auth` is available when your account or administrator permits it. See [OpenAI authentication](https://developers.openai.com/codex/auth).

For sandboxes, the login must be stored in a file. Sign in with `codex -c cli_auth_credentials_store='"file"' login`, or set `cli_auth_credentials_store = "file"` in `~/.codex/config.toml` and sign in again, where policy permits. See [credential storage](https://developers.openai.com/codex/auth#credential-storage). The login is then in `~/.codex/auth.json`, or `$CODEX_HOME/auth.json` when `CODEX_HOME` is set.

With `localSandboxProvider()`, Codex uses the host login directly and Outpost writes nothing on the host. Docker, Podman, Vercel, Daytona and Firecracker start with a private home: a host login alone is not visible there until `authentication` prepares it.

## Generate a workflow using your subscription

Account login is the default when initializing a workflow:

```sh
outpost init --agent codex --sandbox-provider docker --authentication account --repository /path/to/repository
```

The generated `run.ts` contains `codexHarness({ authentication: "account" })` and reads no credential file itself. Before the first dispatch, Outpost reads the host `auth.json` and installs a private copy in the sandbox home with mode `0600`, through an installer that receives it on stdin. This works with Docker, Podman, Vercel, Daytona and Firecracker; change `--sandbox-provider` accordingly. It uses your ChatGPT plan and does not require an OpenAI API key. Cloud allocation credentials are still required for Vercel and Daytona.

With `--sandbox-provider local`, the workflow uses the existing host login directly. Account limits and model access still apply. Outpost never exports the OS keychain or copies other host Codex settings.

## Use your ChatGPT account in a container

Select `account` on the harness; no volume or hook is needed:

```ts
import { agent, codexHarness, createSandbox } from "@elie-laloum/outpost";
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

await using sandbox = await createSandbox({
  agent: agent({ harness: codexHarness({ authentication: "account" }) }),
  sandboxProvider: dockerSandboxProvider(),
});
const result = await sandbox.dispatch({
  brief: { text: "Summarize the repository without changing files." },
  deadlineMs: 120_000,
});
console.log(result.text);
```

Replace the provider and its import with Podman or a cloud provider if needed. For a login kept elsewhere, pass `{ account: { file: "/path/to/auth.json" } }`. Outpost prepares the login once per sandbox, before the first dispatch or attach of Codex; sandbox paths stay at their defaults for native conversation capture. The dispatch makes a real model call.

Refreshes update the sandbox copy, not the host file. Because Codex can rotate its refresh token, the host login may then be revoked. Give Outpost a dedicated login, for example `CODEX_HOME=~/.outpost/accounts/codex codex -c cli_auth_credentials_store='"file"' login`, and select `{ account: { file: "~/.outpost/accounts/codex/auth.json" } }`. Sign in to it again if it becomes stale. Treat the file as a password and keep it out of Git and logs.

## API-key alternative

Declare `OPENAI_API_KEY=` in `.outpost/.env` and provide the value through the parent process or a secret manager. Select `usage`:

```ts
import { agent, codexHarness, createSandbox } from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: agent({ harness: codexHarness({ authentication: "usage" }) }),
});
const result = await sandbox.dispatch({
  brief: { text: "Summarize the repository without changing files." },
  deadlineMs: 120_000,
});
console.log(result.text);
```

Before the first dispatch, Outpost runs `codex login --with-api-key` in the sandbox with the key on stdin, then passes `OPENAI_API_KEY` to every Codex command. To read the key under another name, select `{ usage: { variable: "TEAM_OPENAI_KEY" } }`. On the local provider, the login command does not run, so the host `~/.codex/auth.json` is never overwritten. API-key usage has separate API billing. See [Codex login commands](https://developers.openai.com/codex/cli/reference).

A handwritten `sandboxReady` hook that copies `auth.json` or runs `codex login` is no longer needed; remove it when you select `authentication`, so the login is not prepared twice.

## Troubleshooting

Read the error first: a missing `auth.json` names the path and the login command, and a missing key reads `Missing OPENAI_API_KEY. Declare the selected credential explicitly.` Check keychain-only login, an invalid `auth.json` and undeclared variables. Codex has no account-token form: `{ account: { key } }` and `{ account: { variable } }` are rejected when the agent is composed. A successful allocation does not prove that the model accepts the credential; only a dispatch does. Provider allocation credentials do not authenticate Codex.

Continue with [environment precedence](../../../agents/environment/) or [cookbooks](../../../cookbook/).

## OpenAI-compatible model providers

Use a custom provider for a service implementing the OpenAI Responses API, including streamed responses and Codex tool calls. Chat Completions-only endpoints are not supported. Supply the model name explicitly; model names and availability belong to that service.

```ts
import { agent, codexHarness, dispatch } from "@elie-laloum/outpost";
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const result = await dispatch({
  agent: agent({
    harness: codexHarness({
      modelProvider: {
        baseUrl: "https://models.example.com/v1",
        apiKeyEnvironment: "MODEL_API_KEY",
      },
      authentication: "usage",
    }),
    model: "vendor/model",
  }),
  sandboxProvider: dockerSandboxProvider({
    variables: { MODEL_API_KEY: process.env.MODEL_API_KEY ?? "" },
  }),
  brief: {
    text: "Inspect the repository and describe the next useful change.",
  },
});
console.log(result.text);
```

`apiKeyEnvironment` defaults to `OPENAI_API_KEY`; use `false` only for an endpoint that needs no authentication, in which case no `authentication` form is accepted. With a model provider, only `usage`, `usage.key` and `usage.variable` are accepted: they fill the `apiKeyEnvironment` variable and run no `codex login`. Set the secret in the parent process and pass it explicitly, or declare it in the repository's `.outpost/.env`. Outpost passes the environment variable name to Codex configuration, never the key in command arguments. Billing belongs to the selected service. URLs must not embed credentials, query parameters or fragments. `localhost` is the sandbox itself, so local servers must be reachable from that sandbox.

See [Codex custom model providers](https://developers.openai.com/codex/config-advanced/#custom-model-providers). Native Codex conversation and sandbox contracts remain applicable. Compatibility must be validated against the chosen service; an OpenAI-compatible label alone does not establish support for Responses or tools.
