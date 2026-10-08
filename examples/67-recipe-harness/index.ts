// Configure the Outpost harness, a model provider, tools, permissions and a JSON response entirely in YAML.
// Build Outpost, then run with Node.js 24+ and Git; a local HTTP fixture answers without credentials or paid calls.

import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:http";
import { once } from "node:events";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const execute = promisify(execFile);

test("a YAML harness validates a streamed JSON verdict", async (t) => {
  const repository = await mkdtemp(join(tmpdir(), "outpost-recipe-harness-"));
  t.after(() => rm(repository, { recursive: true, force: true }));
  const received: unknown[] = [];
  const server = createServer(async (request, response) => {
    let body = "";
    for await (const chunk of request) body += String(chunk);
    received.push(JSON.parse(body));
    response.writeHead(200, { "content-type": "text/event-stream" });
    response.end(
      `data: ${JSON.stringify({ choices: [{ delta: { content: '<verdict>{"approved":true}</verdict>' }, finish_reason: "stop" }], usage: { prompt_tokens: 5, completion_tokens: 3, total_tokens: 8 } })}\n\ndata: [DONE]\n\n`,
    );
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(
    () =>
      new Promise<void>((done, reject) =>
        server.close((error) => (error ? reject(error) : done())),
      ),
  );
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const git = (...args: string[]) => execute("git", args, { cwd: repository });
  await git("init", "-b", "main");
  await git("config", "user.name", "Outpost example");
  await git("config", "user.email", "example@example.invalid");
  await writeFile(join(repository, "initial"), "initial");
  await git("add", ".");
  await git("commit", "-m", "Initial");
  const configuration = await readFile(
    new URL("./outpost.yaml", import.meta.url),
    "utf8",
  );
  const config = join(repository, "outpost.yaml");
  await writeFile(
    config,
    configuration
      .replace("repository: ../..", "repository: .")
      .replace(":9999/v1", `:${address.port}/v1`),
  );
  const result = await execute(process.execPath, [
    resolve(import.meta.dirname, "../../dist/cli/main.js"),
    "recipe",
    "run",
    "--file",
    resolve(import.meta.dirname, "recipe.yaml"),
    "--config",
    config,
  ]);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, "done");
  assert.match(report.outputs.review.text, /approved/);
  assert.equal(report.usage.tokens.input, 5);
  assert.equal(report.usage.tokens.output, 3);
  assert.equal(received.length, 1);
  assert.equal(result.stderr, "");
});
