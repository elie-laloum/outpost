import assert from "node:assert/strict";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout } from "node:timers/promises";
import { test } from "node:test";
import { openBrowser } from "../../src/infrastructure/browser.ts";

test(
  "the browser launcher falls back to the next available opener",
  { skip: process.platform !== "linux" },
  async (t) => {
    const directory = await mkdtemp(join(tmpdir(), "outpost-browser-"));
    const path = process.env.PATH;
    t.after(async () => {
      process.env.PATH = path;
      await rm(directory, { recursive: true, force: true });
    });
    const opened = join(directory, "opened.txt");
    await writeFile(
      join(directory, "xdg-open"),
      `#!/bin/sh\nprintf '%s' "$1" > "${opened}"\n`,
    );
    await chmod(join(directory, "xdg-open"), 0o755);
    process.env.PATH = directory;
    openBrowser("http://127.0.0.1:1/#token=x");
    for (let attempt = 0; attempt < 100; attempt++) {
      const text = await readFile(opened, "utf8").catch(() => "");
      if (text) {
        assert.equal(text, "http://127.0.0.1:1/#token=x");
        return;
      }
      await setTimeout(20);
    }
    assert.fail("xdg-open was not launched");
  },
);
