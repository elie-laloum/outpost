import assert from "node:assert/strict";
import { test } from "node:test";
import {
  dispatch,
  createSandbox,
  openWorkspace,
  createReporter,
} from "../../src/index.ts";
import type {
  DispatchTelemetry,
  DispatchTelemetryOutcome,
  SandboxProvider,
} from "../../src/index.ts";
import { localSandboxProvider as local } from "../../src/providers/local.ts";
import { repository, scripted, emit } from "../helpers.ts";

function recording() {
  let starts = 0;
  const outcomes: DispatchTelemetryOutcome[] = [];
  const telemetry: DispatchTelemetry = {
    startDispatch() {
      starts++;
      return {
        finish(outcome) {
          outcomes.push(outcome);
        },
      };
    },
  };
  return {
    telemetry,
    outcomes,
    get starts() {
      return starts;
    },
  };
}
const usageScript =
  "console.log(JSON.stringify({kind:'usage',tokens:{input:3,cached:1,output:2}}));";

test("cold passes share one session and report exact usage after disposal", async (t) => {
  const root = await repository(t);
  const record = recording();
  let released = 0;
  const base = local();
  const sandboxProvider: SandboxProvider = {
    ...base,
    async acquire(request) {
      const lease = await base.acquire(request);
      return {
        ...lease,
        async release() {
          await lease.release();
          released++;
        },
      };
    },
  };
  const report = createReporter({ text: async () => {} });
  const result = await dispatch({
    repository: root,
    sandboxProvider,
    agent: scripted(usageScript + emit("unfinished")),
    brief: { text: "test" },
    passes: 2,
    logging: false,
    observe: report,
    telemetry: {
      startDispatch() {
        const session = record.telemetry.startDispatch();
        return {
          finish(outcome) {
            assert.equal(released, 2);
            session.finish(outcome);
          },
        };
      },
    },
  });
  await report.flush();
  assert.equal(record.starts, 1);
  assert.equal(record.outcomes.length, 1);
  assert.deepEqual(record.outcomes[0], {
    status: "done",
    completed: false,
    usage: result.usage,
  });
  assert.equal(result.usage.input, 6);
});

test("warm and workspace dispatches retain separate sessions and reusable ownership", async (t) => {
  const root = await repository(t);
  const record = recording();
  const options = {
    agent: scripted(usageScript + emit("<outpost>done</outpost>")),
    brief: { text: "test" },
    logging: false as const,
    telemetry: record.telemetry,
  };
  await using workspace = await openWorkspace({ repository: root });
  await workspace.dispatch({ ...options, sandboxProvider: local() });
  await using box = await workspace.sandbox({
    sandboxProvider: local(),
    logging: false,
  });
  await box.dispatch(options);
  await assert.rejects(
    box.dispatch({
      ...options,
      agent: scripted(usageScript + "process.exit(7)"),
    }),
    /status 7/,
  );
  await box.dispatch(options);
  assert.equal(record.starts, 4);
  assert.deepEqual(
    record.outcomes.map((item) => item.status),
    ["done", "done", "failed", "done"],
  );
  assert.equal(record.outcomes[2]?.usage.input, 3);
});

test("validation, allocation and cleanup failures terminate telemetry without changing the rejection", async (t) => {
  const root = await repository(t);
  const record = recording();
  const base = {
    repository: root,
    sandboxProvider: local(),
    agent: scripted(emit("<outpost>done</outpost>")),
    brief: { text: "test" },
    telemetry: record.telemetry,
    logging: false as const,
  };
  await assert.rejects(dispatch({ ...base, passes: 0 }));
  const allocation = new Error("allocation");
  await assert.rejects(
    dispatch({
      ...base,
      sandboxProvider: {
        ...local(),
        acquire: async () => {
          throw allocation;
        },
      },
    }),
    (error) => error === allocation,
  );
  const cleanup = new Error("cleanup");
  const provider = local();
  await assert.rejects(
    dispatch({
      ...base,
      sandboxProvider: {
        ...provider,
        async acquire(request) {
          const lease = await provider.acquire(request);
          return {
            ...lease,
            async release() {
              await lease.release();
              throw cleanup;
            },
          };
        },
      },
    }),
    (error) => error === cleanup,
  );
  assert.equal(record.starts, 3);
  assert.deepEqual(
    record.outcomes.map((item) => item.status),
    ["failed", "failed", "failed"],
  );
});

