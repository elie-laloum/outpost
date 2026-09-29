---
title: "Cloud sandboxes"
description: "Run agents in Vercel or Daytona sandboxes and synchronize their changes back."
---

Mounted providers see the selected workspace through the live host mount. Remote providers upload a snapshot and synchronize changes back. Your application uses the same sandbox operations, but the file ownership differs.

## Vercel Sandbox

Install the optional SDK alongside Outpost. A local container engine is not required.

```sh
npm install @vercel/sandbox
```

```ts
import { createVercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";

const sandboxProvider = createVercelSandboxProvider({
  create: { runtime: "node24" },
});
```

### Configure allocation

Configure the Vercel SDK’s allocation credentials in the host environment. You can use a Vercel OIDC token or the SDK’s token, team and project settings. They are separate from the agent’s account or API key.

Vercel rejects interactive terminal attachment. Use `sandbox.command()` and headless dispatch. `create` passes supported creation settings to the SDK; `root` selects the remote workspace location.

### Repository synchronization

Outpost uploads Git history and selected inputs, runs work remotely, then validates and synchronizes changes back. `includeUncommitted` opts into including host edits. Concurrent host changes can stop synchronization and leave recovery material.

A missing supported CLI can be bootstrapped remotely. Set `bootstrap: false` on sandbox options when your image must provide all tools. Use `sandboxReady` to install project dependencies.

Close owned sandboxes in `finally`; cloud allocation can incur charges until resources are released. See [File exchange](../cloud-sandboxes/) and [Failure recovery](../recovery/).

API: [createVercelSandboxProvider](../../reference/createvercelsandboxprovider/).

## Daytona Sandbox

Install the optional SDK alongside Outpost. A local container engine is not required.

```sh
npm install @daytona/sdk
```

```ts
import { createDaytonaSandboxProvider } from "@elie-laloum/outpost/providers/daytona";

const sandboxProvider = createDaytonaSandboxProvider({
  connection: { apiKey: process.env.DAYTONA_API_KEY ?? "" },
});
```

### Configure allocation

Supply Daytona allocation credentials through `connection` on the host. Select an image or snapshot through `create`; make sure it has the project runtime and a working shell.

Daytona supports interactive attachment through its native PTY API. Account credentials are still installed separately for the selected agent. `variables` controls the values forwarded into execution.

### Repository synchronization

Outpost uploads Git history and selected inputs, runs work remotely, then validates and synchronizes changes back. `includeUncommitted` opts into including host edits. Concurrent host changes can stop synchronization and leave recovery material.

A missing supported CLI can be bootstrapped remotely. Set `bootstrap: false` on sandbox options when your image must provide all tools. Use `sandboxReady` to install project dependencies.

Close owned sandboxes in `finally`; cloud allocation can incur charges until resources are released. See [File exchange](../cloud-sandboxes/) and [Failure recovery](../recovery/).

API: [createDaytonaSandboxProvider](../../reference/createdaytonasandboxprovider/).

## Remote inputs

`copies` selects additional repository-relative files. `includeUncommitted` includes host edits in the remote snapshot. Send only the inputs required for the task; remote allocation uploads them to your cloud account.

## Synchronization

Before applying incoming changes, Outpost validates the transfer and backs up the host state. If the host changed concurrently, synchronization fails instead of silently overwriting it. Preserve the reported transfer directory and use [Failure recovery](../recovery/) to inspect both sides.
