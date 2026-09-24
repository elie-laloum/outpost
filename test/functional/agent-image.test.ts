import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { agentVersions } from "../../src/providers/versions.constants.ts";

test("prebuilt image context pins inputs, locks supported agents and preserves UID/home recipes", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-image-inputs-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const base = `node:24-bookworm-slim@sha256:${"a".repeat(64)}`;
  const result = await executeProcess({
    executable: process.execPath,
    arguments: [
      "scripts/prepare-agent-image.mjs",
      directory,
      base,
      "20260901T000000Z",
    ],
  });
  assert.equal(result.status, 0, result.stderr);
  const recipe = await readFile(join(directory, "Dockerfile"), "utf8");
  assert.ok(recipe.startsWith(`FROM ${base}\n`));
  assert.match(
    recipe,
    /snapshot.debian.org\/archive\/debian\/20260901T000000Z/,
  );
  assert.match(recipe, /COPY package.json package-lock.json/);
  assert.match(recipe, /RUN npm ci .*--omit=dev/);
  assert.match(
    recipe,
    /ENV PATH=\/opt\/outpost\/agents\/node_modules\/.bin:\$PATH/,
  );
  assert.match(
    recipe,
    /chown "\$AGENT_UID:\$AGENT_GID" \/home\/agent && chmod 700/,
  );
  assert.match(recipe, /USER \$AGENT_UID:\$AGENT_GID/);
  const manifest = JSON.parse(
    await readFile(join(directory, "package.json"), "utf8"),
  );
  assert.deepEqual(manifest.allowScripts, {
    "@anthropic-ai/claude-code": true,
  });
  const lock = JSON.parse(
    await readFile(join(directory, "package-lock.json"), "utf8"),
  );
  for (const [name, version] of Object.entries({
    "@google/gemini-cli": agentVersions.gemini,
    "@openai/codex": agentVersions.codex,
    "@anthropic-ai/claude-code": agentVersions.claude,
  })) {
    assert.equal(lock.packages[""].dependencies[name], version);
    assert.equal(lock.packages[`node_modules/${name}`].version, version);
    assert.match(lock.packages[`node_modules/${name}`].integrity, /^sha512-/);
  }
  assert.equal(
    await readFile(join(directory, ".dockerignore"), "utf8"),
    "*\n!Dockerfile\n!package.json\n!package-lock.json\n",
  );
  for (const [badBase, snapshot] of [
    ["node:24", "20260901T000000Z"],
    [base, "latest"],
    [base, "20260901T000000Z; echo bad"],
  ]) {
    const invalid = await executeProcess({
      executable: process.execPath,
      arguments: [
        resolve("scripts/prepare-agent-image.mjs"),
        directory,
        badBase!,
        snapshot!,
      ],
    });
    assert.notEqual(invalid.status, 0);
    assert.match(invalid.stderr, /Usage:/);
  }
});