test("pre-aborted and running cancellation are cancelled while deadlines are failures", async (t) => {
  const root = await repository(t);
  const record = recording();
  const abort = new AbortController();
  const options = {
    repository: root,
    sandboxProvider: local(),
    agent: scripted("setTimeout(() => {}, 10000)"),
    brief: { text: "test" },
    telemetry: record.telemetry,
    logging: false as const,
  };
  abort.abort("stop");
  await assert.rejects(
    dispatch({ ...options, signal: abort.signal }),
    (error) => error === "stop",
  );
  const running = new AbortController();
  await assert.rejects(
    dispatch({
      ...options,
      signal: running.signal,
      observe(event) {
        if (event.kind === "phase" && event.name === "running")
          running.abort("stop running");
      },
    }),
  );
  await assert.rejects(dispatch({ ...options, deadlineMs: 50 }));
  assert.deepEqual(
    record.outcomes.map((item) => item.status),
    ["cancelled", "cancelled", "failed"],
  );
});

test("broken telemetry and reporters cannot change dispatch success", async (t) => {
  const root = await repository(t);
  const options = {
    repository: root,
    sandboxProvider: local(),
    agent: scripted(emit("<outpost>done</outpost>")),
    brief: { text: "test" },
    logging: false as const,
  };
  for (const telemetry of [
    {
      startDispatch() {
        throw new Error("start");
      },
    },
    {
      startDispatch() {
        return {
          finish() {
            throw new Error("finish");
          },
        };
      },
    },
  ]) {
    const result = await dispatch({
      ...options,
      telemetry,
      observe() {
        throw new Error("observe");
      },
    });
    assert.equal(result.completed, true);
  }
});

test("repairs, resume and fork start fresh sessions without losing telemetry configuration", async (t) => {
  const { writeFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const { response } = await import("../../src/index.ts");
  const root = await repository(t);
  const record = recording();
  const file = join(root, "native.jsonl");
  let requests = 0;
  const agent = {
    ...scripted(() => {
      requests++;
      return (
        usageScript +
        `console.log(JSON.stringify({kind:'conversation',id:'native-id'}));` +
        emit(requests === 1 ? "invalid" : "<answer>ok</answer>")
      );
    }),
    storage: {
      name: "fixture",
      async locate(id: string) {
        return { id, file, format: "custom" as const };
      },
      async capture(id: string) {
        await writeFile(file, "native data");
        return { id, file, format: "custom" as const };
      },
      async restore() {},
    },
  };
  const result = await dispatch({
    repository: root,
    sandboxProvider: local(),
    agent,
    brief: { text: "Return <answer>ok</answer>" },
    response: response.text({ tag: "answer", repairs: 1 }),
    logging: false,
    telemetry: record.telemetry,
  });
  assert.equal(result.turns.length, 2);
  assert.equal(record.starts, 1);
  assert.equal(record.outcomes[0]?.usage.input, 6);
  await result.resume({ brief: { text: "again" }, logging: false });
  await result.fork({ brief: { text: "fork" }, logging: false });
  assert.equal(record.starts, 3);
  assert.equal(record.outcomes.length, 3);
});

test("integration and remote synchronization errors remain inside the dispatch span", async (t) => {
  const { mkdir } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const root = await repository(t);
  const record = recording();
  const workspace = await openWorkspace({ repository: root });
  t.after(() => workspace.close({ preserve: true }));
  const integration = new Error("integration failed");
  workspace.integrate = async () => {
    throw integration;
  };
  await assert.rejects(
    dispatch({
      workspace,
      sandboxProvider: local(),
      agent: scripted(usageScript + emit("done")),
      brief: { text: "test" },
      logging: false,
      telemetry: record.telemetry,
    }),
    (error) => error === integration,
  );
  assert.equal(record.outcomes[0]?.status, "failed");
  assert.equal(record.outcomes[0]?.usage.input, 3);

  const remote = join(root, ".outpost", "fake-remote");
  await mkdir(remote, { recursive: true });
  let executed = false;
  let released = false;
  const synchronization = new Error("synchronization failed");
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: {
        name: "fake-remote",
        placement: "remote",
        async acquire() {
          const lease = await local().acquire({
            repository: remote,
            directory: remote,
            gitDirectories: [],
            variables: {},
          });
          return {
            ...lease,
            async download(...args) {
              if (executed) throw synchronization;
              return lease.download(...args);
            },
            async release() {
              await lease.release();
              released = true;
            },
          };
        },
      },
      agent: scripted(() => {
        executed = true;
        return usageScript + emit("done");
      }),
      brief: { text: "test" },
      logging: false,
      telemetry: {
        startDispatch() {
          const session = record.telemetry.startDispatch();
          return {
            finish(outcome) {
              assert.equal(released, true);
              session.finish(outcome);
            },
          };
        },
      },
    }),
  );
  assert.equal(executed, true);
  assert.equal(record.outcomes[1]?.status, "failed");
  assert.equal(record.outcomes[1]?.usage.input, 3);
});
