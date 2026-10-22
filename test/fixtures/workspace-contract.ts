import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { suite, test } from "node:test";
import type { TestContext } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import type { Command } from "../../src/domain/command.types.ts";
import type { FileWorkspaceSource } from "../../src/domain/file-workspace.types.ts";
import type { BranchPolicy } from "../../src/domain/workspace.types.ts";
import { createWorkspace } from "../../src/workspaces.ts";
import { repository } from "../helpers.ts";
import type {
  ContractScope,
  ContractWorkspace,
  WorkspaceContractEnvironment,
  WorkspaceContractTarget,
} from "./workspace-contract.types.ts";

/** Git workspaces in current and named mode, then directory copies and ephemeral roots. */
export function workspaceContractTargets(
  environment: WorkspaceContractEnvironment,
): WorkspaceContractTarget[] {
  const git =
    (branch?: BranchPolicy) =>
    async (scope: ContractScope): Promise<ContractWorkspace> =>
      createWorkspace({
        source: {
          kind: "git",
          repository: await repository(scope),
          ...(branch ? { branch } : {}),
        },
      });
  const files =
    (source: (directory: string) => FileWorkspaceSource) =>
    async (scope: ContractScope): Promise<ContractWorkspace> => {
      const root = await mkdtemp(join(tmpdir(), "outpost-workspace-contract-"));
      scope.after(() =>
        rm(root, { recursive: true, force: true, maxRetries: 5 }),
      );
      await mkdir(join(root, "source"));
      await writeFile(join(root, "source", "base.txt"), "base\n");
      return createWorkspace({
        source: source(join(root, "source")),
        runtime: { directory: join(root, "runtime") },
      });
    };
  const target = (
    name: string,
    open: WorkspaceContractTarget["open"],
    sandboxProvider: WorkspaceContractTarget["sandboxProvider"],
    owned: boolean,
    unpreserved: WorkspaceContractTarget["unpreserved"],
  ): WorkspaceContractTarget => ({
    name: `${environment.name} ${name}`,
    open,
    sandboxProvider,
    node: environment.node,
    owned,
    unpreserved,
  });
  return [
    target("Git current", git(), environment.gitProvider, false, "retained"),
    target(
      "Git named",
      git({ mode: "named", name: "contract" }),
      environment.gitProvider,
      true,
      "retained",
    ),
    target(
      "directory copy",
      files((directory) => ({
        kind: "directory",
        directory,
        access: { mode: "copy" },
      })),
      environment.fileProvider,
      true,
      "removed",
    ),
    target(
      "ephemeral",
      files(() => ({ kind: "ephemeral" })),
      environment.fileProvider,
      true,
      "removed",
    ),
  ];
}

/** Registers the lifecycle checks every workspace kind satisfies with one sandbox provider. */
export function defineWorkspaceContractSuite(
  target: WorkspaceContractTarget,
): void {
  const script = (source: string, signal?: AbortSignal): Command => ({
    executable: target.node,
    arguments: ["-e", source],
    ...(signal ? { signal } : {}),
  });
  const write = script(
    "require('node:fs').writeFileSync('made.txt','sandbox')",
  );
  const lend = async (t: TestContext) => {
    const cleanups: (() => Promise<unknown>)[] = [];
    t.after(async () => {
      for (const cleanup of cleanups.reverse()) await cleanup();
    });
    const scope: ContractScope = { after: (cleanup) => cleanups.push(cleanup) };
    const workspace = await target.open(scope);
    scope.after(() => workspace[Symbol.asyncDispose]());
    const borrow = async () => {
      const sandbox = await workspace.sandbox({
        sandboxProvider: target.sandboxProvider(),
      });
      scope.after(() => sandbox.close());
      return sandbox;
    };
    return { workspace, sandbox: await borrow(), borrow };
  };
  const retained = async (directory: string) =>
    readFile(join(directory, "made.txt"), "utf8");

  suite(`${target.name} workspace contract`, () => {
    test("commands report their exit status after outputs close and the sandbox stays usable", async (t) => {
      const { sandbox } = await lend(t);
      const result = await sandbox.command(
        script(
          "const fs=require('node:fs'); console.log('before-close'); fs.closeSync(1); fs.closeSync(2); setTimeout(()=>process.exit(17),150)",
        ),
      );
      assert.equal(result.status, 17);
      assert.match(result.stdout, /before-close/);
      assert.equal((await sandbox.command(script(""))).status, 0);
    });

    test("cancellation stops the command and leaves the sandbox reusable", async (t) => {
      const { sandbox } = await lend(t);
      const controller = new AbortController();
      const running = sandbox.command(
        script(
          "setTimeout(()=>require('node:fs').writeFileSync('late','x'),1000)",
          controller.signal,
        ),
      );
      setTimeout(() => controller.abort(), 200);
      await assert.rejects(running, { name: "AbortError" });
      await delay(1200);
      const late = await sandbox.command(
        script(
          "process.stdout.write(String(require('node:fs').existsSync('late')))",
        ),
      );
      assert.equal(late.status, 0);
      assert.equal(late.stdout, "false");
    });

    test("a workspace lends one sandbox at a time, outlives it and closes only after it", async (t) => {
      const { workspace, sandbox, borrow } = await lend(t);
      await assert.rejects(borrow, { code: "configuration" });
      await assert.rejects(async () => workspace.close(), {
        code: "configuration",
      });
      await sandbox.command(write);
      await sandbox.close();
      const next = await borrow();
      const read = await next.command(
        script(
          "process.stdout.write(require('node:fs').readFileSync('made.txt','utf8'))",
        ),
      );
      assert.equal(read.stdout, "sandbox");
    });

    test("closing is idempotent and refuses later use", async (t) => {
      const { workspace, sandbox } = await lend(t);
      assert.deepEqual(await sandbox.close(), await sandbox.close());
      await assert.rejects(async () => sandbox.command(script("")), {
        code: "configuration",
      });
      const disposal = await workspace.close();
      assert.deepEqual(await workspace.close(), disposal);
      await workspace[Symbol.asyncDispose]();
      await assert.rejects(
        async () =>
          workspace.sandbox({ sandboxProvider: target.sandboxProvider() }),
        { code: "configuration" },
      );
    });

    test("preservation retains the files the sandbox wrote", async (t) => {
      const { workspace, sandbox } = await lend(t);
      await sandbox.command(write);
      await sandbox.close();
      const disposal = await workspace.close({ preserve: true });
      assert.equal(disposal.retainedDirectory !== undefined, target.owned);
      assert.equal(
        await retained(disposal.retainedDirectory ?? workspace.directory),
        "sandbox",
      );
    });

    test(`closing without preservation leaves uncommitted files ${target.unpreserved}`, async (t) => {
      const { workspace, sandbox } = await lend(t);
      await sandbox.command(write);
      await sandbox.close();
      const disposal = await workspace.close();
      if (target.unpreserved === "removed") {
        assert.equal(disposal.retainedDirectory, undefined);
        await assert.rejects(stat(workspace.directory), { code: "ENOENT" });
        return;
      }
      assert.equal(disposal.retainedDirectory !== undefined, target.owned);
      assert.equal(
        await retained(disposal.retainedDirectory ?? workspace.directory),
        "sandbox",
      );
    });
  });
}
