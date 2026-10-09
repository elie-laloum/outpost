import assert from "node:assert/strict";
import test from "node:test";
import { once } from "node:events";
import { createApp } from "../src/app.ts";

test("health, greetings, missing routes and methods", async (t) => {
  const server = createApp();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(
    () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  );
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const base = `http://127.0.0.1:${address.port}`;
  assert.deepEqual(await (await fetch(base + "/health")).json(), {
    status: "ok",
  });
  assert.deepEqual(await (await fetch(base + "/hello?name=Jean")).json(), {
    message: "Hello, Jean!",
  });
  assert.deepEqual(await (await fetch(base + "/hello")).json(), {
    message: "Hello, world!",
  });
  assert.equal((await fetch(base + "/missing")).status, 404);
  assert.equal((await fetch(base + "/hello", { method: "POST" })).status, 405);
});
