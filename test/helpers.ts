import { mkdtemp, rm, writeFile, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TestContext } from "node:test";
import type {
  CliAgent,
  AgentEvent,
  AgentInput,
} from "../src/domain/agent.types.ts";
import { git } from "../src/infrastructure/git.ts";
import { createClaudeConversations } from "../src/adapters/agents/claude/claude-conversations.ts";
import { createCodexConversations } from "../src/adapters/agents/codex/codex-conversations.ts";
import { createCopilotConversations } from "../src/adapters/agents/copilot/copilot-conversations.ts";
import { createKimiConversations } from "../src/adapters/agents/kimi/kimi-conversations.ts";

const conversationStores = {
  claude: createClaudeConversations,
  codex: createCodexConversations,
  copilot: createCopilotConversations,
  kimi: createKimiConversations,
} as const;

/** Creates the built-in native conversation store for a CLI format name. */
export function conversationStore(format: keyof typeof conversationStores) {
  return conversationStores[format]();
}

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
  return await realpath(path);
}

export function scripted(
  script: string | ((input: AgentInput) => string),
): CliAgent {
  return {
    kind: "cli",
    harness: {
      kind: "cli",
      bind() {
        throw new Error("Fixture is already bound");
      },
    },
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
