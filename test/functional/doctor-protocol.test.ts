import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  createAntigravityHarness,
  createClaudeHarness,
  createCodexHarness,
  createCopilotHarness,
  createKimiHarness,
  diagnoseAgentProtocol,
} from "../../src/index.ts";
import { builtInAgentRecord } from "../../src/adapters/agents/catalog.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";

const protocolFixtures = builtInAgentRecord((agent) => agent.protocol);

const harnesses = {
  claude: createClaudeHarness,
  codex: createCodexHarness,
  antigravity: createAntigravityHarness,
  copilot: createCopilotHarness,
  kimi: createKimiHarness,
} as const;
const resumable = new Set(["claude", "codex"]);

for (const name of Object.keys(harnesses) as (keyof typeof harnesses)[]) {
  const agent = harnesses[name]().bind();
  test(`${name} reports only synthetic structural compatibility`, () => {
    const report = diagnoseAgentProtocol(name);
    assert.equal(report.hasFailures, false);
    assert.equal(report.installedCli, "unverified");
    assert.equal(report.modelCompatibility, "unverified");
    assert.deepEqual(
      report.checks.map((check) => check.id),
      protocolFixtures[name].map(
        (fixture) => `protocol.fixture.${fixture.name}`,
      ),
    );
    assert.ok(report.checks.length >= 3);
  });
  for (const mode of ["start", "resume", "fork"] as const) {
    if (!resumable.has(name) && mode !== "start") continue;
    test(`${name} ${mode} default request executes deterministic streaming fixture`, async () => {
      const request = agent.request({
        text: "fixture-prompt",
        ...(mode === "start"
          ? {}
          : {
              continuation: {
                id: "fixture-conversation",
                fork: mode === "fork",
              },
            }),
      });
      const result = await executeProcess({
        ...request,
        executable: process.execPath,
        arguments: [
          fileURLToPath(
            new URL("../fixtures/agent-protocol.ts", import.meta.url),
          ),
          name,
          mode,
          ...(request.arguments ?? []),
        ],
        deadlineMs: 5000,
        retain: 65536,
      });
      assert.equal(result.status, 0, result.stderr);
      assert.deepEqual(
        result.stdout
          .trim()
          .split("\n")
          .flatMap((line) => agent.events(line)),
        protocolFixtures[name][0]!.expected,
      );
    });
  }
}
