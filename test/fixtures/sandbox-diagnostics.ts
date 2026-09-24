import assert from "node:assert/strict";
import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createSandbox,
  diagnoseAgentProtocol,
  diagnoseSandbox,
} from "../../src/index.ts";
import { git } from "../../src/infrastructure/git/command.ts";
import { docker } from "../../src/providers/docker.ts";
import { local } from "../../src/providers/local.ts";
import { podman } from "../../src/providers/podman.ts";

const engine = process.env.OUTPOST_CONTAINER_ENGINE;
if (engine !== undefined && engine !== "docker" && engine !== "podman")
  throw new Error("OUTPOST_CONTAINER_ENGINE must be docker or podman when set");
const image = process.env.OUTPOST_CONTAINER_IMAGE ?? "outpost-ci:latest";
const provider = engine ? { docker, podman }[engine]({ image }) : local();
const directory = await realpath(
  await mkdtemp(join(tmpdir(), "outpost-owned-diagnostics-")),
);
let cleanupSafe = true;
try {
  await git(directory, ["init", "-b", "main"]);
  await git(directory, ["config", "user.name", "Diagnostics Demo"]);
  await git(directory, ["config", "user.email", "demo@example.test"]);
  await writeFile(join(directory, "example.txt"), "temporary fixture\n");
  await git(directory, ["add", "example.txt"]);
  await git(directory, ["commit", "-m", "Initial"]);
  cleanupSafe = false;
  const sandbox = await createSandbox({ repository: directory, provider });
  try {
    const report = await diagnoseSandbox(sandbox, { transfers: true });
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    assert.equal(report.hasFailures, false);
    const command = await sandbox.command({
      executable: "node",
      arguments: ["-e", "process.stdout.write('reused'); process.exitCode=7"],
      deadlineMs: 5000,
    });
    assert.equal(command.stdout, "reused");
    assert.equal(command.status, 7);
    for (const agent of ["codex", "claude"] as const) {
      const protocol = diagnoseAgentProtocol(agent);
      assert.equal(protocol.hasFailures, false);
      console.log(
        `${agent}: bundled protocol fixtures passed; installed CLI and model remain ${protocol.modelCompatibility}.`,
      );
    }
    console.log("Owned sandbox reused after diagnostics; no model calls made.");
  } finally {
    await sandbox.close();
    cleanupSafe = true;
  }
} finally {
  if (cleanupSafe)
    await rm(directory, { recursive: true, force: true, maxRetries: 5 });
  if (!cleanupSafe)
    console.error(
      `Sandbox cleanup unconfirmed; temporary repository retained at ${directory}.`,
    );
}
