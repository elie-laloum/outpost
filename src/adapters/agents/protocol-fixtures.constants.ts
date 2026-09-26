import type {
  AgentProtocolFixture,
  ProtocolAgent,
} from "./protocol-fixtures.types.ts";

export const protocolFixtures: Readonly<
  Record<ProtocolAgent, readonly AgentProtocolFixture[]>
> = {
  antigravity: [
    {
      name: "turn",
      lines: [
        '{"event":"init","conversation_id":"fixture-conversation","init":{"cwd":"/workspace","model":"fixture-model"}}',
        '{"event":"step_update","step_update":{"conversation_id":"fixture-conversation","step_index":1,"state":"ACTIVE","step_type":"tool","tool_name":"run_command"}}',
        '{"event":"step_update","step_update":{"conversation_id":"fixture-conversation","step_index":1,"state":"DONE","step_type":"tool","tool_name":"run_command","tool_info":{"name":"run_command","parameters":{"command":"fixture-command"}}}}',
        '{"event":"step_update","step_update":{"conversation_id":"fixture-conversation","step_index":2,"state":"ACTIVE","step_type":"agent_response","text_delta":"fixture-result"}}',
        '{"event":"result","result":{"conversation_id":"fixture-conversation","status":"SUCCESS","response":"fixture-result","usage":{"input_tokens":10,"output_tokens":3,"thinking_tokens":1,"cache_read_tokens":2}}}',
      ],
      expected: [
        { kind: "conversation", id: "fixture-conversation" },
        {
          kind: "raw",
          value: {
            event: "step_update",
            step_update: {
              conversation_id: "fixture-conversation",
              step_index: 1,
              state: "ACTIVE",
              step_type: "tool",
              tool_name: "run_command",
            },
          },
        },
        {
          kind: "tool",
          name: "run_command",
          input: { command: "fixture-command" },
        },
        { kind: "text", text: "fixture-result" },
        { kind: "usage", tokens: { input: 10, cached: 2, output: 4 } },
        { kind: "result", text: "fixture-result" },
        { kind: "finished" },
      ],
    },
    {
      name: "failure",
      lines: [
        '{"event":"result","result":{"status":"CANCELED","response":""}}',
        '{"event":"result","result":{"status":"ERROR","error":"fixture-failure"}}',
      ],
      expected: [
        {
          kind: "failure",
          message: "Antigravity ended the turn with status CANCELED",
        },
        { kind: "failure", message: "fixture-failure" },
      ],
    },
    {
      name: "unknown",
      lines: ['{"event":"future.event"}', "invalid-json"],
      expected: [
        { kind: "raw", value: { event: "future.event" } },
        { kind: "raw", value: "invalid-json" },
      ],
    },
  ],
  copilot: [
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
  ],
  kimi: [
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
          kind: "raw",
          value: {
            role: "tool",
            tool_call_id: "call-1",
            content: "fixture-output",
          },
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
