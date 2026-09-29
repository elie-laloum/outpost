import assert from "node:assert/strict";
import { test } from "node:test";
import { createAgent } from "../../src/domain/agent.ts";
import type { CliHarness } from "../../src/domain/agent.types.ts";
import {
  createAntigravityHarness,
  createClaudeHarness,
  createCodexHarness,
  createCopilotHarness,
  createKimiHarness,
} from "../../src/index.ts";
import type { McpServers } from "../../src/index.ts";
import { kimiMcpStoreKey } from "../../src/adapters/agents/kimi-mcp.ts";

const servers: McpServers = {
  linear: {
    command: "npx",
    arguments: ["-y", "linear-mcp"],
    environment: { LOG_LEVEL: "warn" },
    variables: ["LINEAR_API_KEY"],
  },
  docs: {
    url: "https://mcp.example.com/mcp",
    headers: { "X-Team": "core" },
    bearerTokenVariable: "DOCS_TOKEN",
  },
};
const variables = {
  LINEAR_API_KEY: "linear-secret",
  DOCS_TOKEN: "docs-secret",
};

function compose(harness: (settings: object) => CliHarness) {
  return createAgent({ harness: harness({ mcpServers: servers }) });
}

function assertNoSecrets(value: unknown) {
  const text = JSON.stringify(value);
  assert.ok(!text.includes("linear-secret") && !text.includes("docs-secret"));
}

test("Claude and Copilot receive inline MCP configuration with variable references", () => {
  const claude = compose(createClaudeHarness).request({ text: "go" });
  const inline = claude.arguments!.find((entry) =>
    entry.startsWith("--mcp-config="),
  )!;
  assert.deepEqual(JSON.parse(inline.slice("--mcp-config=".length)), {
    mcpServers: {
      linear: {
        type: "stdio",
        command: "npx",
        args: ["-y", "linear-mcp"],
        env: { LOG_LEVEL: "warn", LINEAR_API_KEY: "${LINEAR_API_KEY}" },
      },
      docs: {
        type: "http",
        url: "https://mcp.example.com/mcp",
        headers: { "X-Team": "core", Authorization: "Bearer ${DOCS_TOKEN}" },
      },
    },
  });
  const copilot = compose(createCopilotHarness).request({ text: "go" });
  const index = copilot.arguments!.indexOf("--additional-mcp-config");
  assert.deepEqual(JSON.parse(copilot.arguments![index + 1]!), {
    mcpServers: {
      linear: {
        type: "local",
        command: "npx",
        args: ["-y", "linear-mcp"],
        env: { LOG_LEVEL: "warn", LINEAR_API_KEY: "${LINEAR_API_KEY}" },
        tools: ["*"],
      },
      docs: {
        type: "http",
        url: "https://mcp.example.com/mcp",
        headers: { "X-Team": "core", Authorization: "Bearer ${DOCS_TOKEN}" },
        tools: ["*"],
      },
    },
  });
  const interactive = compose(createCopilotHarness).request({
    interactive: true,
  });
  assert.ok(interactive.arguments!.includes("--additional-mcp-config"));
  for (const command of [claude, copilot]) assertNoSecrets(command);
});

test("Codex receives MCP servers as TOML configuration overrides", () => {
  const command = compose(createCodexHarness).request({ text: "go" });
  const overrides = command.arguments!.filter(
    (_entry, index, all) => all[index - 1] === "-c",
  );
  assert.deepEqual(overrides, [
    'mcp_servers.linear.command="npx"',
    'mcp_servers.linear.args=["-y","linear-mcp"]',
    'mcp_servers.linear.env={"LOG_LEVEL"="warn"}',
    'mcp_servers.linear.env_vars=["LINEAR_API_KEY"]',
    'mcp_servers.docs.url="https://mcp.example.com/mcp"',
    'mcp_servers.docs.http_headers={"X-Team"="core"}',
    'mcp_servers.docs.bearer_token_env_var="DOCS_TOKEN"',
  ]);
  assert.ok(
    command.arguments!.indexOf("exec") > command.arguments!.lastIndexOf("-c"),
  );
  assertNoSecrets(command);
  const live = compose(createCodexHarness).request({
    text: "go",
    liveInput: true,
  });
  assert.equal(live.arguments!.at(-1), "app-server");
  assert.deepEqual(
    live.arguments!.filter((_entry, index, all) => all[index - 1] === "-c"),
    overrides,
  );
  const plain = createAgent({
    harness: createCodexHarness({
      mcpServers: { bare: { command: "server" } },
    }),
  }).request({ text: "go" });
  assert.deepEqual(plain.arguments!.slice(0, 4), [
    "-c",
    'mcp_servers.bare.command="server"',
    "-c",
    "mcp_servers.bare.args=[]",
  ]);
});

