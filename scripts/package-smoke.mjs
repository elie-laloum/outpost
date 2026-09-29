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
      "import {signWorkflowDecision, ed25519DecisionVerifier, openaiModelProvider, antigravityHarness, copilotHarness, kimiHarness, response, workflow, conversations, reporter, recoveryDetails, diagnoseAgentProtocol, diagnoseSandbox, planRecoveryRetention, pruneRecoveryRetention, assertRecoveryQuota, verifyRecoveryTransfer} from '@elie-laloum/outpost'; import {dockerSandboxProvider} from '@elie-laloum/outpost/providers/docker'; import {firecrackerSandboxProvider} from '@elie-laloum/outpost/providers/firecracker'; if(typeof firecrackerSandboxProvider!=='function')throw Error('Missing Firecracker provider'); if((await response.text({tag:'ok'}).read('<ok>yes</ok>'))!=='yes'||dockerSandboxProvider().name!=='docker')throw Error('Package import failed'); for(const item of [signWorkflowDecision,ed25519DecisionVerifier,openaiModelProvider,antigravityHarness,copilotHarness,kimiHarness,conversations.capture,reporter,recoveryDetails,diagnoseSandbox,planRecoveryRetention,pruneRecoveryRetention,assertRecoveryQuota,verifyRecoveryTransfer])if(typeof item!=='function')throw Error('Missing public extension'); for(const name of ['codex','claude','antigravity','copilot','kimi'])if(diagnoseAgentProtocol(name).hasFailures)throw Error('Protocol fixtures failed'); (await workflow('empty',[]).start()).unwrap()",
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
    for (const name of ['fileArtifactStore','fileWorkflowCheckpointStore','claude','codex','gemini','geminiHarness','customHarness','openaiCompatible','local','docker','podman','vercel','daytona','firecracker','mountedProvider','remoteProvider']) assert.equal(name in api, false, name);
    for (const name of ['claude','codex','antigravity','copilot','kimi']) {
      assert.equal(typeof api[name+'Harness'], 'function');
      assert.equal(api.agent({harness:api[name+'Harness'](),model:'arbitrary-model'}).model.name,'arbitrary-model');
    }
    for (const name of ['local','docker','podman','firecracker']) {
      const exports = await import('@elie-laloum/outpost/providers/'+name);
      assert.equal(name in exports,false,name);
      assert.equal(typeof exports[name+'SandboxProvider'],'function');
    }
    const loop=api.loopTask({key:'loop',maxRounds:2,attempt:(ctx)=>ctx.round,check:(_,value)=>value===2?{done:true}:{done:false,feedback:'again'}});
    const verified=await api.workflow('loop',[loop]).start();
    verified.unwrap();
    assert.equal(verified.value(loop),2);
    assert.equal(verified.usage.attempts,2);
    assert.equal(typeof api.LoopTaskExhausted,'function');
    const quota=api.quotaFault(new api.OutpostError('quota','limit',{resetAt:'2026-01-01T00:00:00.000Z'}));
    assert.deepEqual(quota,{message:'limit',resetAt:'2026-01-01T00:00:00.000Z'});
    assert.deepEqual(api.unavailableFault(new api.OutpostError('provider','down',{unavailable:'HTTP 503'})),{message:'HTTP 503'});
    const fallback=api.fallbackAgent([api.agent({harness:api.claudeHarness()}),api.agent({harness:api.codexHarness()})],{on:['quota','unavailable']});
    assert.equal(fallback.kind,'fallback');
    assert.deepEqual(fallback.on,['quota','unavailable']);
    const replaying=api.replayAgent({journal:[{kind:'prompt',text:'work',source:'agent'},{kind:'summary',durationMs:1,status:0,tokens:{input:0,cached:0,output:0},source:'agent'}]});
    assert.equal(replaying.kind,'replay');
    assert.equal(replaying.remainingTurns,1);
    assert.equal(new api.ReplayDivergence({kind:'exhausted',turn:2}).code,'replay');
    assert.equal(api.cronSchedule('0 2 * * *',{timeZone:'Europe/Paris'}).next(new Date('2026-06-30T12:00:00Z')).toISOString(),'2026-07-01T00:00:00.000Z');
    for (const name of ['runSchedules','serveTriggers','githubWebhook','gitlabWebhook','slackRequest','standardWebhook','labelAdded','commandIssued','workflowJob'])
      assert.equal(typeof api[name],'function',name);
    assert.equal(api.githubWebhook({secret:'smoke'}).name,'github');
    const transporter=api.localTransport({directory:'consumer-store'});
    const artifact=api.artifactStore({transporter});
    const id='a'.repeat(64);
    await artifact.put(id,new Uint8Array([0,255]));
    assert.deepEqual([...await artifact.get(id)],[0,255]);
    let cachedRuns=0;
    const cachedTask=()=>api.task({key:'cached',cache:{store:api.taskCacheStore({transporter}),version:'1',key:()=>['smoke']},perform:()=>({run:++cachedRuns})});
    for (const expected of [false,true]) {
      const item=cachedTask();
      const cachedResult=await api.workflow('cache',[item]).start();
      cachedResult.unwrap();
      assert.deepEqual(cachedResult.value(item),{run:1});
      assert.equal(cachedResult.tasks[0].cacheHit===true,expected);
    }
    assert.equal(typeof api.repositoryFingerprint,'function');
    const checkpoints=api.workflowCheckpointStore({transporter});
    const lease=await checkpoints.acquire('consumer');
    await lease.write({answer:42});
    await lease.release();
    const resumed=await checkpoints.acquire('consumer');
    assert.deepEqual(await resumed.read(),{answer:42});
    await resumed.release();
    const child=api.agent({model:'fixture',harness:api.harness({modelProvider:{name:'fixture',request:async()=>({text:'done'})}})});
    const delegate=api.defineHarnessSubagent({name:'review',description:'Review fixture',agent:child});
    assert.equal(delegate.readOnly,false);
    assert.deepEqual(await delegate.validate({prompt:'Review'}),{value:{prompt:'Review'}});
    assert.equal(api.harness({modelProvider:child.harness.modelProvider,tools:[delegate]}).tools[0],delegate);
    const modelProvider=api.anthropicModelProvider({apiKey:'unused'});
    assert.equal('generate' in modelProvider,false);
    assert.equal(typeof modelProvider.stream,'function');
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
    `import { agent as composeAgent,  dispatch, codexHarness, claudeHarness, antigravityHarness, copilotHarness, kimiHarness, response, createSandbox, type AntigravitySettings, type CopilotSettings, type KimiSettings, type AgentAuthentication, type AccountCredential, type UsageCredential, type EgressPolicy } from '@elie-laloum/outpost';
import { loopTask, workflow, type LoopTaskContext, type LoopTaskOptions, type LoopCheckResult, type LoopRoundRecord } from '@elie-laloum/outpost';
const loopOptions: LoopTaskOptions<number> = {key:'fix',maxRounds:2,attempt:(ctx: LoopTaskContext)=>ctx.round,check:(_,value): LoopCheckResult=>value===2?{done:true}:{done:false,feedback:'again'}};
const loop=loopTask(loopOptions);
const verified=await workflow('fix',[loop]).start();
const number: number=verified.value(loop);
const history: readonly LoopRoundRecord[] | undefined=verified.tasks[0]?.rounds;
import { quotaFault, type QuotaFault, type WorkflowQuotaPolicy, type WorkflowQuotaPause, type WorkflowOptions } from '@elie-laloum/outpost';
const quotaPolicy: WorkflowQuotaPolicy = {action:'pause',maxWaitMs:60_000};
const quotaOptions: WorkflowOptions = {onQuota:quotaPolicy};
const quotaPause: WorkflowQuotaPause | undefined=verified.tasks[0]?.quota;
const quotaSignal: QuotaFault | undefined=quotaFault(new Error('other'));
import { fallbackAgent, unavailableFault, type DispatchAgent, type DispatchResult, type FallbackAgent, type FallbackAgentOptions, type FallbackAttempt, type FallbackCandidate, type FallbackRecord, type FallbackTrigger, type UnavailableFault } from '@elie-laloum/outpost';
const fallbackTriggers: readonly FallbackTrigger[] = ['quota','unavailable'];
const fallbackOptions: FallbackAgentOptions = {on:fallbackTriggers};
const fallbackCoder: FallbackAgent = fallbackAgent([composeAgent({harness:claudeHarness(),model:'opus'}),composeAgent({harness:claudeHarness(),model:'sonnet'})],fallbackOptions);
const dispatchCoder: DispatchAgent = fallbackCoder;
const fallbackRecord: FallbackRecord | undefined = (undefined as DispatchResult<undefined> | undefined)?.fallback;
const selectedCandidate: FallbackCandidate | undefined = fallbackRecord?.selected;
const failedAttempt: FallbackAttempt | undefined = fallbackRecord?.attempts[0];
const outage: UnavailableFault | undefined = unavailableFault(new Error('other'));
import { replayAgent, ReplayDivergence, readJournal, type ReplayAgent, type ReplayAgentOptions, type ReplayDivergenceKind, type ReplayTurn, type WorkspaceCommitsEvent } from '@elie-laloum/outpost';
const replayOptions: ReplayAgentOptions = {journal:[],divergence:'warn'};
const replaying: ReplayAgent | undefined = replayOptions.journal.length ? replayAgent(replayOptions) : undefined;
const replayedTurn: ReplayTurn | undefined = replaying?.turns[0];
const divergenceKind: ReplayDivergenceKind = new ReplayDivergence({kind:'prompt',turn:1}).kind;
const recordedCommits: WorkspaceCommitsEvent['kind'] = 'workspace-commits';
const replayCoder: Agent | undefined = replaying;
const replayLogging: Parameters<typeof dispatch>[0]['logging'] = {replayable:true};
void readJournal;
import { cronSchedule, runSchedules, serveTriggers, githubWebhook, gitlabWebhook, slackRequest, standardWebhook, labelAdded, commandIssued, workflowJob, workflowCheckpointStore as triggerCheckpoints, type CronSchedule, type CronOptions, type RunSchedulesOptions, type TriggerSchedule, type ScheduleFailure, type TriggerJob, type TriggerJobInput, type TriggerRoute, type TriggerServer, type TriggerServerOptions, type TriggerFailure, type TriggerEvent, type TriggerSource, type TriggerSecret, type TriggerHttpRequest, type TriggerReply, type TriggerOutcome, type GithubWebhookOptions, type GitlabWebhookOptions, type GitlabSigningOptions, type GitlabTokenOptions, type SlackRequestOptions, type StandardWebhookOptions, type TriggerLabel, type TriggerCommand, type WorkflowJobOptions, type WorkflowJobContext, type WorkflowJobCheckpoint, type WorkflowJobStartOptions, type QueueHandler } from '@elie-laloum/outpost';
const cronOptions: CronOptions = {timeZone:'UTC'};
const nightly: CronSchedule = cronSchedule('0 2 * * *',cronOptions);
const triggerSchedule: TriggerSchedule = {name:'nightly',cron:nightly,handler:'audit',runId:(slot)=>slot.toISOString()};
const scheduleOptions: Omit<RunSchedulesOptions,'queue'|'signal'> = {schedules:[triggerSchedule],onError:(_,failure: ScheduleFailure)=>void failure.slot};
const triggerJob: TriggerJob = {handler:'fix',runId:'issue-1',input:{issue:1}};
const jobInput: TriggerJobInput = {runId:triggerJob.runId,input:null};
const githubOptions: GithubWebhookOptions = {secret:async()=>['a','b']};
const signedGitlab: GitlabSigningOptions = {signingToken:'whsec_c21va2U=',toleranceMs:60_000};
const legacyGitlab: GitlabTokenOptions = {token:'token'};
const gitlabOptions: readonly GitlabWebhookOptions[] = [signedGitlab,legacyGitlab];
const slackOptions: SlackRequestOptions = {signingSecret:'s'};
const standardOptions: StandardWebhookOptions = {secret:'whsec_c21va2U=',source:'billing'};
const secret: TriggerSecret = 'secret';
const sources: readonly TriggerSource[] = [githubWebhook(githubOptions),gitlabWebhook(signedGitlab),slackRequest(slackOptions),standardWebhook(standardOptions)];
const route: TriggerRoute = {path:'/github',source:sources[0]!,on:(event: TriggerEvent)=>{const issue: TriggerLabel | undefined=labelAdded(event,'fix');const command: TriggerCommand | undefined=commandIssued(event,'/outpost');return issue&&!command?triggerJob:undefined;}};
const serverOptions: Omit<TriggerServerOptions,'queue'> = {routes:[route],maxBytes:1024,onError:(_,failure: TriggerFailure)=>void failure.stage};
const outcome: TriggerOutcome = 'accepted';
const reply: TriggerReply | undefined = sources[2]?.reply?.(outcome);
const httpRequest: TriggerHttpRequest = {method:'POST',path:'/github',headers:{},body:new Uint8Array()};
const checkpoint: WorkflowJobCheckpoint = {store:triggerCheckpoints({transporter:localTransport({directory:'jobs'})}),version:'1'};
const jobStart: WorkflowJobStartOptions = {concurrency:1};
const jobOptions: WorkflowJobOptions = {checkpoint,start:jobStart,workflow:(input,context: WorkflowJobContext)=>workflow(context.runId,[task({key:'echo',perform:()=>input})])};
const jobHandler: QueueHandler = workflowJob(jobOptions);
const triggerServer: ((options: TriggerServerOptions)=>Promise<TriggerServer>) = serveTriggers;
void [scheduleOptions,jobInput,gitlabOptions,secret,serverOptions,reply,httpRequest,jobHandler,triggerServer,runSchedules];
import { task, taskCacheStore, localTransport, type TaskCacheOptions, type TaskCacheStore, type TaskCacheEntry, type TaskCacheStoreOptions, type TaskCacheOutcome, type WorkflowEvent } from '@elie-laloum/outpost';
const cacheStoreOptions: TaskCacheStoreOptions = {transporter:localTransport({directory:'typed-cache'}),maxBytes:1024};
const cacheStore: TaskCacheStore = taskCacheStore(cacheStoreOptions);
const cacheOptions: TaskCacheOptions = {store:cacheStore,version:'1',key:()=>['commit',{brief:'b'}],maxAgeMs:60_000,mode:'reuse'};
const cachedTask=task({key:'cached',cache:cacheOptions,perform:()=>({ok:true})});
const cacheEntry: TaskCacheEntry | undefined=await cacheStore.read('a'.repeat(64));
const cacheHit: true | undefined=verified.tasks[0]?.cacheHit;
const cacheOutcome: TaskCacheOutcome | undefined=({} as WorkflowEvent).cache;
import { repositoryFingerprint } from '@elie-laloum/outpost';
const fingerprintKey=async (): Promise<string>=>repositoryFingerprint('.');
import { agentTask, isolatedTask, type TaskContext, type QueueQuota, type QueueRequest, type SpeculationResult } from '@elie-laloum/outpost';
const resumedConversation=(context: TaskContext): string | undefined=>context.quota?.conversation;
const queueQuota: QueueQuota={resetAt:'2026-01-01T00:00:00.000Z',conversation:'c'};
const resumedJob: QueueRequest={id:'job:quota:2',idempotencyKey:'job',handler:'work',input:null};
const speculationQuota=(result: SpeculationResult): string | undefined=>result.status==='quota'?result.quota?.resetAt:undefined;
type QuotaResumeOption=Parameters<typeof agentTask>[0]['quotaResume'] | Parameters<typeof isolatedTask>[0]['quotaResume'];
const restart: QuotaResumeOption='restart';
// @ts-expect-error Gemini CLI was removed without a compatibility export.
import { geminiHarness } from '@elie-laloum/outpost';
// @ts-expect-error Gemini CLI settings were removed.
import type { GeminiSettings } from '@elie-laloum/outpost';
import { openaiModelProvider, type OpenAIModelProviderOptions, type ModelProvider, type ModelRequest, type ModelResult, type AgentAdapter, type SandboxProvider } from '@elie-laloum/outpost';
import { harness, anthropicModelProvider, defineHarnessTool, type Agent, type AgentModel, type ModelReasoning, type HarnessTool, type Harness, type HarnessOptions, type AgentHarness } from '@elie-laloum/outpost';
// @ts-expect-error The renamed harness contract has no compatibility export.
import type { CustomHarness } from '@elie-laloum/outpost';
// @ts-expect-error The renamed options contract has no compatibility export.
import type { CustomHarnessOptions } from '@elie-laloum/outpost';
// @ts-expect-error The renamed factory has no compatibility export.
import { customHarness } from '@elie-laloum/outpost';
// @ts-expect-error Removed API has no compatibility export.
import { openaiCompatible } from '@elie-laloum/outpost';
// @ts-expect-error Removed sandbox factory has no alias.
import { local } from '@elie-laloum/outpost/providers/local';
const read: HarnessTool<{ path: string }> = defineHarnessTool({name:'read',description:'Read a file.',readOnly:true,input:{type:'object',properties:{path:{type:'string'}},required:['path']},execute:async(input: { path: string },context)=>(await context.sandbox.invoke({executable:'cat',arguments:[input.path],signal:context.signal})).stdout});
const harnessOptions: HarnessOptions = {modelProvider:anthropicModelProvider({apiKey:'unused'}),tools:[read],limits:{maxSteps:5,usage:{output:1000}},toolExecution:{concurrency:2,onError:'return-to-model'}};
const custom: Harness = harness(harnessOptions);
const variants: readonly AgentHarness[] = [custom, codexHarness()];
for (const configured of variants) {
  if (configured.kind === 'cli') configured.bind();
  if (configured.kind === 'custom') configured.modelProvider.validate?.({name:'arbitrary'});
}
// @ts-expect-error Harness describes the built-in engine, not a CLI preset.
const cliAsHarness: Harness = codexHarness();
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
const accountFile: AccountCredential = { file: '~/.outpost/accounts/kimi' };
const usageKey: UsageCredential = { variable: 'TEAM_API_KEY' };
const forms: readonly AgentAuthentication[] = ['account', 'usage', { account: accountFile }, { usage: usageKey }, { account: { key: 'token' } }];
console.log(forms);
// @ts-expect-error Legacy authentication modes were removed.
codexHarness({ authentication: { mode: 'login' } });
// @ts-expect-error Usage credentials cannot name a file.
claudeHarness({ authentication: { usage: { file: '~/.claude' } } });
const antigravitySettings: AntigravitySettings = { mode: 'plan', authentication: 'account' };
const copilotSettings: CopilotSettings = { authentication: { account: { variable: 'COPILOT_GITHUB_TOKEN' } } };
const kimiSettings: KimiSettings = { authentication: 'usage' };
composeAgent({ harness: antigravityHarness(antigravitySettings), model: 'fixture' });
composeAgent({ harness: copilotHarness(copilotSettings) });
composeAgent({ harness: kimiHarness(kimiSettings), model: 'fixture' });
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
  const daytonaSdk = JSON.parse(
    readFileSync(resolve("node_modules/@daytona/sdk/package.json"), "utf8"),
  );
  runNpm(
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      `@daytona/sdk@${daytonaSdk.version}`,
      "@types/ws@^8",
    ],
    temporary,
  );
  const daytonaConsumer = join(temporary, "daytona.ts");
  writeFileSync(
    daytonaConsumer,
    `import {daytonaSandboxProvider, type EgressPolicy} from '@elie-laloum/outpost/providers/daytona';
const egress: EgressPolicy = {mode:'allowlist',domains:['api.openai.com']};
if(daytonaSandboxProvider({egress}).name !== 'daytona') throw new Error('Missing Daytona provider');
`,
  );
  checkTypes(daytonaConsumer);
  execFileSync(process.execPath, [daytonaConsumer], {
    cwd: temporary,
    stdio: "inherit",
  });
  console.log("Packed package imports and initializes successfully.");
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
