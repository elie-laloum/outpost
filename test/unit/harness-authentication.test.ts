import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agent,
  antigravityHarness,
  claudeHarness,
  codexHarness,
  copilotHarness,
  kimiHarness,
  type AgentAuthentication,
  type CliAgent,
} from "../../src/index.ts";
import { authenticationForm } from "../../src/domain/authentication.ts";
import type {
  CredentialPlan,
  HostCredential,
} from "../../src/domain/agent.types.ts";

function plan(
  selected: CliAgent,
  variables: Record<string, string> = {},
): CredentialPlan {
  const credentials = selected.credentials;
  assert.ok(credentials, "Expected an authentication plan");
  return credentials(variables);
}

function hostCredential(result: CredentialPlan, index = 0): HostCredential {
  const credential = result.host[index];
  assert.ok(credential);
  return credential;
}

test("authentication forms normalize every supported shape and reject ambiguous values", () => {
  const forms: readonly [AgentAuthentication, string, string?][] = [
    ["account", "account"],
    ["usage", "usage"],
    [{ account: { file: "~/profile" } }, "account.file", "~/profile"],
    [{ account: { key: "secret" } }, "account.key", "secret"],
    [{ account: { variable: "TOKEN" } }, "account.variable", "TOKEN"],
    [{ usage: { key: "secret" } }, "usage.key", "secret"],
    [{ usage: { variable: "API_KEY" } }, "usage.variable", "API_KEY"],
  ];
  for (const [value, form, credential] of forms)
    assert.deepEqual(
      authenticationForm(value),
      credential === undefined ? { form } : { form, value: credential },
    );
  for (const [value, message] of [
    [null, /must be "account", "usage" or an object/],
    [[], /must be "account", "usage" or an object/],
    ["login", /must be "account", "usage" or an object/],
    [{}, /exactly one key/],
    [{ account: { file: "a" }, usage: { key: "b" } }, /exactly one key/],
    [{ account: { file: "a", key: "b" } }, /exactly one key/],
    [{ subscription: { key: "a" } }, /Unknown authentication "subscription"/],
    [{ usage: { file: "a" } }, /usage authentication does not accept "file"/],
    [{ account: { key: "" } }, /account.key must be a nonempty string/],
    [{ usage: { key: "  " } }, /usage.key must be a nonempty string/],
    [{ usage: { variable: 42 } }, /usage.variable must be a nonempty string/],
    [{ usage: { variable: "INVALID-NAME" } }, /Invalid authentication/],
  ] as const)
    assert.throws(
      () => authenticationForm(value as unknown as AgentAuthentication),
      message,
    );
});

test("agents reject unsupported authentication forms when they are composed", () => {
  const unsupported = [
    [codexHarness, { account: { key: "x" } }],
    [codexHarness, { account: { variable: "TOKEN" } }],
    [antigravityHarness, { account: { key: "x" } }],
    [antigravityHarness, { account: { variable: "TOKEN" } }],
    [copilotHarness, "usage"],
    [copilotHarness, { usage: { key: "x" } }],
    [copilotHarness, { usage: { variable: "KEY" } }],
    [kimiHarness, { account: { key: "x" } }],
    [kimiHarness, { account: { variable: "TOKEN" } }],
  ] as const;
  for (const [preset, authentication] of unsupported)
    assert.throws(
      () => agent({ harness: preset({ authentication }) }),
      /does not support .* authentication\. Accepted forms: account/,
    );
  assert.throws(
    () =>
      agent({
        model: "vendor/model",
        harness: codexHarness({
          modelProvider: { baseUrl: "http://localhost/v1" },
          authentication: "account",
        }),
      }),
    /Accepted forms: usage, usage.key, usage.variable/,
  );
  assert.throws(
    () =>
      agent({
        model: "vendor/model",
        harness: codexHarness({
          modelProvider: {
            baseUrl: "http://localhost/v1",
            apiKeyEnvironment: false,
          },
          authentication: "usage",
        }),
      }),
    /Accepted forms: none/,
  );
  assert.throws(
    () =>
      agent({
        harness: claudeHarness({ authentication: { usage: {} } as never }),
      }),
    /exactly one key/,
  );
  assert.equal(agent({ harness: claudeHarness() }).credentials, undefined);
});

