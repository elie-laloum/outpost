import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import {
  createAgent,
  createLocalTransport,
  createSteering,
  createWorkspace,
  defineJsonResponse,
  dispatch,
} from "../src/index.ts";
import { builtInAgent, builtInAgents } from "../src/adapters/agents/catalog.ts";
import { createDockerSandboxProvider } from "../src/providers/docker.ts";
import { OutpostError } from "../src/domain/errors.ts";
import { validateLiveInput } from "./cli-file-live-input.mjs";
import { validateInteractive } from "./cli-file-interactive.mjs";
import { validateSteering } from "./cli-file-steering.mjs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    live: { type: "boolean", default: false },
    preflight: { type: "boolean", default: false },
    "live-protocol": { type: "boolean", default: false },
    help: { type: "boolean", default: false },
    image: { type: "string" },
    model: { type: "string" },
    auth: { type: "string", default: "usage" },
    region: { type: "string" },
    suite: { type: "string", default: "repairs" },
    binding: { type: "string", default: "all" },
    report: { type: "string" },
  },
});

if (values.help) {
  console.log(`Usage: node scripts/cli-file-live.mjs <${builtInAgents.map((agent) => agent.name).join("|")}> --image IMAGE (--preflight | --live --model MODEL)
  --suite dispatch|repairs|continuation|liveInput|steering|interactive|all (default: repairs)
  --auth usage|account-token|account (default: usage; account requires explicit permission to use host sessions)
  --region global|mainland-cn (Kimi account region)
  --binding all|ephemeral|copy|mount-readonly|mount-write (default: all)
  --live-protocol (exercise dispatch, repairs or continuation through the live-input protocol)
  --report PATH (default: a unique /tmp/outpost-cli-file-*.json)
Runs ephemeral, directory copy, read-only mount and writable mount sequentially.
Preflight checks container CLI versions and workspaces only; it makes no model calls.
Live mode temporarily enables candidate capabilities in this script only.
Repairs rejects the first parsed response to require a real second CLI turn.
Continuation checks warm resume and supported forks, plus fresh-container restore where capture exists.
Codex uses the existing custom Responses-provider variant to avoid credential files.
Interactive requires a real terminal; Claude and Codex receive prepared preferences;
scripts/cli-file-terminal.mjs drives it. The all suite excludes interactive.
No automatic campaign retries.`);
  process.exit(0);
}

assert.equal(positionals.length, 1, "Select exactly one agent");
const descriptor = builtInAgent(positionals[0]);
assert.ok(descriptor, "Unknown built-in agent");
assert.ok(values.image, "An explicit locally installed image is required");
assert.notEqual(
  values.live,
  values.preflight,
  "Select exactly one of --preflight or --live; paid model requests require --live",
);
assert.ok(
  [
    "dispatch",
    "repairs",
    "continuation",
    "liveInput",
    "steering",
    "interactive",
    "all",
  ].includes(values.suite),
  "Unknown suite",
);
if (values["live-protocol"])
  assert.ok(
    ["dispatch", "repairs", "continuation"].includes(values.suite),
    "--live-protocol requires dispatch, repairs or continuation",
  );
assert.ok(
  !values.live || values.model || values.auth === "account",
  "Environment-key live validation requires an explicit model",
);
const choice = descriptor.authentication.find(
  (entry) => entry.value === values.auth,
);
assert.ok(
  choice && (choice.variable || values.auth === "account"),
  "Select a descriptor-declared authentication mode",
);
if (values.region)
  assert.ok(
    descriptor.name === "kimi" &&
      (values.region === "global" || values.region === "mainland-cn"),
    "Invalid Kimi region",
  );

process.umask(0o077);
const controller = new AbortController();
const cancel = () => controller.abort(new Error("Validation cancelled"));
process.once("SIGINT", cancel);
process.once("SIGTERM", cancel);
const output = resolve(
  values.report ?? join(tmpdir(), `outpost-cli-file-${randomUUID()}.json`),
);
const root = await mkdtemp(join(tmpdir(), "outpost-cli-file-work-"));
const customProvider =
  descriptor.customModelProvider && values.auth !== "account";
