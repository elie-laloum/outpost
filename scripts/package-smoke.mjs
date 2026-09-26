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
  assert.equal(
    existsSync(join(temporary, "node_modules", "bullmq")),
    false,
    "Base consumers must not require the optional BullMQ dependency",
  );
  execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      "import {openaiModelProvider, geminiHarness, response, workflow, conversations, reporter, recoveryDetails, diagnoseAgentProtocol, diagnoseSandbox, planRecoveryRetention, pruneRecoveryRetention, assertRecoveryQuota, verifyRecoveryTransfer} from '@elie-laloum/outpost'; import {dockerSandboxProvider} from '@elie-laloum/outpost/providers/docker'; import {firecrackerSandboxProvider} from '@elie-laloum/outpost/providers/firecracker'; if(typeof firecrackerSandboxProvider!=='function')throw Error('Missing Firecracker provider'); if((await response.text({tag:'ok'}).read('<ok>yes</ok>'))!=='yes'||dockerSandboxProvider().name!=='docker')throw Error('Package import failed'); for(const item of [openaiModelProvider,conversations.capture,reporter,recoveryDetails,diagnoseSandbox,planRecoveryRetention,pruneRecoveryRetention,assertRecoveryQuota,verifyRecoveryTransfer])if(typeof item!=='function')throw Error('Missing public extension'); if(diagnoseAgentProtocol('codex').hasFailures||diagnoseAgentProtocol('gemini').hasFailures)throw Error('Protocol fixtures failed'); (await workflow('empty',[]).start()).unwrap()",
    ],
    { cwd: temporary, stdio: "inherit" },
  );
  assert.equal(
    existsSync(join(temporary, "node_modules", "@aws-sdk", "client-s3")),
    false,
    "Base consumers must not require the optional S3 SDK",
  );
  execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      "import {localTransport,artifactStore,workflowCheckpointStore,recoverWorkflowCheckpoint,readJournal,transportConversations,archiveRecovery,materializeRecoveryArchive} from '@elie-laloum/outpost'; const transporter=localTransport({directory:'state'}); const first=await transporter.write('artifacts/smoke',new Uint8Array([0,255]),{ifRevision:null}); if((await transporter.read(first.key)).bytes[1]!==255)throw Error('Transport bytes changed'); for(const item of [artifactStore,workflowCheckpointStore,recoverWorkflowCheckpoint,readJournal,transportConversations,archiveRecovery,materializeRecoveryArchive])if(typeof item!=='function')throw Error('Missing transport export');",
    ],
    { cwd: temporary, stdio: "inherit" },
  );
  execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `
    import assert from 'node:assert/strict';
    import * as api from '@elie-laloum/outpost';
    for (const name of ['claude','codex','gemini','customHarness','openaiCompatible','local','docker','podman','vercel','daytona','firecracker','mountedProvider','remoteProvider']) assert.equal(name in api, false, name);
    for (const name of ['claude','codex','gemini']) {
      assert.equal(typeof api[name+'Harness'], 'function');
      assert.equal(api.agent({harness:api[name+'Harness'](),model:'arbitrary-model'}).model.name,'arbitrary-model');
    }
    for (const name of ['local','docker','podman','firecracker']) {
      const exports = await import('@elie-laloum/outpost/providers/'+name);
      assert.equal(name in exports,false,name);
      assert.equal(typeof exports[name+'SandboxProvider'],'function');
    }
    const modelProvider=api.anthropicModelProvider({apiKey:'unused'});
    assert.equal('generate' in modelProvider,false);
    assert.equal('model' in modelProvider,false);
    const echo=api.defineHarnessTool({name:'echo',description:'Echo.',readOnly:true,input:{type:'object',properties:{text:{type:'string'}}},execute:input=>input.text});
    const toolset=api.defineHarnessToolset({name:'basic',tools:[echo]});
    for (const name of ['File','Edit','Search','Git','Shell']) assert.equal(api['harness'+name+'Tools']().kind,'toolset',name);
    assert.deepEqual(api.harnessFileTools().tools.map(tool=>tool.name),['read_file','list_files']);
    assert.equal(api.harnessConversations().name,'harness');
    const skill=api.defineHarnessSkill({name:'style',description:'House style.',instructions:'Be brief.'});
    assert.deepEqual(api.harness({modelProvider,skills:[skill]}).tools.map(tool=>tool.name),['load_skill']);
    assert.equal(api.summarizeHistory().kind,'context');
    assert.equal(api.truncateToolResults().name,'truncate-tool-results');
    assert.equal(api.harness({modelProvider,conversations:false,context:api.truncateToolResults()}).conversations,false);
    const permissions=api.defineHarnessPermissions({default:'deny',rules:[{effect:'allow',tools:['echo']}]});
    assert.deepEqual(permissions.evaluate('echo',{}),{allowed:true});
    const stop=api.defineHarnessHook({on:'stop',run:()=>undefined});
    const configured=api.harness({modelProvider,tools:[toolset],instructions:api.defineHarnessInstructions('Be brief.'),hooks:[stop],permissions});
    assert.equal(configured.tools[0].name,'echo');
    assert.equal(api.agent({harness:configured,model:{name:'arbitrary',maxOutputTokens:100}}).kind,'custom');
    assert.throws(()=>api.agent({harness:configured,model:'arbitrary'}),/maxOutputTokens/);
    assert.throws(()=>api.harness({modelProvider,run:async()=>({text:'done'})}),/no longer accepts run/);
  `,
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
    [cli, "init", "--yes", "--sandbox-provider", "local"],
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
      "--sandbox-provider",
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
  assert.ok(manifest.exports["./queues/bullmq"].types);
  const consumer = join(temporary, "consumer.ts");
  writeFileSync(
    consumer,
    `import { agent as composeAgent,  dispatch, codexHarness, geminiHarness, response, createSandbox, type GeminiSettings, type EgressPolicy } from '@elie-laloum/outpost';
import { openaiModelProvider, type OpenAIModelProviderOptions, type ModelProvider, type ModelRequest, type ModelResult, type AgentAdapter, type SandboxProvider } from '@elie-laloum/outpost';
import { harness, anthropicModelProvider, defineHarnessTool, type Agent, type AgentModel, type ModelReasoning, type HarnessTool } from '@elie-laloum/outpost';
// @ts-expect-error The renamed factory has no compatibility export.
import { customHarness } from '@elie-laloum/outpost';
// @ts-expect-error Removed API has no compatibility export.
import { openaiCompatible } from '@elie-laloum/outpost';
// @ts-expect-error Removed sandbox factory has no alias.
import { local } from '@elie-laloum/outpost/providers/local';
const read: HarnessTool<{ path: string }> = defineHarnessTool({name:'read',description:'Read a file.',readOnly:true,input:{type:'object',properties:{path:{type:'string'}},required:['path']},execute:async(input: { path: string },context)=>(await context.sandbox.invoke({executable:'cat',arguments:[input.path],signal:context.signal})).stdout});
const custom = harness({modelProvider:anthropicModelProvider({apiKey:'unused'}),tools:[read],limits:{maxSteps:5,usage:{output:1000}},toolExecution:{concurrency:2,onError:'return-to-model'}});
// @ts-expect-error Custom callbacks were replaced by declarative tools.
harness({modelProvider:anthropicModelProvider({apiKey:'unused'}),run:async()=>({text:'done'})});
const reasoning: ModelReasoning = 'high';
const selectedModel: AgentModel = {name:'arbitrary',reasoning,maxOutputTokens:10};
const composed: Agent = composeAgent({harness:custom,model:selectedModel});
// @ts-expect-error Custom harness requires a model.
composeAgent({harness:custom});
// @ts-expect-error The old preset namespaces are no longer exported.
import { claude, codex, gemini } from '@elie-laloum/outpost';
// @ts-expect-error Model selection belongs to the agent.
codexHarness({model:'arbitrary'});
// @ts-expect-error Reasoning belongs to the agent model.
codexHarness({reasoning:'high'});
// @ts-expect-error Output limits belong to the agent model.
anthropicModelProvider({apiKey:'unused',maxOutputTokens:10});
console.log(composed);
const modelOptions: OpenAIModelProviderOptions = { baseUrl: 'http://localhost/v1', apiKey: false };
const modelProvider: ModelProvider = openaiModelProvider(modelOptions);
const modelInput: ModelRequest = { model: 'test', prompt: 'hello' };
const generate: Promise<ModelResult> = modelProvider.request(modelInput);
// @ts-expect-error A model client is not a coding agent without its harness.
const agent: AgentAdapter = modelProvider;
// @ts-expect-error A model client does not allocate sandboxes.
const backend: SandboxProvider = modelProvider;
console.log(generate, agent, backend);
import { localSandboxProvider } from '@elie-laloum/outpost/providers/local';
import { firecrackerSandboxProvider, type FirecrackerOptions } from '@elie-laloum/outpost/providers/firecracker';
const microvm: typeof firecrackerSandboxProvider = (options: FirecrackerOptions) => firecrackerSandboxProvider(options);
console.log(microvm);
import { dockerSandboxProvider, type DependencyCache } from '@elie-laloum/outpost/providers/docker';
import { podmanSandboxProvider } from '@elie-laloum/outpost/providers/podman';
import { planRecoveryRetention, pruneRecoveryRetention, assertRecoveryQuota, verifyRecoveryTransfer, type RecoveryRetentionPolicy, type FileTransfers, type SandboxLease } from '@elie-laloum/outpost';
const egress: EgressPolicy = { mode: 'deny-all' };
dockerSandboxProvider({egress});
podmanSandboxProvider({egress});
const cache: DependencyCache = {name:'npm', key:'lock-v1'};
dockerSandboxProvider({caches:[cache]});
podmanSandboxProvider({caches:[cache]});
const policy: RecoveryRetentionPolicy = {version:1, scopes:['closed-logs'], minAgeMs:1000};
const plan = await planRecoveryRetention({policy});
await pruneRecoveryRetention(plan);
await assertRecoveryQuota({maxBytes:1024});
await verifyRecoveryTransfer('/tmp/transfer', {checksums:true});
const batchCapability = (lease: SandboxLease): FileTransfers | undefined => lease.fileTransfers;
console.log(batchCapability);
await using sandbox = await createSandbox({ sandboxProvider: localSandboxProvider() });
await sandbox.diagnose({transfers:true});
const result = await sandbox.dispatch({ agent: composeAgent({ harness: codexHarness({}) }), brief: { text: 'Return <n>1</n>' }, response: response.json({tag:'n', schema: value => Number(value)}) });
const n: number = result.value;
const geminiSettings: GeminiSettings = { approvalMode: 'plan' };
composeAgent({ harness: geminiHarness(geminiSettings), model: "flash" });
const once = await dispatch({agent:composeAgent({ harness: codexHarness({}) }),sandboxProvider:localSandboxProvider(),brief:{text:'hello'}});
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
import { task, workflow, dispatch, agent as composeAgent, codexHarness, createReporter, type DispatchTelemetry, type WorkflowTelemetry } from '@elie-laloum/outpost';
const telemetry: OpenTelemetryObserver = openTelemetry({tracer:trace.getTracer('consumer'),meter:metrics.getMeter('consumer')});
const step = task({key:'sample',perform(context){context.reportUsage({input:1,cached:0,output:1});return 1;}});
const workflowTelemetry: WorkflowTelemetry = telemetry;
(await workflow('smoke',[step]).start({budget:{attempts:1},telemetry:workflowTelemetry})).unwrap();
const instrumentation: DispatchTelemetry = telemetry;
const abort = AbortSignal.abort(new Error('expected cancellation'));
try { await dispatch({agent:composeAgent({harness:codexHarness()}),brief:{text:'unused'},signal:abort,telemetry:instrumentation}); throw new Error('Expected cancellation'); }
catch(error) { if(error !== abort.reason) throw error; }
let text = '';
const report = createReporter({async text(event){text += event.text;}});
report({kind:'text',text:'written',pass:1,at:new Date().toISOString()});
await report.flush();
if(text !== 'written') throw new Error('Reporter did not flush');
telemetry.close();
`,
  );
  checkTypes(telemetryConsumer);
  execFileSync(process.execPath, [telemetryConsumer], {
    cwd: temporary,
    stdio: "inherit",
  });

  runNpm(
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "bullmq@^5.81.5",
    ],
    temporary,
  );
  execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      "import {bullmqTaskQueue} from '@elie-laloum/outpost/queues/bullmq'; if(typeof bullmqTaskQueue !== 'function') throw Error('Missing BullMQ adapter')",
    ],
    { cwd: temporary, stdio: "inherit" },
  );

  const bullmqConsumer = join(temporary, "bullmq.ts");
  writeFileSync(
    bullmqConsumer,
    `import { bullmqTaskQueue, type BullMQTaskQueue, type BullMQTaskQueueOptions } from '@elie-laloum/outpost/queues/bullmq';
import type { TaskQueue } from '@elie-laloum/outpost';
const options: BullMQTaskQueueOptions = {name:'consumer',connection:{host:'127.0.0.1'}};
const open: (options: BullMQTaskQueueOptions) => Promise<BullMQTaskQueue> = bullmqTaskQueue;
function compatible(queue: BullMQTaskQueue): TaskQueue { return queue; }
void [options, open, compatible];
`,
  );
  checkTypes(bullmqConsumer);
  console.log("Packed package imports and initializes successfully.");
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
