import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdir,
  readFile,
  writeFile,
  open,
  rename,
  unlink,
} from "node:fs/promises";
import { resolve, join } from "node:path";
import { randomUUID } from "node:crypto";
import {
  createAgent,
  createHarness,
  defineHarnessSubagent,
  defineHarnessTool,
  createSandbox,
  createOpenAIModelProvider,
  createAnthropicModelProvider,
  createHarnessFileTools,
  createHarnessEditTools,
  createHarnessSearchTools,
  createHarnessGitTools,
  createHarnessShellTools,
} from "../src/index.ts";
import { createLocalSandboxProvider } from "../src/providers/local.ts";
import { createDockerSandboxProvider } from "../src/providers/docker.ts";
import { createPodmanSandboxProvider } from "../src/providers/podman.ts";

const [protocol = "offline", backend = "local", scenario = "coding", ...flags] =
  process.argv.slice(2);
assert.ok(
  ["offline", "responses", "chat-completions", "anthropic"].includes(protocol),
  "Unknown protocol",
);
assert.ok(
  ["local", "docker", "podman", "vercel", "daytona"].includes(backend),
  "Unknown sandbox",
);
assert.ok(
  [
    "coding",
    "cache",
    "cancel",
    "truncation",
    "steps",
    "usage",
    "network",
  ].includes(scenario),
  "Unknown scenario",
);
assert.ok(
  flags.every((flag) => flag === "--live"),
  "Unknown flag",
);
assert.ok(
  protocol === "offline" || flags.includes("--live"),
  "Paid model requests require --live",
);
assert.ok(
  protocol !== "offline" || scenario === "coding",
  "Offline covers coding only",
);
process.umask(0o077);
const directory = resolve(
  process.env.OUTPOST_HARNESS_REPORT_DIRECTORY ?? "temp/harness-stable-live",
);
await mkdir(directory, { recursive: true });
const output = join(
  directory,
  `${new Date().toISOString().replaceAll(":", "-")}-${protocol}-${backend}-${scenario}`,
);
await mkdir(output);
const repository = join(output, "repository");
await mkdir(repository);
const git = (args) =>
  execFileSync("git", args, {
    cwd: repository,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
await writeFile(
  join(repository, "sum.mjs"),
  "export const sum = (values) => values.length;\n",
);
await writeFile(
  join(repository, "sum.test.mjs"),
  "import assert from 'node:assert/strict';\nimport { sum } from './sum.mjs';\nassert.equal(sum([17, 29, -8, 4]), 42);\nassert.equal(sum([]), 0);\n",
);
await writeFile(join(repository, ".gitignore"), ".outpost/\n");
git(["init", "-b", "main"]);
git(["config", "user.name", "Harness validation"]);
git(["config", "user.email", "harness@example.invalid"]);
git(["add", "."]);
git(["commit", "-m", "Create coding fixture"]);
const model =
  protocol === "anthropic"
    ? (process.env.OUTPOST_ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001")
    : (process.env.OUTPOST_OPENAI_MODEL ?? "gpt-5.6-luna");
const report = {
  protocol,
  backend,
  scenario,
  model,
  startedAt: new Date().toISOString(),
  status: "running",
  requests: 0,
  usage: [],
  events: [],
  checks: [],
  cleanup: false,
};
const save = () =>
  writeFile(
    join(output, "report.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
await save();
async function reserve(request) {
  const path = join(directory, "budget.json");
  const lockPath = join(directory, "budget.lock");
  const lock = await open(lockPath, "wx");
  try {
    const ledger = await readFile(path, "utf8")
      .then(JSON.parse)
      .catch((error) => {
        if (error.code !== "ENOENT") throw error;
        return { limitUsd: 5, reservedUsd: 0, requests: [] };
      });
    assert.ok(request.maxOutputTokens > 0);
    const inputBytes = Buffer.byteLength(JSON.stringify(request));
    const reservedUsd =
      ((inputBytes + 4096) * 1.25 + request.maxOutputTokens * 5) / 1_000_000;
    assert.ok(
      ledger.reservedUsd + reservedUsd <= ledger.limitUsd,
      "Campaign model budget exhausted",
    );
    ledger.reservedUsd += reservedUsd;
    ledger.requests.push({
      protocol,
      backend,
      scenario,
      model,
      inputBytes,
      maxOutputTokens: request.maxOutputTokens,
      reservedUsd,
    });
    await writeFile(`${path}.tmp`, JSON.stringify(ledger, null, 2) + "\n");
    await rename(`${path}.tmp`, path);
  } finally {
    await lock.close();
    await unlink(lockPath);
  }
}
const offline = {
  name: "scripted",
  async request(request) {
    const results =
      request.messages
        ?.flatMap((message) => message.content)
        .filter((block) => block.type === "tool-result") ?? [];
    const tools = request.tools?.map((tool) => tool.name) ?? [];
    const answer = (text) => ({
      text,
      usage: { input: 4, cached: 0, output: 2 },
      stopReason: "end",
    });
    const call = (name, input) => ({
      ...answer(""),
      stopReason: "tool-calls",
      content: [{ type: "tool-call", id: randomUUID(), name, input }],
    });
    if (request.prompt) return answer("summary");
    if (!tools.length) return answer("42 <outpost>done</outpost>");
    if (tools.includes("implement"))
      return results.length
        ? answer("42 <outpost>done</outpost>")
        : call("implement", {
            prompt: "Fix sum.mjs, run node sum.test.mjs and commit.",
          });
    if (!results.length) return call("read_file", { path: "sum.mjs" });
    if (results.length === 1)
      return call("write_file", {
        path: "sum.mjs",
        content:
          "export const sum = (values) => values.reduce((a, b) => a + b, 0);\n",
      });
    if (results.length === 2)
      return call("shell", {
        command:
          "node sum.test.mjs && git add sum.mjs && git -c user.name=Harness -c user.email=harness@example.invalid commit -m 'Fix sum'",
      });
    assert.ok(
      results.every((result) => !result.isError),
      JSON.stringify(results),
    );
    return answer("42; committed");
  },
};
const factories = {
  offline: () => offline,
  responses: () =>
    createOpenAIModelProvider({
      baseUrl: "https://api.openai.com/v1",
      api: "responses",
      apiKey: process.env.OPENAI_API_KEY ?? "",
    }),
  "chat-completions": () =>
    createOpenAIModelProvider({
      baseUrl: "https://api.openai.com/v1",
      api: "chat-completions",
      apiKey: process.env.OPENAI_API_KEY ?? "",
    }),
  anthropic: () =>
    createAnthropicModelProvider({
      apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    }),
};
const raw = factories[protocol]();
const start = async (request) => {
  assert.ok(report.requests < 40, "Campaign request limit reached");
  if (protocol !== "offline") await reserve(request);
  report.requests++;
};
const record = (result) => {
  if (result.usage) report.usage.push(result.usage);
  return result;
};
const modelProvider = {
  name: raw.name,
  validate: raw.validate,
  async request(request) {
    await start(request);
    return record(await raw.request(request));
  },
  ...(raw.stream
    ? {
        async *stream(request) {
          await start(request);
          for await (const event of raw.stream(request)) {
            if (event.type === "result") record(event.result);
            yield event;
          }
        },
      }
    : {}),
};
const sandboxes = {
  local: () => createLocalSandboxProvider(),
  docker: () =>
    createDockerSandboxProvider({
      image: process.env.OUTPOST_CONTAINER_IMAGE ?? "outpost-ci:latest",
    }),
  podman: () =>
    createPodmanSandboxProvider({
      image: process.env.OUTPOST_CONTAINER_IMAGE ?? "outpost-ci:latest",
    }),
  vercel: async () =>
    (await import("../src/providers/vercel.ts")).createVercelSandboxProvider({
      create: {
        token: process.env.VERCEL_TOKEN,
        teamId: process.env.VERCEL_TEAM_ID,
        projectId: process.env.VERCEL_PROJECT_ID,
        runtime: "node24",
        timeout: 300_000,
      },
    }),
  daytona: async () =>
    (await import("../src/providers/daytona.ts")).createDaytonaSandboxProvider({
      connection: { apiKey: process.env.DAYTONA_API_KEY },
      create: {
        language: "typescript",
        autoStopInterval: 5,
        autoDeleteInterval: 0,
      },
    }),
};
const modelSpec = {
  name: model,
  maxOutputTokens: scenario === "truncation" ? 16 : 2048,
  ...(protocol === "responses" ? { reasoning: "low" } : {}),
  ...(protocol === "chat-completions" ? { reasoning: "none" } : {}),
};
const compose = (options) =>
  createAgent({
    model: modelSpec,
    harness: createHarness({
      modelProvider,
      limits: {
        maxSteps: 16,
        maxToolCalls: 30,
        usage: { input: 200_000, output: 20_000 },
      },
      ...options,
    }),
  });
const coder = compose({
  instructions:
    "Use the provided tools to inspect and edit only the fixture. Run its tests and commit the fix. Use git -c user.name=Harness -c user.email=harness@example.invalid when committing. Never modify tests. Report the test result.",
  tools: [
    createHarnessFileTools(),
    createHarnessEditTools(),
    createHarnessSearchTools(),
    createHarnessGitTools(),
    createHarnessShellTools(),
  ],
});
const delegation = defineHarnessSubagent({
  name: "implement",
  description: "Delegate fixing and testing the fixture to a coding assistant.",
  agent: coder,
});
const controller = new AbortController();
let sandbox;
try {
  sandbox = await createSandbox({
    repository,
    sandboxProvider: await sandboxes[backend](),
    agent: compose({
      tools: [delegation],
      instructions:
        "You coordinate the task. Always delegate implementation to implement. Finish with <outpost>done</outpost>.",
    }),
    logging: false,
    bootstrap: false,
  });
  const observe = (event) => {
    if (
      [
        "step",
        "usage",
        "subagent",
        "tool",
        "tool-result",
        "conversation",
      ].includes(event.kind)
    )
      report.events.push(event);
    if (scenario === "cancel" && event.kind === "text-delta")
      controller.abort(new Error("Campaign cancellation"));
  };
  if (scenario === "coding") {
    const first = await sandbox.dispatch({
      brief: {
        text: "Fix sum.mjs to sum values correctly, including empty arrays. Delegate to implement. Have it run node sum.test.mjs and commit. Report 42 and finish.",
      },
      observe,
      deadlineMs: 180_000,
    });
    assert.equal(first.completed, true);
    assert.ok(
      report.events.some(
        (event) => event.kind === "subagent" && event.status === "finished",
      ),
    );
    assert.ok(first.commits.length > 0, "The child must commit its fix");
    const verified = await sandbox.command({
      executable: "node",
      arguments: ["sum.test.mjs"],
    });
    assert.equal(verified.status, 0);
    assert.equal(
      (
        await sandbox.command({
          executable: "git",
          arguments: ["diff", "HEAD~1", "--", "sum.test.mjs"],
        })
      ).stdout,
      "",
    );
    const second = await sandbox.dispatch({
      agent: compose({ tools: [] }),
      continuation: { id: first.conversation },
      brief: {
        text: "Without tools, recall the expected sum from our previous task. Report 42 and finish with <outpost>done</outpost>.",
      },
      observe,
    });
    assert.equal(second.completed, true);
    assert.match(second.text, /42/);
    report.checks.push(
      "delegation",
      "edit",
      "test",
      "commit",
      "continuation",
      "warm-reuse",
    );
  }
  if (scenario === "cache") {
    const instructions = Array.from(
      { length: 1500 },
      (_, i) =>
        `Fixture policy ${i}: inspect only synthetic files and respect tool permissions.`,
    ).join("\n");
    const cached = compose({ tools: [], instructions });
    for (let i = 0; i < 2; i++)
      await sandbox.dispatch({
        agent: cached,
        brief: { text: "Reply CACHE_OK <outpost>done</outpost>." },
        observe,
      });
    assert.ok(
      report.usage.some((usage) => usage.cached > 0),
      "No real cache hit",
    );
    report.checks.push("real-cache-hit");
  }
  if (["cancel", "truncation", "steps", "usage"].includes(scenario)) {
    const looping = defineHarnessTool({
      name: "again",
      description: "Call repeatedly",
      input: { type: "object", properties: {}, additionalProperties: false },
      execute: () => "Call again",
    });
    const settings =
      scenario === "steps" ? { limits: { maxSteps: 1 }, tools: [looping] } : {};
    const chosen = compose({
      ...settings,
      ...(scenario === "usage" ? { limits: { usage: { output: 0 } } } : {}),
    });
    const prompt =
      scenario === "steps"
        ? "Call again now. Do not answer without using the tool."
        : "Write a long list of 200 numbered facts. Do not stop early.";
    await assert.rejects(
      sandbox.dispatch({
        agent: chosen,
        brief: { text: prompt },
        observe,
        signal: controller.signal,
      }),
      (error) =>
        scenario === "cancel"
          ? error === controller.signal.reason
          : error.code === "limit",
    );
    report.checks.push(`expected-${scenario}`);
  }
  if (scenario === "network") {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const reader = response.body.getReader();
      const first = await reader.read();
      await reader.cancel();
      return new Response(
        new ReadableStream({
          start(controller) {
            if (first.value) controller.enqueue(first.value.slice(0, 128));
            controller.close();
          },
        }),
        { status: response.status, headers: response.headers },
      );
    };
    try {
      await assert.rejects(
        sandbox.dispatch({
          agent: compose({}),
          brief: { text: "Say hello" },
          observe,
        }),
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
    report.checks.push("incomplete-real-response-rejected");
  }
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  report.error = { name: error.name, code: error.code, message: error.message };
  process.exitCode = 1;
} finally {
  try {
    await sandbox?.close();
    report.cleanup = true;
  } catch (error) {
    report.cleanupError = error.message;
    report.status = "failed";
    process.exitCode = 1;
  }
  report.finishedAt = new Date().toISOString();
  await save();
  console.log(
    JSON.stringify({
      output,
      status: report.status,
      checks: report.checks,
      requests: report.requests,
      cleanup: report.cleanup,
      error: report.error,
    }),
  );
}
