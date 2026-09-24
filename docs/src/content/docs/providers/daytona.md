---
title: "Daytona sandbox"
description: "Daytona sandbox — Outpost"
sidebar:
  order: 5
---

Install the optional SDK:

```sh
npm install @daytona/sdk
```

```ts
import { dispatch, claude } from "@elie-laloum/outpost";
import { daytona } from "@elie-laloum/outpost/providers/daytona";

const apiKey = process.env.DAYTONA_API_KEY;
if (!apiKey) throw new Error("Set DAYTONA_API_KEY");
await dispatch({
  agent: claude(),
  provider: daytona({
    connection: { apiKey },
    create: { language: "typescript" },
  }),
  branch: { mode: "named", name: "cloud/daytona-task" },
  brief: { text: "Review the code and commit focused fixes." },
});
```

`connection` configures the SDK client. `create` accepts the SDK’s image or snapshot creation parameters. Outpost also accepts `root`, `variables` and `retain`. Model credentials must be supplied independently through [agent environment configuration](../../agents/environment/).

The environment needs Node.js, npm, Git, `sh` and `setsid`. Automatic agent bootstrap is enabled unless `bootstrap: false`. A custom image should provide the remaining project tools.

Native process sessions stream stdout/stderr and are cleaned up after invocation. Cancellation terminates the command process group rather than the whole warm sandbox. Files and directories transfer through the lease. Interactive attachment is not supported in this release.

Read [remote synchronization](../../sandboxes/remote-sync/) before enabling `includeUncommitted` or editing the host workspace concurrently. Provider contract tests do not provision a live paid sandbox.

[Run opt-in hosted compatibility checks](../../operations/cloud-compatibility/) for live provider contracts and credential-free agent CLI checks.
