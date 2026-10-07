import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import {
  createAgentConflictResolver,
  openWorkspace,
  OutpostError,
  recoveryDetails,
} from "../../src/index.ts";
import type {
  AgentConflictResolverOptions,
  DiffGuard,
  SandboxProvider,
} from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { git } from "../../src/infrastructure/git/command.ts";
import { emit, repository, scripted } from "../helpers.ts";

async function fixture(
  t: TestContext,
  guard?: DiffGuard,
  signal?: AbortSignal,
) {
  const root = await repository(t);
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "integrate" },
    ...(guard ? { guard } : {}),
    ...(signal ? { signal } : {}),
  });
  t.after(() => workspace.close({ preserve: true }));
  await writeFile(join(workspace.directory, "base.txt"), "candidate\n");
  await git(workspace.directory, ["commit", "-am", "Candidate"]);
  await writeFile(join(root, "base.txt"), "host\n");
  await git(root, ["commit", "-am", "Host"]);
  return {
    root,
    workspace,
    host: (await git(root, ["rev-parse", "HEAD"])).trim(),
    source: (await git(workspace.directory, ["rev-parse", "HEAD"])).trim(),
  };
}

const resolverAgent = (extra = "") =>
  scripted(`import {writeFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';
if (!execFileSync('git',['ls-files','--unmerged'],{encoding:'utf8'}).trim()) throw new Error('Missing merge conflict');
writeFileSync('base.txt','host + candidate\\n');${extra}
execFileSync('git',['add','.']);execFileSync('git',['-c','commit.gpgSign=false','commit','-m','Resolve merge']);${emit("done")}`);

const verify = {
  executable: process.execPath,
  arguments: [
    "--input-type=module",
    "-e",
    "import {readFileSync} from 'node:fs'; if(readFileSync('base.txt','utf8') !== 'host + candidate\\n') process.exit(9);",
  ],
};
function resolver(
  options: Partial<AgentConflictResolverOptions> = {},
  extra = "",
) {
  return createAgentConflictResolver(resolverAgent(extra), {
    sandboxProvider: createLocalSandboxProvider(),
    logging: false,
    verify,
    ...options,
  });
}

for (const remote of [false, true]) {
  test(`agent resolves an actual merge and verifies the combined commit (${remote ? "remote fixture" : "local"})`, async (t) => {
    const { root, workspace, host, source } = await fixture(t);
    let sandboxProvider = createLocalSandboxProvider();
    if (remote) {
      const local = sandboxProvider;
      const provider: SandboxProvider = {
        name: "remote-fixture",
        placement: "remote",
        async acquire(context) {
          const directory = join(root, ".outpost", "remote-fixture");
          await mkdir(directory, { recursive: true });
          return local.acquire({
            ...context,
            directory,
            repository: directory,
            gitDirectories: [],
          });
        },
      };
      sandboxProvider = provider;
    }
    const result = await workspace.integrate({
      onConflict: resolver({ sandboxProvider }),
    });
    assert.ok(result);
    assert.equal(result.verification.status, 0);
    assert.equal(
      await readFile(join(root, "base.txt"), "utf8"),
      "host + candidate\n",
    );
    assert.equal(
      (await git(root, ["rev-parse", "HEAD"])).trim(),
      result.commit,
    );
    assert.equal(
      (await git(root, ["rev-parse", workspace.branch])).trim(),
      source,
    );
    assert.deepEqual(
      (await git(root, ["rev-list", "--parents", "-n", "1", result.commit]))
        .trim()
        .split(" ")
        .slice(1),
      [source, host],
    );
    assert.equal(
      (
        await git(root, ["status", "--porcelain", "--untracked-files=no"])
      ).trim(),
      "",
    );
  });
}

