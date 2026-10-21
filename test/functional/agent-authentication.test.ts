import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { authenticateAgent } from "../../src/application/agent-authentication.ts";
import { credentialInstaller } from "../../src/application/credential-installer.constants.ts";
import { configurationInstaller } from "../../src/application/configuration-installer.constants.ts";
import { createAgent } from "../../src/domain/agent.ts";
import type { CliAgent } from "../../src/domain/agent.types.ts";
import type { Command } from "../../src/domain/command.types.ts";
import type {
  SandboxLease,
  SandboxProvider,
} from "../../src/domain/sandbox.types.ts";
import {
  createClaudeHarness,
  createCodexHarness,
  createCopilotHarness,
  createKimiHarness,
  createSandbox,
  createObservation,
} from "../../src/core.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { emit, repository, scripted } from "../helpers.ts";

function recordingLease(home: string, calls: Command[]): SandboxLease {
  return {
    root: "/workspace",
    home,
    async invoke(command) {
      calls.push(command);
      return { status: 0, stdout: "", stderr: "" };
    },
    async upload() {},
    async download() {},
    async release() {},
  };
}

const signal = new AbortController().signal;

test("host placement forwards only credential variables and never writes files", async (t) => {
  const directory = await repository(t);
  const calls: Command[] = [];
  const lease = recordingLease(directory, calls);
  const account = createAgent({
    harness: createClaudeHarness({ authentication: "account" }),
  });
  assert.deepEqual(
    await authenticateAgent(account, {}, lease, "host", signal),
    {},
  );
  const token = createAgent({
    harness: createClaudeHarness({
      authentication: { account: { key: "subscription-token" } },
    }),
  });
  assert.deepEqual(await authenticateAgent(token, {}, lease, "host", signal), {
    CLAUDE_CODE_OAUTH_TOKEN: "subscription-token",
  });
  const usage = createAgent({
    harness: createCodexHarness({
      authentication: { usage: { key: "sk-host" } },
    }),
  });
  await assert.rejects(authenticateAgent(usage, {}, lease, "host", signal), {
    code: "configuration",
  });
  const compatible = createAgent({
    model: "fixture",
    harness: createCodexHarness({
      authentication: { usage: { key: "sk-host" } },
      modelProvider: { baseUrl: "https://example.test/v1" },
    }),
  });
  assert.deepEqual(
    await authenticateAgent(compatible, {}, lease, "host", signal),
    { OPENAI_API_KEY: "sk-host" },
  );
  assert.equal(calls.length, 0);
  assert.deepEqual(
    await authenticateAgent(
      createAgent({ harness: createClaudeHarness() }),
      {},
      lease,
      "remote",
      signal,
    ),
    {},
  );
});

