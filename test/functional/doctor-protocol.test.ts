import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  claudeHarness,
  codexHarness,
  geminiHarness,
  diagnoseAgentProtocol,
} from "../../src/index.ts";
import { protocolFixtures } from "../../src/adapters/agents/protocol-fixtures.constants.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";

for (const name of ["claude", "codex", "gemini"] as const) {
  const agent = {
    claude: claudeHarness,
    codex: codexHarness,
    gemini: geminiHarness,
  }
    [name]()
    .bind();
  test(`${name} reports only synthetic structural compatibility`, () => {
    const report = diagnoseAgentProtocol(name);
    assert.equal(report.hasFailures, false);
    assert.equal(report.installedCli, "unverified");
    assert.equal(report.modelCompatibility, "unverified");
    assert.deepEqual(
      report.checks.map((check) => check.id),
      [
        "protocol.fixture.turn",
        "protocol.fixture.failure",
        "protocol.fixture.unknown",
      ],
    );
  });
  for (const mode of ["start", "resume", "fork"] as const) {
    if (name === "gemini" && mode !== "start") continue;
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
