import { defineHarnessTool, defineHarnessToolset } from "../../domain/tool.ts";
import type { HarnessToolset } from "../../domain/tool.types.ts";
import { anywhere, repositoryPath } from "./sandbox-files.ts";
import { TOOL_LIMITS } from "./tools.constants.ts";
import type { FileSelectionOptions, SearchInput } from "./tools.types.ts";
import { filesystemSelectionScript } from "./filesystem-selection.constants.ts";
import { invariant } from "../../domain/errors.ts";

export function createHarnessSearchTools(
  options: FileSelectionOptions = {},
): HarnessToolset {
  invariant(
    options.selection === undefined ||
      options.selection === "git" ||
      options.selection === "filesystem",
    "Search selection must be git or filesystem",
  );
  return defineHarnessToolset({
    name: "search",
    tools: [searchTool(options.selection ?? "git")],
  });
}

function searchTool(selection: "git" | "filesystem") {
  return defineHarnessTool({
    ...(selection === "git" ? { workspace: "git" as const } : {}),
    name: "search",
    description:
      selection === "git"
        ? "Search files tracked or not ignored by Git for an extended regular expression. Returns path:line:text matches."
        : "Search ordinary workspace files for a JavaScript regular expression without following links or applying Git ignore rules. Returns path:line:text matches.",
    readOnly: true,
    input: {
      type: "object",
      properties: {
        pattern: { type: "string", minLength: 1 },
        path: { type: "string" },
        glob: { type: "string", minLength: 1 },
        ignore_case: { type: "boolean" },
        max_results: {
          type: "integer",
          minimum: 1,
          maximum: TOOL_LIMITS.searchMatches,
        },
      },
      required: ["pattern"],
      additionalProperties: false,
    },
    resources: (input: SearchInput) => ({ paths: [input.path ?? "."] }),
    async execute(input: SearchInput, context) {
      const scope = repositoryPath(input.path ?? ".") || ".";
      const invocation =
        selection === "filesystem"
          ? {
              executable: "node",
              arguments: [
                "-e",
                `(function(){${filesystemSelectionScript}})()`,
                "search",
                scope,
                JSON.stringify(input),
              ],
            }
          : {
              executable: "git",
              arguments: [
                "grep",
                "--untracked",
                "-n",
                "-I",
                "--no-color",
                "--full-name",
                "-E",
                ...(input.ignore_case ? ["-i"] : []),
                "-e",
                input.pattern,
                "--",
                input.glob
                  ? `:(glob)${scope === "." ? "" : `${scope}/`}${anywhere(input.glob)}`
                  : scope,
              ],
            };
      const result = await context.sandbox.invoke({
        ...invocation,
        retain: TOOL_LIMITS.commandCharacters,
        signal: context.signal,
      });
      if (result.status === 1) return "No matches.";
      if (result.status !== 0)
        return {
          content: result.stderr || "File search failed",
          isError: true,
        };
      if (!result.stdout) return "No matches.";
      const limit = input.max_results ?? TOOL_LIMITS.searchMatches;
      const matches = result.stdout.split("\n").filter(Boolean);
      const shown = matches.slice(0, limit);
      return shown.length < matches.length
        ? `${shown.join("\n")}\n[${matches.length - shown.length} more matches; refine the search]`
        : shown.join("\n");
    },
  });
}
