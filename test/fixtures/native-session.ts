import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

export function kimiBucket(cwd: string): string {
  const path = cwd.replaceAll("\\", "/").replace(/\/+$/, "");
  let slug = basename(path)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/^-+|-+$/g, "");
  if (!slug || slug === "." || slug === "..") slug = "workspace";
  return `wd_${slug}_${createHash("sha256").update(path).digest("hex").slice(0, 12)}`;
}

export function sessionDirectory(
  format: "copilot" | "kimi",
  home: string,
  cwd: string,
  id: string,
): string {
  return format === "kimi"
    ? join(home, ".kimi-code", "sessions", kimiBucket(cwd), id)
    : join(home, ".copilot", "session-state", id);
}

export async function seedSession(
  format: "copilot" | "kimi",
  home: string,
  cwd: string,
  id: string,
  history = "remember me",
): Promise<string> {
  const dir = sessionDirectory(format, home, cwd, id);
  const files =
    format === "kimi"
      ? {
          "state.json": JSON.stringify({
            id,
            version: 2,
            cwd,
            createdAt: 1,
            updatedAt: 1,
            archived: false,
            agents: {
              main: { homedir: join(dir, "agents", "main"), type: "main" },
            },
          }),
          "agents/main/wire.jsonl": "",
          "agents/main/plans/plan.md": history,
        }
      : {
          "events.jsonl":
            JSON.stringify({
              type: "session.start",
              data: { sessionId: id, context: { cwd, gitRoot: cwd } },
            }) + "\n",
          "workspace.yaml": `id: ${id}\ncwd: ${JSON.stringify(cwd)}\ngit_root: ${JSON.stringify(cwd)}\n`,
          "plan.md": history,
        };
  for (const [name, text] of Object.entries(files)) {
    const path = join(dir, name);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, text);
  }
  return dir;
}
