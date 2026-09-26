---
title: "Vercel Sandbox"
description: "Allocate a remote environment with Vercel Sandbox."
---

Install the optional SDK alongside Outpost. A local container engine is not required.

```sh
npm install @vercel/sandbox
```

```ts
import { vercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";

const sandboxProvider = vercelSandboxProvider({
  create: { runtime: "node24" },
});
```

## Configure allocation

Configure the Vercel SDK’s allocation credentials in the host environment. You can use a Vercel OIDC token or the SDK’s token, team and project settings. They are separate from the agent’s account or API key.

Vercel rejects interactive terminal attachment. Use `sandbox.command()` and headless dispatch. `create` passes supported creation settings to the SDK; `root` selects the remote workspace location.

## Repository synchronization

Outpost uploads Git history and selected inputs, runs work remotely, then validates and synchronizes changes back. `includeUncommitted` opts into including host edits. Concurrent host changes can stop synchronization and leave recovery material.

A missing supported CLI can be bootstrapped remotely. Set `bootstrap: false` on sandbox options when your image must provide all tools. Use `sandboxReady` to install project dependencies.

Close owned sandboxes in `finally`; cloud allocation can incur charges until resources are released. See [File exchange](../file-exchange/) and [Failure recovery](../failure-recovery/).

API: [vercelSandboxProvider](../../reference/vercelsandboxprovider/).
