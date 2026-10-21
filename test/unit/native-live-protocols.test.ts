import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { createInterface } from "node:readline";
import { PassThrough } from "node:stream";
import { setImmediate } from "node:timers/promises";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import {
  createAgent,
  createCopilotHarness,
  createKimiHarness,
  defineCopilotHook,
  defineKimiHook,
} from "../../src/core.ts";
import { copilotRpcBridge } from "../../src/adapters/agents/copilot/copilot-rpc.constants.ts";
import { copilotRpcSession } from "../../src/adapters/agents/copilot/copilot-rpc.ts";
import {
  kimiServerEvents,
  kimiServerInput,
} from "../../src/adapters/agents/kimi/kimi-server.ts";
import { kimiServerBridge } from "../../src/adapters/agents/kimi/kimi-server.constants.ts";

const notification = (type: string, data: object) =>
  JSON.stringify({
    jsonrpc: "2.0",
    method: "session.event",
    params: { sessionId: "s", event: { type, data } },
  });

test("Copilot receipts confirm consumption, including reordered replies, rather than queue acceptance", () => {
  const session = copilotRpcSession({}, { text: "initial" });
  assert.equal(session.encode("queued before startup"), "");
  const opened = session.read(
    JSON.stringify({
      id: "outpost-open",
      result: { sessionId: "s" },
    }),
  );
  const sent = opened.replies.map((line) => JSON.parse(line));
  assert.equal(sent.length, 2);
  assert.deepEqual(
    sent.map((call) => call.params.prompt),
    ["initial", "queued before startup"],
  );
  assert.ok(
    sent.every(
      (call) =>
        call.method === "session.send" && call.params.mode === "immediate",
    ),
  );
  assert.equal(
    session.read(
      JSON.stringify({ id: sent[0].id, result: { messageId: "first" } }),
    ).consumed,
    0,
  );
  assert.equal(
    session.read(notification("user.message", { messageId: "first" })).consumed,
    1,
  );
  assert.equal(
    session.read(notification("user.message", { messageId: "first" })).consumed,
    0,
  );
  assert.equal(
    session.read(notification("user.message", { messageId: "second" }))
      .consumed,
    0,
  );
  assert.equal(
    session.read(
      JSON.stringify({ id: sent[1].id, result: { messageId: "second" } }),
    ).consumed,
    1,
  );
  const rejected = JSON.parse(session.encode("rejected"));
  assert.equal(
    session.read(JSON.stringify({ id: rejected.id, error: { code: -1 } }))
      .consumed,
    0,
  );
  assert.equal(session.read("not json").consumed, 0);
});

test("Copilot handles native permission requests once and refuses unsupported client operations", () => {
  const session = copilotRpcSession({}, {});
  session.read(
    JSON.stringify({ id: "outpost-open", result: { sessionId: "s" } }),
  );
  const result = session.read(
    notification("permission.requested", { requestId: "permission-1" }),
  );
  const response = JSON.parse(result.replies[0]!);
  assert.equal(
    response.method,
    "session.permissions.handlePendingPermissionRequest",
  );
  assert.deepEqual(response.params, {
    sessionId: "s",
    requestId: "permission-1",
    result: { kind: "approve-once" },
  });
  assert.equal(
    session.read(
      notification("permission.requested", {
        requestId: "already-resolved",
        resolvedByHook: true,
      }),
    ).replies.length,
    0,
  );
  const unsupported = session.read(
    JSON.stringify({ jsonrpc: "2.0", id: 42, method: "unknown" }),
  );
  assert.equal(JSON.parse(unsupported.replies[0]!).error.code, -32601);
  assert.equal(unsupported.consumed, 0);
});