test("isolated placements install host files once and run login commands with merged credentials", async (t) => {
  const directory = await repository(t);
  const profile = join(directory, "profile.json");
  await writeFile(
    profile,
    `// state\n{"lastLoggedInUser":{"host":"https://github.com","login":"octo"},"authTokens":{"https://github.com:octo":"gho_file"},}`,
  );
  const calls: Command[] = [];
  const lease = recordingLease("/home/agent", calls);
  const copilot = createAgent({
    harness: createCopilotHarness({
      authentication: { account: { file: profile } },
    }),
  });
  assert.deepEqual(
    await authenticateAgent(copilot, {}, lease, "mounted", signal),
    { COPILOT_GITHUB_TOKEN: "gho_file" },
  );
  assert.equal(calls.length, 0);
  await writeFile(
    profile,
    JSON.stringify({
      lastLoggedInUser: { host: "https://github.com", login: "octo" },
      authTokens: { "https://github.com:octo": { token: "gho_object" } },
    }),
  );
  assert.deepEqual(
    await authenticateAgent(copilot, {}, lease, "mounted", signal),
    { COPILOT_GITHUB_TOKEN: "gho_object" },
  );
  assert.equal(calls.length, 0);
  const codexAuth = join(directory, "auth.json");
  await writeFile(codexAuth, '{"tokens":{"access_token":"fixture"}}');
  const codex = createAgent({
    harness: createCodexHarness({
      authentication: { account: { file: codexAuth } },
    }),
  });
  assert.deepEqual(
    await authenticateAgent(codex, {}, lease, "remote", signal),
    {},
  );
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0]?.arguments, ["-e", credentialInstaller]);
  assert.deepEqual(JSON.parse(calls[0]?.stdin ?? ""), {
    home: "/home/agent",
    files: [
      {
        path: ".codex/auth.json",
        content: '{"tokens":{"access_token":"fixture"}}',
      },
    ],
  });
  assert.equal(calls[0]?.variables, undefined);
  calls.length = 0;
  const usage = createAgent({
    harness: createCodexHarness({ authentication: "usage" }),
  });
  assert.deepEqual(
    await authenticateAgent(
      usage,
      { OPENAI_API_KEY: "sk-sandbox", OTHER: "kept" },
      lease,
      "mounted",
      signal,
    ),
    { OPENAI_API_KEY: "sk-sandbox" },
  );
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.stdin, "sk-sandbox");
  assert.deepEqual(calls[0]?.variables, {
    OPENAI_API_KEY: "sk-sandbox",
    OTHER: "kept",
  });
  await assert.rejects(
    authenticateAgent(
      createAgent({
        harness: createCodexHarness({
          authentication: { account: { file: join(directory, "missing") } },
        }),
      }),
      {},
      lease,
      "mounted",
      signal,
    ),
    /Run codex login/,
  );
});

test(
  "the credential installer writes private files atomically and refuses unsafe paths",
  { skip: process.platform === "win32" },
  async (t) => {
    const directory = await repository(t);
    const home = join(directory, "home");
    await mkdir(home);
    const install = (files: unknown) =>
      executeProcess({
        executable: process.execPath,
        arguments: ["-e", credentialInstaller],
        stdin: JSON.stringify({ home, files }),
      });
    const result = await install([
      { path: ".tool/nested/token", content: "first" },
      { path: ".tool/nested/token", content: "second" },
      { path: "device_id", content: "device" },
    ]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, "");
    const target = join(home, ".tool", "nested", "token");
    assert.equal(await readFile(target, "utf8"), "second");
    assert.equal((await stat(target)).mode & 0o777, 0o600);
    assert.equal((await stat(join(home, ".tool"))).mode & 0o777, 0o700);
    assert.equal(
      (await stat(join(home, ".tool", "nested"))).mode & 0o777,
      0o700,
    );
    assert.deepEqual(await readdir(join(home, ".tool", "nested")), ["token"]);
    for (const path of [
      "../escape",
      ".tool/../../escape",
      "/absolute",
      "",
      "./token",
      ".tool//token",
    ]) {
      const refused = await install([{ path, content: "secret-value" }]);
      assert.notEqual(refused.status, 0, path);
      assert.match(refused.stderr, /Unsafe credential path/);
    }
    assert.deepEqual((await readdir(directory)).includes("escape"), false);
  },
);

test("sandboxes authenticate each selected adapter once and merge credentials into its commands", async (t) => {
  const root = await repository(t);
  const plans: string[] = [];
  const credentialed = (name: string, token: string): CliAgent => ({
    ...scripted(
      `if (process.env.FIXTURE_TOKEN !== ${JSON.stringify(token)}) throw new Error("wrong token"); ${emit("<outpost>done</outpost>")}`,
    ),
    credentials() {
      plans.push(name);
      return {
        variables: { FIXTURE_TOKEN: token },
        host: [],
        files: [],
        commands: [],
      };
    },
  });
  const first = credentialed("first", "one");
  const second = credentialed("second", "two");
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    logging: false,
  });
  for (const selected of [first, first, second, first])
    await sandbox.dispatch({ agent: selected, brief: { text: "run" } });
  assert.deepEqual(plans, ["first", "second", "first"]);
});

