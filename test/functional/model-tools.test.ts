import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { createServer } from "node:http";
import { once } from "node:events";
import {
  anthropicModelProvider,
  openaiModelProvider,
  type ModelMessage,
  type ModelProvider,
  type ModelToolSpec,
} from "../../src/index.ts";

const tools: ModelToolSpec[] = [
  {
    name: "read_file",
    description: "Read a repository file.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string" } },
      required: ["path"],
    },
  },
];
const foreign = {
  type: "reasoning" as const,
  provider: "elsewhere",
  model: "other",
  data: { secret: true },
};

async function scripted(t: TestContext, replies: unknown[]) {
  const bodies: Record<string, unknown>[] = [];
  const server = createServer(async (request, response) => {
    let body = "";
    for await (const chunk of request) body += chunk;
    bodies.push(JSON.parse(body));
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(replies.shift()));
  });
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  return { baseUrl: `http://127.0.0.1:${address.port}/v1`, bodies };
}

async function converse(provider: ModelProvider, model: string) {
  const question: ModelMessage = {
    role: "user",
    content: [{ type: "text", text: "What is in README?" }],
  };
  const first = await provider.request({
    model,
    messages: [question],
    tools,
    maxOutputTokens: 100,
    cache: true,
  });
  assert.equal(first.stopReason, "tool-calls");
  const history: ModelMessage[] = [
    question,
    { role: "assistant", content: [foreign, ...(first.content ?? [])] },
    {
      role: "user",
      content: [
        { type: "text", text: "Tool output follows." },
        { type: "tool-result", callId: "call-1", content: "# Outpost" },
      ],
    },
  ];
  const second = await provider.request({
    model,
    messages: history,
    tools,
    maxOutputTokens: 100,
  });
  assert.equal(second.stopReason, "end");
  assert.equal(second.text, "It is the Outpost readme.");
  return first;
}

test("Anthropic tool conversations group results and replay its own thinking", async (t) => {
  const { baseUrl, bodies } = await scripted(t, [
    {
      type: "message",
      role: "assistant",
      stop_reason: "tool_use",
      content: [
        { type: "thinking", thinking: "", signature: "sig" },
        { type: "text", text: "" },
        {
          type: "tool_use",
          id: "call-1",
          name: "read_file",
          input: { path: "README.md" },
        },
      ],
    },
    {
      type: "message",
      role: "assistant",
      stop_reason: "end_turn",
      content: [{ type: "text", text: "It is the Outpost readme." }],
    },
  ]);
  const provider = anthropicModelProvider({ baseUrl, apiKey: "key" });
  await converse(provider, "claude");
  assert.deepEqual(bodies[0]?.cache_control, { type: "ephemeral" });
  assert.deepEqual(bodies[0]?.tools, [
    {
      name: "read_file",
      description: "Read a repository file.",
      input_schema: tools[0]!.inputSchema,
    },
  ]);
  assert.deepEqual(bodies[1]?.messages, [
    { role: "user", content: [{ type: "text", text: "What is in README?" }] },
    {
      role: "assistant",
      content: [
        { type: "thinking", thinking: "", signature: "sig" },
        {
          type: "tool_use",
          id: "call-1",
          name: "read_file",
          input: { path: "README.md" },
        },
      ],
    },
    {
      role: "user",
      content: [
        { type: "tool_result", tool_use_id: "call-1", content: "# Outpost" },
        { type: "text", text: "Tool output follows." },
      ],
    },
  ]);
  assert.equal("cache_control" in bodies[1]!, false);
});

test("Chat Completions tool conversations use tool messages without reasoning replay", async (t) => {
  const { baseUrl, bodies } = await scripted(t, [
    {
      choices: [
        {
          finish_reason: "tool_calls",
          message: {
            role: "assistant",
            content: null,
            tool_calls: [
              {
                id: "call-1",
                type: "function",
                function: {
                  name: "read_file",
                  arguments: '{"path":"README.md"}',
                },
              },
            ],
          },
        },
      ],
    },
    {
      choices: [
        {
          finish_reason: "stop",
          message: { role: "assistant", content: "It is the Outpost readme." },
        },
      ],
    },
  ]);
  const provider = openaiModelProvider({ baseUrl, apiKey: false });
  await converse(provider, "gpt");
  assert.deepEqual(bodies[0]?.tools, [
    {
      type: "function",
      function: {
        name: "read_file",
        description: "Read a repository file.",
        parameters: tools[0]!.inputSchema,
      },
    },
  ]);
  assert.deepEqual(bodies[1]?.messages, [
    { role: "user", content: "What is in README?" },
    {
      role: "assistant",
      content: null,
      tool_calls: [
        {
          id: "call-1",
          type: "function",
          function: { name: "read_file", arguments: '{"path":"README.md"}' },
        },
      ],
    },
    { role: "tool", tool_call_id: "call-1", content: "# Outpost" },
    { role: "user", content: "Tool output follows." },
  ]);
});

test("Responses tool conversations replay encrypted reasoning before calls", async (t) => {
  const reasoning = {
    type: "reasoning",
    id: "rs-1",
    encrypted_content: "opaque",
    summary: [],
  };
  const { baseUrl, bodies } = await scripted(t, [
    {
      status: "completed",
      output: [
        reasoning,
        {
          type: "function_call",
          id: "fc-1",
          call_id: "call-1",
          name: "read_file",
          arguments: '{"path":"README.md"}',
        },
      ],
    },
    {
      status: "completed",
      output: [
        {
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: "It is the Outpost readme." }],
        },
      ],
    },
  ]);
  const provider = openaiModelProvider({
    baseUrl,
    apiKey: false,
    api: "responses",
  });
  const first = await converse(provider, "gpt");
  assert.equal(first.content?.[0]?.type, "reasoning");
  assert.deepEqual(bodies[1]?.input, [
    { role: "user", content: "What is in README?" },
    reasoning,
    {
      type: "function_call",
      call_id: "call-1",
      name: "read_file",
      arguments: '{"path":"README.md"}',
    },
    { type: "function_call_output", call_id: "call-1", output: "# Outpost" },
    { role: "user", content: "Tool output follows." },
  ]);
  assert.deepEqual(bodies[1]?.tools, [
    {
      type: "function",
      name: "read_file",
      description: "Read a repository file.",
      parameters: tools[0]!.inputSchema,
    },
  ]);
});
