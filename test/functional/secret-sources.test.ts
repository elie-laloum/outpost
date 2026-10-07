import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { createSandbox, fromSecrets, OutpostError } from "../../src/index.ts";
import { createVaultSecretSource } from "../../src/adapters/secrets/vault.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

test("Vault/OpenBao KV v2 reads a declared document once, filters fields and delivers variables without an env file", async (t) => {
  const root = await repository(t);
  const calls: string[] = [];
  const server = createServer((request, response) => {
    calls.push(request.url ?? "");
    assert.equal(request.headers["x-vault-token"], "host-only-token");
    assert.equal(request.headers["x-vault-request"], "true");
    assert.equal(request.headers["x-vault-namespace"], "team");
    response.setHeader("Content-Type", "application/json");
    response.end(
      JSON.stringify({
        data: {
          data: {
            OPENAI_API_KEY: "selected-key",
            UNDECLARED_KEY: "private-key",
          },
          metadata: { version: 3 },
        },
      }),
    );
  });
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const source = createVaultSecretSource({
    address: `http://127.0.0.1:${address.port}`,
    token: "host-only-token",
    mount: "kv",
    path: "outpost/production keys",
    version: 3,
    namespace: "team",
  });
  assert.deepEqual(await source.resolve([]), {});
  assert.equal(calls.length, 0);
  const variables = await fromSecrets(source, ["OPENAI_API_KEY"]);
  assert.deepEqual(variables, { OPENAI_API_KEY: "selected-key" });
  assert.deepEqual(calls, ["/v1/kv/data/outpost/production%20keys?version=3"]);
  const before = await readdir(root);
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider: createLocalSandboxProvider({ variables }),
    logging: false,
  });
  const command = await sandbox.command({
    executable: process.execPath,
    arguments: [
      "-e",
      "if(process.env.OPENAI_API_KEY!=='selected-key'||process.env.UNDECLARED_KEY||process.env.VAULT_TOKEN==='host-only-token')process.exit(7);console.log('selected variables available');",
    ],
  });
  assert.equal(command.status, 0);
  assert.equal(command.stdout.trim(), "selected variables available");
  assert.deepEqual(
    (await readdir(root)).filter((name) => !name.startsWith(".outpost")),
    before,
  );
  await assert.rejects(access(join(root, ".outpost", ".env")));
  assert.equal(await readFile(join(root, "base.txt"), "utf8"), "base\n");
  await assert.rejects(
    fromSecrets(source, ["MISSING"]),
    /Missing declared secret: MISSING/,
  );
});

test("Vault refuses malformed, oversized, redirected and failed reads without echoing HTTP bodies", async (t) => {
  let mode = "ok";
  let redirectedReads = 0;
  const server = createServer((request, response) => {
    if (request.url === "/redirected") {
      redirectedReads++;
      response.end("must not read");
      return;
    }
    if (mode === "hang") return;
    if (mode === "redirect") {
      response.writeHead(302, { Location: "/redirected" });
      response.end();
      return;
    }
    if (mode === "denied") {
      response.writeHead(403);
      response.end("private-token-in-error");
      return;
    }
    if (mode === "no-body") {
      response.writeHead(204);
      response.end();
      return;
    }
    if (mode === "broken") {
      response.end("private-token-invalid-json");
      return;
    }
    if (mode === "oversized") {
      response.end('"' + "x".repeat(2_097_153) + '"');
      return;
    }
    if (mode === "invalid-utf8") {
      response.end(
        Buffer.concat([
          Buffer.from('{"data":{"data":{"KEY":"'),
          Buffer.from([0xff]),
          Buffer.from('"}}}'),
        ]),
      );
      return;
    }
    if (mode === "invalid") {
      response.end('{"data":{"data":[]}}');
      return;
    }
    response.end('{"data":{"data":{"KEY":"value"}}}');
  });
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const source = createVaultSecretSource({
    address: `http://127.0.0.1:${address.port}`,
    token: "fixture",
    mount: "kv",
    path: "outpost",
  });
  for (const next of [
    "denied",
    "no-body",
    "broken",
    "invalid-utf8",
    "oversized",
    "invalid",
    "redirect",
  ]) {
    mode = next;
    await assert.rejects(fromSecrets(source, ["KEY"]), (error) => {
      assert.ok(error instanceof OutpostError);
      assert.equal(error.code, "provider");
      assert.equal(String(error).includes("private-token"), false);
      assert.equal(error.cause, undefined);
      return true;
    });
  }
  assert.equal(redirectedReads, 0);
  mode = "hang";
  await assert.rejects(
    fromSecrets(source, ["KEY"], { timeoutMs: 20 }),
    (error) => error instanceof OutpostError && error.code === "timeout",
  );
  mode = "ok";
  assert.deepEqual(await fromSecrets(source, ["KEY"]), { KEY: "value" });
});
