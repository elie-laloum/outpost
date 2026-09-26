import { defineHarnessTool, defineHarnessToolset } from "../../domain/tool.ts";
import type { HarnessToolset } from "../../domain/tool.types.ts";
import { anywhere, repositoryPath } from "./sandbox-files.ts";
import { TOOL_LIMITS } from "./tools.constants.ts";
import type { SearchInput } from "./tools.types.ts";

export function harnessSearchTools(): HarnessToolset {
  return defineHarnessToolset({ name: "search", tools: [searchTool()] });
}

function searchTool() {
  return defineHarnessTool({
    name: "search",
    description:
      "Search repository files that are tracked or not ignored by Git for an extended regular expression. Returns path:line:text matches. A glob without a slash matches file names at any depth.",
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
      const result = await context.sandbox.invoke({
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
        retain: TOOL_LIMITS.commandCharacters,
        signal: context.signal,
      });
      if (result.status === 1) return "No matches.";
      if (result.status !== 0)
        return { content: result.stderr || "git grep failed", isError: true };
      const limit = input.max_results ?? TOOL_LIMITS.searchMatches;
      const matches = result.stdout.split("\n").filter(Boolean);
      const shown = matches.slice(0, limit);
      return shown.length < matches.length
        ? `${shown.join("\n")}\n[${matches.length - shown.length} more matches; refine the search]`
        : shown.join("\n");
    },
  });
}
