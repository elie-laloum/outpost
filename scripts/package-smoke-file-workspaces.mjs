import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { delimiter, join } from "node:path";

export function smokeFileWorkspaces(directory, checkTypes) {
  const consumer = join(directory, "file-workspaces.ts");
  writeFileSync(
    consumer,
    `import {createWorkspace,createSandbox,dispatch,attach,defineIsolatedCommandTask,workspaceFingerprint,publishWorkspaceOutputs,type Workspace,type FileWorkspace,type FileDispatchResult,type DispatchResult} from '@elie-laloum/outpost';
import {createLocalSandboxProvider} from '@elie-laloum/outpost/providers/local';
import {scriptedAgent} from '@elie-laloum/outpost/testing';
const sandboxProvider=createLocalSandboxProvider();
const workspace:FileWorkspace=await createWorkspace({source:{kind:'ephemeral'},runtime:{directory:'./files'}});
const sandbox=await createSandbox({workspace,sandboxProvider});
const result:FileDispatchResult<undefined>=await dispatch({workspace,sandboxProvider,agent:scriptedAgent({turns:[{text:'ok'}]}),brief:{text:'work'}});
await workspaceFingerprint(workspace);
await publishWorkspaceOutputs(workspace,{paths:['**/*.json'],destination:'./out',policy:'create'});
defineIsolatedCommandTask({key:'command',request:()=>({workspaceSource:{kind:'ephemeral'},sandboxProvider,command:{executable:'node'}})});
declare const legacy:Workspace;
declare const gitResult:DispatchResult<undefined>;
const branch:string=gitResult.branch;
const legacySandbox=legacy.sandbox({sandboxProvider});
// @ts-expect-error File results do not contain synthetic Git branches.
result.branch;
// @ts-expect-error File workspaces do not accept Git branch configuration.
createWorkspace({source:{kind:'ephemeral'},branch:{mode:'current'}});
// @ts-expect-error Owned source and borrowed workspace are exclusive.
createSandbox({workspace,workspaceSource:{kind:'ephemeral'},sandboxProvider});
void [sandbox,branch,legacySandbox,attach];
`,
  );
  checkTypes(consumer);
  const bin = join(directory, "file-trap-bin");
  mkdirSync(bin);
  const trap = join(directory, "git-invocations");
  writeFileSync(
    join(bin, "git"),
    `#!/bin/sh\necho invoked >> '${trap.replaceAll("'", "'\\''")}'\nexit 99\n`,
  );
  chmodSync(join(bin, "git"), 0o700);
  const environment = {
    ...process.env,
    PATH: `${bin}${delimiter}${process.env.PATH}`,
  };
  const file = join(directory, "file-recipe.yaml"),
    config = join(directory, "file-outpost.yaml");
  writeFileSync(
    file,
    JSON.stringify({
      version: 3,
      name: "installed-files",
      workflow: {
        checkpoint: {
          store: { $ref: "stores.checkpoint" },
          runId: "installed-files",
          version: "1",
        },
      },
      tasks: [
        {
          key: "produce",
          command: {
            executable: process.execPath,
            arguments: [
              "-e",
              "require('fs').appendFileSync('result.json','one')",
            ],
          },
        },
        {
          key: "approve",
          after: ["produce"],
          gate: {
            kind: "approval",
            prompt: "Continue?",
            actors: ["maintainer"],
          },
        },
        {
          key: "finish",
          after: ["approve"],
          command: {
            executable: process.execPath,
            arguments: [
              "-e",
              "if(require('fs').readFileSync('result.json','utf8')!=='one')process.exit(8)",
            ],
          },
        },
      ],
    }),
  );
  writeFileSync(
    config,
    JSON.stringify({
      version: 3,
      workspace: { kind: "ephemeral" },
      sandbox: { provider: "local" },
      transports: { state: { type: "local", directory: "./file-storage" } },
      stores: {
        checkpoint: {
          type: "transport",
          transporter: { $ref: "transports.state" },
        },
      },
      outputs: [
        {
          paths: ["**/*.json"],
          destination: "./file-published",
          policy: "create",
        },
      ],
    }),
  );
  const cli = join(
    directory,
    "node_modules/@elie-laloum/outpost/dist/cli/main.js",
  );
  const run = (args) => {
    const result = spawnSync(
      process.execPath,
      [cli, ...args, "--file", file, "--config", config, "--json"],
      { cwd: directory, env: environment, encoding: "utf8" },
    );
    if (result.error) throw result.error;
    const report = JSON.parse(result.stdout);
    assert.equal(
      result.status,
      ["paused", "waiting-input"].includes(report.status) ? 1 : 0,
      result.stderr,
    );
    return report;
  };
  assert.equal(run(["recipe", "validate"]).version, 3);
  const first = run(["recipe", "run"]);
  assert.equal(first.status, "paused");
  const decision = join(directory, "file-decision.json");
  writeFileSync(
    decision,
    JSON.stringify({
      executionId: first.executionId,
      key: "approve",
      requestId: first.tasks.find((task) => task.key === "approve").pause.id,
      actor: "maintainer",
      action: "approve",
      reason: "Reviewed",
    }),
  );
  const completed = run([
    "recipe",
    "decide",
    "--run-id",
    "installed-files",
    "--decision",
    decision,
  ]);
  assert.equal(completed.status, "done", JSON.stringify(completed.errors));
  assert.equal(completed.workspace, undefined);
  assert.equal(completed.workspaceInfo.kind, "ephemeral");
  assert.equal(
    readFileSync(join(directory, "file-published/result.json"), "utf8"),
    "one",
  );
  assert.equal(existsSync(trap), false, "Installed file execution invoked Git");
  smokeWithoutGit(directory, cli);
}

