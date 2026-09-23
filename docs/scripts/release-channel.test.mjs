import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const script = new URL("./release-channel.mjs", import.meta.url).href;
async function decision(tag, releases) {
  const directory = await mkdtemp(join(tmpdir(), "outpost-docs-release-"));
  const output = join(directory, "output");
  try {
    const code = `globalThis.fetch = async () => ({ok:true,json:async()=>${JSON.stringify(releases)}}); await import(${JSON.stringify(script)});`;
    execFileSync(process.execPath, ["--input-type=module", "-e", code], {
      env: {
        ...process.env,
        GITHUB_REF_NAME: tag,
        GITHUB_REPOSITORY: "example/project",
        GITHUB_OUTPUT: output,
        GH_TOKEN: "fixture",
      },
      stdio: "pipe",
      timeout: 10_000,
    });
    return (await readFile(output, "utf8")).trim();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
const release = (tag_name, extra = {}) => ({
  tag_name,
  draft: false,
  prerelease: false,
  ...extra,
});
test("publishes the highest stable semantic version regardless of API order", async () => {
  assert.equal(
    await decision("v1.10.0", [release("v1.9.9"), release("v1.10.0")]),
    "deploy=true",
  );
});
test("an older release cannot replace current documentation", async () => {
  assert.equal(
    await decision("v1.9.9", [release("v1.9.9"), release("v1.10.0")]),
    "deploy=false",
  );
});
test("drafts and prereleases do not replace stable docs", async () => {
  const releases = [
    release("v2.0.0", { draft: true }),
    release("v2.0.0-rc.1", { prerelease: true }),
    release("v1.1.3"),
  ];
  assert.equal(await decision("v1.1.3", releases), "deploy=true");
  assert.equal(await decision("v2.0.0-rc.1", releases), "deploy=false");
});
test("main never deploys", async () => {
  assert.equal(await decision("main", [release("v1.1.3")]), "deploy=false");
});