test("Git preparation retries failed configuration and refreshes variables without repeating warm authentication", async (t) => {
  const root = await repository(t);
  await mkdir(join(root, ".outpost"), { recursive: true });
  const environment = join(root, ".outpost", ".env");
  await writeFile(environment, "OUTPOST_PREPARATION_VALUE=first\n");
  let authentications = 0;
  const configurations: string[] = [];
  const operations: string[] = [];
  await using observation = createObservation({
    sinks: [
      {
        observe(value) {
          if (
            value.event.kind === "operation" &&
            value.event.name.startsWith("agent.")
          )
            operations.push(`${value.event.name}:${value.event.status}`);
        },
      },
    ],
  });
  const agent: CliAgent = {
    ...scripted(
      "console.log(JSON.stringify({kind:'result',text:process.env.OUTPOST_PREPARATION_VALUE + ':' + process.env.OUTPOST_PREPARATION_TOKEN}))",
    ),
    credentials() {
      authentications++;
      return {
        variables: { OUTPOST_PREPARATION_TOKEN: "credential" },
        host: [],
        files: [],
        commands: [],
      };
    },
    configuration(variables) {
      configurations.push(variables.OUTPOST_PREPARATION_VALUE!);
      if (configurations.length === 1) throw new Error("configuration refused");
      return { files: [] };
    },
  };
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    logging: false,
    observation,
  });
  await assert.rejects(
    sandbox.dispatch({ agent, brief: { text: "run" } }),
    /configuration refused/,
  );
  assert.equal(
    (await sandbox.dispatch({ agent, brief: { text: "run" } })).text,
    "first:credential",
  );
  await writeFile(environment, "OUTPOST_PREPARATION_VALUE=second\n");
  assert.equal(
    (await sandbox.dispatch({ agent, brief: { text: "run" } })).text,
    "second:credential",
  );
  assert.equal(authentications, 2);
  assert.deepEqual(configurations, ["first", "first"]);
  await observation.flush();
  assert.equal(
    operations.filter((event) => event === "agent.authenticate:finished")
      .length,
    2,
  );
  assert.equal(
    operations.filter((event) => event === "agent.configure:failed").length,
    1,
  );
  assert.equal(
    operations.filter((event) => event === "agent.configure:finished").length,
    1,
  );
});

test("file preparation uses explicit variables on each dispatch and configures through the authenticated lease", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "outpost-file-authentication-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const directory = join(root, "runtime");
  await mkdir(join(directory, ".outpost"), { recursive: true });
  await writeFile(
    join(directory, ".outpost", ".env"),
    "OUTPOST_PREPARATION_UNDECLARED=forbidden\n",
  );
  const local = createLocalSandboxProvider({
    variables: { OUTPOST_PREPARATION_VALUE: "provider" },
  });
  const installations: Command[] = [];
  const sandboxProvider: SandboxProvider = {
    ...local,
    workspaces: {
      ...local.workspaces!,
      async acquire(context) {
        const lease = await local.workspaces!.acquire(context);
        return {
          ...lease,
          home: join(root, "home"),
          invoke(command) {
            if (command.arguments?.[1] === configurationInstaller)
              installations.push(command);
            return lease.invoke(command);
          },
        };
      },
    },
  };
  let authentications = 0;
  const configurations: string[] = [];
  const fixture = scripted(
    "console.log(JSON.stringify({kind:'result',text:process.env.OUTPOST_PREPARATION_VALUE + ':' + process.env.OUTPOST_PREPARATION_TOKEN}))",
  );
  const agent: CliAgent = {
    ...fixture,
    fileWorkspaces: { dispatch: true },
    variables: { OUTPOST_PREPARATION_VALUE: "agent" },
    credentials(variables) {
      assert.equal(variables.OUTPOST_PREPARATION_VALUE, "agent");
      assert.equal(variables.OUTPOST_PREPARATION_UNDECLARED, undefined);
      authentications++;
      return {
        variables: { OUTPOST_PREPARATION_TOKEN: "credential" },
        host: [],
        files: [],
        commands: [],
      };
    },
    configuration(variables) {
      configurations.push(variables.OUTPOST_PREPARATION_VALUE!);
      assert.equal(variables.OUTPOST_PREPARATION_TOKEN, undefined);
      return {
        files: [{ path: "settings.json", entries: { configured: true } }],
      };
    },
    request(input) {
      return {
        ...fixture.request(input),
        variables: { OUTPOST_PREPARATION_TOKEN: "command" },
      };
    },
  };
  await using sandbox = await createSandbox({
    workspaceSource: { kind: "ephemeral" },
    runtime: { directory },
    sandboxProvider,
    variables: { OUTPOST_PREPARATION_VALUE: "sandbox" },
    logging: false,
  });
  for (let i = 0; i < 2; i++)
    assert.equal(
      (await sandbox.dispatch({ agent, brief: { text: "run" } })).text,
      "agent:command",
    );
  assert.equal(authentications, 2);
  assert.deepEqual(configurations, ["agent", "agent"]);
  assert.equal(installations.length, 2);
  for (const command of installations) {
    assert.equal(command.variables?.OUTPOST_PREPARATION_TOKEN, "credential");
    assert.equal(command.variables?.OUTPOST_PREPARATION_VALUE, "agent");
  }
  assert.deepEqual(
    JSON.parse(await readFile(join(root, "home", "settings.json"), "utf8")),
    { configured: true },
  );
});

