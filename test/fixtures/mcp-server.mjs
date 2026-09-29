import { appendFileSync } from "node:fs";
import { createInterface } from "node:readline";

const log = (entry) =>
  process.env.MCP_LOG &&
  appendFileSync(process.env.MCP_LOG, `${JSON.stringify(entry)}\n`);
const send = (message) =>
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", ...message })}\n`);

if (process.argv[2] === "crash") {
  process.stderr.write("boom\n");
  process.exit(3);
}

const tools = [
  {
    name: "echo",
    description: "Echo text",
    inputSchema: { type: "object", properties: { text: { type: "string" } } },
  },
  { name: "fail", title: "Always fails", inputSchema: { type: "object" } },
  {
    name: "structured",
    inputSchema: {
      type: "object",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      anyOf: [{ required: ["a"] }, { required: ["b"] }],
    },
  },
  {
    name: "weird.name/tool",
    description: "Punctuated",
    inputSchema: { type: "object" },
  },
  {
    name: "env",
    description: "Read a variable",
    inputSchema: { type: "object", properties: { name: { type: "string" } } },
  },
  {
    name: "slow",
    description: "Never answers",
    inputSchema: { type: "object" },
  },
  {
    name: "invalid",
    description: "Protocol error",
    inputSchema: { type: "object" },
  },
  {
    name: "x".repeat(80),
    description: "Long name",
    inputSchema: { type: "object" },
  },
];

const calls = {
  echo: (args) => ({
    content: [
      { type: "text", text: `echo:${args.text}` },
      { type: "image", data: "AAAA", mimeType: "image/png" },
      { type: "resource_link", uri: "file:///doc.md", name: "doc" },
      { type: "resource", resource: { uri: "file:///a.txt", text: "inline" } },
      { type: "resource", resource: { uri: "file:///b.bin", blob: "AA" } },
      { type: "future", value: 1 },
    ],
  }),
  fail: () => ({ content: [{ type: "text", text: "nope" }], isError: true }),
  structured: () => ({ content: [], structuredContent: { ok: true } }),
  "weird.name/tool": () => ({ content: [{ type: "text", text: "weird" }] }),
  env: (args) => ({
    content: [{ type: "text", text: process.env[args.name] ?? "unset" }],
  }),
  [`${"x".repeat(80)}`]: () => ({ content: [{ type: "text", text: "long" }] }),
};

const rich = process.argv[2] === "rich";

const resources = {
  "resources/list": (params) =>
    params.cursor === undefined
      ? {
          resources: [{ uri: "file:///readme.md", name: "readme" }],
          nextCursor: "page-2",
        }
      : { resources: [{ uri: "file:///logo.png", name: "logo" }] },
  "resources/templates/list": () => ({
    resourceTemplates: [{ uriTemplate: "file:///{path}", name: "file" }],
  }),
  "resources/read": (params) =>
    params.uri === "file:///readme.md"
      ? {
          contents: [
            { uri: params.uri, mimeType: "text/markdown", text: "# Readme" },
          ],
        }
      : params.uri === "file:///logo.png"
        ? {
            contents: [
              { uri: params.uri, mimeType: "image/png", blob: "AAAA" },
            ],
          }
        : undefined,
  "prompts/list": () => ({
    prompts: [
      { name: "review", arguments: [{ name: "lang", required: true }] },
    ],
  }),
  "prompts/get": (params) =>
    params.name === "review"
      ? {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Review ${params.arguments.lang} code.`,
              },
            },
            {
              role: "assistant",
              content: {
                type: "resource",
                resource: { uri: "file:///rules.md", text: "Be strict." },
              },
            },
          ],
        }
      : undefined,
};

const input = createInterface({ input: process.stdin });
input.on("line", (line) => {
  const message = JSON.parse(line);
  if (message.id !== undefined && message.method === undefined) {
    log({ reply: message });
    return;
  }
  log({ method: message.method, params: message.params });
  if (message.method === "initialize" && process.argv[2] === "hang") return;
  if (message.method === "initialize") {
    process.stdout.write("not json\n");
    send({ id: "server-ping", method: "ping" });
    send({
      id: "server-sampling",
      method: "sampling/createMessage",
      params: {},
    });
    send({ method: "notifications/message", params: { level: "info" } });
    send({ id: 999, result: {} });
    send({
      id: message.id,
      result: {
        protocolVersion: message.params.protocolVersion,
        capabilities: rich
          ? { tools: {}, resources: {}, prompts: {} }
          : { tools: {} },
        serverInfo: { name: "fixture", version: "1" },
      },
    });
  } else if (Object.hasOwn(resources, message.method)) {
    const result = resources[message.method](message.params ?? {});
    send(
      result
        ? { id: message.id, result }
        : { id: message.id, error: { code: -32602, message: "not found" } },
    );
  } else if (message.method === "tools/list") {
    const first = message.params.cursor === undefined;
    send({
      id: message.id,
      result: first
        ? { tools: tools.slice(0, 2), nextCursor: "page-2" }
        : { tools: tools.slice(2) },
    });
  } else if (message.method === "tools/call") {
    const name = message.params.name;
    if (name === "slow") return;
    if (name === "invalid")
      send({
        id: message.id,
        error: { code: -32602, message: "bad arguments" },
      });
    else
      send({ id: message.id, result: calls[name](message.params.arguments) });
  }
});
input.on("close", () => {
  log({ closed: true });
  process.exit(0);
});
