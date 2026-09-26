import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import type { HostCredential } from "../../src/domain/agent.types.ts";
import {
  parseJsonc,
  readHostCredential,
  resolveHostPath,
} from "../../src/infrastructure/host-credentials.ts";
import { HOST_CREDENTIAL_LIMIT } from "../../src/infrastructure/host-credentials.constants.ts";

async function temporary(t: { after(callback: () => unknown): void }) {
  const directory = await mkdtemp(join(tmpdir(), "outpost-credentials-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

const credential = (path: string): HostCredential => ({
  source: { path },
  destination: { file: ".tool/token" },
  login: "tool login",
  alternative: '{ usage: { variable: "TOOL_KEY" } }',
});

test("host credential paths expand the home directory and honor explicit home overrides", () => {
  assert.equal(
    resolveHostPath({ path: "~/.codex/auth.json" }, {}),
    join(homedir(), ".codex", "auth.json"),
  );
  const source = {
    path: "~/.codex/auth.json",
    home: { variable: "CODEX_HOME", path: "auth.json" },
  };
  assert.equal(
    resolveHostPath(source, { CODEX_HOME: "/profiles/codex" }),
    join(resolve("/profiles/codex"), "auth.json"),
  );
  assert.equal(
    resolveHostPath(source, { CODEX_HOME: "" }),
    join(homedir(), ".codex", "auth.json"),
  );
});

test("host credentials read regular files, apply their selector and explain missing logins", async (t) => {
  const directory = await temporary(t);
  const path = join(directory, "token");
  await writeFile(path, "secret-value");
  assert.equal(await readHostCredential(credential(path)), "secret-value");
  assert.equal(
    await readHostCredential({
      ...credential(path),
      select: (content) => content.toUpperCase(),
    }),
    "SECRET-VALUE",
  );
  await assert.rejects(
    readHostCredential(credential(join(directory, "missing"))),
    (error: Error) =>
      /Run tool login on the host/.test(error.message) &&
      /TOOL_KEY/.test(error.message) &&
      /never reads the system keychain/.test(error.message) &&
      !error.message.includes("secret-value"),
  );
  await assert.rejects(
    readHostCredential(credential(join(path, "nested"))),
    /were not found/,
  );
});

test("host credentials reject directories, links and oversized files", async (t) => {
  const directory = await temporary(t);
  await mkdir(join(directory, "folder"));
  await assert.rejects(
    readHostCredential(credential(join(directory, "folder"))),
    /regular file/,
  );
  const large = join(directory, "large");
  await writeFile(large, Buffer.alloc(HOST_CREDENTIAL_LIMIT + 1, 97));
  await assert.rejects(readHostCredential(credential(large)), /at most/);
  if (process.platform === "win32") return;
  const target = join(directory, "target");
  await writeFile(target, "secret-value");
  await symlink(target, join(directory, "link"));
  await assert.rejects(
    readHostCredential(credential(join(directory, "link"))),
    /not a link/,
  );
});

test("JSONC parsing removes comments and trailing commas outside strings", () => {
  assert.deepEqual(
    parseJsonc(`{
      // login state
      "url": "https://example.test/a//b", /* block */
      "text": "keep /* this */ and \\"quotes\\",}",
      "list": [1, 2,],
      "value": 1/**/,
    }`),
    {
      url: "https://example.test/a//b",
      text: 'keep /* this */ and "quotes",}',
      list: [1, 2],
      value: 1,
    },
  );
  assert.throws(() => parseJsonc("{ invalid"), SyntaxError);
});