test("Claude account files keep only the subscription login and reject conflicting API keys", () => {
  const account = agent({
    harness: claudeHarness({ authentication: "account" }),
  });
  const credential = hostCredential(plan(account));
  assert.deepEqual(credential.source, {
    path: "~/.claude/.credentials.json",
    home: { variable: "CLAUDE_CONFIG_DIR", path: ".credentials.json" },
  });
  assert.deepEqual(credential.destination, {
    file: ".claude/.credentials.json",
  });
  assert.match(credential.alternative ?? "", /CLAUDE_CODE_OAUTH_TOKEN/);
  assert.equal(
    credential.select?.(
      JSON.stringify({
        claudeAiOauth: { accessToken: "a", refreshToken: "r" },
        mcpOAuth: { server: "private" },
      }),
    ),
    JSON.stringify({ claudeAiOauth: { accessToken: "a", refreshToken: "r" } }),
  );
  assert.throws(
    () => credential.select?.("not-json secret-value"),
    (error: Error) =>
      /not valid JSON/.test(error.message) &&
      !error.message.includes("secret-value"),
  );
  assert.throws(
    () => credential.select?.(JSON.stringify({ mcpOAuth: {} })),
    /no claudeAiOauth/,
  );
  assert.throws(
    () => plan(account, { ANTHROPIC_API_KEY: "key" }),
    /Conflicting Claude authentication/,
  );
  const file = agent({
    harness: claudeHarness({
      authentication: { account: { file: "~/profiles/claude.json" } },
    }),
  });
  assert.deepEqual(hostCredential(plan(file)).source, {
    path: "~/profiles/claude.json",
  });
  const token = agent({
    harness: claudeHarness({ authentication: { account: { key: "oauth" } } }),
  });
  assert.deepEqual(plan(token).variables, { CLAUDE_CODE_OAUTH_TOKEN: "oauth" });
  const variable = agent({
    harness: claudeHarness({
      authentication: { account: { variable: "TEAM_TOKEN" } },
    }),
  });
  assert.deepEqual(plan(variable, { TEAM_TOKEN: "oauth" }).variables, {
    CLAUDE_CODE_OAUTH_TOKEN: "oauth",
  });
  assert.throws(() => plan(variable), /Missing TEAM_TOKEN/);
  const usage = agent({ harness: claudeHarness({ authentication: "usage" }) });
  assert.deepEqual(plan(usage, { ANTHROPIC_API_KEY: "key" }), {
    variables: { ANTHROPIC_API_KEY: "key" },
    host: [],
    files: [],
    commands: [],
  });
  assert.throws(() => plan(usage), /Missing ANTHROPIC_API_KEY/);
  assert.throws(
    () =>
      plan(usage, { ANTHROPIC_API_KEY: "key", CLAUDE_CODE_OAUTH_TOKEN: "x" }),
    /Conflicting Claude authentication/,
  );
  const mapped = agent({
    harness: claudeHarness({
      authentication: { usage: { variable: "TEAM_KEY" } },
    }),
  });
  assert.deepEqual(plan(mapped, { TEAM_KEY: "key" }).variables, {
    ANTHROPIC_API_KEY: "key",
  });
});

