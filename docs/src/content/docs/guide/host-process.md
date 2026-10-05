---
title: "Run on your machine"
description: "Run the installed agent CLI directly on the host with the local provider."
---

## Prerequisites

Install the agent CLI and project tools on your machine. Make the CLI available on `PATH`, then sign in or configure its API access. The local provider uses these host tools directly; it does not use an image.

:::caution
Nothing is isolated. The agent and every command it runs act as your user, with your files, environment variables and network. Use it only for code you trust; see [Security](../security/).
:::

## Configure

Create the provider with `createLocalSandboxProvider()` and pass it to `dispatch()`, like any other sandbox provider.

```ts title="host.ts"
import { dispatch } from "@elie-laloum/outpost";
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";
import { coder, repository } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider: createLocalSandboxProvider(),
  agent: coder,
  branch: { mode: "named", name: "outpost/host-fix" },
  brief: { text: "Fix the failing unit test and commit the fix." },
});
console.log(result.commits);
```

The agent runs your installed CLI in a worktree of `outpost/host-fix`. `variables` adds [environment variables](../environment-variables/) on top of your process environment.

## What changes from a container

| Aspect                    | [Docker and Podman](../containers/)      | Host execution                                                            |
| ------------------------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| Isolation                 | Container with reduced privileges        | None                                                                      |
| Agent CLI and tools       | From the [agent image](../agent-images/) | Installed by you; Outpost installs nothing                                |
| Environment               | Declared variables only                  | Your process environment plus declared variables                          |
| Account authentication    | Host sign-in copied into the sandbox     | The CLI’s own sign-in; Outpost passes variables only, no credential files |
| Agent home                | Private and ephemeral                    | Your own home directory                                                   |
| Native conversations      | Captured from the sandbox home           | Kept in your CLI’s own stores                                             |
| Interactive `attach()`    | Supported                                | Supported                                                                 |
| Outbound rules (`egress`) | `deny-all`                               | Unsupported                                                               |

## Repository access

The agent works in the directory set by your [branch policy](../repository-and-branch/). Without `branch`, that is your checkout as it is; with `named` or `integrate`, a worktree under `.outpost/workspaces/`.

Workflows, conversations and [sandbox sessions](../sandbox-sessions/) work unchanged.

## Limits

- Passing `egress` throws: use a container or a cloud sandbox for [network restrictions](../network-restrictions/).
- [MCP servers](../mcp-servers/) declared for Kimi Code or Antigravity are merged into `~/.kimi-code/mcp.json` or `~/.gemini/config/mcp_config.json` in your home, and stay there after the run.
- `{ account: { file } }` is ignored: the CLI uses the sign-in stored in your home.

API: [createLocalSandboxProvider](../../reference/createlocalsandboxprovider/) · [LocalOptions](../../reference/support-localoptions/).
