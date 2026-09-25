---
title: "Connect your Codex account"
description: "Connect your Codex account — Outpost"
sidebar:
  order: 4
---

Choose ChatGPT account access or an API key. Outpost does not forward your browser session or OS keychain. Install the native CLI on the host for local login; generated images already contain it.

## Sign in on your computer

Run `codex login`, complete the browser flow, then run `codex login status`. On a headless device, `codex login --device-auth` is available when your account or administrator permits it. See [OpenAI authentication](https://developers.openai.com/codex/auth).

With `localSandboxProvider()`, Codex uses host credentials. Docker/Podman start with a private home: host login alone is insufficient.

## Generate a workflow using your subscription

Use the account login option when initializing a workflow:

```sh
outpost init --agent codex --sandbox-provider docker --authentication login --repository /path/to/repository
```

Sign in on the host with file credential storage as described below. The generated workflow reads `auth.json` from `CODEX_HOME` (or `~/.codex`) and sends a copy through stdin to the private sandbox home with mode `0600`. This works with Docker, Podman, Vercel and Daytona; change `--sandbox-provider` accordingly. It uses your ChatGPT account access and does not require an OpenAI API key. Cloud allocation credentials are still required for Vercel and Daytona.

With `--sandbox-provider local`, the workflow uses the existing host login directly. Account limits and model access still apply. The generated workflow does not export the OS keychain or copy other host Codex settings.

## Use your ChatGPT account in a container

This recipe requires `~/.codex/auth.json`. If credentials are in the OS keychain, select `cli_auth_credentials_store = "file"` in `~/.codex/config.toml` and sign in again, where policy permits. See [credential storage](https://developers.openai.com/codex/auth#credential-storage).

Mount a read-only credential seed, then copy it into the writable ephemeral home:

```ts
import {
  agent as composeAgent,
  createSandbox,
  codexHarness,
} from "@elie-laloum/outpost";
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

await using sandbox = await createSandbox({
  agent: composeAgent({ harness: codexHarness({}) }),
  sandboxProvider: dockerSandboxProvider({
    volumes: [
      {
        source: "~/.codex/auth.json",
        target: "~/.outpost-auth/codex.json",
        readOnly: true,
      },
    ],
  }),
  hooks: {
    sandboxReady: [
      {
        executable: "sh",
        arguments: [
          "-c",
          'mkdir -p "$HOME/.codex" && cp "$HOME/.outpost-auth/codex.json" "$HOME/.codex/auth.json" && chmod 600 "$HOME/.codex/auth.json"',
        ],
      },
    ],
  },
});
const status = await sandbox.command({
  executable: "codex",
  arguments: ["login", "status"],
});
if (status.status !== 0) throw new Error(status.stderr);
console.log("Codex authentication is ready");
```

Replace the provider/import with Podman if needed. Adapt the source for a custom host `CODEX_HOME`; keep sandbox paths at their defaults for native conversation capture. Add `sandbox.dispatch(...)` after the status check to run an agent.

Refreshes update the sandbox copy, not the host seed. Re-authenticate the seed if it becomes stale. Do not share one writable auth file across parallel sandboxes. Treat the file as a password and keep it out of Git and logs.

## API-key alternative

Declare `OPENAI_API_KEY=` in `.outpost/.env` and provide the value through the parent process or secret manager. Initialize the native CLI through stdin:

```ts
import {
  agent as composeAgent,
  createSandbox,
  codexHarness,
} from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: composeAgent({ harness: codexHarness({}) }),
  hooks: {
    sandboxReady: [
      {
        executable: "sh",
        arguments: [
          "-c",
          'test -n "$OPENAI_API_KEY" && printenv OPENAI_API_KEY | codex login --with-api-key',
        ],
      },
    ],
  },
});
console.log(
  (
    await sandbox.command({
      executable: "codex",
      arguments: ["login", "status"],
    })
  ).status,
);
```

The hook runs once per sandbox. Keep dependent setup in the same command: sandbox hooks run concurrently. API-key usage has separate API billing. See [Codex login commands](https://developers.openai.com/codex/cli/reference).

## Troubleshooting

Run `codex login status` inside the sandbox. Check missing/expired seed files, keychain-only login and undeclared variables. These examples only check authentication; dispatching makes model calls. For cloud providers, generate a workflow with `--authentication login` to copy the account credential seed, or use the API-key hook with explicit variables. Local mounts apply only to Docker/Podman. Provider allocation credentials do not authenticate Codex.

Continue with [environment precedence](../../../agents/environment/) or [cookbooks](../../../cookbook/).

## OpenAI-compatible model providers

Use a custom provider for a service implementing the OpenAI Responses API, including streamed responses and Codex tool calls. Chat Completions-only endpoints are not supported. Supply the model name explicitly; model names and availability belong to that service.

```ts
import {
  agent as composeAgent,
  codexHarness,
  dispatch,
} from "@elie-laloum/outpost";
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const result = await dispatch({
  agent: composeAgent({
    harness: codexHarness({
      modelProvider: {
        baseUrl: "https://models.example.com/v1",
        apiKeyEnvironment: "MODEL_API_KEY",
      },
      variables: { MODEL_API_KEY: process.env.MODEL_API_KEY! },
    }),
    model: "vendor/model",
  }),
  sandboxProvider: dockerSandboxProvider(),
  brief: {
    text: "Inspect the repository and describe the next useful change.",
  },
});
console.log(result.text);
```

`apiKeyEnvironment` defaults to `OPENAI_API_KEY`; use `false` only for an endpoint that needs no authentication. Set the secret in the parent process and pass it explicitly, or declare it in the repository's `.outpost/.env`. Outpost passes the environment variable name to Codex configuration, never the key in command arguments. This provider does not require `codex login`; billing belongs to the selected service. URLs must not embed credentials, query parameters or fragments. `localhost` is the sandbox itself, so local servers must be reachable from that sandbox.

See [Codex custom model providers](https://developers.openai.com/codex/config-advanced/#custom-model-providers). Native Codex conversation and sandbox contracts remain applicable. Compatibility must be validated against the chosen service; an OpenAI-compatible label alone does not establish support for Responses or tools.
