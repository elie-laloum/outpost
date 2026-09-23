import { test } from "node:test";
import assert from "node:assert/strict";
import { PassThrough, Readable, Writable } from "node:stream";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { repository } from "../helpers.ts";
import { binaryExecutor } from "../../src/infrastructure/binary-process.ts";

test("binary transport preserves all bytes beyond text retention and waits for the sink", async () => {
  const bytes = Buffer.alloc(2_000_000);
  for (let index = 0; index < bytes.length; index++) bytes[index] = index % 256;
  const chunks: Buffer[] = [];
  const output = new Writable({
    write(chunk, _encoding, done) {
      chunks.push(Buffer.from(chunk));
      setImmediate(done);
    },
  });
  const result = await binaryExecutor({
    input: Readable.from([bytes]),
    output,
  })({
    executable: process.execPath,
    arguments: ["-e", "process.stdin.pipe(process.stdout)"],
  });
  assert.equal(result.status, 0);
  assert.equal(result.stdout, "");
  assert.deepEqual(Buffer.concat(chunks), bytes);
});

test("binary transport reports process failures, drains unused output and rejects missing executables", async () => {
  await assert.rejects(
    binaryExecutor({})({
      executable: process.execPath,
      arguments: ["-e", "console.error('failure');process.exit(7)"],
    }),
    /status 7/,
  );
  assert.equal(
    (
      await binaryExecutor({})({
        executable: process.execPath,
        arguments: ["-e", "process.stdout.write(Buffer.alloc(200000))"],
      })
    ).status,
    0,
  );
  await assert.rejects(
    binaryExecutor({})({ executable: "outpost-missing-binary" }),
    /ENOENT/,
  );
});

test("binary transport cancels blocked processes and failed streams", async () => {
  await assert.rejects(
    binaryExecutor({})({
      executable: process.execPath,
      arguments: ["-e", "setTimeout(()=>{},60000)"],
      deadlineMs: 100,
    }),
    /timed out/,
  );
  await assert.rejects(
    binaryExecutor({})({
      executable: process.execPath,
      signal: AbortSignal.abort(new Error("cancelled")),
    }),
    /cancelled/,
  );
  const output = new Writable({
    write(_chunk, _encoding, done) {
      done(new Error("disk failure"));
    },
  });
  await assert.rejects(
    binaryExecutor({ output })({
      executable: process.execPath,
      arguments: [
        "-e",
        "process.stdout.write(Buffer.alloc(200000));setTimeout(()=>{},60000)",
      ],
      deadlineMs: 5000,
    }),
    /disk failure/,
  );
  const input = new Readable({
    read() {
      this.destroy(new Error("input failure"));
    },
  });
  await assert.rejects(
    binaryExecutor({ input })({
      executable: process.execPath,
      arguments: ["-e", "process.stdin.resume()"],
    }),
    /input failure/,
  );
});

test("native tar interoperates across host platforms with binary names and contents", async (t) => {
  const root = await repository(t);
  const input = join(root, "input");
  const output = join(root, "output");
  await mkdir(input);
  await mkdir(output);
  const bytes = Buffer.from([0, 255, 128, 10, 13]);
  const name = "résultat with spaces.bin";
  await writeFile(join(input, name), bytes);
  const pipe = new PassThrough();
  await Promise.all([
    binaryExecutor({ output: pipe })({
      executable: "tar",
      arguments: ["-cf", "-", "-C", input, "--", name],
    }),
    binaryExecutor({ input: pipe })({
      executable: "tar",
      arguments: [
        "-xpf",
        "-",
        "--ignore-zeros",
        "--no-same-owner",
        "-C",
        output,
      ],
    }),
  ]);
  assert.deepEqual(await readFile(join(output, name)), bytes);
});
