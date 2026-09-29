import { test } from "node:test";
import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

const echoLines = [
  "-e",
  "let b='';process.stdin.on('data',d=>{b+=d;let i;while((i=b.indexOf('\\n'))>=0){console.log('got:'+b.slice(0,i));b=b.slice(i+1)}});process.stdin.on('end',()=>{console.log('eof');process.exit(Number(process.argv[1]??0))})",
];

test("live input streams stdin to a running process after the initial text", async () => {
  const input = new PassThrough();
  const seen: string[] = [];
  const pending = executeProcess({
    executable: process.execPath,
    arguments: [...echoLines, "3"],
    stdin: "first\n",
    input,
    observe(channel, text) {
      if (channel !== "stdout") return;
      seen.push(text);
      if (text.includes("got:first")) input.end("second\n");
    },
  });
  const result = await pending;
  assert.equal(result.status, 3);
  assert.match(result.stdout, /got:first\ngot:second\neof\n/);
  assert.ok(seen.length > 0);
});

test("live input commands complete when the process exits with stdin still open", async () => {
  const input = new PassThrough();
  const result = await executeProcess({
    executable: process.execPath,
    arguments: [
      "-e",
      "process.stdin.resume();setTimeout(()=>process.exit(4),50)",
    ],
    input,
  });
  assert.equal(result.status, 4);
  input.end("late\n");
});

test("cancellation terminates a process that is waiting for live input", async () => {
  const input = new PassThrough();
  const controller = new AbortController();
  const pending = executeProcess({
    executable: process.execPath,
    arguments: ["-e", "process.stdin.resume();setInterval(()=>{},1000)"],
    input,
    signal: controller.signal,
  });
  setTimeout(() => controller.abort(new Error("stop")), 100);
  await assert.rejects(pending, /stop/);
  input.end();
});

test("the local provider advertises live input and keeps the lease reusable", async (t) => {
  const root = await repository(t);
  const lease = await localSandboxProvider().acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  try {
    assert.equal(lease.liveInput, true);
    const input = new PassThrough();
    const pending = lease.invoke({
      executable: process.execPath,
      arguments: echoLines,
      input,
    });
    input.end("steer\n");
    assert.match((await pending).stdout, /got:steer\neof/);
    assert.equal(
      (await lease.invoke({ executable: process.execPath, arguments: ["-v"] }))
        .status,
      0,
    );
  } finally {
    await lease.release();
  }
});
