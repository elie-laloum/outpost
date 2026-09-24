import assert from "node:assert/strict";
import { protocolFixtures } from "../../src/adapters/agents/protocol-fixtures.constants.ts";

const [agent, mode, ...args] = process.argv.slice(2);
assert.ok(agent === "claude" || agent === "codex");
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
let input = "";
for await (const chunk of process.stdin) input += chunk;
assert.equal(input, "fixture-prompt");
for (const line of protocolFixtures[agent][0]!.lines) {
  const split = Math.floor(line.length / 2);
  process.stdout.write(line.slice(0, split));
  await new Promise((resolve) => setTimeout(resolve, 5));
  process.stdout.write(`${line.slice(split)}\n`);
}
