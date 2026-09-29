import { test } from "node:test";
import assert from "node:assert/strict";
import { appendFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PassThrough } from "node:stream";
import { executeProcess } from "../../src/infrastructure/process.ts";
import {
  cloudInputFeed,
  cloudInputFrames,
} from "../../src/providers/cloud-input.ts";
import { cloudInputScript } from "../../src/providers/cloud-input.constants.ts";
import { repository } from "../helpers.ts";

const echo =
  "let b='';process.stdin.on('data',d=>{b+=d;let i;while((i=b.indexOf('\\n'))>=0){console.log('got:'+b.slice(0,i));b=b.slice(i+1)}});process.stdin.on('end',()=>{console.log('eof');process.exit(4)})";

test("the cloud input wrapper feeds appended frames to stdin and ends on the empty frame", async (t) => {
  const file = join(await repository(t), "input");
  await writeFile(file, cloudInputFrames("first\n"));
  const pending = executeProcess({
    executable: process.execPath,
    arguments: ["-e", cloudInputScript, file, process.execPath, "-e", echo],
    async observe(channel, text) {
      if (channel !== "stdout" || !text.includes("got:first")) return;
      const input = new PassThrough();
      const feed = cloudInputFeed(
        input,
        (line) => appendFile(file, line),
        (cause) => assert.fail(String(cause)),
      );
      input.end("second\n");
      await new Promise((resolve) => input.once("end", resolve));
      await new Promise((resolve) => setTimeout(resolve, 20));
      await feed.finish();
    },
  });
  const result = await pending;
  assert.equal(result.status, 4);
  assert.match(result.stdout, /got:first\ngot:second\neof/);
  assert.equal(cloudInputFrames(undefined), "");
});

test("the cloud input wrapper reports a missing program", async (t) => {
  const file = join(await repository(t), "input");
  await writeFile(file, "");
  const result = await executeProcess({
    executable: process.execPath,
    arguments: ["-e", cloudInputScript, file, "outpost-missing-program"],
  });
  assert.equal(result.status, 127);
});

test("the cloud input feed appends in order and stops after its first failure", async () => {
  const input = new PassThrough();
  const lines: string[] = [];
  const failures: unknown[] = [];
  const feed = cloudInputFeed(
    input,
    async (line) => {
      if (lines.length === 1) throw new Error("append failed");
      lines.push(line);
    },
    (cause) => failures.push(cause),
  );
  input.write("one");
  input.write("two");
  input.end("three");
  await new Promise((resolve) => input.once("end", resolve));
  await feed.finish();
  assert.deepEqual(lines, [`${Buffer.from("one").toString("base64")}\n`]);
  assert.equal(failures.length, 1);
});
