import assert from "node:assert/strict";
import { readdir, writeFile } from "node:fs/promises";
import { test } from "node:test";
import { createSandbox, diagnoseSandbox } from "../../src/index.ts";
import type { TransferOptions } from "../../src/domain/sandbox.types.ts";
import { local } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

test("owned sandbox diagnostics preserve ownership, exclusivity and reuse with optional binary probes", async (t) => {
  const root = await repository(t);
  const provider = local();
  let released = 0;
  let acquired = 0;
  const sandbox = await createSandbox({
    repository: root,
    provider: {
      ...provider,
      async acquire(context) {
        acquired++;
        const lease = await provider.acquire(context);
        return {
          ...lease,
          async release() {
            released++;
            await lease.release();
          },
        };
      },
    },
  });
  t.after(() => sandbox.close());
  const before = await readdir(sandbox.root);
  const pending = diagnoseSandbox(sandbox, { transfers: true });
  assert.throws(
    () => sandbox.command({ executable: "node", arguments: ["--version"] }),
    /active operation/,
  );
  const report = await pending;
  assert.equal(report.hasFailures, false, JSON.stringify(report));
  assert.deepEqual(report.provider, { name: "local", placement: "host" });
  assert.equal(report.ownership, "caller");
  assert.equal(
    report.capabilities.find((item) => item.id === "transfers")?.observed,
    "pass",
  );
  assert.deepEqual(await readdir(sandbox.root), before);
  assert.equal(acquired, 1);
  assert.equal(released, 0);
  assert.equal(
    (
      await sandbox.command({
        executable: "node",
        arguments: ["-e", "process.exitCode=9"],
      })
    ).status,
    9,
  );
  await sandbox.close();
  assert.equal(released, 1);
});

test("caller owned lease diagnostics are read-only by default and never release or allocate", async (t) => {
  const root = await repository(t);
  const lease = await local().acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => lease.release());
  const report = await diagnoseSandbox({
    ...lease,
    async upload() {
      assert.fail("unexpected upload");
    },
    async download() {
      assert.fail("unexpected download");
    },
    async release() {
      assert.fail("unexpected release");
    },
  });
  assert.equal(report.hasFailures, false);
  assert.equal(
    report.capabilities.find((item) => item.id === "transfers")?.observed,
    "unverified",
  );
  assert.equal(report.provider, undefined);
});

test("response loss after remote directory creation still cleans the unique probe directory", async (t) => {
  const root = await repository(t);
  const lease = await local().acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => lease.release());
  const before = await readdir(root);
  const controller = new AbortController();
  const report = await diagnoseSandbox(
    {
      ...lease,
      async invoke(command) {
        const result = await lease.invoke(command);
        if (command.arguments?.[1]?.includes("mkdirSync")) {
          controller.abort(new Error("lost creation response"));
          throw new Error("lost creation response");
        }
        return result;
      },
    },
    { transfers: true, signal: controller.signal },
  );
  assert.equal(report.hasFailures, true);
  assert.ok(
    report.checks.some(
      (check) =>
        check.id === "sandbox.transfers.cleanup" && check.status === "pass",
    ),
  );
  assert.deepEqual(await readdir(root), before);
  assert.equal(
    (await lease.invoke({ executable: "node", arguments: ["--version"] }))
      .status,
    0,
  );
});

test("deadline stops an owned probe process while keeping the sandbox reusable", async (t) => {
  const root = await repository(t);
  const provider = local();
  const sandbox = await createSandbox({
    repository: root,
    provider: {
      ...provider,
      async acquire(context) {
        const lease = await provider.acquire(context);
        return {
          ...lease,
          invoke(command) {
            if (command.arguments?.[1]?.includes("outpost-stdout"))
              return lease.invoke({
                ...command,
                arguments: ["-e", "setInterval(() => {}, 1000)"],
              });
            return lease.invoke(command);
          },
        };
      },
    },
  });
  t.after(() => sandbox.close());
  const report = await sandbox.diagnose({ deadlineMs: 200 });
  assert.equal(report.capabilities[0]?.observed, "fail");
  assert.equal(
    (await sandbox.command({ executable: "node", arguments: ["--version"] }))
      .status,
    0,
  );
});

for (const direction of ["upload", "download"] as const) {
  test(`binary corruption during ${direction} fails the observed transfer probe and cleans files`, async (t) => {
    const root = await repository(t);
    const lease = await local().acquire({
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: {},
    });
    t.after(() => lease.release());
    const before = await readdir(root);
    const report = await diagnoseSandbox(
      {
        ...lease,
        async [direction](
          source: string,
          destination: string,
          options?: TransferOptions,
        ) {
          await lease[direction](source, destination, options);
          await writeFile(destination, "corrupt");
        },
      },
      { transfers: true },
    );
    assert.equal(
      report.capabilities.find((item) => item.id === "transfers")?.observed,
      "fail",
    );
    assert.ok(
      report.checks.some(
        (check) =>
          check.id === "sandbox.transfers.cleanup" && check.status === "pass",
      ),
    );
    assert.deepEqual(await readdir(root), before);
  });
}
