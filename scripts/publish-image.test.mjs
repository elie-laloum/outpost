import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const script = fileURLToPath(new URL("./publish-image.sh", import.meta.url));
const digest = `sha256:${"a".repeat(64)}`;

async function publish(t, variables = {}) {
  const root = await mkdtemp(join(tmpdir(), "outpost-image-publication-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const bin = join(root, "bin");
  await mkdir(bin);
  await writeFile(join(root, "package.json"), '{"version":"1.2.3"}');
  await writeFile(join(root, "outputs"), "");
  await writeFile(
    join(bin, "docker"),
    `#!/usr/bin/env bash
set -eu
echo "$*" >> "$PUBLICATION_TEST_ROOT/commands"
stage=""
if [[ "$1" == push && "$2" == *-arm64 ]]; then stage=push; fi
if [[ "$*" == 'buildx imagetools create '* ]]; then stage=manifest; fi
if [[ -n "$stage" ]]; then
  counter="$PUBLICATION_TEST_ROOT/$stage-count"
  count=0
  if [[ -f "$counter" ]]; then count=$(cat "$counter"); fi
  count=$((count + 1))
  echo "$count" > "$counter"
  if [[ "$stage" == "$FAIL_STAGE" ]] && (( count <= FAIL_COUNT )); then
    echo 'unknown blob' >&2
    exit 42
  fi
fi
if [[ "$*" == 'buildx imagetools inspect '* ]]; then
  echo "$TEST_DIGEST"
fi
`,
    { mode: 0o700 },
  );
  await writeFile(
    join(bin, "sleep"),
    '#!/usr/bin/env bash\necho "$1" >> "$PUBLICATION_TEST_ROOT/delays"\n',
    { mode: 0o700 },
  );
  const result = spawnSync("bash", [script], {
    cwd: root,
    encoding: "utf8",
    timeout: 10_000,
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      PUBLICATION_TEST_ROOT: root,
      REPOSITORY: "Owner/Repository",
      NAME: "codex",
      RUNNER_TEMP: root,
      GITHUB_SHA: "commit",
      GITHUB_RUN_ID: "123",
      GITHUB_RUN_ATTEMPT: "1",
      GITHUB_OUTPUT: join(root, "outputs"),
      FAIL_STAGE: "",
      FAIL_COUNT: "0",
      TEST_DIGEST: digest,
      ...variables,
    },
  });
  assert.ifError(result.error);
  return {
    ...result,
    commands: (await readFile(join(root, "commands"), "utf8"))
      .trim()
      .split("\n"),
    outputs: await readFile(join(root, "outputs"), "utf8"),
    delays: await readFile(join(root, "delays"), "utf8").catch(() => ""),
  };
}

test("an unknown blob retries the same ARM64 image without reloading or rebuilding", async (t) => {
  const result = await publish(t, { FAIL_STAGE: "push", FAIL_COUNT: "1" });
  assert.equal(result.status, 0, result.stderr);
  const pushes = result.commands.filter((command) =>
    command.startsWith("push "),
  );
  assert.equal(pushes.length, 3);
  assert.equal(pushes[1], pushes[2]);
  assert.equal(
    result.commands.filter((command) => command.startsWith("load ")).length,
    2,
  );
  assert.equal(result.delays, "5\n");
  assert.equal(
    result.outputs,
    `image=ghcr.io/owner/repository/codex\ndigest=${digest}\n`,
  );
});

test("manifest publication retries after both architecture pushes succeed", async (t) => {
  const result = await publish(t, { FAIL_STAGE: "manifest", FAIL_COUNT: "2" });
  assert.equal(result.status, 0, result.stderr);
  const manifests = result.commands.filter((command) =>
    command.startsWith("buildx imagetools create "),
  );
  assert.equal(manifests.length, 3);
  assert.equal(new Set(manifests).size, 1);
  assert.equal(
    result.commands.filter((command) => command.startsWith("push ")).length,
    2,
  );
  assert.equal(result.delays, "5\n10\n");
});

test("persistent push failure preserves its exit code and prevents manifest and attestation outputs", async (t) => {
  const result = await publish(t, { FAIL_STAGE: "push", FAIL_COUNT: "3" });
  assert.equal(result.status, 42);
  assert.equal(
    result.commands.filter((command) => command.startsWith("push ")).length,
    4,
  );
  assert.ok(!result.commands.some((command) => command.startsWith("buildx ")));
  assert.equal(result.delays, "5\n10\n");
  assert.equal(result.outputs, "");
});

test("invalid remote digests never become attestation outputs", async (t) => {
  const result = await publish(t, { TEST_DIGEST: "invalid" });
  assert.notEqual(result.status, 0);
  assert.equal(result.outputs, "");
});
