import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  createAgent,
  createHarness,
  defineHarnessPermissions,
  defineHarnessSubagent,
  defineHarnessTool,
  defineMcpPrompt,
  dispatch,
  type AgentObservation,
  type HarnessOptions,
  type McpServers,
  type ModelProvider,
  type ModelRequest,
  type ModelResult,
  type SandboxProvider,
} from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

const server = fileURLToPath(
  new URL("../fixtures/mcp-server.mjs", import.meta.url),
);
const tokens = { input: 4, cached: 1, output: 2 };
const done: ModelResult = {
  text: "<outpost>done</outpost>",
  content: [{ type: "text", text: "<outpost>done</outpost>" }],
  stopReason: "end",
  usage: tokens,
};
type Reply = (request: ModelRequest) => ModelResult;

const call =
  (...calls: [name: string, input: unknown][]): Reply =>
  (request) => ({
    text: "",
    content: calls.map(([name, input], index) => ({
      type: "tool-call" as const,
      id: `call-${request.messages?.length ?? 0}-${index}`,
      name,
      input,
    })),
    stopReason: "tool-calls",
    usage: tokens,
  });

function provider(replies: Reply[], requests: ModelRequest[] = []) {
  const modelProvider: ModelProvider = {
    name: "fixture",
    async request(request) {
      request.signal?.throwIfAborted();
      requests.push(request);
      const reply = replies.shift();
      assert.ok(reply, "unexpected model request");
      return reply(request);
    },
  };
  return modelProvider;
}

const results = (request: ModelRequest | undefined) =>
  (request?.messages?.at(-1)?.content ?? []).map((block) =>
    block.type === "tool-result"
      ? `${block.isError ? "error:" : ""}${block.content}`
      : "",
  );

function fixture(log: string, extra: Partial<McpServers[string]> = {}) {
  return {
    fixture: {
      command: process.execPath,
      arguments: [server],
      environment: { MCP_LOG: log },
      variables: ["MCP_SECRET"],
      ...extra,
    },
  } as McpServers;
}

async function entries(log: string) {
  return (await readFile(log, "utf8"))
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
}

const run = (
  root: string,
  replies: Reply[],
  options: Omit<HarnessOptions, "modelProvider">,
  requests: ModelRequest[] = [],
  sandboxProvider: SandboxProvider = createLocalSandboxProvider({
    variables: { MCP_SECRET: "fixture-secret" },
  }),
  observe?: (event: AgentObservation) => void,
) =>
  dispatch({
    repository: root,
    sandboxProvider,
    logging: false,
    agent: createAgent({
      model: "m",
      harness: createHarness({
        modelProvider: provider(replies, requests),
        ...options,
      }),
    }),
    brief: { text: "Use the MCP server" },
    ...(observe ? { observe } : {}),
  });