test("server variants preserve request validation and ordinary CLI execution", () => {
  for (const harness of [createCopilotHarness, createKimiHarness]) {
    const agent = createAgent({ harness: harness() });
    assert.equal(agent.request({ text: "ordinary" }).executable, agent.name);
    const live = agent.request({ text: "initial", liveInput: true });
    assert.equal(live.executable, "node");
    assert.ok(live.stdin);
    assert.throws(
      () =>
        agent.request({
          liveInput: true,
          continuation: { id: "../outside" },
        }),
      /Invalid conversation/,
    );
    assert.throws(
      () =>
        agent.request({
          liveInput: true,
          continuation: { id: "session", fork: true },
        }),
      /fork/,
    );
    const configured = createAgent({
      harness: harness({ mcpServers: { fixture: { command: "node" } } }),
    });
    assert.equal(
      configured.liveInput,
      undefined,
      "MCP keeps the validated print-mode configuration",
    );
    assert.equal(configured.resumable, true);
  }
  for (const harness of [
    createCopilotHarness({
      hooks: [defineCopilotHook({ on: "sessionStart", run() {} })],
    }),
    createKimiHarness({
      hooks: [defineKimiHook({ on: "SessionStart", run() {} })],
    }),
  ]) {
    const agent = createAgent({ harness });
    assert.equal(agent.liveInput, undefined);
    assert.ok(agent.hooks, "Native hooks retain their existing execution path");
  }
});

test("Copilot RPC preserves terminal errors, usage and tool events", () => {
  const agent = createAgent({ harness: createCopilotHarness() });
  assert.deepEqual(
    agent.events(
      JSON.stringify({
        jsonrpc: "2.0",
        id: "outpost-open",
        result: { sessionId: "s" },
      }),
    ),
    [{ kind: "conversation", id: "s" }],
  );
  assert.equal(
    agent.events(
      JSON.stringify({
        jsonrpc: "2.0",
        id: "outpost-open",
        result: {},
      }),
    )[0]?.kind,
    "failure",
  );
  assert.deepEqual(agent.events(notification("session.idle", {})), [
    { kind: "finished" },
  ]);
  const failed = agent.events(
    notification("session.error", {
      errorType: "quota",
      message: "quota exceeded",
    }),
  );
  assert.ok(failed.some((event) => event.kind === "quota"));
  assert.ok(failed.some((event) => event.kind === "failure"));
  assert.deepEqual(
    agent
      .events(
        notification("assistant.message", {
          content: "hello",
          toolRequests: [{ name: "shell", arguments: "pwd", toolCallId: "t" }],
        }),
      )
      .map((event) => event.kind),
    ["text", "tool"],
  );
  assert.equal(
    agent.events(
      JSON.stringify({
        jsonrpc: "2.0",
        id: "send",
        error: { message: "denied" },
      }),
    )[0]?.kind,
    "failure",
  );
});

test("Kimi server input and output distinguish receipts, deltas, tools and terminal failure", () => {
  const session = kimiServerInput.open({});
  assert.deepEqual(JSON.parse(session.encode("steer")), { text: "steer" });
  assert.equal(
    session.read('{"role":"outpost-server","type":"accepted"}').consumed,
    1,
  );
  assert.equal(session.read('{"type":"accepted"}').consumed, 0);
  assert.equal(session.read("invalid").consumed, 0);
  const event = (value: object) =>
    kimiServerEvents({ type: "event", event: value });
  assert.deepEqual(event({ type: "assistant.delta", delta: "hello" }), [
    { kind: "text", text: "hello" },
  ]);
  assert.deepEqual(event({ type: "thinking.delta", delta: "reason" }), [
    { kind: "reasoning", text: "reason" },
  ]);
  assert.deepEqual(
    event({
      type: "tool.call.started",
      name: "Shell",
      toolCallId: "t",
      args: { command: "pwd" },
    }),
    [
      {
        kind: "tool",
        name: "Shell",
        callId: "t",
        input: { command: "pwd" },
      },
    ],
  );
  assert.equal(
    event({
      type: "tool.result",
      toolCallId: "t",
      output: "done",
      isError: false,
    })[0]?.kind,
    "tool-result",
  );
  assert.equal(
    event({ type: "error", message: "retry notice" })[0]?.kind,
    "warning",
  );
  assert.equal(
    event({
      type: "turn.ended",
      reason: "failed",
      error: { message: "bad model" },
    })[0]?.kind,
    "failure",
  );
  assert.deepEqual(kimiServerEvents({ type: "finished" }), [
    { kind: "finished" },
  ]);
  assert.deepEqual(kimiServerEvents({ type: "conversation", id: "s" }), [
    { kind: "conversation", id: "s" },
  ]);
  assert.equal(
    kimiServerEvents({ type: "failure", message: "lost connection" })[0]?.kind,
    "failure",
  );
  assert.deepEqual(event({ type: "unknown" }), []);
});