test("Codex copies file credentials and logs API keys in through stdin only", () => {
  const account = agent({
    harness: codexHarness({ authentication: "account" }),
  });
  const credential = hostCredential(plan(account));
  assert.deepEqual(credential.source.home, {
    variable: "CODEX_HOME",
    path: "auth.json",
  });
  assert.deepEqual(credential.destination, { file: ".codex/auth.json" });
  assert.equal(credential.select?.('{"tokens":{}}'), '{"tokens":{}}');
  assert.throws(() => credential.select?.("invalid"), /Codex credential file/);
  const usage = agent({
    harness: codexHarness({ authentication: { usage: { key: "sk-secret" } } }),
  });
  const login = plan(usage).commands[0];
  assert.equal(login?.stdin, "sk-secret");
  assert.deepEqual(login?.arguments?.slice(2), [
    "codex",
    "login",
    "--with-api-key",
  ]);
  assert.ok(!login?.arguments?.includes("sk-secret"));
  assert.deepEqual(plan(usage).variables, { OPENAI_API_KEY: "sk-secret" });
  const external = agent({
    model: "vendor/model",
    harness: codexHarness({
      modelProvider: {
        baseUrl: "http://localhost/v1",
        apiKeyEnvironment: "VENDOR_KEY",
      },
      authentication: "usage",
    }),
  });
  assert.deepEqual(plan(external, { VENDOR_KEY: "key" }), {
    variables: { VENDOR_KEY: "key" },
    host: [],
    files: [],
    commands: [],
  });
  assert.throws(() => plan(external), /Missing VENDOR_KEY/);
});

test("Antigravity API keys select the Gemini provider in a generated settings file", () => {
  const usage = agent({
    harness: antigravityHarness({ authentication: "usage" }),
  });
  assert.deepEqual(plan(usage, { GEMINI_API_KEY: "key" }), {
    variables: { GEMINI_API_KEY: "key" },
    host: [],
    files: [
      {
        path: ".gemini/antigravity-cli/settings.json",
        content: '{"modelProvider":"gemini"}\n',
      },
    ],
    commands: [],
  });
  const account = agent({
    harness: antigravityHarness({ authentication: "account" }),
  });
  assert.deepEqual(hostCredential(plan(account)).destination, {
    file: ".gemini/antigravity-cli/antigravity-oauth-token",
  });
  assert.deepEqual(plan(account).files, []);
});

test("Copilot extracts the stored login token and rejects classic tokens", () => {
  const account = agent({
    harness: copilotHarness({ authentication: "account" }),
  });
  const credential = hostCredential(plan(account));
  assert.deepEqual(credential.destination, {
    variable: "COPILOT_GITHUB_TOKEN",
  });
  assert.deepEqual(credential.source.home, {
    variable: "COPILOT_HOME",
    path: "config.json",
  });
  const configuration = (token: string) => `// Copilot state
{
  "lastLoggedInUser": { "host": "https://github.com", "login": "octo" },
  "authTokens": { "https://github.com:octo": "${token}", },
}`;
  assert.equal(credential.select?.(configuration("gho_valid")), "gho_valid");
  assert.throws(
    () => credential.select?.(configuration("ghp_classic")),
    /classic personal access tokens/,
  );
  assert.throws(
    () => credential.select?.('{"lastLoggedInUser":{"host":"h","login":"l"}}'),
    /system keychain.*COPILOT_GITHUB_TOKEN/,
  );
  assert.throws(
    () => credential.select?.("{ gho_secret-value"),
    (error: Error) =>
      /not valid JSON/.test(error.message) &&
      !error.message.includes("secret-value"),
  );
  assert.throws(
    () =>
      agent({
        harness: copilotHarness({
          authentication: { account: { key: "ghp_classic" } },
        }),
      }),
    /classic personal access tokens/,
  );
  const variable = agent({
    harness: copilotHarness({
      authentication: { account: { variable: "GITHUB_PAT" } },
    }),
  });
  assert.deepEqual(
    plan(variable, { GITHUB_PAT: "github_pat_valid" }).variables,
    {
      COPILOT_GITHUB_TOKEN: "github_pat_valid",
    },
  );
  assert.throws(
    () => plan(variable, { GITHUB_PAT: "ghp_classic" }),
    /classic personal access tokens/,
  );
});

