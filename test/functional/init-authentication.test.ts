import assert from "node:assert/strict";
import { test } from "node:test";
import { chmod, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  authenticationEnvironment,
  authenticationInstructions,
  authenticationSetting,
  authenticationSource,
} from "../../src/cli/init-authentication.ts";
import { credentialRecipes } from "../../src/adapters/agents/authentication.constants.ts";
import { initialize } from "../../src/cli/scaffold.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { repository } from "../helpers.ts";

test("initialization rejects unavailable package managers and unsupported authentication before writing files", async (t) => {
  const directory = await repository(t);
  const before = await readdir(directory);
  await assert.rejects(
    initialize({ directory, manager: "pnpm", install: true }, async () => {
      throw new Error("ENOENT");
    }),
    /Package manager pnpm is unavailable/,
  );
  for (const agent of ["codex", "antigravity", "kimi"] as const)
    await assert.rejects(
      initialize({ directory, agent, authentication: "account-token" }),
      /Authentication for/,
    );
  await assert.rejects(
    initialize({ directory, agent: "copilot", authentication: "usage" }),
    /Authentication for copilot must be account, account-token/,
  );
  await assert.rejects(
    initialize({ directory, agent: "kimi", authentication: "usage" }),
    /requires a model/,
  );
  assert.deepEqual(await readdir(directory), before);
});

test("authentication choices declare only the selected credential and explain its source", () => {
  const cases = [
    [{ agent: "codex" }, "", "account", /codex login/],
    [{ agent: "codex", authentication: "usage" }, "OPENAI_API_KEY=\n", "usage"],
    [{ agent: "claude" }, "", "account", /keychain/],
    [
      { agent: "claude", authentication: "account-token" },
      "CLAUDE_CODE_OAUTH_TOKEN=\n",
      '{ account: { variable: "CLAUDE_CODE_OAUTH_TOKEN" } }',
      /claude setup-token/,
    ],
    [
      { agent: "claude", authentication: "usage" },
      "ANTHROPIC_API_KEY=\n",
      "usage",
      /billed separately/,
    ],
    [{ agent: "antigravity" }, "", "account", /Google account/],
    [
      { agent: "antigravity", authentication: "usage" },
      "GEMINI_API_KEY=\n",
      "usage",
    ],
    [{ agent: "copilot" }, "", "account", /COPILOT_GITHUB_TOKEN/],
    [
      { agent: "copilot", authentication: "account-token" },
      "COPILOT_GITHUB_TOKEN=\n",
      '{ account: { variable: "COPILOT_GITHUB_TOKEN" } }',
      /ghp_/,
    ],
    [{ agent: "kimi" }, "", "account", /kimi-code/],
    [
      { agent: "kimi", authentication: "usage", model: "fixture" },
      "KIMI_API_KEY=\n",
      "usage",
    ],
    [
      { agent: "codex", baseUrl: "https://models.example/v1" },
      "OPENAI_API_KEY=\n",
      "usage",
      /custom Responses provider/,
    ],
  ] as const;
  for (const [options, environment, source, instructions] of cases) {
    assert.equal(authenticationEnvironment(options), environment);
    assert.equal(
      authenticationSource(options),
      source.startsWith("{") ? source : JSON.stringify(source),
    );
    if (instructions)
      assert.match(authenticationInstructions(options), instructions);
  }
  assert.deepEqual(
    authenticationSetting({
      agent: "copilot",
      authentication: "account-token",
    }),
    { account: { variable: "COPILOT_GITHUB_TOKEN" } },
  );
  assert.throws(
    () =>
      authenticationEnvironment({ agent: "copilot", authentication: "usage" }),
    /account, account-token/,
  );
});