test("Copilot transport preserves split UTF-8 frames and process status, and rejects malformed framing", async () => {
  for (const malformed of [false, true]) {
    const child = Object.assign(new EventEmitter(), {
      stdin: new PassThrough(),
      stdout: new PassThrough(),
      kill: () => {
        killed = true;
      },
    });
    let killed = false;
    const process = {
      argv: ["node", '["--headless","--stdio"]'],
      stdin: new PassThrough(),
      stdout: new PassThrough(),
      stderr: new PassThrough(),
      cwd: () => "/workspace",
      exitCode: 0,
    };
    let output = "",
      input = Buffer.alloc(0);
    process.stdout.on("data", (chunk) => {
      output += String(chunk);
    });
    child.stdin.on("data", (chunk: Buffer) => {
      input = Buffer.concat([input, chunk]);
    });
    runInNewContext(copilotRpcBridge, {
      Buffer,
      process,
      require(name: string) {
        if (name === "node:readline") return { createInterface };
        assert.equal(name, "node:child_process");
        return { spawn: () => child };
      },
    });
    process.stdin.write('{"method":"session.create","params":{}}\n');
    await setImmediate();
    assert.match(input.toString(), /"workingDirectory":"\/workspace"/);
    if (malformed) {
      child.stdout.write("Content-Length: 999999999\r\n\r\n");
      assert.equal(killed, true);
      assert.equal(process.exitCode, 1);
    }
    if (!malformed) {
      const value = { result: "é" };
      const body = Buffer.from(JSON.stringify(value));
      const frame = Buffer.concat([
        Buffer.from(`Content-Length: ${body.length}\r\n\r\n`),
        body,
      ]);
      for (const byte of frame) child.stdout.write(Buffer.from([byte]));
      assert.deepEqual(JSON.parse(output), value);
      child.emit("close", 7);
      assert.equal(process.exitCode, 7);
    }
    process.stdin.destroy();
    child.stdin.destroy();
    child.stdout.destroy();
  }
});

test("Kimi bridge rejects an unexpected server exit and preserves its nonzero status", () => {
  const child = Object.assign(new EventEmitter(), {
    stdout: new PassThrough(),
    stderr: new PassThrough(),
    kill: () => true,
  });
  const process = {
    stdin: new PassThrough(),
    stdout: new PassThrough(),
    exitCode: 0,
  };
  let output = "";
  process.stdout.on("data", (chunk) => {
    output += String(chunk);
  });
  runInNewContext(kimiServerBridge, {
    process,
    setTimeout,
    clearTimeout,
    require(name: string) {
      if (name === "node:readline") return { createInterface };
      if (name === "node:crypto") return {};
      assert.equal(name, "node:child_process");
      return { spawn: () => child };
    },
  });
  child.emit("close", 7);
  assert.equal(process.exitCode, 7);
  assert.equal(JSON.parse(output).type, "failure");
  assert.equal(process.stdin.destroyed, true);
});

