import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const [name, ...args] = process.argv.slice(2);
if (name !== "claude" && name !== "codex") throw new Error("Unknown fixture");
const home = process.env.OUTPOST_FIXTURE_HOME!;
const cwd = process.cwd();
let prompt = "";
for await (const chunk of process.stdin) prompt += chunk;
const root =
  name === "claude"
    ? join(home, ".claude", "projects")
    : join(home, ".codex", "sessions");
const flag = args.indexOf(name === "claude" ? "--resume" : "resume");
const id = flag >= 0 ? args[flag + 1]! : randomUUID();
const suffix = name === "claude" ? `/${id}.jsonl` : `-${id}.jsonl`;
const existing = (
  await readdir(root, { recursive: true }).catch(() => [] as string[])
).find((file) => `/${file.replaceAll("\\", "/")}`.endsWith(suffix));
if (flag >= 0 && !existing) {
  console.error(`Transcript ${id} is unavailable`);
  process.exit(3);
}
const created = {
  claude: join(root, "fixture-project", `${id}.jsonl`),
  codex: join(
    root,
    "2026",
    "09",
    "29",
    `rollout-2026-09-29T00-00-00-${id}.jsonl`,
  ),
}[name];
const file = existing ? join(root, existing) : created;
const previous = existing ? await readFile(file, "utf8") : "";
const history = previous
  .split("\n")
  .filter(Boolean)
  .map((line) => String(JSON.parse(line).prompt))
  .join("\n");
await mkdir(dirname(file), { recursive: true });
await writeFile(file, `${previous}${JSON.stringify({ cwd, prompt })}\n`);
const answer = `${history}\n${prompt}<outpost>done</outpost>`;
const emit = (value: unknown) => console.log(JSON.stringify(value));
if (name === "claude") {
  emit({ type: "system", subtype: "init", session_id: id });
  emit({
    type: "result",
    result: answer,
    usage: { input_tokens: 1, output_tokens: 1 },
  });
}
if (name === "codex") {
  emit({ type: "thread.started", thread_id: id });
  emit({
    type: "item.completed",
    item: { type: "agent_message", text: answer },
  });
  emit({
    type: "turn.completed",
    usage: { input_tokens: 1, output_tokens: 1 },
  });
}
