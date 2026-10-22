import assert from "node:assert/strict";
import { test } from "node:test";
import { createRecipeZoneSandboxes } from "../../src/application/recipes/zone-sandboxes.ts";

function fixture(fail?: string) {
  const events: string[] = [];
  const zones = createRecipeZoneSandboxes<
    string,
    { name: string; close(): Promise<void> }
  >({
    async workspace(zone) {
      events.push(`open ${zone.workspace}`);
      return zone.workspace;
    },
    async sandbox(workspace, zone, switched) {
      events.push(
        `sandbox ${zone.sandbox} on ${workspace}${switched ? " after another" : ""}`,
      );
      if (zone.sandbox === fail) throw new Error(`cannot open ${fail}`);
      return {
        name: zone.sandbox,
        async close() {
          events.push(`close ${zone.sandbox}`);
        },
      };
    },
  });
  return { events, zones };
}

test("one sandbox stays open per workspace and is replaced when a task selects another", async () => {
  const { events, zones } = fixture();
  const a = { workspace: "workspace", sandbox: "sandboxes.a" };
  const b = { workspace: "workspace", sandbox: "sandboxes.b" };
  const side = { workspace: "workspaces.side", sandbox: "sandboxes.c" };
  assert.equal((await zones.acquire(a)).name, "sandboxes.a");
  assert.equal(await zones.acquire(a), await zones.acquire(a));
  assert.equal((await zones.acquire(side)).name, "sandboxes.c");
  assert.equal((await zones.acquire(b)).name, "sandboxes.b");
  assert.equal((await zones.acquire(a)).name, "sandboxes.a");
  assert.deepEqual(
    [...zones.workspaces.keys()],
    ["workspace", "workspaces.side"],
  );
  await zones.release();
  await zones.release();
  assert.deepEqual(events, [
    "open workspace",
    "sandbox sandboxes.a on workspace",
    "open workspaces.side",
    "sandbox sandboxes.c on workspaces.side",
    "close sandboxes.a",
    "sandbox sandboxes.b on workspace after another",
    "close sandboxes.b",
    "sandbox sandboxes.a on workspace after another",
    "close sandboxes.a",
    "close sandboxes.c",
  ]);
});

test("concurrent requests for one workspace open it once and switch in order", async () => {
  const { events, zones } = fixture();
  await Promise.all([
    zones.acquire({ workspace: "workspace", sandbox: "sandboxes.a" }),
    zones.acquire({ workspace: "workspace", sandbox: "sandboxes.b" }),
  ]);
  assert.deepEqual(events, [
    "open workspace",
    "sandbox sandboxes.a on workspace",
    "close sandboxes.a",
    "sandbox sandboxes.b on workspace after another",
  ]);
});

test("a sandbox that fails to open leaves its workspace usable by the next task", async () => {
  const { events, zones } = fixture("sandboxes.broken");
  await zones.acquire({ workspace: "workspace", sandbox: "sandboxes.a" });
  await assert.rejects(
    zones.acquire({ workspace: "workspace", sandbox: "sandboxes.broken" }),
    /cannot open sandboxes.broken/,
  );
  await zones.acquire({ workspace: "workspace", sandbox: "sandboxes.a" });
  await zones.release();
  assert.deepEqual(events, [
    "open workspace",
    "sandbox sandboxes.a on workspace",
    "close sandboxes.a",
    "sandbox sandboxes.broken on workspace after another",
    "sandbox sandboxes.a on workspace after another",
    "close sandboxes.a",
  ]);
});
