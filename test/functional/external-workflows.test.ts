import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { isolatedTask, workflow } from "../../src/index.ts";
import { local } from "../../src/providers/local.ts";
import { emit, repository, scripted } from "../helpers.ts";

test("one workflow coordinates commits in two external repositories", async (t) => {
  const backendRepository = await repository(t);
  const frontendRepository = await repository(t);
  const change = (file: string) =>
    scripted(
      (input) => `
    import { writeFileSync } from 'node:fs';
    import { execFileSync } from 'node:child_process';
    writeFileSync(${JSON.stringify(file)}, ${JSON.stringify(input.text)});
    execFileSync('git', ['add', ${JSON.stringify(file)}]);
    execFileSync('git', ['commit', '-m', 'Workflow change']);
    ${emit("<outpost>done</outpost>")}
  `,
    );
  const backend = isolatedTask({
    key: "backend",
    request: () => ({
      repository: backendRepository,
      provider: local(),
      agent: change("backend.txt"),
      branch: { mode: "integrate" },
      brief: { text: "Backend change" },
    }),
  });
  const frontend = isolatedTask({
    key: "frontend",
    after: [backend],
    request: (context) => ({
      repository: frontendRepository,
      provider: local(),
      agent: change("frontend.txt"),
      branch: { mode: "integrate" },
      brief: { text: `Adapt to ${context.value(backend).commits[0]!.oid}` },
    }),
  });
  const result = await workflow("external-repositories", [
    backend,
    frontend,
  ]).start();
  result.unwrap();
  assert.equal(
    await readFile(join(backendRepository, "backend.txt"), "utf8"),
    "Backend change",
  );
  assert.equal(
    await readFile(join(frontendRepository, "frontend.txt"), "utf8"),
    `Adapt to ${result.value(backend).commits[0]!.oid}`,
  );
  await assert.rejects(readFile(join(backendRepository, "frontend.txt")), {
    code: "ENOENT",
  });
  await assert.rejects(readFile(join(frontendRepository, "backend.txt")), {
    code: "ENOENT",
  });
  assert.equal(result.value(frontend).commits.length, 1);
});
