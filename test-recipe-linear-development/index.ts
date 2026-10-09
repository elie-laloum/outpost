// Check Linear authentication, private credential caching and the runnable TypeScript project without live services.
// Run with node --test; the actual development workflow starts with outpost recipe run and the two YAML files.

import assert from "node:assert/strict";
import test from "node:test";
import {
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
  symlink,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validatedLinearToken } from "./credentials.ts";
import { readLinearToken, saveLinearToken } from "./credential-store.ts";
import { createLinearClient } from "./linear-api.ts";
import "./repo/test/app.test.ts";

test("only verified keys are saved, cached keys are rechecked and rejected keys are replaced", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-linear-auth-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, ".private/key");
  const messages: string[] = [],
    checked: string[] = [],
    answers = ["bad-key", "good-key"];
  let accepted = "good-key",
    prompts = 0;
  const request: typeof fetch = async (_url, init) => {
    const key = new Headers(init?.headers).get("Authorization")!;
    checked.push(key);
    return key === accepted
      ? Response.json({ data: { viewer: { id: "viewer" } } })
      : Response.json({
          errors: [{ extensions: { code: "AUTHENTICATION_ERROR" } }],
        });
  };
  const dependencies = {
    fetch: request,
    environment: () => undefined,
    write: (message: string) => {
      messages.push(message);
    },
    async prompt() {
      prompts++;
      if (prompts === 2) assert.equal(await readLinearToken(file), undefined);
      return answers.shift();
    },
  };
  const signal = new AbortController().signal;
  assert.equal(
    await validatedLinearToken(file, signal, dependencies),
    "good-key",
  );
  assert.equal(await readFile(file, "utf8"), "good-key");
  assert.equal(prompts, 2);
  await validatedLinearToken(file, signal, dependencies);
  assert.equal(prompts, 2);
  accepted = "new-key";
  answers.push("new-key");
  await validatedLinearToken(file, signal, dependencies);
  assert.deepEqual(checked, [
    "bad-key",
    "good-key",
    "good-key",
    "good-key",
    "new-key",
  ]);
  assert.equal(await readFile(file, "utf8"), "new-key");
  assert.doesNotMatch(messages.join(""), /bad-key|good-key|new-key/);
  if (process.platform !== "win32") {
    assert.equal((await stat(file)).mode & 0o777, 0o600);
    assert.equal((await stat(join(directory, ".private"))).mode & 0o777, 0o700);
  }
});

test("outages do not replace saved credentials or ask for new ones; malformed data fails closed", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-linear-outage-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, ".private/key");
  await saveLinearToken(file, "saved-key");
  const signal = new AbortController().signal;
  await assert.rejects(
    validatedLinearToken(file, signal, {
      environment: () => undefined,
      fetch: async () => new Response("", { status: 503 }),
      async prompt() {
        assert.fail("No prompt on an outage");
      },
    }),
    /unavailable/,
  );
  assert.equal(await readFile(file, "utf8"), "saved-key");
  await assert.rejects(
    createLinearClient("saved-key", async () =>
      Response.json({ data: { viewer: {} } }),
    ).validate(signal),
    /invalid viewer/,
  );
  await assert.rejects(
    createLinearClient("saved-key", async () =>
      Response.json({
        data: { viewer: { id: "viewer" } },
        errors: [
          {
            message: "Never expose saved-key",
            extensions: { code: "RATELIMITED" },
          },
        ],
      }),
    ).validate(signal),
    (error) => error instanceof Error && !error.message.includes("saved-key"),
  );
});

test(
  "the credential cache refuses links",
  { skip: process.platform === "win32" },
  async (t) => {
    const directory = await mkdtemp(join(tmpdir(), "outpost-linear-link-"));
    t.after(() => rm(directory, { recursive: true, force: true }));
    const file = join(directory, ".private/key");
    await readLinearToken(file);
    const target = join(directory, "target");
    await writeFile(target, "untouched");
    await symlink(target, file);
    await assert.rejects(readLinearToken(file), /private regular/);
    await assert.rejects(saveLinearToken(file, "valid-key"), /credential link/);
    assert.equal(await readFile(target, "utf8"), "untouched");
  },
);

test("Linear reads use fixed HTTPS, variables and checked response fields", async () => {
  const client = createLinearClient("fixture-only", async (url, init) => {
    assert.equal(url, "https://api.linear.app/graphql");
    assert.equal(init?.redirect, "error");
    assert.deepEqual(JSON.parse(String(init?.body)).variables, {
      id: "ENG-123",
    });
    return Response.json({
      data: {
        issue: {
          id: "uuid",
          identifier: "ENG-123",
          title: "Demo",
          description: null,
          url: "https://linear.app/example/issue/ENG-123",
        },
      },
    });
  });
  assert.equal(
    (await client.issue("ENG-123", new AbortController().signal)).description,
    "",
  );
});
