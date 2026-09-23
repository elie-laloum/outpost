---
title: "Connect your Codex account"
description: "Connect your Codex account — Outpost"
sidebar:
  order: 4
---

Choose ChatGPT account access or an API key. Outpost does not forward your browser session or OS keychain. Install the native CLI on the host for local login; generated images already contain it.

## Sign in on your computer

Run `codex login`, complete the browser flow, then run `codex login status`. On a headless device, `codex login --device-auth` is available when your account or administrator permits it. See [OpenAI authentication](https://developers.openai.com/codex/auth).

With `local()`, Codex uses host credentials. Docker/Podman start with a private home: host login alone is insufficient.

## Use your ChatGPT account in a container

This recipe requires `~/.codex/auth.json`. If credentials are in the OS keychain, select `cli_auth_credentials_store = "file"` in `~/.codex/config.toml` and sign in again, where policy permits. See [credential storage](https://developers.openai.com/codex/auth#credential-storage).

Mount a read-only credential seed, then copy it into the writable ephemeral home:

```ts
import { createSandbox, codex } from "@elie-laloum/outpost";
import { docker } from "@elie-laloum/outpost/providers/docker";

await using sandbox = await createSandbox({
  agent: codex(),
  provider: docker({
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
import { createSandbox, codex } from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: codex(),
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

Run `codex login status` inside the sandbox. Check missing/expired seed files, keychain-only login and undeclared variables. These examples only check authentication; dispatching makes model calls. For cloud providers, use the API-key hook with explicit variables; local mounts apply only to Docker/Podman. Provider allocation credentials do not authenticate Codex.

Continue with [environment precedence](../environment/) or [cookbooks](../../cookbooks/).
