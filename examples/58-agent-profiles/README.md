# Portable agent profiles

Build with `bun run build`, then run `node examples/58-agent-profiles/index.ts` using Node.js 24+. This offline example needs no credentials, container or model API. Its explicitly unisolated local provider executes the included MCP server on your host. The demo repository is created once under `examples/.repos/58-agent-profiles` and reused.

`profile.ts` declares literal instructions and an MCP server once. The example composes all five CLI presets with that profile and constructs their requests without launching a CLI. A second profile restricts built-in tools to reading and the exact shell command `npm test`; it retains the same MCP server, whose `delete_note` tool is excluded separately.

The real Outpost harness runs a simulated model against the local MCP server. It reads a note and attempts a forbidden file edit. The example asserts that the read succeeds, the edit produces a denied tool result and `generated.txt` does not exist. It also checks Codex's explicit refusal to compose the restricted profile. Declaring a tool capability does not install an implementation: add the corresponding toolsets to the harness before using them.

Claude and the Outpost harness support built-in allowlists; Codex, Copilot, Kimi and Antigravity refuse them. Claude uses native tool selection and a command hook; the Outpost harness intersects the profile with its permissions and rechecks calls after hooks. Instructions guide behavior; permissions govern protocol calls and do not isolate arbitrary shell/MCP side effects. Models, credentials and sandbox selection remain separate. Native CLI execution and continuation with profiles still require live validation.