test("Kimi and Antigravity plan home configuration files with the same servers", () => {
  const kimi = compose(createKimiHarness).configuration!(variables);
  assert.deepEqual(kimi.files, [
    {
      path: ".kimi-code/mcp.json",
      section: "mcpServers",
      entries: {
        linear: {
          command: "npx",
          args: ["-y", "linear-mcp"],
          env: { LOG_LEVEL: "warn" },
        },
        docs: {
          url: "https://mcp.example.com/mcp",
          headers: { "X-Team": "core" },
          bearerTokenEnvVar: "DOCS_TOKEN",
        },
      },
    },
  ]);
  const antigravity = compose(createAntigravityHarness).configuration!(
    variables,
  );
  assert.deepEqual(antigravity.files, [
    {
      path: ".gemini/config/mcp_config.json",
      section: "mcpServers",
      entries: {
        linear: {
          command: "npx",
          args: ["-y", "linear-mcp"],
          env: { LOG_LEVEL: "warn", LINEAR_API_KEY: "${LINEAR_API_KEY}" },
          disabled: false,
        },
        docs: {
          serverUrl: "https://mcp.example.com/mcp",
          headers: {
            "X-Team": "core",
            Authorization: "Bearer ${DOCS_TOKEN}",
          },
          disabled: false,
        },
      },
    },
  ]);
  for (const plan of [kimi, antigravity]) assertNoSecrets(plan);
  for (const harness of [createKimiHarness, createAntigravityHarness]) {
    const request = compose(harness).request({ text: "go" });
    assert.ok(!JSON.stringify(request).includes("mcp"));
  }
});

test("every CLI requires the variables its MCP servers reference", () => {
  const harnesses = [
    createClaudeHarness,
    createCodexHarness,
    createCopilotHarness,
    createKimiHarness,
    createAntigravityHarness,
  ] as const;
  for (const harness of harnesses) {
    const configured = compose(harness);
    assert.equal(
      configured.configuration!(variables).files.length,
      harness === createKimiHarness || harness === createAntigravityHarness
        ? 1
        : 0,
    );
    assert.throws(() => configured.configuration!({ LINEAR_API_KEY: "x" }), {
      code: "configuration",
      message: /Missing DOCS_TOKEN/,
    });
    assert.equal(
      createAgent({ harness: harness({}) }).configuration,
      undefined,
    );
    assert.equal(
      createAgent({ harness: harness({ mcpServers: {} }) }).configuration,
      undefined,
    );
    assert.throws(
      () => harness({ mcpServers: { linear: { url: "ftp://x" } } }),
      { code: "configuration" },
    );
    assert.ok(
      !JSON.stringify(
        createAgent({ harness: harness({}) }).request({ text: "go" }),
      ).includes("mcp"),
    );
  }
});

test("Codex reports MCP tool calls with server-qualified names", () => {
  const codex = createAgent({ harness: createCodexHarness() });
  const started = codex.events(
    JSON.stringify({
      type: "item.started",
      item: {
        type: "mcp_tool_call",
        id: "call-1",
        server: "linear",
        tool: "search",
        arguments: { query: "bug" },
      },
    }),
  );
  assert.deepEqual(started, [
    {
      kind: "tool",
      name: "mcp__linear__search",
      input: { query: "bug" },
      callId: "call-1",
    },
  ]);
  const completed = codex.events(
    JSON.stringify({
      type: "item.completed",
      item: {
        type: "mcp_tool_call",
        id: "call-1",
        server: "linear",
        tool: "search",
        result: "found",
      },
    }),
  );
  assert.equal(
    completed[0]?.kind === "tool-result" && completed[0].name,
    "mcp__linear__search",
  );
});

