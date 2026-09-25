---
title: "Vercel sandbox"
description: "Vercel sandbox — Outpost"
sidebar:
  order: 4
---

Install the optional SDK in the consuming project:

```sh
npm install @vercel/sandbox
```

```ts
import { agent as composeAgent, dispatch, codex } from "@elie-laloum/outpost";
import { vercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";

await dispatch({
  agent: composeAgent({ harness: codex.harness({}) }),
  sandboxProvider: vercelSandboxProvider({
    create: { timeout: 30 * 60 * 1000 },
  }),
  branch: { mode: "named", name: "cloud/vercel-task" },
  brief: { text: "Add validation tests and commit them." },
});
```

`create` is typed from the installed SDK’s sandbox-creation options. Use it for provider credentials, runtime, resources and network configuration supported by that SDK. Credential discovery follows the SDK, so authenticate sandbox allocation separately from the selected model.

Outpost-specific options are `root` (remote workspace path), `retain` (captured output tail) and `variables` (provider environment). Outpost discovers the actual remote home and can install the selected missing agent in a user-writable prefix. Set `bootstrap: false` on dispatch/sandbox options to manage installation yourself.

The default workspace is `/vercel/sandbox/outpost`. Outpost creates missing parent directories recursively, including on images whose initial working directory is `/vercel`. A custom `root` must be writable by the sandbox user.

Remote work requires `named` or `integrate`; omitted branch configuration defaults to integration. Commands stream output and synchronize changes back. Interactive attachment is not supported. Use [remote synchronization](../../../environment/remote-sync/) to understand uncommitted inputs, host-edit conflicts and recovery.

SDK contract tests use controlled doubles. Availability, quotas and model access in your account require an account-specific smoke test.

[Run opt-in hosted compatibility checks](../../../extend/cloud-compatibility/) for live provider contracts and credential-free agent CLI checks.

## Agent authentication

Vercel allocation credentials do not sign Claude Code into your account. When changing providers, preserve the model variables explicitly:

```ts
import {
  agent as composeAgent,
  claude,
  createSandbox,
} from "@elie-laloum/outpost";
import { vercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";

const token = process.env.CLAUDE_CODE_OAUTH_TOKEN;
if (!token) throw new Error("Set CLAUDE_CODE_OAUTH_TOKEN before allocation");
await using sandbox = await createSandbox({
  agent: composeAgent({ harness: claude.harness({}) }),
  sandboxProvider: vercelSandboxProvider({
    create: { timeout: 300_000 },
    variables: { CLAUDE_CODE_OAUTH_TOKEN: token },
  }),
});
```

Obtain this token with `claude setup-token` on the host. For API billing instead, pass `ANTHROPIC_API_KEY` without the subscription token. A workflow-local `.env` is not automatically loaded by the library: read it explicitly, use the generated starter, or declare the variable in the target repository's `.outpost/.env`. See [Claude authentication](../../../agents/connect-claude/) and [environment precedence](../../../agents/environment/).
