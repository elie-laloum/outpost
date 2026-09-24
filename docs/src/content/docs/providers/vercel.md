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
import { dispatch, codex } from "@elie-laloum/outpost";
import { vercel } from "@elie-laloum/outpost/providers/vercel";

await dispatch({
  agent: codex(),
  provider: vercel({ create: { timeout: 30 * 60 * 1000 } }),
  branch: { mode: "named", name: "cloud/vercel-task" },
  brief: { text: "Add validation tests and commit them." },
});
```

`create` is typed from the installed SDK’s sandbox-creation options. Use it for provider credentials, runtime, resources and network configuration supported by that SDK. Credential discovery follows the SDK, so authenticate sandbox allocation separately from the selected model.

Outpost-specific options are `root` (remote workspace path), `retain` (captured output tail) and `variables` (provider environment). Outpost discovers the actual remote home and can install the selected missing agent in a user-writable prefix. Set `bootstrap: false` on dispatch/sandbox options to manage installation yourself.

Remote work requires `named` or `integrate`; omitted branch configuration defaults to integration. Commands stream output and synchronize changes back. Interactive attachment is not supported. Use [remote synchronization](../../sandboxes/remote-sync/) to understand uncommitted inputs, host-edit conflicts and recovery.

SDK contract tests use controlled doubles. Availability, quotas and model access in your account require an account-specific smoke test.

[Run opt-in hosted compatibility checks](../../operations/cloud-compatibility/) for live provider contracts and credential-free agent CLI checks.
