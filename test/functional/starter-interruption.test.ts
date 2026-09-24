import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { initialize } from "../../src/cli/scaffold.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { emit, repository } from "../helpers.ts";

for (const signal of ["SIGINT", "SIGTERM", undefined] as const) {
  test(`generated starter handles ${signal ?? "agent failure"} without hiding failures`, async (t) => {
    const root = await repository(t);
    const folder = await mkdtemp(join(tmpdir(), "outpost-interruption-"));
    t.after(() => rm(folder, { recursive: true, force: true }));
    const initialized = await initialize({
      directory: folder,
      repository: root,
      provider: "local",
    });
    const bridge = join(folder, "bridge.mts");
    const script = signal
      ? `import { writeFileSync } from 'node:fs';
         writeFileSync('unfinished.txt', 'preserve this work');
         ${emit("ready to interrupt")}
         setInterval(() => {}, 1000);`
      : "process.exit(7);";
    await writeFile(
      bridge,
      `import { dispatch as run } from ${JSON.stringify(new URL("../../src/index.ts", import.meta.url).href)};
       export { OutpostError, reporter } from ${JSON.stringify(new URL("../../src/index.ts", import.meta.url).href)};
       import { scripted } from ${JSON.stringify(new URL("../helpers.ts", import.meta.url).href)};
       export const codex = () => scripted(${JSON.stringify(script)});
       export const dispatch = (options) => run({
         ...options,
         observe(event) {
           options.observe?.(event);
           if (event.kind === 'text' && event.text === 'ready to interrupt') {
             if (process.platform === "win32") process.emit(${JSON.stringify(signal) ?? "undefined"});
             else process.kill(process.pid, ${JSON.stringify(signal) ?? "undefined"});
           }
         },
       });`,
    );
    const runner = initialized.files.find((file) =>
      /run\.(?:mjs|mts|ts)$/.test(file),
    )!;
    const source = (await readFile(runner, "utf8"))
      .replaceAll(
        '"@elie-laloum/outpost"',
        JSON.stringify(pathToFileURL(bridge).href),
      )
      .replace(
        '"@elie-laloum/outpost/providers/local"',
        JSON.stringify(
          new URL("../../src/providers/local.ts", import.meta.url).href,
        ),
      );
    await writeFile(runner, source);
    const output = await executeProcess({
      executable: process.execPath,
      arguments: [runner],
      directory: folder,
      deadlineMs: 15_000,
    });
    assert.match(output.stderr, /Preparing sandbox/);
    assert.match(output.stdout, /preparing prompt/);
    assert.match(output.stdout, /running/);
    if (signal) {
      assert.equal(
        output.status,
        signal === "SIGINT" ? 130 : 143,
        output.stderr,
      );
      assert.match(output.stdout, /ready to interrupt/);
      assert.match(output.stderr, /Cancelled\. Recovery details:/);
      assert.match(output.stderr, /branch:/);
      assert.match(output.stderr, /directory:/);
      assert.match(output.stderr, /log:/);
      assert.doesNotMatch(output.stderr, /OutpostError:|at file:/);
      const workspaces = join(root, ".outpost", "workspaces");
      const entries = await readdir(workspaces);
      assert.equal(entries.length, 1);
      assert.equal(
        await readFile(join(workspaces, entries[0]!, "unfinished.txt"), "utf8"),
        "preserve this work",
      );
    } else {
      assert.equal(output.status, 1);
      assert.match(output.stderr, /OutpostError:/);
      assert.doesNotMatch(output.stderr, /Cancelled/);
    }
    assert.deepEqual(await readdir(join(root, ".outpost", "locks")), [
      "resource-activity",
    ]);
    assert.deepEqual(
      await readdir(join(root, ".outpost", "locks", "resource-activity")),
      [],
    );
  });
}
