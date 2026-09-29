import type { AgentProtocolFixture } from "../protocol-fixtures.types.ts";

export const codexProtocolFixtures: readonly AgentProtocolFixture[] = [
  {
    name: "turn",
    lines: [
      '{"type":"thread.started","thread_id":"fixture-conversation"}',
      '{"type":"item.started","item":{"type":"command_execution","command":"fixture-command"}}',
      '{"type":"item.completed","item":{"type":"agent_message","text":"fixture-result"}}',
      '{"type":"turn.completed","usage":{"input_tokens":10,"cached_input_tokens":2,"output_tokens":3}}',
    ],
    expected: [
      { kind: "conversation", id: "fixture-conversation" },
      { kind: "tool", name: "command", input: "fixture-command" },
      { kind: "text", text: "fixture-result" },
      { kind: "usage", tokens: { input: 10, cached: 2, output: 3 } },
      { kind: "finished" },
    ],
  },
  {
    name: "failure",
    lines: ['{"type":"turn.failed","error":{"message":"fixture-failure"}}'],
    expected: [{ kind: "failure", message: "fixture-failure" }],
  },
  {
    name: "unknown",
    lines: ['{"type":"future.event"}', "invalid-json"],
    expected: [
      { kind: "raw", value: { type: "future.event" } },
      { kind: "raw", value: "invalid-json" },
    ],
  },
];
