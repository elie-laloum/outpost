import type { InitOptions } from "./scaffold.types.ts";

export function starter(options: InitOptions, extension: string): string {
  const agent = options.agent ?? "codex",
    provider = options.provider ?? "docker",
    template = options.template ?? "blank";
  const planning = template === "plan" || template === "plan-review";
  const reviewing = template === "review" || template === "plan-review";
  const imports = `import { campaign, dispatch, ${agent} } from "@elie-laloum/outpost";\nimport type { Backlog } from "@elie-laloum/outpost";\nimport { ${provider} } from "@elie-laloum/outpost/providers/${provider}";\nimport { readFile } from "node:fs/promises";\n${options.tracker ? `import { backlog } from "./tickets.${extension}";\n` : ""}`;
  const config = `const runtime = { agent: ${agent}(${options.model ? `{ model: ${JSON.stringify(options.model)} }` : ""}), provider: ${provider}(${options.image && (provider === "docker" || provider === "podman") ? `{ image: ${JSON.stringify(options.image)} }` : ""}) };\nconst objective = process.argv.slice(2).join(" ") || "Inspect this repository and implement one useful improvement.";\n`;
  if (template === "blank")
    return `${imports}\n${config}\nconst result = await dispatch({ ...runtime, branch: { mode: "integrate" }, brief: { file: ".outpost/brief.md", values: { OBJECTIVE: objective } } });\nconsole.log({ branch: result.branch, commits: result.commits, conversation: result.conversation });\n`;
  const backlog = options.tracker
    ? ""
    : `let pending = true;\nconst requested = { id: "objective", title: objective };\nconst backlog: Backlog = {\n  async list() { return pending ? [requested] : []; },\n  async get() { return requested; },\n  async close() { pending = false; },\n};\n`;
  return `${imports}\n${config}\n${backlog}\nconst result = await campaign({\n  ...runtime, backlog,\n  cycles: 10, concurrency: ${planning ? 3 : 1},\n  implementationPasses: ${planning ? 100 : 1}, reviewPasses: 1,\n  planner: ${planning ? "runtime.agent" : "false"}, reviewer: ${reviewing ? "runtime.agent" : "false"},\n  copies: ["node_modules"],\n  standards: await readFile(new URL("./STANDARDS.md", import.meta.url), "utf8"),\n  observe: event => console.log(\`[cycle \${event.cycle}] \${event.phase}\${event.issue ? " " + event.issue : ""}\`),\n});\nconsole.log(result);\nif (result.issues.some(issue => issue.state === "failed")) process.exitCode = 1;\n`;
}

export function tracker(
  kind: NonNullable<InitOptions["tracker"]>,
  label?: string,
): string {
  if (kind !== "custom") {
    const factory = kind === "github" ? "githubBacklog" : "beadsBacklog";
    return `import { ${factory} } from "@elie-laloum/outpost";\nexport const backlog = ${factory}(${label ? `{ label: ${JSON.stringify(label)} }` : ""});\n`;
  }
  return `import type { Backlog, Issue } from "@elie-laloum/outpost";
async function request(path: string, method = "GET", signal?: AbortSignal) {
  const base = process.env.OUTPOST_TRACKER_URL;
  if (!base) throw new Error("Set OUTPOST_TRACKER_URL");
  const reply = await fetch(new URL(path, base.endsWith("/") ? base : base + "/"), { method, signal });
  if (!reply.ok) throw new Error(\`Tracker returned \${reply.status}\`);
  return reply;
}
export const backlog: Backlog = {
  async list(signal) { return await (await request("issues?state=open", "GET", signal)).json() as Issue[]; },
  async get(id, signal) { return await (await request("issues/" + encodeURIComponent(id), "GET", signal)).json() as Issue; },
  async close(id, signal) { await request("issues/" + encodeURIComponent(id) + "/close", "POST", signal); },
};
`;
}
