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
import {
  agent as composeAgent,
  dispatch,
  claudeHarness,
} from "@elie-laloum/outpost";
import { daytonaSandboxProvider } from "@elie-laloum/outpost/providers/daytona";

const apiKey = process.env.DAYTONA_API_KEY;
if (!apiKey) throw new Error("Set DAYTONA_API_KEY");
await dispatch({
  agent: composeAgent({ harness: claudeHarness({}) }),
  sandboxProvider: daytonaSandboxProvider({
    connection: { apiKey },
    create: { language: "typescript" },
  }),
  branch: { mode: "named", name: "cloud/daytona-task" },
  brief: { text: "Review the code and commit focused fixes." },
});
```

`connection` configures the SDK client. `create` accepts the SDK’s image or snapshot creation parameters. Outpost also accepts `root`, `variables` and `retain`. Model credentials must be supplied independently through [agent environment configuration](../../../agents/environment/).

The environment needs Node.js, npm, Git, `sh` and `setsid`. Automatic agent bootstrap is enabled unless `bootstrap: false`. A custom image should provide the remaining project tools.

Native process sessions stream stdout/stderr and are cleaned up after invocation. Non-interactive commands preserve Daytona’s session shell so that it can report the process exit status, including when the command closes its output streams before exiting. Command output is encoded during transport and decoded before observation so Daytona’s line-oriented session logs cannot add bytes to NUL-delimited Git paths or unterminated output. Cancellation terminates the command process group rather than the whole warm sandbox. Files and directories transfer through the lease. Interactive commands and `sandbox.attach()` use Daytona’s [native PTY API](https://www.daytona.io/docs/en/pty/). Input and output preserve terminal bytes; stdout and stderr are merged into the terminal output. Outpost forwards terminal dimensions and resize events from the output stream, restores input raw mode, and disconnects the PTY after completion. Command status is verified independently of WebSocket closure. Cancellation kills the command process group and PTY while keeping the sandbox reusable.

Read [remote synchronization](../../../environment/remote-sync/) before enabling `includeUncommitted` or editing the host workspace concurrently. Provider contract tests do not provision a live paid sandbox.

[Run opt-in hosted compatibility checks](../../../extend/cloud-compatibility/) for live provider contracts and credential-free agent CLI checks.

Run the opt-in native terminal fixture with an existing Daytona account:

```sh
OUTPOST_DAYTONA_TERMINAL=1 node test/fixtures/daytona-terminal.ts
```

It requires `DAYTONA_API_KEY`, allocates one billable sandbox, and always attempts deletion. It checks real TTY descriptors, input, nonzero status after output closes, terminal resizing, cancellation of descendants and warm reuse. It makes no model calls. Routine unit tests use SDK contract doubles; their success is not evidence of live cloud compatibility.