function smokeWithoutGit(directory, cli) {
  if (process.env.OUTPOST_PACKAGE_CONTAINER_ENGINE !== "docker") return;
  const context = join(directory, "no-git-image");
  mkdirSync(context);
  const client = execFileSync("sh", ["-c", "command -v docker"], {
    encoding: "utf8",
  }).trim();
  copyFileSync(client, join(context, "docker"));
  writeFileSync(
    join(context, "Dockerfile"),
    'FROM node:24-slim\nARG OUTPOST_TEST_UID\nRUN getent passwd "$OUTPOST_TEST_UID" || useradd --no-create-home --uid "$OUTPOST_TEST_UID" --home-dir /home/node outpost-smoke\nCOPY docker /usr/local/bin/docker\n',
  );
  const image = `outpost-package-no-git:${process.pid}`;
  const file = join(directory, "no-git-recipe.yaml"),
    config = join(directory, "no-git-outpost.yaml");
  writeFileSync(
    file,
    JSON.stringify({
      version: 3,
      name: "no-git",
      tasks: [
        {
          key: "produce",
          command: {
            executable: "node",
            arguments: [
              "-e",
              "require('fs').writeFileSync('result.json','verified');if(require('child_process').spawnSync('git',['--version']).error?.code!=='ENOENT')process.exit(9)",
            ],
          },
        },
      ],
    }),
  );
  writeFileSync(
    config,
    JSON.stringify({
      version: 3,
      runtime: { directory: "./no-git-control", namespace: "no-git" },
      workspace: { kind: "ephemeral" },
      sandbox: { provider: "docker", image: "node:24-slim" },
      outputs: [
        {
          paths: ["**/*.json"],
          destination: "./no-git-published",
          policy: "create",
        },
      ],
    }),
  );
  const socket = process.env.OUTPOST_DOCKER_SOCKET ?? "/var/run/docker.sock";
  try {
    execFileSync(
      "docker",
      [
        "build",
        "--network=none",
        "--build-arg",
        `OUTPOST_TEST_UID=${process.getuid()}`,
        "-t",
        image,
        context,
      ],
      { stdio: "inherit" },
    );
    const script = `const cp=require('child_process');if(cp.spawnSync('git',['--version']).error?.code!=='ENOENT')throw Error('Host contains Git');cp.execFileSync('tar',['--version']);const result=cp.spawnSync('node',${JSON.stringify([cli, "recipe", "run", "--file", file, "--config", config, "--json"])},{stdio:'inherit'});process.exit(result.status??1)`;
    execFileSync(
      "docker",
      [
        "run",
        "--rm",
        "--network=none",
        "--user",
        `${process.getuid()}:${process.getgid()}`,
        "--group-add",
        String(statSync(socket).gid),
        "-e",
        "HOME=/home/node",
        "--mount",
        `type=bind,source=${directory},target=${directory}`,
        "--mount",
        `type=bind,source=${socket},target=/var/run/docker.sock`,
        "-w",
        directory,
        image,
        "node",
        "-e",
        script,
      ],
      { stdio: "inherit" },
    );
    assert.equal(
      readFileSync(join(directory, "no-git-published/result.json"), "utf8"),
      "verified",
    );
  } finally {
    execFileSync("docker", ["image", "rm", image], { stdio: "inherit" });
  }
}
