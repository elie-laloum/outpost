export const sessionUsageLimits = {
  bytes: 64 * 1024 * 1024,
  outputBytes: 1024 * 1024,
  lineBytes: 1024 * 1024,
  records: 4096,
  directories: 4096,
  agents: 128,
  deadlineMs: 5000,
} as const;

export const sessionUsageScript = String.raw`
const fs = require("node:fs/promises");
const { createReadStream } = require("node:fs");
const { createInterface } = require("node:readline");
const { join, resolve } = require("node:path");
const { homedir } = require("node:os");
const [kind, id, encodedLimits] = process.argv.slice(1);
const limits = JSON.parse(encodedLimits);
const result = { records: [], complete: true };
let bytes = 0;
function project(usage, keys) {
  return Object.fromEntries(keys.map(key => [key,
    typeof usage?.[key] === "number" ? usage[key] : null]));
}
async function directory(path) {
  if ((await fs.lstat(path)).isSymbolicLink() || await fs.realpath(path) !== resolve(path))
    throw new Error("Unsafe session directory");
  const entries = await fs.readdir(path, { withFileTypes: true });
  if (entries.length > limits.directories) throw new Error("Too many session directories");
  return entries;
}
async function read(path) {
  const stat = await fs.lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink() || await fs.realpath(path) !== resolve(path))
    throw new Error("Unsafe session file");
  bytes += stat.size;
  if (bytes > limits.bytes) throw new Error("Session usage file limit exceeded");
  const stream = createReadStream(path, { encoding: "utf8", start: 0, end: Math.max(0, stat.size - 1) });
  const lines = createInterface({ input: stream, crlfDelay: Infinity });
  stream.on("error", () => lines.close());
  let usageSeen = false;
  try {
    for await (const line of lines) {
      if (Buffer.byteLength(line) > limits.lineBytes) throw new Error("Session line limit exceeded");
      if (!line.trim()) continue;
      const record = JSON.parse(line);
      if (kind === "copilot" && record.type === "session.shutdown") {
        const metrics = record.data?.modelMetrics;
        if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) {
          result.complete = false;
          continue;
        }
        usageSeen = Object.keys(metrics).length > 0;
        result.records = Object.values(metrics).map(metric => project(metric?.usage,
          ["inputTokens", "outputTokens", "cacheReadTokens", "cacheWriteTokens"]));
      }
      if (kind === "kimi" && record.type === "usage.record") {
        usageSeen = true;
        result.records.push(project(record.usage,
          ["inputOther", "output", "inputCacheRead", "inputCacheCreation"]));
      }
      if (result.records.length > limits.records) throw new Error("Too many usage records");
    }
    if (!usageSeen) result.complete = false;
    if (stream.errored) throw stream.errored;
  } finally {
    lines.close();
    stream.destroy();
  }
}
(async () => {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(id)) throw new Error("Invalid session ID");
  if (kind === "copilot") {
    const home = await fs.realpath(resolve(process.env.COPILOT_HOME || join(homedir(), ".copilot")));
    await read(join(home, "session-state", id, "events.jsonl"));
    return;
  }
  const home = await fs.realpath(resolve(process.env.KIMI_CODE_HOME || join(homedir(), ".kimi-code")));
  const root = join(home, "sessions");
  const buckets = await directory(root);
  const matches = [];
  for (const bucket of buckets) {
    if (!bucket.isDirectory()) continue;
    const path = join(root, bucket.name, id);
    try {
      const stat = await fs.lstat(path);
      if (stat.isSymbolicLink()) throw new Error("Unsafe session directory");
      if (stat.isDirectory()) matches.push(path);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  if (matches.length !== 1) throw new Error("Session directory is missing or ambiguous");
  const rootAgents = join(matches[0], "agents");
  const agents = await directory(rootAgents);
  if (agents.length > limits.agents) throw new Error("Too many session agents");
  let foundMain = false;
  for (const agent of agents) {
    if (agent.isSymbolicLink()) throw new Error("Unsafe agent directory");
    if (!agent.isDirectory()) continue;
    if (agent.name === "main") foundMain = true;
    try { await read(join(rootAgents, agent.name, "wire.jsonl")); }
    catch { result.complete = false; }
  }
  if (!foundMain) result.complete = false;
})().catch(() => { result.complete = false; }).finally(() => {
  if (result.records.length > limits.records) result.records = [];
  process.stdout.write(JSON.stringify(result));
});
`;
