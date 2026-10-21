import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { createWorkspace } from "../src/workspaces.ts";
import {
  createSandbox,
  createAgent,
  createLocalTransport,
  dispatch,
  changed,
} from "../src/core.ts";
import type { AgentEvent } from "../src/domain/agent.types.ts";
import { createClaudeConversations } from "../src/adapters/agents/claude/claude-conversations.ts";
import { createDockerSandboxProvider } from "../src/providers/docker.ts";
import { createPodmanSandboxProvider } from "../src/providers/podman.ts";

const engine = process.env.OUTPOST_CONTAINER_ENGINE;
const factory =
  engine === "podman"
    ? createPodmanSandboxProvider
    : createDockerSandboxProvider;
const image = process.env.OUTPOST_FILE_CONTAINER_IMAGE ?? "node:24-slim";

test(
  "real file containers capture native transcripts and cold-resume without host Git",
  { skip: !engine },
  async () => {
    const root = await mkdtemp(join(tmpdir(), "outpost-file-conversation-"));
    try {
      await using workspace = await createWorkspace({
        source: { kind: "ephemeral" },
        runtime: {
          directory: join(root, "runtime"),
          namespace: "native-session",
        },
        retention: {
          policy: "portable",
          transporter: createLocalTransport({
            directory: join(root, "archive"),
          }),
        },
      });
      const native = createClaudeConversations();
      const agent = createAgent({
        harness: {
          kind: "cli",
          bind: () => ({
            name: "native-session-fixture",
            resumable: true,
            fileWorkspaces: { dispatch: true, continuation: true },
            storage: {
              ...native,
              capture: (id, context) =>
                native.capture(id, {
                  ...context,
                  home: context.home ?? join(root, "host-home"),
                }),
            },
            request(input) {
              return {
                executable: "node",
                arguments: [
                  "-e",
                  `const fs=require('node:fs'), path=require('node:path');
if(fs.existsSync('.git'))process.exit(4);
const id='native-file-session';
const file=path.join(process.env.HOME,'.claude','projects',process.cwd().replace(/[^a-zA-Z0-9]/g,'-'),id+'.jsonl');
const count=${Boolean(input.continuation)} ? JSON.parse(fs.readFileSync(file,'utf8')).count+1 : 1;
fs.mkdirSync(path.dirname(file),{recursive:true});
fs.writeFileSync(file,JSON.stringify({cwd:process.cwd(),count}));
console.log(JSON.stringify({kind:'conversation',id}));
console.log(JSON.stringify({kind:'text',text:'count='+count+' DONE'}));`,
                ],
              };
            },
            events: (line): AgentEvent[] => [JSON.parse(line)],
          }),
        },
      });
      const first = await dispatch({
        workspace,
        sandboxProvider: factory({ image, networks: "none" }),
        agent,
        brief: { text: "Start synthetic session" },
        until: "DONE",
        logging: false,
      });
      assert.match(first.text, /count=1/);
      assert.ok(first.transcript);
      assert.ok(
        !relative(workspace.runtime.directory, first.transcript).startsWith(
          "..",
        ),
      );
      assert.equal(first.workspaceInfo.conversations?.length, 1);
      const second = await first.resume({
        brief: { text: "Restore synthetic session" },
        until: "DONE",
        logging: false,
      });
      assert.match(second.text, /count=2/);
      assert.equal(JSON.parse(second.report()).version, 2);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

test(
  "real file container runs without Git, transfers binary files and reuses after cancellation",
  { skip: !engine },
  async () => {
    const control = await mkdtemp(join(tmpdir(), "outpost-file-container-"));
    try {
      for (const repositoryMode of ["mounted", "isolated"] as const) {
        await using workspace = await createWorkspace({
          source: { kind: "ephemeral" },
          runtime: { directory: control },
        });
        await writeFile(
          join(workspace.directory, "binary"),
          Buffer.from([0, 255, 128]),
        );
        await mkdir(join(workspace.directory, "empty"));
        await chmod(join(workspace.directory, "binary"), 0o640);
        await using sandbox = await createSandbox({
          workspace,
          sandboxProvider: factory({ image, networks: "none", repositoryMode }),
          hooks: {
            sandboxReady: [
              {
                executable: "node",
                arguments: [
                  "-e",
                  "require('node:fs').appendFileSync('preparation-runs','run\\n')",
                ],
                when: changed(["trigger"]),
              },
            ],
          },
        });
        const verify = await sandbox.command({
          executable: "sh",
          arguments: [
            "-c",
            '! command -v git && node -e \'const fs=require("fs");if(fs.readFileSync("binary").toString("hex")!=="00ff80"||!fs.statSync("empty").isDirectory())process.exit(2);fs.writeFileSync("result.json","{}")\'',
          ],
        });
        assert.equal(verify.status, 0, verify.stderr);
        assert.equal(
          (
            await sandbox.command({
              executable: "node",
              arguments: [
                "-e",
                "const fs=require('node:fs'); if(fs.readFileSync('preparation-runs','utf8')!=='run\\n')process.exit(2); fs.writeFileSync('trigger','changed')",
              ],
            })
          ).status,
          0,
        );
        assert.equal(
          (
            await sandbox.command({
              executable: "node",
              arguments: [
                "-e",
                "if(require('node:fs').readFileSync('preparation-runs','utf8')!=='run\\nrun\\n')process.exit(3)",
              ],
            })
          ).status,
          0,
        );
        const cancelled = new AbortController();
        const operation = sandbox.command({
          executable: "sleep",
          arguments: ["30"],
          signal: cancelled.signal,
        });
        setTimeout(() => cancelled.abort(), 100);
        await assert.rejects(operation);
        assert.equal((await sandbox.command({ executable: "true" })).status, 0);
        assert.equal(
          (
            await sandbox.command({
              executable: "sh",
              arguments: ["-c", "exec 1>&- 2>&-; sleep 0.05; exit 7"],
            })
          ).status,
          7,
        );
        await sandbox.close({ preserve: true });
        assert.equal(
          await readFile(join(workspace.directory, "result.json"), "utf8"),
          "{}",
        );
        assert.deepEqual(
          await readFile(join(workspace.directory, "binary")),
          Buffer.from([0, 255, 128]),
        );
      }
    } finally {
      await rm(control, { recursive: true, force: true });
    }
  },
);

test(
  "real source mounts expose immediate writable effects and enforce readOnly",
  { skip: !engine },
  async () => {
    const directory = await mkdtemp(join(tmpdir(), "outpost-file-mount-"));
    const source = join(directory, "source");
    await mkdir(source);
    await writeFile(join(source, "initial"), "initial");
    try {
      for (const readOnly of [true, false]) {
        await using workspace = await createWorkspace({
          source: {
            kind: "directory",
            directory: source,
            access: { mode: "mount", target: "input", readOnly },
          },
          runtime: { directory: join(directory, "control") },
        });
        await using sandbox = await createSandbox({
          workspace,
          sandboxProvider: factory({ image, networks: "none" }),
        });
        const write = await sandbox.command({
          executable: "sh",
          arguments: ["-c", "printf changed > input/initial"],
        });
        assert.equal(write.status === 0, !readOnly);
        assert.equal(
          await readFile(join(source, "initial"), "utf8"),
          readOnly ? "initial" : "changed",
        );
        await sandbox.close();
        await workspace.close();
        assert.equal(
          await readFile(join(source, "initial"), "utf8"),
          readOnly ? "initial" : "changed",
        );
      }
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
);