test("the built-in harness exposes MCP server tools running inside the sandbox", async (t) => {
  const root = await repository(t);
  const log = join(root, "mcp.log");
  const requests: ModelRequest[] = [];
  const events: AgentObservation[] = [];
  const long = `mcp__fixture__${"x".repeat(40)}`;
  await run(
    root,
    [
      (request) => {
        const names = (request.tools ?? []).map((tool) => tool.name);
        assert.deepEqual(names.slice(0, 7), [
          "mcp__fixture__echo",
          "mcp__fixture__fail",
          "mcp__fixture__structured",
          "mcp__fixture__weird_name_tool",
          "mcp__fixture__env",
          "mcp__fixture__slow",
          "mcp__fixture__invalid",
        ]);
        assert.match(names[7]!, /^mcp__fixture__x+_[0-9a-f]{8}$/);
        assert.equal(names[7]!.length, 64);
        assert.ok(names[7]!.startsWith(long));
        const fail = request.tools!.find(
          (tool) => tool.name === "mcp__fixture__fail",
        );
        assert.equal(fail?.description, "Always fails");
        const structured = request.tools!.find(
          (tool) => tool.name === "mcp__fixture__structured",
        );
        assert.equal(structured?.inputSchema.$schema, undefined);
        assert.ok(Array.isArray(structured?.inputSchema.anyOf));
        return call(
          ["mcp__fixture__echo", { text: "hi" }],
          ["mcp__fixture__fail", {}],
          ["mcp__fixture__structured", { a: 1 }],
          ["mcp__fixture__weird_name_tool", {}],
          ["mcp__fixture__env", { name: "MCP_SECRET" }],
          ["mcp__fixture__invalid", {}],
          [names[7]!, {}],
          ["mcp__fixture__echo", "not an object"],
        )(request);
      },
      () => done,
    ],
    {
      mcpServers: fixture(log),
      toolExecution: { concurrency: 1 },
    },
    requests,
    undefined,
    (event) => events.push(event),
  );
  assert.deepEqual(results(requests[1]), [
    [
      "echo:hi",
      "[image omitted: image/png]",
      "[resource file:///doc.md]",
      "inline",
      "[resource file:///b.bin]",
      '{"type":"future","value":1}',
    ].join("\n"),
    "error:nope",
    '{"ok":true}',
    "weird",
    "fixture-secret",
    "error:MCP server fixture returned error -32602: bad arguments",
    "long",
    results(requests[1])[7],
  ]);
  assert.match(results(requests[1])[7]!, /^error:.*Expected an object/);
  const log_ = await entries(log);
  assert.deepEqual(
    log_.filter((entry) => entry.reply).map((entry) => entry.reply),
    [
      { jsonrpc: "2.0", id: "server-ping", result: {} },
      {
        jsonrpc: "2.0",
        id: "server-sampling",
        error: {
          code: -32601,
          message: "Outpost does not support sampling/createMessage",
        },
      },
    ],
  );
  assert.deepEqual(log_.at(-1), { closed: true });
  assert.ok(log_.some((entry) => entry.method === "notifications/initialized"));
  assert.ok(
    !events.some(
      (event) => event.kind === "tool-output" && event.text.includes("jsonrpc"),
    ),
  );
});

test("MCP tool deadlines cancel the request and permissions apply to server tools", async (t) => {
  const root = await repository(t);
  const log = join(root, "mcp.log");
  const requests: ModelRequest[] = [];
  const events: AgentObservation[] = [];
  await run(
    root,
    [
      call(["mcp__fixture__slow", {}], ["mcp__fixture__echo", { text: "x" }]),
      () => done,
    ],
    {
      mcpServers: fixture(log),
      toolExecution: { deadlineMs: 100 },
      permissions: defineHarnessPermissions({
        rules: [{ effect: "deny", tools: ["mcp__fixture__echo"] }],
        default: "allow",
      }),
    },
    requests,
    undefined,
    (event) => events.push(event),
  );
  const [slow] = results(requests[1]);
  assert.match(slow!, /^error:.*timed out/);
  assert.ok(events.some((event) => event.kind === "tool-denied"));
  const cancelled = (await entries(log)).find(
    (entry) => entry.method === "notifications/cancelled",
  );
  assert.equal(typeof cancelled?.params.requestId, "number");
});

test("MCP server startup failures stop the turn with a clear cause", async (t) => {
  const root = await repository(t);
  const log = join(root, "mcp.log");
  await assert.rejects(
    run(root, [], {
      mcpServers: fixture(log, { variables: ["MCP_ABSENT"] }),
    }),
    {
      code: "configuration",
      message: /Missing MCP_ABSENT for MCP server fixture/,
    },
  );
  await assert.rejects(
    run(root, [], {
      mcpServers: fixture(log, { arguments: [server, "crash"] }),
    }),
    {
      code: "process",
      message: /MCP server fixture exited with status 3: boom/,
    },
  );
  await assert.rejects(
    run(root, [], {
      mcpServers: fixture(log, {
        arguments: [server, "hang"],
        startupTimeoutMs: 300,
      }),
    }),
    { code: "timeout", message: /did not initialize within 300 ms/ },
  );
  await assert.rejects(
    run(root, [], {
      mcpServers: fixture(log, { command: "outpost-missing-mcp-command" }),
    }),
    { code: "process", message: /status 127/ },
  );
  const clash = defineHarnessTool({
    name: "mcp__fixture__echo",
    description: "Static tool with an MCP name",
    input: { type: "object" },
    execute: () => "static",
  });
  await assert.rejects(
    run(root, [], { mcpServers: fixture(log), tools: [clash] }),
    {
      code: "configuration",
      message: /Duplicate tool name: mcp__fixture__echo/,
    },
  );
  const streamless: SandboxProvider = {
    ...createLocalSandboxProvider(),
    async acquire(context) {
      const { liveInput: _live, ...lease } =
        await createLocalSandboxProvider().acquire(context);
      return lease;
    },
  };
  await assert.rejects(
    run(root, [], { mcpServers: fixture(log) }, [], streamless),
    { code: "configuration", message: /live process input/ },
  );
});