test("Kimi account defaults to global and installs the scoped OAuth file and provisions the matching region", async (t) => {
  const directory = await repository(t);
  const profile = join(directory, "global-profile");
  const home = join(directory, "sandbox-home");
  await mkdir(join(profile, "credentials"), { recursive: true });
  await mkdir(home);
  const filename = "kimi-code-env-0e4f99c69cc27850.json";
  await writeFile(
    join(profile, "credentials", filename),
    '{"access_token":"global-fixture"}',
  );
  await writeFile(
    join(profile, "credentials", "kimi-code.json"),
    "mainland-private",
  );
  await writeFile(
    join(profile, "config.toml"),
    'unrelated_api_key = "do-not-copy"',
  );
  await writeFile(join(profile, "device_id"), "global-device");
  const calls: Command[] = [];
  const lease = recordingLease(home, calls);
  lease.invoke = async (command) => {
    calls.push(command);
    if (command.arguments?.[1] === credentialInstaller)
      return executeProcess(command);
    return { status: 0, stdout: "", stderr: "" };
  };
  const selected = createAgent({
    harness: createKimiHarness({
      authentication: { account: { file: profile } },
    }),
  });
  const variables = await authenticateAgent(
    selected,
    {},
    lease,
    "mounted",
    signal,
  );
  assert.deepEqual(variables, {
    KIMI_CODE_OAUTH_HOST: "https://auth.kimi.ai",
    KIMI_CODE_BASE_URL: "https://api.kimi.ai/coding/v1",
  });
  assert.equal(
    await readFile(join(home, ".kimi-code", "credentials", filename), "utf8"),
    '{"access_token":"global-fixture"}',
  );
  assert.equal(
    await readFile(join(home, ".kimi-code", "device_id"), "utf8"),
    "global-device",
  );
  assert.deepEqual((await readdir(join(home, ".kimi-code"))).sort(), [
    "credentials",
    "device_id",
  ]);
  assert.deepEqual(await readdir(join(home, ".kimi-code", "credentials")), [
    filename,
  ]);
  assert.deepEqual(calls[1]?.arguments?.slice(2), [
    "kimi",
    "login",
    "--region",
    "global",
  ]);
  assert.deepEqual(calls[1]?.variables, variables);
  assert.equal(
    await readFile(join(profile, "credentials", filename), "utf8"),
    '{"access_token":"global-fixture"}',
  );
  calls.length = 0;
  await assert.rejects(
    authenticateAgent(
      createAgent({
        harness: createKimiHarness({
          authentication: { account: { file: profile } },
        }),
      }),
      { KIMI_CODE_OAUTH_HOST: "https://auth.kimi.com" },
      lease,
      "mounted",
      signal,
    ),
    /conflicts with account region/,
  );
  assert.equal(calls.length, 0);
});
