import type { AgentProtocolFixture } from "./protocol-fixtures.types.ts";

export const protocolFixtures: Readonly<
  Record<"claude" | "codex" | "gemini", readonly AgentProtocolFixture[]>
> = {
  gemini: [
    {
      name: "turn",
      lines: [
        '{"type":"init","session_id":"fixture-conversation","model":"fixture-model"}',
        '{"type":"tool_use","tool_name":"command","tool_id":"call-1","parameters":{"command":"fixture-command"}}',
        '{"type":"message","role":"assistant","content":"fixture-result","delta":true}',
        '{"type":"result","status":"success","stats":{"input_tokens":10,"cached":2,"output_tokens":3}}',
      ],
      expected: [
        { kind: "conversation", id: "fixture-conversation" },
        {
          kind: "tool",
          name: "command",
          input: { command: "fixture-command" },
        },
        { kind: "text", text: "fixture-result" },
        { kind: "usage", tokens: { input: 10, cached: 2, output: 3 } },
        { kind: "finished" },
      ],
    },
    {
      name: "failure",
      lines: [
        '{"type":"result","status":"error","error":{"message":"fixture-failure"}}',
      ],
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
  ],
  codex: [
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
  ],
  claude: [
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
  ],
};
