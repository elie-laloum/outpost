import assert from "node:assert/strict";
import { test } from "node:test";
import { PassThrough, Writable } from "node:stream";
import type {
  Daytona,
  PtyCreateOptions,
  PtyConnectOptions,
  PtyResult,
} from "@daytona/sdk";
import { daytona } from "../../src/providers/daytona.ts";

function fixture() {
  const input = new PassThrough();
  const bytes: Buffer[] = [];
  const output = Object.assign(
    new Writable({
      write(chunk, _encoding, done) {
        bytes.push(Buffer.from(chunk));
        done();
      },
    }),
    { columns: 99, rows: 35 },
  );
  const sent: (string | Uint8Array)[] = [];
  const commands: string[] = [];
  const sizes: number[][] = [];
  const uploaded: Buffer[] = [];
  let create: PtyCreateOptions & PtyConnectOptions;
  let finish: (result: PtyResult) => void = () => {};
  let exited = new Promise<PtyResult>((resolve) => {
    finish = resolve;
  });
  let status: number | undefined;
  let killed = 0;
  let disconnected = 0;
  let deleted = 0;
  let sendError: Error | undefined;
  let createError: Error | undefined;
  let killError: Error | undefined;
  let orphanKills = 0;
  let creation: Promise<void> = Promise.resolve();
  const sandbox = {
    getUserHomeDir: async () => "/home/test",
    fs: {
      createFolder: async () => {},
      uploadFile: async (data: Buffer) => {
        uploaded.push(data);
      },
    },
    process: {
      createPty: async (options: PtyCreateOptions & PtyConnectOptions) => {
        create = options;
        await creation;
        if (createError) throw createError;
        return {
          wait: () => exited,
          sendInput: async (data: string | Uint8Array) => {
            if (sendError) throw sendError;
            sent.push(data);
          },
          resize: async (...size: number[]) => {
            sizes.push(size);
          },
          kill: async () => {
            killed++;
            if (killError) throw killError;
            finish({ exitCode: 137 });
          },
          disconnect: async () => {
            disconnected++;
          },
        };
      },
      killPtySession: async () => {
        orphanKills++;
      },
      executeCommand: async (script: string) => {
        commands.push(script);
        if (script.startsWith("if [ -f") && script.includes(".status"))
          return {
            exitCode: status === undefined ? 3 : 0,
            result: status === undefined ? "" : String(status),
          };
        return { exitCode: 0, result: "" };
      },
    },
  };
  return {
    input,
    output,
    sent,
    bytes,
    commands,
    sizes,
    uploaded,
    acquire: () =>
      daytona(
        {},
        async () =>
          ({
            create: async () => sandbox,
            delete: async () => {
              deleted++;
            },
          }) as unknown as Pick<Daytona, "create" | "delete">,
      ).acquire({
        repository: "/repo",
        directory: "/repo",
        gitDirectories: [],
        variables: { BASE: "base" },
      }),
    get create() {
      return create!;
    },
    get killed() {
      return killed;
    },
    get disconnected() {
      return disconnected;
    },
    get deleted() {
      return deleted;
    },
    get orphanKills() {
      return orphanKills;
    },
    failCreate(cause: Error) {
      createError = cause;
    },
    failKill(cause: Error) {
      killError = cause;
    },
    failSend(cause: Error) {
      sendError = cause;
    },
    holdCreate(pending: Promise<void>) {
      creation = pending;
    },
    exit(code: number) {
      status = code;
      finish({ exitCode: code });
    },
    recordStatus(code: number) {
      status = code;
    },
    nativeExit(code: number) {
      finish({ exitCode: code });
    },
    closeOutput() {
      finish({ exitCode: 0 });
    },
    reset() {
      status = undefined;
      exited = new Promise((resolve) => {
        finish = resolve;
      });
    },
  };
}

const tick = () => new Promise<void>((resolve) => setImmediate(resolve));

