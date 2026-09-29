import assert from "node:assert/strict";
import { builtInAgentRecord } from "../../src/adapters/agents/catalog.ts";

const protocolFixtures = builtInAgentRecord((agent) => agent.protocol);

const [agent, mode, ...args] = process.argv.slice(2);
assert.ok(
  agent === "claude" ||
    agent === "codex" ||
    agent === "antigravity" ||
    agent === "copilot" ||
    agent === "kimi",
);
assert.ok(mode === "start" || mode === "resume" || mode === "fork");
const continuation = mode === "start" ? [] : [mode, "fixture-conversation"];
if (agent === "codex")
  assert.deepEqual(args, [
    "--dangerously-bypass-approvals-and-sandbox",
    "exec",
    ...continuation,
    "--json",
    "-",
  ]);
if (agent === "claude")
  assert.deepEqual(args, [
    "--print",
    "--verbose",
    "--output-format",
    "stream-json",
    "--dangerously-skip-permissions",
    ...(mode === "start" ? [] : ["--resume", "fixture-conversation"]),
    ...(mode === "fork" ? ["--fork-session"] : []),
  ]);
if (agent === "antigravity") {
  assert.equal(mode, "start");
  assert.deepEqual(args, [
    "--dangerously-skip-permissions",
    "--input-format",
    "stream-json",
    "--output-format",
    "stream-json",
  ]);
}
if (agent === "copilot") {
  assert.equal(mode, "start");
  assert.deepEqual(args, [
    "--output-format",
    "json",
    "--allow-all",
    "--no-ask-user",
  ]);
}
if (agent === "kimi") {
  assert.equal(mode, "start");
  assert.deepEqual(args, [
    "--prompt",
    "fixture-prompt",
    "--output-format",
    "stream-json",
  ]);
}
let input = "";
for await (const chunk of process.stdin) input += chunk;
const prompts = {
  antigravity: `${JSON.stringify({ event: "user", message: { content: "fixture-prompt" } })}\n`,
  kimi: "",
} as const;
assert.equal(
  input,
  agent === "antigravity" || agent === "kimi"
    ? prompts[agent]
    : "fixture-prompt",
);
for (const line of protocolFixtures[agent][0]!.lines) {
  const split = Math.floor(line.length / 2);
  process.stdout.write(line.slice(0, split));
  await new Promise((resolve) => setTimeout(resolve, 5));
  process.stdout.write(`${line.slice(split)}\n`);
}