test("Kimi copies its profile credentials or translates an API key for a named model", () => {
  const account = agent({
    harness: kimiHarness({ authentication: "account" }),
  });
  const result = plan(account);
  assert.deepEqual(result.variables, {
    KIMI_CODE_OAUTH_HOST: "https://auth.kimi.ai",
    KIMI_CODE_BASE_URL: "https://api.kimi.ai/coding/v1",
  });
  assert.deepEqual(
    result.host.map((credential) => credential.destination),
    [
      { file: ".kimi-code/credentials/kimi-code-env-0e4f99c69cc27850.json" },
      { file: ".kimi-code/device_id" },
    ],
  );
  assert.equal(result.host[0]?.source.home?.variable, "KIMI_CODE_HOME");
  const login = result.commands[0];
  assert.deepEqual(login?.arguments?.slice(2), [
    "kimi",
    "login",
    "--region",
    "global",
  ]);
  assert.ok((login?.deadlineMs ?? 0) > 0);
  const profile = agent({
    harness: kimiHarness({
      authentication: { account: { file: "~/.kimi-work" } },
    }),
  });
  assert.match(
    hostCredential(plan(profile)).source.path,
    /^~.\.kimi-work.credentials.kimi-code-env-0e4f99c69cc27850\.json$/,
  );
  assert.throws(
    () => agent({ harness: kimiHarness({ authentication: "usage" }) }),
    /requires a model/,
  );
  const usage = agent({
    model: "fixture-model",
    harness: kimiHarness({ authentication: "usage" }),
  });
  assert.deepEqual(plan(usage, { KIMI_API_KEY: "key" }).variables, {
    KIMI_API_KEY: "key",
    KIMI_MODEL_API_KEY: "key",
    KIMI_MODEL_PROVIDER_TYPE: "kimi",
    KIMI_MODEL_NAME: "fixture-model",
  });
  assert.equal(
    usage.request({ text: "go" }).arguments?.includes("--model"),
    false,
  );
  assert.deepEqual(
    agent({
      model: "kimi-code/fixture",
      harness: kimiHarness({ authentication: "account" }),
    })
      .request({ text: "go" })
      .arguments?.slice(0, 2),
    ["--model", "kimi-code/fixture"],
  );
});

test("Kimi validates account regions and keeps API authentication separate", () => {
  assert.throws(
    () => kimiHarness({ region: "unknown" as never }),
    /Kimi region/,
  );
  assert.throws(
    () => kimiHarness({ region: "global", authentication: "usage" }),
    /region selects account authentication/,
  );
  const mainland = plan(
    agent({
      harness: kimiHarness({
        authentication: "account",
        region: "mainland-cn",
      }),
    }),
  );
  assert.equal(
    mainland.variables.KIMI_CODE_OAUTH_HOST,
    "https://auth.kimi.com",
  );
  assert.equal(
    mainland.variables.KIMI_CODE_BASE_URL,
    "https://api.kimi.com/coding/v1",
  );
  assert.deepEqual(mainland.commands[0]?.arguments?.slice(2), [
    "kimi",
    "login",
    "--region",
    "mainland-cn",
  ]);
  assert.match(
    hostCredential(mainland).source.path,
    /credentials[/\\]kimi-code\.json$/,
  );
  const selected = agent({
    harness: kimiHarness({ region: "global", authentication: "account" }),
  });
  const result = plan(selected);
  const implicit = agent({
    harness: kimiHarness({ authentication: "account" }),
  });
  assert.deepEqual(plan(implicit), result);
  assert.match(
    hostCredential(result).source.path,
    /kimi-code-env-0e4f99c69cc27850\.json$/,
  );
  assert.equal(hostCredential(result).source.home?.variable, "KIMI_CODE_HOME");
  for (const selection of [selected, implicit])
    for (const name of [
      "KIMI_CODE_OAUTH_HOST",
      "KIMI_OAUTH_HOST",
      "KIMI_CODE_BASE_URL",
    ])
      assert.throws(
        () => plan(selection, { [name]: "https://wrong.example" }),
        /conflicts with account region/,
      );
  assert.deepEqual(
    plan(selected, { KIMI_CODE_OAUTH_HOST: "https://auth.kimi.ai/" }).variables,
    result.variables,
  );
});
