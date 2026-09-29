// MCP servers — the harness starts a Model Context Protocol server inside the sandbox for each turn,
// and hands its tools to the model as mcp__<server>__<tool>. Here, a small ticket server
// (repo/mcp/tickets.mjs) that also offers a resource and a prompt.

import { join } from "node:path";
import {
  createAgent,
  createHarness,
  defineMcpPrompt,
  dispatch,
  OutpostError,
  type AgentEvent,
  type McpServers,
} from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";


const repository = demoRepository(import.meta.dirname);
const brief = { file: join(import.meta.dirname, "triage.md") };


// 1. The server: a stdio command, run from the workspace root.
//    The secret is passed by name only: its value never appears in arguments or files.
const mcpServers: McpServers = {
  tickets: {
    command: "node",
    arguments: ["mcp/tickets.mjs"],
    variables: ["TICKETS_TOKEN"],
    tools: { exclude: ["delete_ticket"] }, // the model never sees this tool
    startupTimeoutMs: 10_000,
  },
};


// 2. The server's "triage" prompt, rendered into the instructions at the start of each turn.
const triage = defineMcpPrompt({ server: "tickets", name: "triage", arguments: { team: "paiements" } });

const triager = createAgent({
  model,
  harness: createHarness({ modelProvider, mcpServers, instructions: [triage] }),
});

const observe = (event: AgentEvent) => {
  if (event.kind === "tool") console.log("  outil :", event.name, JSON.stringify(event.input));
};


// 3. The secret is declared on the sandbox provider (or in .outpost/.env).
console.log("1. tri des tickets");
const withToken = createDockerSandboxProvider({ image: "outpost:sandbox", variables: { TICKETS_TOKEN: "demo-token" } });

const result = await dispatch({ repository, sandboxProvider: withToken, agent: triager, brief, observe });
console.log(result.text.trim().replace(/^/gm, "  "));


// 4. Without the secret, the server does not start and the turn fails before the model is called.
console.log("\n2. secret manquant");
try {
  await dispatch({ repository, sandboxProvider, agent: triager, brief });
} catch (error) {
  if (!(error instanceof OutpostError)) throw error;
  console.log(`  code : ${error.code} · ${error.message.split("\n")[0]}`);
}
