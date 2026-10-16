import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createLocalTransport } from "../../src/infrastructure/local-transport.ts";
import {
  archiveFiles,
  restoreArchiveFiles,
} from "../../src/infrastructure/transport-archive.ts";
import { repository } from "../helpers.ts";

test("Git metadata requires explicit archive permission and never permits destination traversal", async (t) => {
  const root = await repository(t);
  const transport = createLocalTransport({ directory: join(root, "store") });
  const source = join(root, "source");
  await mkdir(join(source, "dependency", ".git"), { recursive: true });
  await writeFile(
    join(source, "dependency", ".git", "config"),
    "git dependency",
  );
  const paths = ["dependency/.git/config"];
  await assert.rejects(
    archiveFiles(transport, source, paths, "denied"),
    /Unsafe workspace path/,
  );
  const reference = await archiveFiles(
    transport,
    source,
    paths,
    "allowed",
    undefined,
    { allowGitMetadata: true },
  );
  await assert.rejects(
    restoreArchiveFiles(transport, reference, join(root, "denied")),
    /Unsafe workspace path/,
  );
  await restoreArchiveFiles(
    transport,
    reference,
    join(root, "restored"),
    undefined,
    { allowGitMetadata: true },
  );
  assert.equal(
    await readFile(join(root, "restored", ...paths), "utf8"),
    "git dependency",
  );
  const manifest = JSON.parse(
    Buffer.from((await transport.read(reference.key))!.bytes).toString(),
  );
  for (const path of [
    "../escape",
    "/escape",
    "C:\\escape",
    "C:escape",
    "dependency/../../escape",
    "dependency\\..\\..\\escape",
  ]) {
    manifest.files[0].path = path;
    const malicious = await transport.write(
      "malicious/" + Buffer.from(path).toString("hex"),
      Buffer.from(JSON.stringify(manifest)),
      { ifRevision: null },
    );
    await assert.rejects(
      restoreArchiveFiles(
        transport,
        malicious,
        join(root, "unsafe"),
        undefined,
        { allowGitMetadata: true },
      ),
      /Unsafe workspace path/,
    );
  }
});

test("failed archives remove only chunks created by that attempt", async (t) => {
  const root = await repository(t);
  const transport = createLocalTransport({
    directory: join(root, "archive-store"),
  });
  await writeFile(join(root, "first"), "content");
  await assert.rejects(
    archiveFiles(transport, root, ["first", "missing"], "failed"),
    /ENOENT/,
  );
  const entries = [];
  for await (const entry of transport.list("failed/")) entries.push(entry);
  assert.deepEqual(entries, []);
  const owned = await transport.write(
    "occupied/files/0/0",
    Buffer.from("other owner"),
    { ifRevision: null },
  );
  await assert.rejects(archiveFiles(transport, root, ["first"], "occupied"));
  assert.equal((await transport.read(owned.key))?.revision, owned.revision);
});