test(
  "tool commands use the bootstrapped CLI and stdin without printing the secret",
  { skip: process.platform === "win32" },
  async (t) => {
    const directory = await repository(t);
    const bin = join(directory, ".outpost-tools", "bin");
    await mkdir(bin, { recursive: true });
    const path = join(bin, "codex");
    await writeFile(
      path,
      '#!/usr/bin/env node\nconst fs=require("node:fs"); if (process.argv.slice(2).join(" ")!=="login --with-api-key" || fs.readFileSync(0,"utf8")!=="fixture-key") process.exit(1);',
    );
    await chmod(path, 0o755);
    const result = await executeProcess({
      executable: process.execPath,
      arguments: [
        "-e",
        credentialRecipes.tool,
        "codex",
        "login",
        "--with-api-key",
      ],
      stdin: "fixture-key",
      variables: { HOME: directory },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, "");
    const missing = await executeProcess({
      executable: process.execPath,
      arguments: ["-e", credentialRecipes.tool, "outpost-missing-tool"],
      variables: { HOME: directory },
    });
    assert.notEqual(missing.status, 0);
  },
);

test("custom Responses starters select usage authentication without performing OpenAI login", async (t) => {
  const directory = await repository(t);
  await initialize({
    directory,
    agent: "codex",
    sandboxProvider: "vercel",
    baseUrl: "https://models.example/v1",
    model: "vendor/model",
    apiKeyEnvironment: "VENDOR_API_KEY",
  });
  const source = await readFile(join(directory, "run.ts"), "utf8");
  assert.match(source, /modelProvider/);
  assert.match(source, /authentication: "usage"/);
  assert.doesNotMatch(source, /--with-api-key|homedir/);
  assert.equal(
    await readFile(join(directory, ".env.example"), "utf8"),
    "VENDOR_API_KEY=\n",
  );
  const checked = await executeProcess({
    executable: process.execPath,
    arguments: ["--check", join(directory, "run.ts")],
  });
  assert.equal(checked.status, 0, checked.stderr);
  for (const invalid of [
    { agent: "claude", baseUrl: "https://models.example", model: "test" },
    {
      agent: "codex",
      authentication: "account",
      baseUrl: "https://models.example",
      model: "test",
    },
  ] as const)
    await assert.rejects(
      initialize({ directory: join(directory, "bad"), ...invalid }),
      /require Codex/,
    );
});

test("generated starters select account credentials without reading credential files", async (t) => {
  const directory = await repository(t);
  for (const agent of [
    "codex",
    "claude",
    "antigravity",
    "copilot",
    "kimi",
  ] as const) {
    const target = join(directory, agent);
    await initialize({ directory: target, agent, sandboxProvider: "local" });
    const source = await readFile(join(target, "run.ts"), "utf8");
    assert.match(
      source,
      new RegExp(
        `harness: create${agent}Harness\\(\\{ authentication: "account" \\}\\)`,
        "i",
      ),
    );
    assert.doesNotMatch(source, /homedir|auth\.json|credentials/);
    assert.equal(await readFile(join(target, ".env.example"), "utf8"), "");
  }
});

test("generated Vercel starter forwards a declared parent token without a workflow env file", async (t) => {
  const directory = await repository(t);
  await initialize({
    directory,
    agent: "claude",
    sandboxProvider: "vercel",
    authentication: "account-token",
  });
  await writeFile(
    join(directory, "bridge.mjs"),
    `import assert from "node:assert/strict";
export class OutpostError extends Error {}
export const createReporter=()=>()=>{};
export const createClaudeHarness=(settings)=>({name:"claude",settings});
export const createAgent=(options)=>options;
export const createVercelSandboxProvider=(options)=>options;
export async function dispatch(options) {
 assert.deepEqual(options.agent.harness.settings.authentication,{account:{variable:"CLAUDE_CODE_OAUTH_TOKEN"}});
 assert.equal(options.sandboxProvider.variables.CLAUDE_CODE_OAUTH_TOKEN,"fixture-subscription-token");
 assert.equal(options.sandboxProvider.variables.UNDECLARED_SECRET,undefined);
 assert.equal(options.sandboxProvider.variables.ANTHROPIC_API_KEY,undefined);
 return {branch:"checked",commits:[]};
}`,
  );
  const runner = join(directory, "run.ts");
  const source = (await readFile(runner, "utf8"))
    .replaceAll('"@elie-laloum/outpost"', '"./bridge.mjs"')
    .replaceAll('"@elie-laloum/outpost/providers/vercel"', '"./bridge.mjs"');
  await writeFile(runner, source);
  const result = await executeProcess({
    executable: process.execPath,
    arguments: [runner],
    variables: {
      CLAUDE_CODE_OAUTH_TOKEN: "fixture-subscription-token",
      UNDECLARED_SECRET: "must-not-forward",
    },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /checked/);
  assert.doesNotMatch(
    result.stdout + result.stderr,
    /fixture-subscription-token|must-not-forward/,
  );
});