const nativeVariant = customProvider
  ? "responses-provider-environment-key"
  : "native-default";
const report = {
  agent: descriptor.name,
  pinnedVersion: descriptor.version,
  image: values.image,
  model: values.model ?? null,
  authentication: values.auth,
  ...(values.region ? { region: values.region } : {}),
  variant:
    values.suite === "interactive"
      ? `${nativeVariant}-terminal`
      : nativeVariant,
  mode: values.live ? "live" : "preflight",
  suite: values.suite,
  startedAt: new Date().toISOString(),
  status: "running",
  phase: "setup",
  temporaryCapabilityOverride: values.live,
  ...(values["live-protocol"] ? { liveProtocol: true } : {}),
  cases: [],
  cleanup: false,
};
const save = async () => {
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(report, null, 2) + "\n", {
    mode: 0o600,
  });
};
const wantsRepair = ["repairs", "all"].includes(values.suite);
const wantsContinuation = ["continuation", "all"].includes(values.suite);
const wantsLiveInput = ["liveInput", "all"].includes(values.suite);
const wantsInteractive = values.suite === "interactive";
const bindings = ["ephemeral", "copy", "mount-readonly", "mount-write"];
assert.ok(
  values.binding === "all" || bindings.includes(values.binding),
  "Unknown binding",
);
const authentications = {
  account: "account",
  "account-token": { account: { variable: choice.variable } },
  usage: { usage: { variable: choice.variable } },
};
const authentication = authentications[values.auth];
const harness = descriptor.harness({
  authentication,
  ...(values.region ? { region: values.region } : {}),
  ...(customProvider
    ? {
        modelProvider: {
          baseUrl: "https://api.openai.com/v1",
          apiKeyEnvironment: choice.variable,
        },
      }
    : {}),
});

function candidate() {
  const agent = createAgent({
    harness: {
      ...harness,
      bind(model) {
        return {
          ...harness.bind(model),
          ...(values.suite === "steering" ? { liveInput: undefined } : {}),
          fileWorkspaces: {
            dispatch: true,
            ...(wantsRepair ? { repairs: true } : {}),
            ...(wantsContinuation ? { continuation: true } : {}),
            ...(wantsLiveInput || values["live-protocol"]
              ? { liveInput: true }
              : {}),
            ...(wantsInteractive ? { interactive: true } : {}),
          },
        };
      },
    },
    model: values.model,
  });
  const variables = choice.variable
    ? { [choice.variable]: process.env[choice.variable] }
    : {};
  if (values["live-protocol"])
    assert.ok(
      agent.liveInput,
      "The selected adapter has no live-input protocol",
    );
  if (choice.variable)
    assert.ok(variables[choice.variable], `Missing ${choice.variable}`);
  const plan = agent.credentials?.(variables);
  assert.ok(plan, "Expected an explicit credential plan");
  if (values.auth === "account") return { agent, variables };
  assert.equal(plan.host.length, 0, "Host credential reads are forbidden");
  assert.equal(
    plan.commands.length,
    0,
    "Credential login commands are forbidden",
  );
  for (const file of plan.files)
    assert.ok(
      !file.content.includes(variables[choice.variable]),
      "Credential file writes are forbidden",
    );
  return { agent, variables };
}

function response(expected, repairs = 0) {
  let reads = 0;
  return defineJsonResponse({
    tag: "answer",
    repairs,
    jsonSchema: {
      type: "object",
      properties: { answer: { type: "string" } },
      required: ["answer"],
      additionalProperties: false,
    },
    schema(value) {
      reads++;
      if (repairs && reads === 1)
        throw new Error(
          `Validation challenge: return answer exactly ${expected}.`,
        );
      assert.deepEqual(value, { answer: expected });
      return value;
    },
  });
}