test("Daytona native PTY preserves bytes, split Unicode, resize and late nonzero completion", async () => {
  const f = fixture();
  const lease = await f.acquire();
  let settled = false;
  const result = lease
    .invoke({
      executable: "sh",
      arguments: ["-c", "exec 1>&- 2>&-; sleep .2; exit 7"],
      interactive: true,
      terminal: f,
      retain: 5,
      variables: { CUSTOM: "value" },
      observe() {
        throw new Error("observer");
      },
    })
    .finally(() => {
      settled = true;
    });
  await tick();
  assert.equal(f.create.cwd, "/home/test/outpost");
  assert.equal(f.create.cols, 99);
  assert.equal(f.create.envs?.CUSTOM, "value");
  assert.equal(f.create.envs?.BASE, "base");
  const data = Buffer.from("hello 🌍");
  f.create.onData(data.subarray(0, 8));
  f.create.onData(data.subarray(8));
  f.input.write(Buffer.from([0, 255, 3]));
  f.output.columns = 120;
  f.output.emit("resize");
  await tick();
  f.closeOutput();
  await tick();
  assert.equal(settled, false);
  f.exit(7);
  assert.deepEqual(await result, { status: 7, stdout: "lo 🌍", stderr: "" });
  assert.deepEqual(Buffer.concat(f.bytes), data);
  assert.deepEqual(f.sent[1], Buffer.from([0, 255, 3]));
  assert.deepEqual(f.sizes, [[120, 35]]);
  assert.ok(f.uploaded[0]!.toString().includes(".status"));
  assert.ok(!f.uploaded[0]!.toString().includes("setsid"));
  assert.equal(f.input.listenerCount("data"), 0);
  assert.equal(f.output.listenerCount("resize"), 0);
  assert.equal(f.disconnected, 1);
  assert.equal(f.killed, 0);
  await lease.release();
  assert.equal(f.deleted, 1);
});

test("Daytona PTY cancellation kills only the command group and permits warm reuse", async () => {
  const f = fixture();
  const lease = await f.acquire();
  const stop = new AbortController();
  const pending = lease.invoke({
    executable: "sleep",
    interactive: true,
    terminal: f,
    signal: stop.signal,
  });
  await tick();
  stop.abort(new Error("cancel terminal"));
  await assert.rejects(pending, /cancel terminal/);
  assert.ok(f.commands.some((script) => script.includes('kill -KILL -"$p"')));
  assert.equal(f.killed, 1);
  assert.equal(f.disconnected, 1);
  assert.equal(f.deleted, 0);
  f.reset();
  const next = lease.invoke({
    executable: "true",
    interactive: true,
    terminal: f,
  });
  await tick();
  f.exit(0);
  assert.equal((await next).status, 0);
  await lease.release();
});

test("Daytona PTY cancellation accepts an already removed process", async () => {
  const f = fixture();
  f.failKill(
    Object.assign(new Error("PTY session not found"), {
      name: "DaytonaProcessNotFoundError",
    }),
  );
  const lease = await f.acquire();
  const stop = new AbortController();
  const pending = lease.invoke({
    executable: "sleep",
    interactive: true,
    terminal: f,
    signal: stop.signal,
  });
  await tick();
  const cause = new Error("cancel terminal");
  stop.abort(cause);
  await assert.rejects(pending, (error: unknown) => error === cause);
  assert.equal(f.killed, 1);
  assert.equal(f.disconnected, 1);
  assert.equal(f.deleted, 0);
  await lease.release();
});

test("Daytona PTY deadline cleans a handle acquired after cancellation", async () => {
  const f = fixture();
  let ready = () => {};
  f.holdCreate(
    new Promise((resolve) => {
      ready = resolve;
    }),
  );
  const lease = await f.acquire();
  const pending = lease.invoke({
    executable: "sleep",
    interactive: true,
    terminal: f,
    deadlineMs: 5,
  });
  const rejection = assert.rejects(pending, /timeout/i);
  await new Promise((resolve) => setTimeout(resolve, 15));
  ready();
  await rejection;
  assert.equal(f.killed, 1);
  assert.equal(f.disconnected, 1);
  assert.equal(f.sent.length, 0);
  await lease.release();
});

