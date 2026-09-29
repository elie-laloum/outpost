import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, posix } from "node:path";
import { test } from "node:test";
import { conversations } from "../../src/index.ts";

const { projectKey } = conversations;
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

test("deprecated format-keyed conversation helpers delegate to the native stores", async (t) => {
  const root = await repository(t),
    home = join(root, "home"),
    remote = join(root, "remote");
  await mkdir(remote);
  const id = "legacy-conversation",
    folder = join(home, ".claude", "projects", projectKey(root));
  await mkdir(folder, { recursive: true });
  const native = JSON.stringify({ cwd: root, text: "kept" }) + "\n";
  await writeFile(join(folder, `${id}.jsonl`), native);

  assert.equal(conversations.native("kimi").format, "kimi");
  assert.throws(() => conversations.native("gemini"), /Unsupported/);
  assert.equal(conversations.directory("claude", root, home), folder);
  assert.equal(
    conversations.directory("kimi", root),
    join(root, ".outpost", "conversations", "kimi"),
  );
  assert.equal(
    conversations.claudePath(id, root, home),
    join(folder, `${id}.jsonl`),
  );

  const base = await createLocalSandboxProvider().acquire({
    repository: root,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => base.release());
  const lease = { ...base, home: join(root, "remote-home") };
  const staging = join(root, "stage");
  const found = await conversations.locate("claude", id, root, home);
  assert.equal(found.file, join(folder, `${id}.jsonl`));
  await conversations.restore(found, lease, staging);
  const destination = conversations.destination(
    "claude",
    id,
    lease,
    found.file,
  );
  assert.equal(
    destination,
    posix.join(
      lease.home,
      ".claude",
      "projects",
      projectKey(lease.root),
      `${id}.jsonl`,
    ),
  );
  assert.equal(JSON.parse(await readFile(destination, "utf8")).cwd, lease.root);
  const captured = await conversations.capture(
    "claude",
    id,
    root,
    lease,
    staging,
    { home, local: true },
  );
  assert.equal(captured.file, found.file);
  assert.equal(JSON.parse(await readFile(captured.file, "utf8")).text, "kept");
});
