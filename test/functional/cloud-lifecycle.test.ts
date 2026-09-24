import { test } from "node:test";
import assert from "node:assert/strict";
import type { Daytona, Sandbox } from "@daytona/sdk";
import type { Sandbox as VercelSandbox } from "@vercel/sandbox";
import { vercel } from "../../src/providers/vercel.ts";
import { daytona } from "../../src/providers/daytona.ts";

const context = {
  repository: "/unused",
  directory: "/unused",
  gitDirectories: [],
  variables: {},
};

test("Daytona deletes an allocated sandbox when home discovery fails", async () => {
  let deleted = 0;
  const sandbox = {
    getUserHomeDir: async () => {
      throw new Error("home unavailable");
    },
  };
  const provider = daytona(
    {},
    async () =>
      ({
        create: async () => sandbox,
        delete: async () => {
          deleted++;
        },
      }) as unknown as Pick<Daytona, "create" | "delete">,
  );
  await assert.rejects(provider.acquire(context), /home unavailable/);
  assert.equal(deleted, 1);
});

test("Daytona waits for nonzero process completion after output closes and remains reusable", async () => {
  let polls = 0,
    sessions = 0,
    deleted = 0;
  const sandbox = {
    getUserHomeDir: async () => "/home/test",
    fs: { createFolder: async () => {} },
    process: {
      createSession: async () => {
        sessions++;
      },
      deleteSession: async () => {
        sessions--;
      },
      executeCommand: async () => ({ exitCode: 0 }),
      executeSessionCommand: async () => ({ cmdId: "command" }),
      getSessionCommandLogs: async (
        _id: string,
        _cmd: string,
        stdout: (text: string) => void,
      ) => {
        stdout("closed output");
      },
      getSessionCommand: async () => (++polls === 1 ? {} : { exitCode: 17 }),
    },
  };
  const lease = await daytona(
    {},
    async () =>
      ({
        create: async () => sandbox as unknown as Sandbox,
        delete: async () => {
          deleted++;
        },
      }) as unknown as Pick<Daytona, "create" | "delete">,
  ).acquire(context);
  try {
    assert.deepEqual(
      await lease.invoke({ executable: "fixture", deadlineMs: 2000 }),
      { status: 17, stdout: "closed output", stderr: "" },
    );
    assert.equal(polls, 2);
    assert.equal(sessions, 0);
    assert.equal((await lease.invoke({ executable: "fixture" })).status, 17);
    sandbox.process.getSessionCommand = async () => new Promise(() => {});
    await assert.rejects(
      lease.invoke({ executable: "fixture", deadlineMs: 20 }),
      /timeout|aborted/i,
    );
    assert.equal(sessions, 0);
    assert.equal(deleted, 0);
  } finally {
    await lease.release();
    await lease.release();
  }
  assert.equal(deleted, 1);
});

test("Daytona setup preserves both initialization and cleanup failures", async () => {
  const failure = new Error("home unavailable");
  const cleanup = new Error("delete unavailable");
  let attempts = 0;
  const provider = daytona(
    {},
    async () =>
      ({
        create: async () => ({
          getUserHomeDir: async () => {
            throw failure;
          },
        }),
        delete: async () => {
          if (++attempts === 1) throw cleanup;
        },
      }) as unknown as Pick<Daytona, "create" | "delete">,
  );
  await assert.rejects(
    provider.acquire(context),
    (error: unknown) =>
      error instanceof AggregateError &&
      error.errors[0] === failure &&
      error.errors[1] === cleanup,
  );
});

test("Vercel retains final status after log closure, cleans stdin and reuses after cancellation", async () => {
  let complete!: () => void;
  let started!: () => void;
  const waiting = new Promise<void>((resolve) => {
    started = resolve;
  });
  const completion = new Promise<void>((resolve) => {
    complete = resolve;
  });
  let killed = 0,
    stopped = 0,
    cleaned = 0,
    cancel = false;
  const sandbox = {
    mkDir: async () => {},
    stop: async () => {
      stopped++;
    },
    writeFiles: async () => {},
    runCommand: async (input: string | { signal: AbortSignal }) => {
      if (typeof input === "string") {
        if (input === "rm") cleaned++;
        return { exitCode: 0, stdout: async () => "/home/test" };
      }
      return {
        async *logs() {
          yield { stream: "stdout", data: "closed output" };
        },
        wait: async () => {
          started();
          if (cancel)
            await new Promise((_, reject) => {
              input.signal.addEventListener(
                "abort",
                () => reject(input.signal.reason),
                { once: true },
              );
            });
          await completion;
          return { exitCode: 23 };
        },
        kill: async () => {
          killed++;
        },
      };
    },
  };
  const lease = await vercel(
    {},
    async () => sandbox as unknown as VercelSandbox,
  ).acquire(context);
  try {
    let finished = false;
    const pending = lease
      .invoke({ executable: "fixture", stdin: "input" })
      .then((result) => {
        finished = true;
        return result;
      });
    await waiting;
    assert.equal(finished, false);
    complete();
    assert.equal((await pending).status, 23);
    assert.equal(cleaned, 1);
    cancel = true;
    await assert.rejects(
      lease.invoke({ executable: "fixture", stdin: "input", deadlineMs: 20 }),
      /timeout|aborted/i,
    );
    assert.equal(killed, 1);
    assert.equal(cleaned, 2);
    assert.equal(stopped, 0);
    cancel = false;
    assert.equal((await lease.invoke({ executable: "fixture" })).status, 23);
  } finally {
    await lease.release();
    await lease.release();
  }
  assert.equal(stopped, 1);
});