function checkResult(result, expectedTurns) {
  assert.equal(result.completed, true);
  assert.equal(result.turns.length, expectedTurns);
  assert.ok(result.turns.every((turn) => turn.status === 0));
  assert.ok(!("branch" in result));
  assert.ok(!("commits" in result));
  assert.equal(JSON.parse(result.report()).version, 2);
}

async function validate(binding, scenario) {
  report.phase = `${binding}/${scenario}`;
  const record = {
    binding,
    scenario,
    status: "running",
    step: "workspace",
    versions: [],
    checks: [],
    turns: 0,
  };
  report.cases.push(record);
  await save();
  const directory = join(root, `${binding}-${scenario}`);
  const source = join(directory, "source");
  const destination = join(directory, "published");
  const sourceToken = randomUUID();
  await mkdir(source, { recursive: true });
  await writeFile(join(source, "fixture.txt"), "before\n");
  await writeFile(join(source, "source-token.txt"), `${sourceToken}\n`);
  await mkdir(destination);
  await writeFile(join(destination, "fixture.txt"), "old publication\n");
  const mounted = binding.startsWith("mount-");
  const workspaceSource =
    binding === "ephemeral"
      ? { kind: "ephemeral" }
      : {
          kind: "directory",
          directory: source,
          access: mounted
            ? {
                mode: "mount",
                target: "input",
                readOnly: binding === "mount-readonly",
              }
            : { mode: "copy" },
        };
  await using workspace = await createWorkspace({
    source: workspaceSource,
    runtime: { directory: join(directory, "runtime"), namespace: "cli-live" },
    retention: {
      policy: "portable",
      transporter: createLocalTransport({
        directory: join(directory, "archive"),
      }),
    },
  });
  if (binding !== "copy")
    await writeFile(join(workspace.directory, "fixture.txt"), "before\n");
  const docker = createDockerSandboxProvider({ image: values.image });
  const sandboxProvider = {
    ...docker,
    workspaces: {
      ...docker.workspaces,
      async acquire(context) {
        record.step = "allocation";
        const lease = await docker.workspaces.acquire(context);
        try {
          record.step = "pinned-version";
          const version = await lease.invoke({
            executable: descriptor.executable,
            arguments: ["--version"],
            deadlineMs: 30_000,
          });
          assert.equal(version.status, 0, "CLI version probe failed");
          const versions =
            version.stdout.match(/\b\d+\.\d+\.\d+(?:-[\w.-]+)?\b/g) ?? [];
          record.versions.push(...versions.slice(0, 4));
          assert.ok(
            versions.includes(descriptor.version),
            "Container CLI version differs from the pinned descriptor",
          );
          record.step = "workspace-probe";
          const probe = await lease.invoke({
            executable: "node",
            arguments: [
              "-e",
              "const fs=require('node:fs');if(fs.existsSync('.git'))process.exit(2);if(fs.readFileSync('fixture.txt','utf8')!=='before\\n' && fs.readFileSync('fixture.txt','utf8')!=='after\\n')process.exit(3)",
            ],
          });
          assert.equal(probe.status, 0, "File workspace probe failed");
          record.step = scenario;
          return lease;
        } catch (error) {
          await lease.release();
          throw error;
        }
      },
    },
  };
  if (scenario === "preflight") {
    await using sandbox = await workspace.sandbox({
      sandboxProvider,
      signal: controller.signal,
    });
    record.checks.push("pinned-cli", "no-dot-git", "file-binding");
    record.status = "passed";
    return;
  }
  const { agent, variables } = candidate();
  const common = {
    agent,
    variables,
    logging: false,
    signal: controller.signal,
    deadlineMs: 180_000,
    idleMs: 60_000,
    ...(values["live-protocol"] ? { steering: createSteering() } : {}),
  };
  const secret = randomUUID();
  if (scenario === "steering") {
    await validateSteering({
      common,
      workspace,
      sandboxProvider,
      record,
      response,
    });
    record.status = "passed";
    return;
  }
  if (scenario === "liveInput") {
    await validateLiveInput({
      common,
      workspace,
      sandboxProvider,
      record,
      response,
      checkResult,
    });
    record.status = "passed";
    return;
  }
  if (scenario === "interactive") {
    await validateInteractive({
      common,
      workspace,
      sandboxProvider,
      record,
      save,
    });
    record.status = "passed";
    return;
  }
  if (scenario === "continuation") {
    let sandbox = await workspace.sandbox({
      sandboxProvider,
      variables,
      signal: controller.signal,
    });
    try {
      record.step = "initial-conversation";
      const first = await sandbox.dispatch({
        ...common,
        brief: {
          text: `Remember the conversation token ${secret}. Do not write it to files. Return answer READY.`,
        },
        response: response("READY"),
      });
      checkResult(first, 1);
      assert.ok(first.conversation);
      const next = {
        ...common,
        brief: {
          text: "Recall the conversation token from the first message. Return it as answer without reading files or using tools.",
        },
        response: response(secret),
      };
      record.step = "warm-continuation";
      const warm = await sandbox.resume(first.conversation, next);
      checkResult(warm, 1);
      record.turns += 2;
      record.checks.push("warm-continuation");
      if (agent.forkable !== false) {
        record.step = "warm-fork";
        const fork = await sandbox.fork(first.conversation, next);
        checkResult(fork, 1);
        assert.ok(fork.conversation);
        assert.notEqual(fork.conversation, first.conversation);
        record.turns++;
        record.checks.push("warm-fork");
      }
      if (agent.storage && agent.capture !== false) {
        assert.ok(first.transcript);
        assert.ok(first.workspaceInfo.conversations?.length);
        await sandbox.close();
        sandbox = await workspace.sandbox({
          sandboxProvider,
          variables,
          signal: controller.signal,
        });
        record.step = "cold-continuation";
        const cold = await sandbox.resume(first.conversation, next);
        checkResult(cold, 1);
        record.turns++;
        record.checks.push(
          "native-capture",
          "portable-archive",
          "fresh-container-restore",
        );
        if (agent.forkable !== false) {
          await sandbox.close();
          sandbox = await workspace.sandbox({
            sandboxProvider,
            variables,
            signal: controller.signal,
          });
          record.step = "cold-fork";
          const fork = await sandbox.fork(first.conversation, next);
          checkResult(fork, 1);
          assert.ok(fork.conversation);
          assert.notEqual(fork.conversation, first.conversation);
          record.turns++;
          record.checks.push("fresh-container-fork");
        }
      }
    } finally {
      await sandbox.close();
    }
  } else {
    const repair = scenario === "repairs";
    record.step = scenario;
    const result = await dispatch({
      ...common,
      workspace,
      sandboxProvider,
      brief: {
        text: `This is a file workspace without Git. Do not run Git or inspect environment variables or credentials. Edit fixture.txt to contain exactly after followed by a newline. Create created.txt containing exactly created followed by a newline. ${binding === "ephemeral" ? "" : `Read ${mounted ? "input/" : ""}source-token.txt and write its token followed by a newline into observed.txt in the working directory.`} ${binding === "mount-write" ? "Also edit input/fixture.txt to contain after followed by a newline." : ""} Return answer READY.`,
      },
      response: response(repair ? "REPAIRED" : "READY", repair ? 1 : 0),
      outputs: [
        {
          paths: ["fixture.txt", "created.txt"],
          destination,
          policy: "update",
        },
      ],
    });
    record.turns = result.turns.length;
    record.step = "verify-result-and-publications";
    checkResult(result, repair ? 2 : 1);
    assert.equal(result.fileOutputs.length, 1);
    assert.equal(result.fileOutputs[0].state, "complete");
    assert.deepEqual(result.fileOutputs[0].created, ["created.txt"]);
    assert.deepEqual(result.fileOutputs[0].replaced, ["fixture.txt"]);
    assert.equal(
      await readFile(join(destination, "fixture.txt"), "utf8"),
      "after\n",
    );
    assert.equal(
      await readFile(join(destination, "created.txt"), "utf8"),
      "created\n",
    );
    assert.equal(
      await readFile(join(source, "fixture.txt"), "utf8"),
      binding === "mount-write" ? "after\n" : "before\n",
    );
    if (binding !== "ephemeral") {
      record.step = "verify-source-read";
      assert.equal(
        await readFile(join(workspace.directory, "observed.txt"), "utf8"),
        `${sourceToken}\n`,
      );
      record.checks.push("source-read");
    }
    if (repair) {
      assert.ok(result.turns[0].conversation);
      assert.equal(result.turns[1].conversation, result.turns[0].conversation);
      record.checks.push("forced-response-repair", "same-conversation");
    }
    record.usage = result.usage;
    record.checks.push(
      "typed-json",
      "created-file",
      "edited-file",
      "fileOutputs",
      "report-v2",
      "source-effects",
    );
  }
  record.status = "passed";
}

