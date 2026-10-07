---
title: "Reuse an agent configuration"
description: "Share literal instructions, built-in tool restrictions and MCP servers across agent harnesses."
---

## Declare the profile once

Use `defineAgentProfile()` to keep your team's instructions and MCP servers independent of its chosen CLI. The declaration is validated and copied into a frozen object; it starts no process and reads no credentials. Follow [setup](../setup/) before running a CLI agent.

Save this declaration in `profile.ts`. This MCP server is a program in your repository, executed inside the sandbox. Its token is referenced by variable name; supply the value through the [sandbox environment](../environment-variables/).

```ts title="profile.ts"
import { defineAgentProfile } from "@elie-laloum/outpost";

export const profile = defineAgentProfile({
  instructions: "Never modify generated files.",
  mcpServers: {
    docs: {
      command: "node",
      arguments: ["mcp/docs.mjs"],
      variables: ["DOCS_TOKEN"],
      tools: { exclude: ["delete_note"] },
    },
  },
});
```

## Choose the agent separately

Save `agent.ts` beside the profile. The authentication remains on the harness; the profile contains neither credentials nor model settings. Both agents below reuse the same instructions and MCP declaration. Pass either agent to [dispatch](../first-request/) with the same repository and sandbox provider.

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

Claude receives appended system instructions and native MCP JSON. Codex receives `developer_instructions` and MCP TOML values through configuration overrides, including its app-server path. Copilot, Kimi and Antigravity prepend the instructions as literal text to each request, including repairs and resumes. The final-answer contract remains after the request text. These projections do not write shared instructions into the repository or change host credential files. Native MCP home files still follow the [existing merge behavior](../mcp-servers/).

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

Apply `restricted` to `createClaudeHarness()` or `createHarness()`. Claude projects the restriction into its available built-in tools and a `PreToolUse` hook, uses `dontAsk`, and disables inherited user/project/local setting sources and inherited MCP configurations for this request. The hook checks the entire shell command: `npm test --watch`, wrappers, extra whitespace and `npm test && git push` are refused. A conflicting explicit Claude permission mode fails when composing the agent. The command hook needs Node.js inside the sandbox and a CLI installation that can execute its shell command.

The built-in Outpost harness maps reading to `read_file`, `list_files` and `search`, editing to `write_file` and `edit_file`, and shell access to `shell`. Declare the corresponding [toolsets](../harness-tools/) on the harness; a profile supplies policy, not implementations. Other custom tools, Git tools and delegation tools are denied when a list is present. Profile permissions intersect with [harness permissions](../harness-permissions/), are checked again after input-changing hooks, and remain active in descendant subagents. Each subagent may impose its own profile restrictions.

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
