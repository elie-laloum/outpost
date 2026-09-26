---
title: "Daytona Sandbox"
description: "Allocate a remote environment with Daytona Sandbox."
---

Install the optional SDK alongside Outpost. A local container engine is not required.

```sh
npm install @daytona/sdk
```

```ts
import { daytonaSandboxProvider } from "@elie-laloum/outpost/providers/daytona";

const sandboxProvider = daytonaSandboxProvider({
  connection: { apiKey: process.env.DAYTONA_API_KEY ?? "" },
});
```

## Configure allocation

Supply Daytona allocation credentials through `connection` on the host. Select an image or snapshot through `create`; make sure it has the project runtime and a working shell.

Daytona supports interactive attachment through its native PTY API. Account credentials are still installed separately for the selected agent. `variables` controls the values forwarded into execution.

## Repository synchronization

Outpost uploads Git history and selected inputs, runs work remotely, then validates and synchronizes changes back. `includeUncommitted` opts into including host edits. Concurrent host changes can stop synchronization and leave recovery material.

A missing supported CLI can be bootstrapped remotely. Set `bootstrap: false` on sandbox options when your image must provide all tools. Use `sandboxReady` to install project dependencies.

Close owned sandboxes in `finally`; cloud allocation can incur charges until resources are released. See [File exchange](../file-exchange/) and [Failure recovery](../failure-recovery/).

API: [daytonaSandboxProvider](../../reference/daytonasandboxprovider/).