try {
  if (values.live) candidate();
  await save();
  for (const binding of bindings.filter(
    (binding) => values.binding === "all" || binding === values.binding,
  )) {
    const scenarios = values.preflight
      ? ["preflight"]
      : [
          ...(["dispatch", "all"].includes(values.suite) ? ["dispatch"] : []),
          ...(wantsRepair ? ["repairs"] : []),
          ...(wantsContinuation ? ["continuation"] : []),
          ...(wantsLiveInput ? ["liveInput"] : []),
          ...(values.suite === "steering" ? ["steering"] : []),
          ...(wantsInteractive ? ["interactive"] : []),
        ];
    for (const scenario of scenarios) await validate(binding, scenario);
  }
  report.status = "passed";
} catch (error) {
  const reasons = [
    ["missing-host-session", /credential.*not found|does not exist|ENOENT/i],
    ["keychain-only", /stores no token|system keychain/i],
    ["authentication", /unauthorized|authentication|invalid.*token|expired/i],
    ["quota", /quota|rate.limit|insufficient.*credit/i],
    ["model", /model.*(?:not found|not supported|unavailable)/i],
    ["git-trust", /git repository|trusted directory/i],
    ["timeout", /deadline|timed out|timeout/i],
    ["empty-response", /empty response/i],
    ["missing-completion", /did not.*complet|without.*complet/i],
    ["internal-error", /internal|unexpected|panic|UNAVAILABLE/i],
  ];
  const diagnostic =
    error instanceof Error
      ? error.message +
        (error instanceof OutpostError ? JSON.stringify(error.details) : "")
      : "";
  report.failure = {
    kind: error instanceof assert.AssertionError ? "assertion" : "execution",
    ...(error instanceof OutpostError
      ? {
          code: error.code,
          status:
            typeof error.details.status === "number"
              ? error.details.status
              : undefined,
        }
      : {}),
    reason:
      reasons.find(([, pattern]) => pattern.test(diagnostic))?.[0] ??
      "unclassified",
    signals: reasons
      .filter(([, pattern]) => pattern.test(diagnostic))
      .map(([name]) => name),
    origin:
      error instanceof Error
        ? error.stack?.match(/(src\/[\w/-]+\.ts:\d+:\d+)/)?.[1]
        : undefined,
    location:
      error instanceof Error
        ? error.stack?.match(/(cli-file-[\w-]+\.mjs:\d+:\d+)/)?.[1]
        : undefined,
    ...(error instanceof assert.AssertionError
      ? { operator: error.operator }
      : {}),
  };
  report.status = "failed";
  if (report.cases.at(-1)?.status === "running")
    report.cases.at(-1).status = "failed";
  process.exitCode = 1;
} finally {
  try {
    await rm(root, { recursive: true, force: true });
    report.cleanup = true;
  } catch {
    report.status = "failed";
    process.exitCode = 1;
  }
  report.finishedAt = new Date().toISOString();
  process.removeListener("SIGINT", cancel);
  process.removeListener("SIGTERM", cancel);
  await save();
  console.log(
    JSON.stringify({
      report: output,
      status: report.status,
      phase: report.phase,
      cleanup: report.cleanup,
    }),
  );
}
