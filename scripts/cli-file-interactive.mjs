import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout } from "node:timers/promises";

async function preparePreferences(name, sandbox, record) {
  if (name !== "claude" && name !== "codex") return;
  const preferences = await sandbox.command({
    executable: "node",
    arguments: [
      "-e",
      name === "claude"
        ? "const fs=require('node:fs'),path=require('node:path'),os=require('node:os');const file=path.join(os.homedir(),'.claude.json');const data=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};const cwd=process.cwd();const projects={...data.projects,[cwd]:{...data.projects?.[cwd],hasTrustDialogAccepted:true,hasCompletedProjectOnboarding:true}};fs.writeFileSync(file,JSON.stringify({...data,hasCompletedOnboarding:true,theme:data.theme??'dark',projects}),{mode:0o600});"
        : "const fs=require('node:fs'),path=require('node:path'),os=require('node:os');const home=path.join(os.homedir(),'.codex');fs.mkdirSync(home,{recursive:true,mode:0o700});fs.appendFileSync(path.join(home,'config.toml'),'\\n[projects.'+JSON.stringify(process.cwd())+']\\ntrust_level = \"trusted\"\\n',{mode:0o600});",
    ],
  });
  assert.equal(preferences.status, 0);
  record.checks.push(
    "prepared-onboarding-preferences",
    "trusted-owned-workspace",
  );
}

export async function validateInteractive({
  common,
  workspace,
  sandboxProvider,
  record,
  save,
}) {
  assert.ok(
    process.stdin.isTTY && process.stdout.isTTY,
    "Interactive validation requires a real PTY",
  );
  await using sandbox = await workspace.sandbox({
    sandboxProvider,
    variables: common.variables,
    signal: common.signal,
  });
  const probe = await sandbox.command({
    executable: "sh",
    arguments: ["-c", "test -t 0 && test -t 1"],
    interactive: true,
  });
  assert.equal(probe.status, 0);
  await preparePreferences(common.agent.name, sandbox, record);
  const first = randomUUID();
  const second = randomUUID();
  const initial = `This is a file workspace without Git. Do not inspect credentials or environment variables. Write ${first} followed by a newline into interactive-first.txt in the working directory. Then wait for the next user instruction.`;
  const terminalInitial = common.agent.name === "kimi";
  const abort = new AbortController();
  const signal = AbortSignal.any([
    common.signal,
    abort.signal,
    AbortSignal.timeout(180_000),
  ]);
  const contents = async (name) =>
    readFile(join(workspace.directory, name), "utf8").catch(() => undefined);
  const watch = async () => {
    while ((await contents("interactive-first.txt")) !== `${first}\n`)
      await setTimeout(250, undefined, { signal });
    record.step = "terminal-followup";
    await save();
    const instruction = `Write ${second} followed by a newline into interactive-second.txt. Do not inspect credentials or run Git.`;
    process.stdout.write(
      `\nOUTPOST_TERMINAL_INPUT:${Buffer.from(instruction).toString("base64")}\n`,
    );
    while ((await contents("interactive-second.txt")) !== `${second}\n`)
      await setTimeout(250, undefined, { signal });
    record.step = "terminal-exit";
    await save();
    process.stdout.write("\nOUTPOST_TERMINAL_EXIT\n");
  };
  record.step = "terminal-initial-prompt";
  await save();
  process.stdout.write("\nOUTPOST_TERMINAL_BEGIN\n");
  const initialInput = terminalInitial
    ? setTimeout(3000, undefined, { signal }).then(() => {
        process.stdout.write(
          `\nOUTPOST_TERMINAL_INITIAL:${Buffer.from(initial).toString("base64")}\n`,
        );
      })
    : Promise.resolve();
  void initialInput.catch(() => {});
  const watching = watch();
  void watching.catch(() => {});
  try {
    const result = await sandbox.attach({
      agent: common.agent,
      signal,
      ...(terminalInitial ? {} : { brief: { text: initial } }),
    });
    record.exitStatus = result.status;
    assert.equal(result.status, 0);
    assert.equal(await contents("interactive-first.txt"), `${first}\n`);
    assert.equal(await contents("interactive-second.txt"), `${second}\n`);
    await watching;
    record.step = "terminal-cancellation";
    await save();
    await assert.rejects(
      sandbox.attach({
        agent: common.agent,
        signal: AbortSignal.timeout(3000),
      }),
    );
    const reuse = await sandbox.command({
      executable: "sh",
      arguments: ["-c", "exit 7"],
    });
    assert.equal(reuse.status, 7);
    record.turns = 2;
    record.checks.push(
      "host-pty",
      "container-tty",
      terminalInitial ? "terminal-initial-input" : "interactive-initial-prompt",
      "terminal-followup-input",
      "two-file-effects",
      "clean-cli-exit",
      "idle-cli-cancellation",
      "warm-sandbox-reuse",
    );
  } finally {
    abort.abort();
    await initialInput.catch(() => {});
    await watching.catch(() => {});
  }
}
