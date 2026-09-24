import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdir, readFile, stat, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Sandbox as VercelSandbox } from "@vercel/sandbox";
import { vercel } from "../../src/providers/vercel.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { repository } from "../helpers.ts";

test(
  "Vercel creates missing workspace and upload parents and reuses directories",
  {
    skip:
      process.platform === "win32"
        ? "Requires POSIX commands and symlinks"
        : false,
  },
  async (t) => {
    const directory = await repository(t);
    const root = join(directory, "missing parent", "sandbox", "outpost");
    let stopped = 0;
    const sandbox = {
      mkDir: (path: string) => mkdir(path),
      runCommand: async (executable: string, args: string[]) => {
        const result = await executeProcess({ executable, arguments: args });
        return {
          exitCode: result.status,
          stdout: async () => result.stdout,
          stderr: async () => result.stderr,
        };
      },
      writeFiles: async (entries: { path: string; content: Buffer }[]) => {
        for (const entry of entries) await writeFile(entry.path, entry.content);
      },
      stop: async () => {
        stopped++;
      },
    };
    const provider = vercel(
      { root },
      async () => sandbox as unknown as VercelSandbox,
    );
    const context = {
      repository: directory,
      directory,
      gitDirectories: [],
      variables: {},
    };
    for (let attempt = 0; attempt < 2; attempt++) {
      const lease = await provider.acquire(context);
      try {
        assert.ok((await stat(root)).isDirectory());
        const source = join(directory, "source");
        await mkdir(join(source, "empty"), { recursive: true });
        await writeFile(join(source, "file"), "payload");
        const destination = join(root, "uploads", "nested", "directory");
        await lease.upload(source, destination);
        assert.ok((await stat(join(destination, "empty"))).isDirectory());
        assert.equal(
          await readFile(join(destination, "file"), "utf8"),
          "payload",
        );
        const link = join(directory, `link-${attempt}`);
        await symlink(join(destination, "file"), link);
        const remoteLink = join(root, `links-${attempt}`, "nested", "link");
        await lease.upload(link, remoteLink);
        assert.equal(await readFile(remoteLink, "utf8"), "payload");
      } finally {
        await lease.release();
      }
    }
    assert.equal(stopped, 2);
  },
);

test("Vercel stops allocation when recursive workspace creation fails", async () => {
  let stopped = 0;
  const sandbox = {
    mkDir: async () => {},
    runCommand: async () => ({
      exitCode: 1,
      stderr: async () => "Permission denied",
    }),
    stop: async () => {
      stopped++;
    },
  };
  const provider = vercel({}, async () => sandbox as unknown as VercelSandbox);
  await assert.rejects(
    provider.acquire({
      repository: "/unused",
      directory: "/unused",
      gitDirectories: [],
      variables: {},
    }),
    /directory.*Permission denied/,
  );
  assert.equal(stopped, 1);
});
