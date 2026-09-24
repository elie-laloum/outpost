import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chmod,
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import {
  authenticationEnvironment,
  authenticationInstructions,
  authenticationSource,
} from "../../src/cli/init-authentication.ts";
import { authenticationRecipes } from "../../src/cli/init-authentication.constants.ts";
import { initialize } from "../../src/cli/scaffold.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { repository } from "../helpers.ts";

test("initialization rejects unavailable package managers before writing files", async (t) => {
  const directory = await repository(t);
  const before = await readdir(directory);
  await assert.rejects(
    initialize({ directory, manager: "pnpm", install: true }, async () => {
      throw new Error("ENOENT");
    }),
    /Package manager pnpm is unavailable/,
  );
  assert.deepEqual(await readdir(directory), before);
  for (const agent of ["codex", "gemini"] as const)
    await assert.rejects(
      initialize({ directory, agent, authentication: "oauth-token" }),
      /Authentication/,
    );
});

test("authentication choices declare only the selected credential and explain its source", () => {
  assert.equal(
    authenticationEnvironment({
      agent: "claude",
      authentication: "oauth-token",
    }),
    "CLAUDE_CODE_OAUTH_TOKEN=\n",
  );
  assert.equal(
    authenticationEnvironment({ agent: "codex", authentication: "login" }),
    "",
  );
  assert.equal(
    authenticationEnvironment({ agent: "gemini" }),
    "GEMINI_API_KEY=\n",
  );
  assert.match(
    authenticationInstructions({ authentication: "login" }),
    /codex login/,
  );
  assert.match(
    authenticationInstructions({ authentication: "oauth-token" }),
    /claude setup-token/,
  );
  assert.match(authenticationInstructions({}), /billed separately/);
  assert.match(
    authenticationSource({ authentication: "login", provider: "vercel" }),
    /auth.json/,
  );
  assert.equal(
    authenticationSource({ authentication: "login", provider: "local" }),
    "const authentication = {};",
  );
  assert.match(
    authenticationSource({ agent: "claude", authentication: "oauth-token" }),
    /Conflicting Claude/,
  );
});

test("credential seeding writes only the private sandbox copy with restricted permissions", async (t) => {
  const directory = await repository(t);
  const credential = JSON.stringify({
    tokens: { access_token: "fixture-only" },
  });
  const result = await executeProcess({
    executable: process.execPath,
    arguments: ["-e", authenticationRecipes.codex.seed],
    stdin: credential,
    variables: { HOME: directory, USERPROFILE: directory },
  });
  assert.equal(result.status, 0, result.stderr);
  const target = join(directory, ".codex", "auth.json");
  assert.equal(await readFile(target, "utf8"), credential);
  if (process.platform !== "win32")
    assert.equal((await stat(target)).mode & 0o777, 0o600);
  assert.equal(result.stdout, "");
});

test(
  "API login uses the bootstrapped CLI and stdin without printing the secret",
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
      arguments: ["-e", authenticationRecipes.codex.login],
      stdin: "fixture-key",
      variables: { HOME: directory },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, "");
  },
);

test("custom Responses starters use the selected key without performing OpenAI login", async (t) => {
  const directory = await repository(t);
  await initialize({
    directory,
    agent: "codex",
    provider: "vercel",
    baseUrl: "https://models.example/v1",
    model: "vendor/model",
    apiKeyEnvironment: "VENDOR_API_KEY",
  });
  const source = await readFile(join(directory, "run.ts"), "utf8");
  assert.match(source, /modelProvider/);
  assert.match(source, /Missing VENDOR_API_KEY/);
  assert.doesNotMatch(source, /--with-api-key/);
  assert.equal(
    await readFile(join(directory, ".env.example"), "utf8"),
    "VENDOR_API_KEY=\n",
  );
  const checked = await executeProcess({
    executable: process.execPath,
    arguments: ["--check", join(directory, "run.ts")],
  });
  assert.equal(checked.status, 0, checked.stderr);
  await assert.rejects(
    initialize({
      directory: join(directory, "bad"),
      agent: "claude",
      baseUrl: "https://models.example",
      model: "test",
    }),
    /require Codex/,
  );
});

test("generated Vercel starter forwards a declared parent token without a workflow env file", async (t) => {
  const directory = await repository(t);
  await initialize({
    directory,
    agent: "claude",
    provider: "vercel",
    authentication: "oauth-token",
  });
  await writeFile(
    join(directory, "bridge.mjs"),
    `import assert from "node:assert/strict";
export class OutpostError extends Error {}
export const reporter=()=>()=>{};
export const claude=()=>({name:"claude"});
export const vercel=(options)=>options;
export async function dispatch(options) {
 assert.equal(options.provider.variables.CLAUDE_CODE_OAUTH_TOKEN,"fixture-subscription-token");
 assert.equal(options.provider.variables.UNDECLARED_SECRET,undefined);
 assert.equal(options.provider.variables.ANTHROPIC_API_KEY,undefined);
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
  const missing = await executeProcess({
    executable: process.execPath,
    arguments: [runner],
    variables: { CLAUDE_CODE_OAUTH_TOKEN: "" },
  });
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /Missing CLAUDE_CODE_OAUTH_TOKEN/);
  assert.doesNotMatch(missing.stderr, /Preparing sandbox/);
});