test("Daytona PTY input failure and output failure are supervised", async () => {
  for (const direction of ["input", "output"]) {
    const f = fixture();
    const lease = await f.acquire();
    const pending = lease.invoke({
      executable: "cat",
      interactive: true,
      terminal: f,
    });
    const rejection = assert.rejects(pending, /broken/);
    await tick();
    if (direction === "input") {
      f.failSend(new Error("broken input"));
      f.input.write("hello");
    }
    if (direction === "output")
      f.output.emit("error", new Error("broken output"));
    await rejection;
    assert.equal(f.killed, 1);
    assert.equal(f.disconnected, 1);
    assert.equal(f.input.listenerCount("error"), 0);
    assert.equal(f.output.listenerCount("error"), 0);
    await lease.release();
  }
});

test("Daytona PTY failed connection cleans its named remote session", async () => {
  const f = fixture();
  f.failCreate(new Error("handshake failed"));
  const lease = await f.acquire();
  await assert.rejects(
    lease.invoke({ executable: "true", interactive: true, terminal: f }),
    /handshake failed/,
  );
  assert.equal(f.orphanKills, 1);
  assert.equal(f.output.listenerCount("error"), 0);
  assert.ok(f.commands.some((script) => script.startsWith("rm -f")));
  await lease.release();
});

test("Daytona PTY kill failure preserves cancellation cause and still disconnects", async () => {
  const f = fixture();
  f.failKill(new Error("kill failed"));
  const lease = await f.acquire();
  const stop = new AbortController();
  const pending = lease.invoke({
    executable: "sleep",
    interactive: true,
    terminal: f,
    signal: stop.signal,
  });
  await tick();
  stop.abort(new Error("cancelled"));
  await assert.rejects(pending, (cause: unknown) => {
    assert.ok(cause instanceof AggregateError);
    assert.match(String(cause.errors[0]), /cancelled/);
    assert.match(String(cause.errors[1]), /kill failed/);
    return true;
  });
  assert.equal(f.disconnected, 1);
  assert.equal(f.input.listenerCount("data"), 0);
  await lease.release();
});

test("Daytona PTY forwards EOF and supplied stdin with default dimensions", async () => {
  const f = fixture();
  const lease = await f.acquire();
  const output = new PassThrough();
  const pending = lease.invoke({
    executable: "cat",
    interactive: true,
    terminal: { input: f.input, output },
    stdin: "prefix\n",
    retain: 0,
  });
  await tick();
  f.input.end();
  await tick();
  f.create.onData(Buffer.from("output"));
  f.exit(0);
  assert.equal((await pending).stdout, "");
  assert.equal(f.create.cols, 80);
  assert.equal(f.create.rows, 24);
  assert.equal(f.sent[1], "prefix\n");
  assert.deepEqual(f.sent[2], new Uint8Array([4]));
  await lease.release();
});

test("Daytona PTY completes when the process exits while the socket remains open", async () => {
  const f = fixture();
  const lease = await f.acquire();
  const pending = lease.invoke({
    executable: "false",
    interactive: true,
    terminal: f,
    deadlineMs: 1000,
  });
  await tick();
  f.recordStatus(23);
  assert.equal((await pending).status, 23);
  assert.equal(f.disconnected, 1);
  await lease.release();
});

test("Daytona PTY preserves explicit native signal exit without a completion file", async () => {
  const f = fixture();
  const lease = await f.acquire();
  const pending = lease.invoke({
    executable: "sh",
    interactive: true,
    terminal: f,
    deadlineMs: 1000,
  });
  await tick();
  f.nativeExit(130);
  assert.equal((await pending).status, 130);
  assert.equal(f.disconnected, 1);
  await lease.release();
});
