import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { docker } from "../../src/providers/docker.ts";
import { podman } from "../../src/providers/podman.ts";

assert.ok(process.stdin.isTTY, "Run this fixture inside a pseudo-terminal");
const root = await mkdtemp(join(tmpdir(), "outpost-terminal-"));
const factory =
  process.env.OUTPOST_CONTAINER_ENGINE === "podman" ? podman : docker;
const lease = await factory({
  image: "outpost-ci:latest",
  networks: "none",
  ...(process.env.OUTPOST_ISOLATED_REPOSITORY
    ? { repositoryMode: "isolated" as const }
    : {}),
}).acquire({
  repository: root,
  directory: root,
  gitDirectories: [],
  variables: {},
});
try {
  const result = await lease.invoke({
    executable: "sh",
    arguments: [
      "-c",
      'test -t 0 && test -t 1 || exit 2; read value; test "$value" = hello || exit 3; exit 7',
    ],
    interactive: true,
  });
  assert.equal(result.status, 7);
  await assert.rejects(
    lease.invoke({
      executable: "sleep",
      arguments: ["30"],
      interactive: true,
      deadlineMs: 500,
    }),
  );
  assert.equal((await lease.invoke({ executable: "true" })).status, 0);
  console.log(
    "Interactive input, exit status, cancellation and warm reuse passed",
  );
} finally {
  await lease.release();
  await rm(root, { recursive: true, force: true });
}