for (const resumed of [false, true]) {
  test(`Kimi bridge authenticates, confirms native consumption and loads ${resumed ? "resumed" : "new"} sessions before subscription`, async () => {
    let killed = false;
    const child = Object.assign(new EventEmitter(), {
      stdout: new PassThrough(),
      stderr: new PassThrough(),
      kill: () => {
        killed = true;
        child.emit("close", 0);
      },
    });
    const process = {
      stdin: new PassThrough(),
      stdout: new PassThrough(),
      cwd: () => "/workspace",
      exitCode: 0,
    };
    let output = "";
    process.stdout.on("data", (chunk) => {
      output += String(chunk);
    });
    const requests: { path: string; body: Record<string, unknown> }[] = [];
    let socket: Socket | undefined;
    class Socket extends EventTarget {
      constructor(url: string, protocols: string[]) {
        super();
        assert.equal(url, "ws://127.0.0.1:12345/api/v1/ws");
        assert.ok(
          requests.some(
            (r) => r.path === (resumed ? "/sessions/s/status" : "/sessions"),
          ),
          "Session must be loaded before subscribing",
        );
        assert.deepEqual(Array.from(protocols), [
          "kimi-code.bearer.private-test-token",
        ]);
        socket = this;
        setImmediate().then(() => this.message({ type: "server_hello" }));
      }
      send(text: string) {
        const message = JSON.parse(text);
        if (message.type === "client_hello")
          this.message({
            type: "ack",
            id: "open",
            code: 0,
            payload: { accepted_subscriptions: ["s"] },
          });
      }
      message(value: object) {
        this.dispatchEvent(
          new MessageEvent("message", { data: JSON.stringify(value) }),
        );
      }
      close() {
        this.dispatchEvent(new Event("close"));
      }
    }
    runInNewContext(kimiServerBridge, {
      Buffer,
      process,
      WebSocket: Socket,
      TextDecoder,
      AbortSignal,
      setTimeout,
      clearTimeout,
      require(name: string) {
        if (name === "node:readline") return { createInterface };
        if (name === "node:crypto")
          return { randomUUID: () => `p${requests.length}` };
        assert.equal(name, "node:child_process");
        return {
          spawn: (_name: string, args: string[]) => {
            assert.ok(args.includes("--no-open"));
            assert.equal(args[args.indexOf("--host") + 1], "127.0.0.1");
            return child;
          },
        };
      },
      async fetch(url: string, init: RequestInit) {
        assert.ok(url.startsWith("http://127.0.0.1:12345/api/v1/"));
        assert.equal(
          new Headers(init.headers).get("Authorization"),
          "Bearer private-test-token",
        );
        assert.equal(init.redirect, "error");
        const path = url.slice("http://127.0.0.1:12345/api/v1".length);
        const body: Record<string, unknown> = JSON.parse(
          String(init.body ?? "{}"),
        );
        requests.push({ path, body });
        let data: object = {};
        if (path === "/config") data = { default_model: "configured-model" };
        if (path === "/sessions") {
          assert.deepEqual(body, { metadata: { cwd: "/workspace" } });
          data = { id: "s" };
        }
        if (path === "/sessions/s/prompts")
          data = {
            status:
              requests.filter((r) => r.path === path).length === 1
                ? "running"
                : "queued",
          };
        return new Response(JSON.stringify({ code: 0, data }));
      },
    });
    child.stdout.write(
      "Kimi server: http://127.0.0.1:12345/#token=private-test-token\n",
    );
    process.stdin.write(
      JSON.stringify({
        text: "initial",
        ...(resumed ? { session: "s" } : {}),
      }) + "\n",
    );
    for (let i = 0; i < 10; i++) await setImmediate();
    assert.ok(socket);
    const first = requests.find((r) => r.path === "/sessions/s/prompts")!;
    assert.equal(first.body.model, resumed ? undefined : "configured-model");
    assert.equal(output.includes('"accepted"'), false);
    socket.message({
      type: "event",
      payload: {
        type: "turn.started",
        sessionId: "s",
        agentId: "main",
        promptId: first.body.prompt_id,
      },
    });
    process.stdin.write('{"text":"steer"}\n');
    for (let i = 0; i < 10; i++) await setImmediate();
    assert.ok(requests.at(-1)?.path.endsWith(":steer"));
    assert.equal(output.match(/"type":"accepted"/g)?.length, 1);
    const second = requests.filter((r) => r.path === "/sessions/s/prompts")[1]!;
    socket.message({
      type: "event",
      payload: {
        type: "prompt.steered",
        sessionId: "s",
        agentId: "main",
        promptIds: [second.body.prompt_id],
      },
    });
    assert.equal(output.match(/"type":"accepted"/g)?.length, 2);
    socket.message({
      type: "event",
      payload: {
        type: "prompt.completed",
        sessionId: "s",
        agentId: "main",
        promptId: "unrelated-prompt",
        reason: "failed",
      },
    });
    assert.equal(killed, false);
    process.stdin.end();
    await setImmediate();
    assert.equal(
      killed,
      false,
      "EOF must not kill an unfinished native prompt",
    );
    socket.message({
      type: "event",
      payload: {
        type: "prompt.completed",
        sessionId: "s",
        agentId: "main",
        promptId: first.body.prompt_id,
        reason: "completed",
      },
    });
    assert.equal(killed, true);
    assert.equal(process.exitCode, 0);
    assert.ok(output.includes('"type":"finished"'));
    assert.equal(output.includes("private-test-token"), false);
  });
}