for (const scenario of [
  "tests",
  "unresolved",
  "abort-merge",
  "verify-edit",
  "verify-commit",
  "guard",
  "agent-failure",
] as const) {
  test(`failed ${scenario} retains resolution and leaves original branches intact`, async (t) => {
    const { root, workspace, host, source } = await fixture(
      t,
      scenario === "guard" ? { protectedPaths: ["protected.txt"] } : undefined,
    );
    let handler = resolver();
    if (scenario === "tests")
      handler = resolver({
        verify: {
          executable: process.execPath,
          arguments: ["-e", "process.exit(7)"],
        },
      });
    if (scenario === "unresolved")
      handler = createAgentConflictResolver(scripted(emit("done")), {
        sandboxProvider: createLocalSandboxProvider(),
        verify,
        logging: false,
      });
    if (scenario === "abort-merge")
      handler = createAgentConflictResolver(
        scripted(
          `import {execFileSync} from 'node:child_process';execFileSync('git',['merge','--abort']);${emit("done")}`,
        ),
        {
          sandboxProvider: createLocalSandboxProvider(),
          verify,
          logging: false,
        },
      );
    if (scenario === "agent-failure")
      handler = createAgentConflictResolver(scripted("process.exit(6)"), {
        sandboxProvider: createLocalSandboxProvider(),
        verify,
        logging: false,
      });
    if (scenario === "guard")
      handler = resolver({}, "writeFileSync('protected.txt','forbidden');");
    if (scenario === "verify-edit")
      handler = resolver({
        verify: {
          executable: process.execPath,
          arguments: [
            "-e",
            "require('node:fs').writeFileSync('base.txt','changed')",
          ],
        },
      });
    if (scenario === "verify-commit")
      handler = resolver({
        verify: {
          executable: "git",
          arguments: [
            "commit",
            "--allow-empty",
            "-m",
            "Changed after verification",
          ],
        },
      });
    await assert.rejects(
      workspace.integrate({ onConflict: handler }),
      (error) => {
        assert.ok(error instanceof OutpostError);
        const expectedCode = {
          tests: "process",
          unresolved: "conflict",
          "abort-merge": "process",
          "verify-edit": "conflict",
          "verify-commit": "conflict",
          guard: "guard",
          "agent-failure": "process",
        };
        assert.equal(error.code, expectedCode[scenario]);
        if (scenario === "tests")
          assert.equal(
            error.details.verification &&
              typeof error.details.verification === "object" &&
              "status" in error.details.verification
              ? error.details.verification.status
              : undefined,
            7,
          );
        const recovery = recoveryDetails(error);
        assert.ok(recovery);
        assert.notEqual(recovery.branch, workspace.branch);
        assert.equal(recovery.sourceBranch, workspace.branch);
        assert.equal(typeof recovery.directory, "string");
        return true;
      },
    );
    assert.equal((await git(root, ["rev-parse", "HEAD"])).trim(), host);
    assert.equal(
      (await git(root, ["rev-parse", workspace.branch])).trim(),
      source,
    );
    assert.equal(await readFile(join(root, "base.txt"), "utf8"), "host\n");
    assert.equal((await git(root, ["ls-files", "--unmerged"])).trim(), "");
    const disposal = await workspace.close();
    assert.equal(disposal.retainedDirectory, workspace.directory);
  });
}

for (const mutation of ["dirty", "head", "branch", "source"] as const) {
  test(`concurrent ${mutation} edits prevent final integration`, async (t) => {
    const { root, workspace, source } = await fixture(t);
    const inner = resolver();
    await assert.rejects(
      workspace.integrate({
        onConflict: async (context) => {
          const result = await inner(context);
          if (mutation === "dirty")
            await writeFile(join(root, "base.txt"), "human edit\n");
          if (mutation === "head")
            await git(root, ["commit", "--allow-empty", "-m", "Human commit"]);
          if (mutation === "branch")
            await git(root, ["checkout", "-b", "human"]);
          if (mutation === "source")
            await git(workspace.directory, [
              "commit",
              "--allow-empty",
              "-m",
              "Source moved",
            ]);
          return result;
        },
      }),
      (error) => error instanceof OutpostError && error.code === "conflict",
    );
    assert.notEqual(
      (await git(root, ["rev-parse", "HEAD"])).trim(),
      (await git(root, ["rev-parse", workspace.branch])).trim(),
    );
    if (mutation !== "source")
      assert.equal(
        (await git(root, ["rev-parse", workspace.branch])).trim(),
        source,
      );
    if (mutation === "dirty")
      assert.equal(
        await readFile(join(root, "base.txt"), "utf8"),
        "human edit\n",
      );
  });
}

test("clean integration bypasses resolver and blocked preflight never starts it", async (t) => {
  const root = await repository(t);
  await using workspace = await openWorkspace({
    repository: root,
    branch: { mode: "integrate" },
  });
  await writeFile(join(workspace.directory, "new.txt"), "new\n");
  await git(workspace.directory, ["add", "."]);
  await git(workspace.directory, ["commit", "-m", "New"]);
  const onConflict = async () => {
    throw new Error("Unexpected resolver");
  };
  await workspace.integrate({ onConflict });
  assert.equal(await readFile(join(root, "new.txt"), "utf8"), "new\n");
  await writeFile(join(root, "base.txt"), "human edit\n");
  await assert.rejects(
    workspace.integrate({ onConflict }),
    (error) => error instanceof OutpostError && error.code === "conflict",
  );
});