test("tool filters use each CLI's native form and unsupported allowlists are refused", () => {
  const filtered: McpServers = {
    linear: {
      command: "npx",
      tools: { include: ["search", "read"], exclude: ["read"] },
    },
    docs: { url: "https://mcp.example.com/mcp", tools: { exclude: ["drop"] } },
  };
  const excludeOnly: McpServers = {
    linear: { command: "npx", tools: { exclude: ["delete"] } },
  };
  const codex = createAgent({
    harness: createCodexHarness({ mcpServers: filtered }),
  })
    .request({ text: "go" })
    .arguments!.filter((_entry, index, all) => all[index - 1] === "-c");
  assert.ok(
    codex.includes('mcp_servers.linear.enabled_tools=["search","read"]'),
  );
  assert.ok(codex.includes('mcp_servers.linear.disabled_tools=["read"]'));
  assert.ok(codex.includes('mcp_servers.docs.disabled_tools=["drop"]'));
  const copilot = createAgent({
    harness: createCopilotHarness({ mcpServers: filtered }),
  }).request({ text: "go" }).arguments!;
  const copilotConfig = JSON.parse(
    copilot[copilot.indexOf("--additional-mcp-config") + 1]!,
  );
  assert.deepEqual(copilotConfig.mcpServers.linear.tools, ["search", "read"]);
  assert.deepEqual(copilotConfig.mcpServers.docs.tools, ["*"]);
  assert.deepEqual(
    copilot.filter((entry) => entry.startsWith("--deny-tool=")),
    ["--deny-tool=linear(read)", "--deny-tool=docs(drop)"],
  );
  const kimi = createAgent({
    harness: createKimiHarness({ mcpServers: filtered }),
  }).configuration!({}).files[0]!.entries as Record<
    string,
    Record<string, unknown>
  >;
  assert.deepEqual(kimi.linear?.enabledTools, ["search", "read"]);
  assert.deepEqual(kimi.linear?.disabledTools, ["read"]);
  assert.deepEqual(kimi.docs?.disabledTools, ["drop"]);
  const claude = createAgent({
    harness: createClaudeHarness({ mcpServers: excludeOnly }),
  }).request({ text: "go" }).arguments!;
  assert.ok(claude.includes("--disallowedTools=mcp__linear__delete"));
  const antigravity = createAgent({
    harness: createAntigravityHarness({ mcpServers: excludeOnly }),
  }).configuration!({}).files[0]!.entries as Record<
    string,
    Record<string, unknown>
  >;
  assert.deepEqual(antigravity.linear?.disabledTools, ["delete"]);
  assert.equal(antigravity.linear?.enabledTools, undefined);
  for (const harness of [createClaudeHarness, createAntigravityHarness])
    assert.throws(
      () => createAgent({ harness: harness({ mcpServers: filtered }) }),
      {
        code: "configuration",
        message: /cannot restrict MCP server linear to listed tools/,
      },
    );
  assert.ok(
    !createAgent({ harness: createClaudeHarness({ mcpServers: servers }) })
      .request({ text: "go" })
      .arguments!.some((entry) => entry.startsWith("--disallowedTools")),
  );
});

