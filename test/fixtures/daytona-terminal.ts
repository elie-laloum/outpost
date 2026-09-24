import assert from "node:assert/strict";
import { PassThrough, Writable } from "node:stream";
import { daytona } from "../../src/providers/daytona.ts";

if (process.env.OUTPOST_DAYTONA_TERMINAL !== "1")
  throw new Error(
    "Set OUTPOST_DAYTONA_TERMINAL=1 to allocate a billable Daytona sandbox",
  );
const apiKey = process.env.DAYTONA_API_KEY;
if (!apiKey) throw new Error("Set DAYTONA_API_KEY");
const lease = await daytona({
  connection: { apiKey },
  create: {
    language: "typescript",
    autoStopInterval: 5,
    autoDeleteInterval: 0,
  },
}).acquire({
  repository: process.cwd(),
  directory: process.cwd(),
  gitDirectories: [],
  variables: {},
});
const input = new PassThrough();
const output = Object.assign(
  new Writable({
    write(_chunk, _encoding, done) {
      done();
    },
  }),
  { columns: 91, rows: 31 },
);
try {
  let entered = false;
  const pending = lease.invoke({
    executable: "sh",
    arguments: [
      "-c",
      'test -t 0 && test -t 1 || exit 2; stty size; printf "READY\\n"; read value; test "$value" = hello || exit 3; stty size; exec 1>&- 2>&-; sleep .2; exit 7',
    ],
    interactive: true,
    terminal: { input, output },
    deadlineMs: 30_000,
    observe(_channel, text) {
      if (!entered && text.includes("READY")) {
        entered = true;
        output.columns = 110;
        output.rows = 40;
        output.emit("resize");
        setTimeout(() => input.write("hello\n"), 500);
      }
    },
  });
  const result = await pending;
  assert.equal(result.status, 7);
  assert.match(result.stdout, /31 91/);
  assert.match(result.stdout, /40 110/);
  const stop = new AbortController();
  const running = lease.invoke({
    executable: "sh",
    arguments: ["-c", "sleep 60 & echo $! > /tmp/outpost-terminal-child; wait"],
    interactive: true,
    terminal: { input, output },
    signal: stop.signal,
    deadlineMs: 30_000,
  });
  await new Promise((resolve) => setTimeout(resolve, 2_000));
  stop.abort(new Error("fixture cancellation"));
  await assert.rejects(running, /fixture cancellation/);
  assert.equal(
    (
      await lease.invoke({
        executable: "sh",
        arguments: [
          "-c",
          'p=$(cat /tmp/outpost-terminal-child); ! kill -0 "$p" 2>/dev/null || test "$(ps -o stat= -p "$p" | cut -c1)" = Z',
        ],
      })
    ).status,
    0,
  );
  assert.equal((await lease.invoke({ executable: "true" })).status, 0);
  console.log(
    "Live Daytona PTY input, resize, late exit, descendants and reuse passed",
  );
} finally {
  input.destroy();
  await lease.release();
}
