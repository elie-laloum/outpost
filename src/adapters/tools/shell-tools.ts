import { positive } from "../../domain/errors.ts";
import { defineHarnessTool, defineHarnessToolset } from "../../domain/tool.ts";
import type { HarnessToolset } from "../../domain/tool.types.ts";
import { commandOutput } from "./sandbox-files.ts";
import { TOOL_LIMITS } from "./tools.constants.ts";
import type { ShellInput, ShellToolsOptions } from "./tools.types.ts";

export function harnessShellTools(
  options: ShellToolsOptions = {},
): HarnessToolset {
  const deadlineMs = positive(
    options.deadlineMs ?? TOOL_LIMITS.shellDeadlineMs,
    "Shell deadlineMs",
  );
  return defineHarnessToolset({
    name: "shell",
    tools: [
      defineHarnessTool({
        name: "shell",
        description:
          "Run a POSIX shell command in the repository root and return its exit status, stdout and stderr. Commands have a deadline and no interactive input.",
        input: {
          type: "object",
          properties: { command: { type: "string", minLength: 1 } },
          required: ["command"],
          additionalProperties: false,
        },
        resources: (input: ShellInput) => ({ command: input.command }),
        async execute(input: ShellInput, context) {
          const result = await context.sandbox.invoke({
            executable: "sh",
            arguments: ["-c", input.command],
            stdin: "",
            deadlineMs,
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
