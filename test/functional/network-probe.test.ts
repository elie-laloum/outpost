import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:net";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { networkProbeScript } from "../fixtures/network-probe.constants.ts";

test("network probes do not confuse a proxy TCP handshake with destination access", async (t) => {
  let accepted = false;
  const server = createServer((socket) => {
    accepted = true;
    socket.on("error", () => {});
    socket.resume();
    t.after(() => socket.destroy());
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const result = await executeProcess({
    executable: process.execPath,
    arguments: [
      "-e",
      networkProbeScript,
      JSON.stringify({ host: "127.0.0.1", port: address.port, timeoutMs: 100 }),
    ],
    deadlineMs: 5000,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(accepted, true);
  assert.deepEqual(JSON.parse(result.stdout), { outcome: "blocked" });
});
