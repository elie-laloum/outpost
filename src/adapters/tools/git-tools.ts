import { defineHarnessTool, defineHarnessToolset } from "../../domain/tool.ts";
import type { HarnessToolset } from "../../domain/tool.types.ts";
import { commandOutput } from "./sandbox-files.ts";
import {
  GIT_BLOCKED_OPTIONS,
  GIT_READ_COMMANDS,
  TOOL_LIMITS,
} from "./tools.constants.ts";
import type { GitInput } from "./tools.types.ts";

export function harnessGitTools(): HarnessToolset {
  return defineHarnessToolset({
    name: "git",
    tools: [
      defineHarnessTool({
        name: "git",
        description:
          "Run a read-only Git command (status, diff, log or show) in the repository with extra arguments, for example log with -n 5 --oneline.",
        readOnly: true,
        input: {
          type: "object",
          properties: {
            command: { enum: [...GIT_READ_COMMANDS] },
            arguments: { type: "array", items: { type: "string" } },
          },
          required: ["command"],
          additionalProperties: false,
        },
        resources: (input: GitInput) => ({
          command: ["git", input.command, ...(input.arguments ?? [])].join(" "),
        }),
        async execute(input: GitInput, context) {
          const blocked = (input.arguments ?? []).find((argument) =>
            GIT_BLOCKED_OPTIONS.some((option) => argument.startsWith(option)),
          );
          if (blocked)
            return {
              content: `Unsupported Git option: ${blocked}`,
              isError: true,
            };
          const result = await context.sandbox.invoke({
            executable: "git",
            arguments: [
              "--no-pager",
              input.command,
              ...(input.command === "status"
                ? []
                : ["--no-ext-diff", "--no-textconv"]),
              ...(input.arguments ?? []),
            ],
            stdin: "",
            retain: TOOL_LIMITS.commandCharacters,
            signal: context.signal,
          });
          return {
            content: commandOutput(result),
            isError: result.status !== 0,
          };
        },
      }),
    ],
  });
}
