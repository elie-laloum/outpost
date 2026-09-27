import { cp, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { seedSession, sessionDirectory } from "./native-session.ts";

const [name, ...args] = process.argv.slice(2);
if (name !== "kimi" && name !== "copilot" && name !== "antigravity")
  throw new Error("Unknown fixture");
const home = process.env.OUTPOST_FIXTURE_HOME!;
const cwd = process.cwd();
const flag = {
  kimi: "--session",
  copilot: "--resume",
  antigravity: "--conversation",
}[name];
if (args[0] === "fork") {
  const parent = args[1]!,
    id = `session_${randomUUID()}`;
  const source = sessionDirectory("kimi", home, cwd, parent);
  const target = sessionDirectory("kimi", home, cwd, id);
  await cp(source, target, { recursive: true });
  const meta = JSON.parse(await readFile(join(target, "state.json"), "utf8"));
  meta.id = id;
  await writeFile(join(target, "state.json"), JSON.stringify(meta));
  console.log(`Forked to ${id} in 1ms`);
} else {
  let prompt = args.includes("--prompt")
    ? args[args.indexOf("--prompt") + 1]!
    : "";
  if (!args.includes("--prompt")) {
    for await (const chunk of process.stdin) prompt += chunk;
    if (name === "antigravity") prompt = JSON.parse(prompt).message.content;
  }
  if (prompt === "fail-before-event") process.exit(9);
  const resumed = args.includes(flag);
  const id = resumed
    ? args[args.indexOf(flag) + 1]!
    : `session_${randomUUID()}`;
  let history = "remember me";
  if (name !== "antigravity") {
    const dir = sessionDirectory(name, home, cwd, id);
    if (resumed)
      history = await readFile(
        join(dir, name === "kimi" ? "agents/main/plans/plan.md" : "plan.md"),
        "utf8",
      );
    await seedSession(name, home, cwd, id, `${history}\n${prompt}`);
  }
  const answer = prompt.includes("Correct the response")
    ? '<answer>{"ok":true}</answer>'
    : prompt.includes("invalid JSON")
      ? "<answer>bad</answer>"
      : `${history}<outpost>done</outpost>`;
  const emit = (value: unknown) => console.log(JSON.stringify(value));
  if (name === "kimi") {
    emit({ role: "meta", type: "session.resume_hint", session_id: id });
    emit({ role: "assistant", content: answer });
  }
  if (name === "copilot") {
    emit({ type: "assistant.message", data: { content: answer } });
    emit({ type: "result", sessionId: id, exitCode: 0 });
  }
  if (name === "antigravity") {
    emit({ event: "init", conversation_id: id });
    emit({ event: "result", result: { status: "SUCCESS", response: answer } });
  }
}
