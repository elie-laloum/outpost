import type { AgentProtocolFixture } from "../protocol-fixtures.types.ts";

export const claudeProtocolFixtures: readonly AgentProtocolFixture[] = [
  {
    name: "turn",
    lines: [
      '{"type":"system","session_id":"fixture-conversation"}',
      '{"type":"assistant","message":{"content":[{"type":"tool_use","name":"command","input":"fixture-command"},{"type":"text","text":"fixture-result"}]}}',
      '{"type":"result","result":"fixture-result","usage":{"input_tokens":10,"cache_creation_input_tokens":1,"cache_read_input_tokens":2,"output_tokens":3}}',
    ],
    expected: [
      { kind: "conversation", id: "fixture-conversation" },
      { kind: "tool", name: "command", input: "fixture-command" },
      { kind: "text", text: "fixture-result" },
      { kind: "result", text: "fixture-result" },
      {
        kind: "usage",
        tokens: { input: 10, cached: 2, cacheCreated: 1, output: 3 },
      },
      { kind: "finished" },
    ],
  },
  {
    name: "failure",
    lines: ['{"type":"result","is_error":true,"result":"fixture-failure"}'],
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
