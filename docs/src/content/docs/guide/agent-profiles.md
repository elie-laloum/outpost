---
title: "Reuse an agent configuration"
description: "Share literal instructions, built-in tool restrictions and MCP servers across agent harnesses."
---

After [running one agent](../first-request/), extract the instructions and MCP declarations you want several agents to share. Model choice and authentication stay on each harness. A profile is reusable configuration, not a sandbox boundary.

## Declare the profile once

Use `defineAgentProfile()` to keep your team's instructions and MCP servers independent of its chosen CLI. The declaration is validated and copied into a frozen object; it starts no process and reads no credentials. Follow [setup](../setup/) before running a CLI agent.

Save the instructions in `profile.ts`. This first profile needs no MCP server.

```ts title="profile.ts"
import { defineAgentProfile } from "@elie-laloum/outpost";

export const profile = defineAgentProfile({
  instructions: "Never modify generated files.",
});
```

## Choose the agent separately

Save `agent.ts` beside the profile. The authentication remains on the harness; the profile contains neither credentials nor model settings. Both agents below reuse the same instructions. Pass either agent to [dispatch](../first-request/) with the same repository and sandbox provider.

```ts title="agent.ts"
import {
  createAgent,
  createClaudeHarness,
  createCodexHarness,
} from "@elie-laloum/outpost";
import { profile } from "./profile.ts";

export const claude = createAgent({
  harness: createClaudeHarness({ authentication: "account", profile }),
});
export const codex = createAgent({
  harness: createCodexHarness({ authentication: "account", profile }),
});
```

The harness applies instructions to every request, including repairs and resumes, without writing them into your repository or changing host credentials. See [defineAgentProfile](../../reference/defineagentprofile/) for each CLI’s projection and [MCP configuration](../mcp-servers/) for configuration merging.

## Restrict the built-in tools

Save `restricted-profile.ts` beside the first file. This profile permits file reading, file edits and only the exact shell command `npm test`. Omitted tool restrictions preserve the harness's existing behavior; an empty list permits no built-in tools. Explicit MCP server declarations grant their own tools, restricted separately by each server's filters.

```ts title="restricted-profile.ts"
import { defineAgentProfile } from "@elie-laloum/outpost";
import { profile } from "./profile.ts";

export const restricted = defineAgentProfile({
  instructions: profile.instructions!,
  mcpServers: profile.mcpServers!,
  allowedTools: ["read", "edit", "shell:npm test"],
});
```

Apply `restricted` to `createClaudeHarness()` or `createHarness()`. Claude enforces the list through native tool selection and a command hook, disables inherited settings/MCP configuration for that request, and rejects incompatible permission modes. The hook needs Node.js and a CLI able to execute it inside the sandbox.

A shell grant matches the entire command: `npm test --watch`, extra whitespace, wrappers and `npm test && git push` do not match `shell:npm test`.

On the built-in harness, declare the [toolsets](../harness-tools/) as well as the profile: a policy does not install tools. `read` covers `read_file`, `list_files` and `search`; `edit` covers `write_file` and `edit_file`; `shell` covers `shell`. Other custom, Git and delegation tools are denied when a list is present.

Profile restrictions intersect with [harness permissions](../harness-permissions/) and are rechecked after hooks rewrite input. Descendant subagents inherit them and may add their own restrictions.

The instructions are behavioral guidance. Tool restrictions control calls through the selected agent's protocol; they are not a filesystem or network security boundary. A permitted shell command or MCP tool can have broader effects. Claude managed policy and trusted CLI configuration still apply. See [security](../security/).

## Handle unsupported projections

Outpost refuses a projection it cannot apply; it never substitutes an instruction asking the model to respect a tool restriction. A refusal has code `configuration` and names the unsupported feature.

| Harness     | Instructions                                 | Built-in tool allowlist                | MCP                        |
| ----------- | -------------------------------------------- | -------------------------------------- | -------------------------- |
| Outpost     | System instructions before harness additions | Enforced by the Outpost loop           | Existing sandbox bridge    |
| Claude Code | Native appended system prompt                | Native tool selection and command hook | Existing native projection |
| Codex       | Native developer instructions                | Refused, including an empty list       | Existing native projection |
| Copilot CLI | Literal request prefix                       | Refused, including an empty list       | Existing native projection |
| Kimi Code   | Literal request prefix                       | Refused, including an empty list       | Existing native projection |
| Antigravity | Literal request prefix                       | Refused, including an empty list       | Existing native projection |

Tool allowlists for Codex, Copilot, Kimi and Antigravity fail at `createAgent()`, before sandbox allocation. Kimi also refuses profile instructions when constructing an interactive request, because its interactive mode accepts no initial prompt. The other CLIs carry the profile into interactive requests through their native arguments or initial prompt.

Profile and harness MCP declarations are merged by server name. A duplicate name is rejected when creating the harness, even when both declarations match. Existing adapter restrictions still apply: for example Claude refuses an MCP `tools.include` filter, and the built-in harness refuses CLI OAuth logins. See [MCP servers](../mcp-servers/) and [MCP OAuth](../mcp-oauth/) for supported projections.

## Run the offline example

The repository contains [`examples/58-agent-profiles`](https://gitlab.elielaloum.com/elielaloum/outpost/-/tree/main/examples/58-agent-profiles). Build Outpost, then run `node examples/58-agent-profiles/index.ts`. It reuses one profile across CLI request projections and executes a simulated model with the built-in harness, real local file tools and a local MCP server. It verifies that a forbidden edit is refused without creating the file. The explicitly unisolated local provider needs no credentials or container.

Deterministic tests cover request projection, the real command hook, local tool denial, hooks and warm continuation. Paid CLI/model runs and native CLI continuation with profiles remain to be validated against the pinned versions. Claude's projection follows its [CLI reference](https://code.claude.com/docs/en/cli-reference) and [permission behavior](https://code.claude.com/docs/en/permissions); Codex's overrides follow its [configuration reference](https://developers.openai.com/codex/config-reference/).

API: [defineAgentProfile](../../reference/defineagentprofile/) · [AgentProfile](../../reference/agentprofile/) · [AgentProfileOptions](../../reference/agentprofileoptions/) · [AgentProfileTool](../../reference/agentprofiletool/).