test("subagents start their own MCP servers on the borrowed sandbox", async (t) => {
  const root = await repository(t);
  const log = join(root, "mcp.log");
  const childRequests: ModelRequest[] = [];
  const child = defineHarnessSubagent({
    name: "inspect",
    description: "Inspect with MCP",
    agent: createAgent({
      model: "child",
      harness: createHarness({
        modelProvider: provider(
          [call(["mcp__fixture__env", { name: "MCP_SECRET" }]), () => done],
          childRequests,
        ),
        mcpServers: fixture(log),
      }),
    }),
  });
  const requests: ModelRequest[] = [];
  await run(
    root,
    [
      (request) => {
        assert.ok(
          !(request.tools ?? []).some((tool) => tool.name.startsWith("mcp__")),
        );
        return call(["inspect", { prompt: "go" }])(request);
      },
      () => done,
    ],
    { tools: [child] },
    requests,
  );
  assert.deepEqual(results(childRequests[1]), ["fixture-secret"]);
  assert.deepEqual((await entries(log)).at(-1), { closed: true });
});

interface HttpRecord {
  readonly method: string;
  readonly headers: Record<string, string | string[] | undefined>;
  readonly body?: { readonly method?: string; readonly id?: unknown };
}

async function mcpHttpServer(t: import("node:test").TestContext) {
  const records: HttpRecord[] = [];
  const server = createServer(async (request, response) => {
    let text = "";
    for await (const chunk of request) text += chunk;
    const body = text ? JSON.parse(text) : undefined;
    records.push({ method: request.method!, headers: request.headers, body });
    if (request.headers.authorization !== "Bearer http-secret") {
      response.writeHead(401).end("denied");
      return;
    }
    if (request.method === "DELETE" || body.id === undefined) {
      response.writeHead(request.method === "DELETE" ? 200 : 202).end();
      return;
    }
    const result = (value: unknown) => ({
      jsonrpc: "2.0",
      id: body.id,
      result: value,
    });
    const sse = (...messages: unknown[]) => {
      response.writeHead(200, { "content-type": "text/event-stream" });
      for (const message of messages) {
        const [head, ...rest] = JSON.stringify(message).split(',"');
        response.write(
          `event: message\r\ndata: ${head}${rest.map((part) => `\r\ndata: ,"${part}`).join("")}\r\n\r\n`,
        );
      }
      response.end();
    };
    if (body.method === "initialize") {
      response.writeHead(200, {
        "content-type": "application/json",
        "mcp-session-id": "session-1",
      });
      response.end(
        JSON.stringify(
          result({
            protocolVersion: body.params.protocolVersion,
            capabilities: { tools: {} },
            serverInfo: { name: "http-fixture", version: "1" },
          }),
        ),
      );
    } else if (body.method === "tools/list")
      sse(
        result({
          tools: [
            {
              name: "greet",
              description: "Greet",
              inputSchema: { type: "object" },
            },
            {
              name: "down",
              description: "Fails",
              inputSchema: { type: "object" },
            },
          ],
        }),
      );
    else if (body.params.name === "greet")
      sse(
        {
          jsonrpc: "2.0",
          method: "notifications/progress",
          params: { progress: 1 },
        },
        result({
          content: [
            { type: "text", text: `hello ${body.params.arguments.who}` },
          ],
        }),
      );
    else response.writeHead(500).end("server exploded");
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());
  const { port } = server.address() as AddressInfo;
  return { url: `http://127.0.0.1:${port}/mcp`, records };
}

test("HTTP MCP servers are bridged from inside the sandbox with session headers", async (t) => {
  const root = await repository(t);
  const http = await mcpHttpServer(t);
  const requests: ModelRequest[] = [];
  const docs: McpServers = {
    docs: {
      url: http.url,
      headers: { "X-Team": "core" },
      bearerTokenVariable: "DOCS_TOKEN",
    },
  };
  await run(
    root,
    [
      call(["mcp__docs__greet", { who: "outpost" }], ["mcp__docs__down", {}]),
      () => done,
    ],
    { mcpServers: docs },
    requests,
    createLocalSandboxProvider({ variables: { DOCS_TOKEN: "http-secret" } }),
  );
  assert.deepEqual(results(requests[1]), [
    "hello outpost",
    "error:MCP server docs returned error -32000: HTTP 500: server exploded",
  ]);
  const [initialize, ...later] = http.records;
  assert.equal(initialize?.body?.method, "initialize");
  assert.equal(initialize?.headers["mcp-session-id"], undefined);
  assert.equal(initialize?.headers["x-team"], "core");
  for (const record of later) {
    assert.equal(record.headers["mcp-session-id"], "session-1");
    assert.equal(record.headers["mcp-protocol-version"], "2025-06-18");
  }
  assert.equal(later[0]?.body?.method, "notifications/initialized");
  assert.equal(later.at(-1)?.method, "DELETE");
  await assert.rejects(
    run(
      root,
      [],
      { mcpServers: docs },
      [],
      createLocalSandboxProvider({
        variables: { DOCS_TOKEN: "wrong" },
      }),
    ),
    { code: "response", message: /HTTP 401: denied/ },
  );
  await assert.rejects(
    run(root, [], { mcpServers: docs }, [], createLocalSandboxProvider()),
    { code: "configuration", message: /Missing DOCS_TOKEN/ },
  );
  await assert.rejects(
    run(root, [], { mcpServers: { docs: { url: "http://127.0.0.1:9/mcp" } } }),
    { code: "response", message: /MCP HTTP request failed/ },
  );
});

test("MCP tool filters limit the tools offered to the model and catch unknown names", async (t) => {
  const root = await repository(t);
  const log = join(root, "mcp.log");
  await run(
    root,
    [
      (request) => {
        assert.deepEqual(
          (request.tools ?? []).map((tool) => tool.name),
          ["mcp__fixture__echo", "mcp__fixture__env"],
        );
        return done;
      },
    ],
    {
      mcpServers: fixture(log, {
        tools: { include: ["echo", "env", "fail"], exclude: ["fail"] },
      }),
    },
  );
  await assert.rejects(
    run(root, [], {
      mcpServers: fixture(log, { tools: { include: ["echo", "missing"] } }),
    }),
    { code: "configuration", message: /has no tool named missing/ },
  );
});

test("resource and prompt tools and MCP prompt instructions reach the model", async (t) => {
  const root = await repository(t);
  const log = join(root, "mcp.log");
  const requests: ModelRequest[] = [];
  const rich = fixture(log, { arguments: [server, "rich"] });
  await run(
    root,
    [
      (request) => {
        assert.match(
          request.system ?? "",
          /user: Review ts code\.\n\nassistant: Be strict\./,
        );
        const names = (request.tools ?? []).map((tool) => tool.name);
        assert.deepEqual(names.slice(-4), [
          "mcp_list_resources",
          "mcp_read_resource",
          "mcp_list_prompts",
          "mcp_get_prompt",
        ]);
        const list = request.tools!.find(
          (tool) => tool.name === "mcp_list_resources",
        );
        assert.deepEqual(
          (list?.inputSchema.properties as Record<string, unknown>).server,
          { type: "string", enum: ["fixture"] },
        );
        return call(
          ["mcp_list_resources", { server: "fixture" }],
          ["mcp_list_resources", { server: "fixture", cursor: "page-2" }],
          [
            "mcp_read_resource",
            { server: "fixture", uri: "file:///readme.md" },
          ],
          ["mcp_read_resource", { server: "fixture", uri: "file:///logo.png" }],
          ["mcp_read_resource", { server: "fixture", uri: "file:///missing" }],
          ["mcp_list_prompts", { server: "fixture" }],
          [
            "mcp_get_prompt",
            { server: "fixture", name: "review", arguments: { lang: "go" } },
          ],
          ["mcp_get_prompt", { server: "fixture", name: "missing" }],
          ["mcp_read_resource", { server: "other", uri: "x" }],
        )(request);
      },
      () => done,
    ],
    {
      mcpServers: rich,
      instructions: [
        defineMcpPrompt({
          server: "fixture",
          name: "review",
          arguments: { lang: "ts" },
        }),
      ],
      toolExecution: { concurrency: 1 },
    },
    requests,
  );
  const outputs = results(requests[1]);
  assert.deepEqual(JSON.parse(outputs[0]!), {
    resources: [{ uri: "file:///readme.md", name: "readme" }],
    resourceTemplates: [{ uriTemplate: "file:///{path}", name: "file" }],
    nextCursor: "page-2",
  });
  assert.deepEqual(JSON.parse(outputs[1]!), {
    resources: [{ uri: "file:///logo.png", name: "logo" }],
  });
  assert.deepEqual(outputs.slice(2, 5), [
    "# Readme",
    "[resource file:///logo.png image/png]",
    "error:MCP server fixture returned error -32602: not found",
  ]);
  assert.deepEqual(JSON.parse(outputs[5]!), {
    prompts: [
      { name: "review", arguments: [{ name: "lang", required: true }] },
    ],
  });
  assert.equal(outputs[6], "user: Review go code.\n\nassistant: Be strict.");
  assert.match(outputs[7]!, /^error:MCP server fixture returned error -32602/);
  assert.match(outputs[8]!, /^error:.*server/);
});

test("MCP prompt instructions need a running server that offers prompts", async (t) => {
  const root = await repository(t);
  const log = join(root, "mcp.log");
  const instructions = [defineMcpPrompt({ server: "fixture", name: "review" })];
  await assert.rejects(run(root, [], { instructions }), {
    code: "configuration",
    message: /needs mcpServers on the harness/,
  });
  await assert.rejects(
    run(root, [], { instructions, mcpServers: fixture(log) }),
    { code: "configuration", message: /offers no prompts/ },
  );
  await run(
    root,
    [
      (request) => {
        assert.ok(
          !(request.tools ?? []).some((tool) => /^mcp_[a-z]/.test(tool.name)),
        );
        return done;
      },
    ],
    { mcpServers: fixture(log) },
  );
});

async function oauthMcpServer(
  t: import("node:test").TestContext,
  method: "client_secret_basic" | "client_secret_post",
) {
  const tokens: URLSearchParams[] = [];
  const clients: string[] = [];
  const valid = new Set<string>();
  let initialize: Record<string, unknown> | undefined;
  let revoked = false;
  const server = createServer(async (request, response) => {
    let text = "";
    for await (const chunk of request) text += chunk;
    const url = new URL(request.url!, base);
    const json = (status: number, value: unknown, headers = {}) =>
      response
        .writeHead(status, { "content-type": "application/json", ...headers })
        .end(JSON.stringify(value));
    if (url.pathname === "/.well-known/oauth-protected-resource/mcp")
      return json(200, {
        resource: `${base}/mcp`,
        authorization_servers: [`${base}/tenant`],
      });
    if (url.pathname === "/.well-known/oauth-authorization-server/tenant")
      return json(200, {
        issuer: `${base}/tenant`,
        token_endpoint: `${base}/token`,
        token_endpoint_auth_methods_supported: [method],
      });
    if (url.pathname === "/token") {
      const body = new URLSearchParams(text);
      tokens.push(body);
      const basic = request.headers.authorization?.replace(/^Basic /, "");
      const client = basic
        ? Buffer.from(basic, "base64").toString()
        : `${body.get("client_id")}:${body.get("client_secret")}`;
      clients.push(client);
      if (client !== "outpost-client:outpost-secret")
        return json(401, { error: "invalid_client" });
      const token = `token-${tokens.length}`;
      valid.add(token);
      return json(200, {
        access_token: token,
        token_type: "Bearer",
        expires_in: 3600,
      });
    }
    const token = request.headers.authorization?.replace(/^Bearer /, "");
    if (!token || !valid.has(token))
      return response
        .writeHead(401, {
          "www-authenticate": `Bearer resource_metadata="${base}/.well-known/oauth-protected-resource/mcp", scope="mcp:read"`,
        })
        .end();
    const body = JSON.parse(text);
    if (body.id === undefined) return response.writeHead(202).end();
    const result = (value: unknown) =>
      json(200, { jsonrpc: "2.0", id: body.id, result: value });
    if (body.method === "initialize") {
      initialize = body.params;
      return result({
        protocolVersion: body.params.protocolVersion,
        capabilities: { tools: {} },
        serverInfo: { name: "oauth-fixture", version: "1" },
      });
    }
    if (body.method === "tools/list")
      return result({
        tools: [{ name: "whoami", inputSchema: { type: "object" } }],
      });
    if (!revoked) {
      revoked = true;
      valid.clear();
    }
    return result({ content: [{ type: "text", text: token }] });
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return {
    url: `${base}/mcp`,
    tokens,
    clients,
    initialize: () => initialize,
  };
}

test("HTTP MCP servers obtain OAuth client credentials tokens inside the sandbox", async (t) => {
  const root = await repository(t);
  const variables = {
    MCP_CLIENT_ID: "outpost-client",
    MCP_CLIENT_SECRET: "outpost-secret",
  };
  const oauth = {
    clientIdVariable: "MCP_CLIENT_ID",
    clientSecretVariable: "MCP_CLIENT_SECRET",
  };
  for (const method of ["client_secret_basic", "client_secret_post"] as const) {
    const http = await oauthMcpServer(t, method);
    const requests: ModelRequest[] = [];
    await run(
      root,
      [
        call(["mcp__docs__whoami", {}]),
        call(["mcp__docs__whoami", {}]),
        () => done,
      ],
      { mcpServers: { docs: { url: http.url, oauth } } },
      requests,
      createLocalSandboxProvider({ variables }),
    );
    assert.deepEqual(results(requests[1]), ["token-1"]);
    assert.deepEqual(results(requests[2]), ["token-2"]);
    assert.deepEqual(
      http.tokens.map((body) => [
        body.get("grant_type"),
        body.get("resource"),
        body.get("scope"),
      ]),
      [
        ["client_credentials", http.url, null],
        ["client_credentials", http.url, "mcp:read"],
      ],
    );
    assert.deepEqual(http.clients, [
      "outpost-client:outpost-secret",
      "outpost-client:outpost-secret",
    ]);
    assert.deepEqual(http.initialize()?.capabilities, {
      extensions: { "io.modelcontextprotocol/oauth-client-credentials": {} },
    });
  }
  const http = await oauthMcpServer(t, "client_secret_basic");
  await assert.rejects(
    run(
      root,
      [],
      {
        mcpServers: {
          docs: { url: http.url, oauth: { ...oauth, scopes: ["mcp:write"] } },
        },
      },
      [],
      createLocalSandboxProvider({
        variables: { ...variables, MCP_CLIENT_SECRET: "wrong" },
      }),
    ),
    { code: "response", message: /OAuth token request failed with HTTP 401/ },
  );
  assert.equal(http.tokens.at(-1)?.get("scope"), "mcp:write");
  await assert.rejects(
    run(root, [], { mcpServers: { docs: { url: http.url, oauth } } }),
    { code: "configuration", message: /Missing MCP_CLIENT_ID/ },
  );
});
