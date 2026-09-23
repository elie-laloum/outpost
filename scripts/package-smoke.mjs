import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";

const npm = process.env.npm_execpath;
assert.ok(npm, "Run through npm run test:package");
const root = process.cwd();
const runNpm = (args, cwd = root) =>
  execFileSync(process.execPath, [npm, ...args], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
const packing = JSON.parse(runNpm(["pack", "--json", "--ignore-scripts"]));
const packed = Array.isArray(packing) ? packing[0] : Object.values(packing)[0];
assert.ok(packed?.filename, "npm pack did not return an archive");
const temporary = mkdtempSync(join(tmpdir(), "outpost-package-"));
try {
  writeFileSync(
    join(temporary, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  runNpm(
    [
      "install",
      "--ignore-scripts",
      "--omit=optional",
      "--no-audit",
      "--no-fund",
      resolve(packed.filename),
    ],
    temporary,
  );
  execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      "import {response, workflow, campaign, conversations, reporter, githubBacklog, beadsBacklog, recoveryDetails} from '@elie-laloum/outpost'; import {docker} from '@elie-laloum/outpost/providers/docker'; if((await response.text({tag:'ok'}).read('<ok>yes</ok>'))!=='yes'||docker().name!=='docker')throw Error('Package import failed'); for(const item of [campaign,conversations.capture,reporter,githubBacklog,beadsBacklog,recoveryDetails])if(typeof item!=='function')throw Error('Missing public extension'); (await workflow('empty',[]).start()).unwrap()",
    ],
    { cwd: temporary, stdio: "inherit" },
  );
  const cli = join(
    temporary,
    "node_modules",
    "@elie-laloum",
    "outpost",
    "dist",
    "cli",
    "main.js",
  );
  execFileSync(
    process.execPath,
    [cli, "init", "--yes", "--provider", "local"],
    { cwd: temporary, stdio: "inherit" },
  );
  const manifest = JSON.parse(
    readFileSync(
      join(
        temporary,
        "node_modules",
        "@elie-laloum",
        "outpost",
        "package.json",
      ),
      "utf8",
    ),
  );
  assert.ok(manifest.exports["."].types);
  const consumer = join(temporary, "consumer.ts");
  writeFileSync(
    consumer,
    `import { dispatch, codex, response, createSandbox } from '@elie-laloum/outpost';
import { local } from '@elie-laloum/outpost/providers/local';
await using sandbox = await createSandbox({ provider: local() });
const result = await sandbox.dispatch({ agent: codex(), brief: { text: 'Return <n>1</n>' }, response: response.json({tag:'n', schema: value => Number(value)}) });
const n: number = result.value;
const once = await dispatch({agent:codex(),provider:local(),brief:{text:'hello'}});
await once.fork({brief:{text:'alternative'},branch:{mode:'named',name:'outpost/alternative'},hooks:{workspaceReady:[]}});
// @ts-expect-error Warm results cannot replace their sandbox configuration.
await result.resume({brief:{text:'continue'},branch:{mode:'named',name:'outpost/wrong'}});
console.log(n,once.commits);
`,
  );
  execFileSync(
    process.execPath,
    [
      resolve("node_modules/typescript/bin/tsc"),
      "--noEmit",
      "--strict",
      "--module",
      "nodenext",
      "--target",
      "es2023",
      "--lib",
      "esnext",
      "--typeRoots",
      resolve("node_modules/@types"),
      "--types",
      "node",
      consumer,
    ],
    { cwd: temporary, stdio: "inherit" },
  );
  console.log("Packed package imports and initializes successfully.");
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
