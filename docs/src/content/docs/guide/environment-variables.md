---
title: "Environment variables"
description: "Declare which variables reach the sandbox, the agent or a single command, and where their values come from."
---

## Choose where to declare a variable

Outpost forwards only the names you declare. Pick the narrowest place that reaches the process that needs the value.

| Where                                    | Reaches                                           | Use it for                                 |
| ---------------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| Sandbox provider `variables`             | Every command in the sandbox, the agent included  | Tool settings such as `CI` or `NODE_ENV`   |
| Harness `variables` (CLI agents)         | The agent’s processes only                        | API keys, agent settings, MCP secrets      |
| Command `variables`                      | That one command                                  | A per-call override                        |
| `.outpost/.env` in the target repository | Every command in the sandbox, like the provider’s | Values you keep out of code for a checkout |
| `.env` next to a generated `run.ts`      | The generated script’s sandbox provider           | Generated projects, below                  |

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  variables: { CI: "true", NODE_ENV: "test" },
});

export const coder = createAgent({
  harness: createClaudeHarness({
    authentication: "usage",
    variables: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "" },
  }),
});
```

Values are strings. Select each name from `process.env` explicitly: spreading `process.env` would send every host secret into the sandbox. Per-command `variables` are shown in [Sandbox sessions](../sandbox-sessions/).

## Know which value wins

When a name appears in several places, the more specific source wins:

`.outpost/.env` → sandbox provider → harness → command

Outpost also sets `GIT_AUTHOR_*` and `GIT_COMMITTER_*` from the repository’s Git configuration; any declared source overrides them.

:::caution
A name cannot be declared on both the harness and the sandbox provider. Dispatch fails before the agent starts with `Agent and sandbox variables overlap: NAME` (code `configuration`).
:::

## Keep values in `.outpost/.env`

Outpost reads `.outpost/.env` at the root of the target repository when it prepares a sandbox. A missing file is ignored.

```sh title=".outpost/.env"
NODE_ENV=test
LINEAR_API_KEY=
```

A nonempty value is used as written. An empty declaration such as `LINEAR_API_KEY=` takes the value from the environment of the process running Outpost. Lines accept `export`, quotes and trailing `#` comments.

:::caution
Keep this file out of Git. A `.env` line in `.gitignore` covers it.
:::

## Generated projects

`outpost init` writes `.env.example` with the variable your sign-in needs. Copy it to `.env` next to `run.ts` and add your own names.

The script reads `.env` from its own directory, so you can run it from anywhere. It fills empty values from the parent environment and passes every declared name to the sandbox provider’s `variables`.

## Secrets for MCP servers and the built-in harness

[MCP servers](../mcp-servers/) name their secrets; Outpost never writes the values into their configuration.

<!-- features -->

- [CLI agents](../choose-an-agent/): Declare the secret on the harness `variables`, the sandbox provider or in `.outpost/.env`.
- [Built-in harness](../harness/): `createHarness()` has no `variables`. Declare the secret on the sandbox provider or in `.outpost/.env`.
- [Model providers](../model-providers/): The `apiKey` stays on the host, in your code. Do not forward it to the sandbox.

A missing secret fails before the server starts, with `Missing NAME`.

## Host or sandbox

Declare only what code in the sandbox needs. Sandbox allocation keys and storage keys stay on the host with their clients: see [Authentication](../authentication/).

## Limits

- With [host execution](../host-process/), commands also inherit the whole environment of the Outpost process.
- An unset `process.env.NAME ?? ""` forwards an empty string, not an absent variable.

API: [Variables](../../reference/variables/) · [Command](../../reference/command/) · [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [createClaudeHarness](../../reference/createclaudeharness/) · [createHarness](../../reference/createharness/).
