import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
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
assert.ok(
  !packed.files.some(({ path }) => path.startsWith("docs/")),
  "The documentation site must stay out of the library package",
);
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
  assert.equal(
    existsSync(join(temporary, "node_modules", "@opentelemetry", "api")),
    false,
    "Base consumers must not require the optional telemetry API",
  );
  execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      "import {gemini, response, workflow, conversations, reporter, recoveryDetails, diagnoseAgentProtocol, diagnoseSandbox, planRecoveryRetention, pruneRecoveryRetention, assertRecoveryQuota, verifyRecoveryTransfer} from '@elie-laloum/outpost'; import {docker} from '@elie-laloum/outpost/providers/docker'; import {firecracker} from '@elie-laloum/outpost/providers/firecracker'; if(typeof firecracker!=='function')throw Error('Missing Firecracker provider'); if((await response.text({tag:'ok'}).read('<ok>yes</ok>'))!=='yes'||docker().name!=='docker')throw Error('Package import failed'); for(const item of [gemini,conversations.capture,reporter,recoveryDetails,diagnoseSandbox,planRecoveryRetention,pruneRecoveryRetention,assertRecoveryQuota,verifyRecoveryTransfer])if(typeof item!=='function')throw Error('Missing public extension'); if(diagnoseAgentProtocol('codex').hasFailures||diagnoseAgentProtocol('gemini').hasFailures)throw Error('Protocol fixtures failed'); (await workflow('empty',[]).start()).unwrap()",
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
  execFileSync(process.execPath, ["--check", join(temporary, "run.ts")], {
    cwd: temporary,
    stdio: "inherit",
  });
  const standalone = join(temporary, "workflow");
  execFileSync(
    process.execPath,
    [
      cli,
      "init",
      "--yes",
      "--provider",
      "vercel",
      "--directory",
      standalone,
      "--repository",
      "../repository",
    ],
    {
      cwd: temporary,
      stdio: "inherit",
    },
  );
  const generated = JSON.parse(
    readFileSync(join(standalone, "package.json"), "utf8"),
  );
  assert.equal(generated.scripts.start, "node run.ts");
  assert.ok(generated.devDependencies["@elie-laloum/outpost"]);
  assert.ok(generated.devDependencies["@vercel/sandbox"]);
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
    `import { dispatch, codex, gemini, response, createSandbox, type GeminiSettings, type EgressPolicy } from '@elie-laloum/outpost';
import { local } from '@elie-laloum/outpost/providers/local';
import { firecracker, type FirecrackerOptions } from '@elie-laloum/outpost/providers/firecracker';
const microvm: typeof firecracker = (options: FirecrackerOptions) => firecracker(options);
console.log(microvm);
import { docker, type DependencyCache } from '@elie-laloum/outpost/providers/docker';
import { podman } from '@elie-laloum/outpost/providers/podman';
import { planRecoveryRetention, pruneRecoveryRetention, assertRecoveryQuota, verifyRecoveryTransfer, type RecoveryRetentionPolicy, type FileTransfers, type SandboxLease } from '@elie-laloum/outpost';
const egress: EgressPolicy = { mode: 'deny-all' };
docker({egress});
podman({egress});
const cache: DependencyCache = {name:'npm', key:'lock-v1'};
docker({caches:[cache]});
podman({caches:[cache]});
const policy: RecoveryRetentionPolicy = {version:1, scopes:['closed-logs'], minAgeMs:1000};
const plan = await planRecoveryRetention({policy});
await pruneRecoveryRetention(plan);
await assertRecoveryQuota({maxBytes:1024});
await verifyRecoveryTransfer('/tmp/transfer', {checksums:true});
const batchCapability = (lease: SandboxLease): FileTransfers | undefined => lease.fileTransfers;
console.log(batchCapability);
await using sandbox = await createSandbox({ provider: local() });
await sandbox.diagnose({transfers:true});
const result = await sandbox.dispatch({ agent: codex(), brief: { text: 'Return <n>1</n>' }, response: response.json({tag:'n', schema: value => Number(value)}) });
const n: number = result.value;
const geminiSettings: GeminiSettings = { model: 'flash', approvalMode: 'plan' };
gemini(geminiSettings);
const once = await dispatch({agent:codex(),provider:local(),brief:{text:'hello'}});
await once.fork({brief:{text:'alternative'},branch:{mode:'named',name:'outpost/alternative'},hooks:{workspaceReady:[]}});
// @ts-expect-error Warm results cannot replace their sandbox configuration.
await result.resume({brief:{text:'continue'},branch:{mode:'named',name:'outpost/wrong'}});
console.log(n,once.commits);
`,
  );
  const checkTypes = (file) =>
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
        file,
      ],
      { cwd: temporary, stdio: "inherit" },
    );
  checkTypes(consumer);
  const telemetryApi = JSON.parse(
    readFileSync(
      resolve("node_modules/@opentelemetry/api/package.json"),
      "utf8",
    ),
  );
  runNpm(
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      `@opentelemetry/api@${telemetryApi.version}`,
    ],
    temporary,
  );
  const telemetryConsumer = join(temporary, "telemetry.ts");
  writeFileSync(
    telemetryConsumer,
    `import { metrics, trace } from '@opentelemetry/api';
import { openTelemetry, type OpenTelemetryObserver } from '@elie-laloum/outpost/opentelemetry';
import { task, workflow } from '@elie-laloum/outpost';
const telemetry: OpenTelemetryObserver = openTelemetry({tracer:trace.getTracer('consumer'),meter:metrics.getMeter('consumer')});
const step = task({key:'sample',perform(context){context.reportUsage({input:1,cached:0,output:1});return 1;}});
(await workflow('smoke',[step]).start({budget:{attempts:1},observe:telemetry.observe})).unwrap();
telemetry.close();
`,
  );
  checkTypes(telemetryConsumer);
  execFileSync(process.execPath, [telemetryConsumer], {
    cwd: temporary,
    stdio: "inherit",
  });
  console.log("Packed package imports and initializes successfully.");
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
