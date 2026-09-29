import type { AgentProtocolFixture } from "../protocol-fixtures.types.ts";

export const kimiProtocolFixtures: readonly AgentProtocolFixture[] = [
  {
    name: "turn",
    lines: [
      '{"role":"meta","type":"system.version","version":"2.1.1"}',
      '{"role":"assistant","tool_calls":[{"type":"function","id":"call-1","function":{"name":"Shell","arguments":"{\\"command\\":\\"fixture-command\\"}"}}]}',
      '{"role":"tool","tool_call_id":"call-1","content":"fixture-output"}',
      '{"role":"assistant","content":"fixture-result"}',
      '{"role":"meta","type":"session.resume_hint","session_id":"fixture-conversation","command":"kimi -r fixture-conversation"}',
    ],
    expected: [
      {
        kind: "raw",
        value: { role: "meta", type: "system.version", version: "2.1.1" },
      },
      {
        kind: "tool",
        name: "Shell",
        input: { command: "fixture-command" },
        callId: "call-1",
      },
      {
        kind: "tool-result",
        callId: "call-1",
        name: "",
        preview: "fixture-output",
        characters: 14,
        isError: false,
      },
      { kind: "text", text: "fixture-result" },
      { kind: "conversation", id: "fixture-conversation" },
    ],
  },
  {
    name: "retry",
    lines: [
      '{"role":"meta","type":"turn.step.retrying","failed_attempt":1,"next_attempt":2,"error_message":"fixture-warning","status_code":429}',
    ],
    expected: [{ kind: "warning", message: "fixture-warning" }],
  },
  {
    name: "unknown",
    lines: ['{"role":"future"}', "invalid-json"],
    expected: [
      { kind: "raw", value: { role: "future" } },
      { kind: "raw", value: "invalid-json" },
    ],
  },
];