test("resolver cancellation retains work and releases both workspaces", async (t) => {
  const { root, workspace, host } = await fixture(t);
  const stop = new AbortController();
  const inner = resolver();
  await assert.rejects(
    workspace.integrate({
      signal: stop.signal,
      onConflict: async (context) => {
        const result = await inner(context);
        stop.abort(new Error("Cancelled by caller"));
        return result;
      },
    }),
    /Cancelled by caller/,
  );
  assert.equal((await git(root, ["rev-parse", "HEAD"])).trim(), host);
  await workspace.close();
});

test("resolver requires verification and refuses nonintegration or active workspaces", async (t) => {
  assert.throws(
    () => resolver({ verify: { executable: "" } }),
    /verification executable/,
  );
  for (const directory of ["", "/other"])
    assert.throws(
      () => resolver({ verify: { executable: "npm", directory } }),
      /resolution workspace/,
    );
  const root = await repository(t);
  await using named = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "named" },
  });
  await assert.rejects(
    named.integrate({ onConflict: resolver() }),
    /integration workspace/,
  );
  const { workspace } = await fixture(t);
  await using sandbox = await workspace.sandbox({
    sandboxProvider: createLocalSandboxProvider(),
  });
  await assert.rejects(
    workspace.integrate({ onConflict: resolver() }),
    /Close the sandbox/,
  );
});

for (const outcome of ["cancel", "deadline"] as const) {
  test(`verification ${outcome} stops its process and retains recoverable work`, async (t) => {
    const { root, workspace, host } = await fixture(t);
    const stop = new AbortController();
    await assert.rejects(
      workspace.integrate({
        signal: stop.signal,
        onConflict: resolver({
          verify: {
            executable: process.execPath,
            arguments: [
              "-e",
              "console.log('verification-ready');setInterval(()=>{},1000)",
            ],
            deadlineMs: outcome === "deadline" ? 100 : 10000,
            observe: (_channel, text) => {
              if (outcome === "cancel" && text.includes("verification-ready"))
                stop.abort(new Error("Cancel verification"));
            },
          },
        }),
      }),
      (error) => {
        assert.ok(recoveryDetails(error)?.directory);
        if (outcome === "deadline")
          assert.ok(error instanceof OutpostError && error.code === "timeout");
        if (outcome === "cancel")
          assert.match(String(error), /Cancel verification/);
        return true;
      },
    );
    assert.equal((await git(root, ["rev-parse", "HEAD"])).trim(), host);
    await workspace.close();
  });
}

test("final integration refuses a custom resolver's unsuccessful verification", async (t) => {
  const { root, workspace, host } = await fixture(t);
  const inner = resolver();
  await assert.rejects(
    workspace.integrate({
      onConflict: async (context) => ({
        ...(await inner(context)),
        verification: { status: 8, stdout: "", stderr: "Failed custom check" },
      }),
    }),
    (error) => error instanceof OutpostError && error.code === "process",
  );
  assert.equal((await git(root, ["rev-parse", "HEAD"])).trim(), host);
});

test("a refused source guard never invokes the resolver", async (t) => {
  const { workspace } = await fixture(t, { protectedPaths: ["base.txt"] });
  await assert.rejects(
    workspace.integrate({
      onConflict: async () => {
        throw new Error("Unexpected resolver");
      },
    }),
    (error) => error instanceof OutpostError && error.code === "guard",
  );
});

test("untracked resolution code cannot participate in a successful verification", async (t) => {
  const { root, workspace, host } = await fixture(t);
  await assert.rejects(
    workspace.integrate({
      onConflict: resolver({
        verify: {
          executable: process.execPath,
          arguments: [
            "-e",
            "require('node:fs').writeFileSync('untracked.txt','extra code')",
          ],
        },
      }),
    }),
    (error) => error instanceof OutpostError && error.code === "conflict",
  );
  assert.equal((await git(root, ["rev-parse", "HEAD"])).trim(), host);
});

test("workspace opening signal does not cancel later conflict integration", async (t) => {
  const setup = new AbortController();
  const { workspace } = await fixture(t, undefined, setup.signal);
  setup.abort(new Error("Opening scope ended"));
  const result = await workspace.integrate({ onConflict: resolver() });
  assert.ok(result);
  assert.equal(result.verification.status, 0);
});

test("detached custom resolutions fail with a classified conflict and retain their work", async (t) => {
  const { root, workspace, host } = await fixture(t);
  const inner = resolver();
  await assert.rejects(
    workspace.integrate({
      onConflict: async (context) => {
        const result = await inner(context);
        await git(context.workspace.directory, [
          "checkout",
          "--detach",
          result.commit,
        ]);
        return result;
      },
    }),
    (error) => {
      assert.ok(error instanceof OutpostError && error.code === "conflict");
      assert.ok(recoveryDetails(error)?.directory);
      return true;
    },
  );
  assert.equal((await git(root, ["rev-parse", "HEAD"])).trim(), host);
});
