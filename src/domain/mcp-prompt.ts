import { invariant, OutpostError } from "./errors.ts";
import type { HarnessInstructions } from "./harness.types.ts";
import { defineHarnessInstructions } from "./instructions.ts";
import { MCP_SERVER_NAME_PATTERN } from "./mcp-server.constants.ts";
import type { McpPromptOptions } from "./mcp-prompt.types.ts";

export function defineMcpPrompt(
  options: McpPromptOptions,
): HarnessInstructions {
  invariant(
    options !== null && typeof options === "object",
    "MCP prompt options must be an object",
  );
  invariant(
    typeof options.server === "string" &&
      MCP_SERVER_NAME_PATTERN.test(options.server),
    "MCP prompt server must be a declared MCP server name",
  );
  invariant(
    typeof options.name === "string" && options.name.trim() !== "",
    "MCP prompt name must be nonempty text",
  );
  const promptArguments = options.arguments ?? {};
  invariant(
    promptArguments !== null &&
      typeof promptArguments === "object" &&
      !Array.isArray(promptArguments) &&
      Object.values(promptArguments).every(
        (value) => typeof value === "string",
      ),
    "MCP prompt arguments must map names to strings",
  );
  const frozen = Object.freeze({ ...promptArguments });
  return defineHarnessInstructions(async (context) => {
    if (!context.mcp)
      throw new OutpostError(
        "configuration",
        `defineMcpPrompt needs mcpServers on the harness that uses it; ${options.server} is not running`,
      );
    return context.mcp.prompt(options.server, options.name, frozen);
  });
}
