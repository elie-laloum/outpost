import type { AgentProtocolFixture } from "../protocol-fixtures.types.ts";

export const copilotProtocolFixtures: readonly AgentProtocolFixture[] = [
  {
    name: "turn",
    lines: [
      '{"id":"1","timestamp":"2026-01-01T00:00:00.000Z","parentId":null,"type":"assistant.turn_start","data":{"turnId":"t1"}}',
      '{"id":"2","timestamp":"2026-01-01T00:00:01.000Z","parentId":"1","type":"assistant.message","data":{"messageId":"m1","content":"","toolRequests":[{"toolCallId":"call-1","name":"bash","arguments":{"command":"fixture-command"},"type":"function"}]}}',
      '{"id":"3","timestamp":"2026-01-01T00:00:02.000Z","parentId":"2","type":"assistant.message","data":{"messageId":"m2","content":"fixture-result","toolRequests":[]}}',
      '{"type":"result","timestamp":"2026-01-01T00:00:03.000Z","sessionId":"fixture-conversation","exitCode":0,"usage":{"premiumRequests":1}}',
    ],
    expected: [
      {
        kind: "raw",
        value: {
          id: "1",
          timestamp: "2026-01-01T00:00:00.000Z",
          parentId: null,
          type: "assistant.turn_start",
          data: { turnId: "t1" },
        },
      },
      {
        kind: "tool",
        name: "bash",
        input: { command: "fixture-command" },
        callId: "call-1",
      },
      { kind: "text", text: "fixture-result" },
      { kind: "conversation", id: "fixture-conversation" },
      { kind: "finished" },
    ],
  },
  {
    name: "failure",
    lines: [
      '{"type":"session.error","data":{"errorType":"authentication","message":"fixture-warning","statusCode":401}}',
      '{"type":"result","sessionId":"fixture-conversation","exitCode":1}',
    ],
    expected: [
      { kind: "warning", message: "fixture-warning" },
      { kind: "conversation", id: "fixture-conversation" },
      {
        kind: "failure",
        message: "GitHub Copilot CLI ended with exit code 1",
      },
    ],
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
