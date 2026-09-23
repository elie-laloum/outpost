import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TestContext } from "node:test";
import type {
  AgentAdapter,
  AgentEvent,
  AgentInput,
} from "../src/domain/ports.ts";
import { git } from "../src/infrastructure/git.ts";

export async function repository(t: TestContext): Promise<string> {
  const path = await mkdtemp(join(tmpdir(), "outpost-test-"));
  t.after(() => rm(path, { recursive: true, force: true, maxRetries: 5 }));
  await git(path, ["init", "-b", "main"]);
  await git(path, ["config", "user.name", "Test Agent"]);
  await git(path, ["config", "user.email", "agent@example.test"]);
  await git(path, ["config", "core.autocrlf", "false"]);
  await writeFile(join(path, "base.txt"), "base\n");
  await git(path, ["add", "."]);
  await git(path, ["commit", "-m", "Initial"]);
  return path;
}

export function scripted(
  script: string | ((input: AgentInput) => string),
): AgentAdapter {
  return {
    name: "fixture",
    resumable: true,
    request(input) {
      return {
        executable: process.execPath,
        arguments: [
          "--input-type=module",
          "-e",
          typeof script === "function" ? script(input) : script,
        ],
        stdin: input.text ?? "",
      };
    },
    events(line) {
      return [JSON.parse(line) as AgentEvent];
    },
  };
}

export const emit = (text: string) =>
  `console.log(${JSON.stringify(JSON.stringify({ kind: "text", text }))});`;
