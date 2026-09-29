import type { AgentProtocolFixture } from "../protocol-fixtures.types.ts";

export const antigravityProtocolFixtures: readonly AgentProtocolFixture[] = [
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
        kind: "tool",
        name: "run_command",
        input: undefined,
        callId: "fixture-conversation:1",
      },
      {
        kind: "tool-result",
        name: "run_command",
        callId: "fixture-conversation:1",
        preview: "",
        characters: 0,
        isError: false,
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
];
