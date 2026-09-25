---
title: "Explicit host execution"
description: "Explicit host execution — Outpost"
sidebar:
  order: 3
---

`localSandboxProvider()` runs commands directly as your OS account. It is useful for trusted local automation or contract testing without a container engine.

```ts
import { agent as composeAgent, dispatch, codex } from "@elie-laloum/outpost";
import { localSandboxProvider } from "@elie-laloum/outpost/providers/local";

await dispatch({
  agent: composeAgent({ harness: codex.harness({}) }),
  sandboxProvider: localSandboxProvider({
    variables: { PROJECT_MODE: "test" },
  }),
  branch: { mode: "named", name: "local/inspection" },
  brief: { text: "Inspect the repository and summarize." },
});
```

Install and authenticate the agent CLI on the host first. `localSandboxProvider()` accepts provider `variables`; it does not build an image or provision an external service. Command directories default to the workspace path. Environment and filesystem access follow your host account.

Branch/worktree isolation still separates Git work, but it does not restrict access to unrelated files. `elevated` never grants host privilege elevation. Native attachment is supported, and transfers copy files/directories locally.

Outpost does not automatically select local execution when Docker, Podman or a cloud provider fails. Choose it explicitly and treat agent commands like commands you would run yourself.