test("startup timeouts use each CLI's setting and unsupported ones are refused", () => {
  const timed: McpServers = {
    linear: { command: "npx", startupTimeoutMs: 90_000 },
    docs: { url: "https://mcp.example.com/mcp", startupTimeoutMs: 90_000 },
  };
  const codex = createAgent({
    harness: createCodexHarness({ mcpServers: timed }),
  }).request({ text: "go" }).arguments!;
  assert.ok(codex.includes("mcp_servers.linear.startup_timeout_ms=90000"));
  assert.ok(codex.includes("mcp_servers.docs.startup_timeout_ms=90000"));
  const kimi = createAgent({
    harness: createKimiHarness({ mcpServers: timed }),
  }).configuration!({}).files[0]!.entries as Record<
    string,
    Record<string, unknown>
  >;
  assert.equal(kimi.linear?.startupTimeoutMs, 90_000);
  const claude = createAgent({
    harness: createClaudeHarness({
      mcpServers: { ...timed, bare: { command: "server" } },
    }),
  });
  assert.equal(claude.variables?.MCP_TIMEOUT, "90000");
  assert.equal(
    createAgent({ harness: createClaudeHarness({ mcpServers: servers }) })
      .variables?.MCP_TIMEOUT,
    undefined,
  );
  assert.throws(
    () =>
      createAgent({
        harness: createClaudeHarness({
          mcpServers: {
            ...timed,
            docs: { url: "https://x.example/mcp", startupTimeoutMs: 1_000 },
          },
        }),
      }),
    { code: "configuration", message: /one MCP startup timeout/ },
  );
  assert.throws(
    () =>
      createAgent({
        harness: createClaudeHarness({
          mcpServers: timed,
          variables: { MCP_TIMEOUT: "5000" },
        }),
      }),
    { code: "configuration", message: /MCP_TIMEOUT, not both/ },
  );
  for (const harness of [createCopilotHarness, createAntigravityHarness])
    assert.throws(
      () => createAgent({ harness: harness({ mcpServers: timed }) }),
      {
        code: "configuration",
        message: /has no MCP startup timeout/,
      },
    );
});

test("OAuth logins are copied from the host for Claude, Codex and Kimi only", () => {
  const login: McpServers = {
    linear: { url: "https://mcp.linear.app/mcp", oauth: "login" },
  };
  const codex = createAgent({
    harness: createCodexHarness({ mcpServers: login }),
  });
  assert.deepEqual(codex.request({ text: "go" }).arguments!.slice(0, 2), [
    "-c",
    'mcp_oauth_credentials_store="file"',
  ]);
  assert.deepEqual(
    codex.configuration!({}).host?.map(({ path, section }) => [path, section]),
    [[".codex/.credentials.json", undefined]],
  );
  const claude = createAgent({
    harness: createClaudeHarness({ mcpServers: login }),
  }).configuration!({});
  assert.deepEqual(
    claude.host?.map(({ path, section }) => [path, section]),
    [[".claude/.credentials.json", "mcpOAuth"]],
  );
  const kimi = createAgent({
    harness: createKimiHarness({ mcpServers: login }),
  }).configuration!({});
  assert.equal(
    (kimi.files[0]!.entries as Record<string, Record<string, unknown>>).linear
      ?.auth,
    "oauth",
  );
  const key = kimiMcpStoreKey("linear", "https://mcp.linear.app/mcp#x");
  assert.match(key, /^linear-[0-9a-f]{24}$/);
  assert.equal(key, kimiMcpStoreKey("linear", "https://mcp.linear.app/mcp"));
  assert.deepEqual(
    kimi.host?.map(({ path, optional }) => [path, optional ?? false]),
    [
      [`.kimi-code/credentials/mcp/${key}-tokens.json`, false],
      [`.kimi-code/credentials/mcp/${key}-client.json`, true],
      [`.kimi-code/credentials/mcp/${key}-discovery.json`, true],
      [`.kimi-code/credentials/mcp/${key}-meta.json`, true],
    ],
  );
  assert.equal(
    createAgent({ harness: createCodexHarness({ mcpServers: servers }) })
      .configuration!(variables).host,
    undefined,
  );
  for (const harness of [createCopilotHarness, createAntigravityHarness])
    assert.throws(
      () => createAgent({ harness: harness({ mcpServers: login }) }),
      {
        code: "configuration",
        message: /cannot reuse a host OAuth login for MCP server linear/,
      },
    );
});
