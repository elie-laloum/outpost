import { createHash } from "node:crypto";
import { OutpostError } from "../../domain/errors.ts";
import { mcpToolFilter } from "../../domain/mcp-server.ts";
import type { McpToolFilter } from "../../domain/mcp-server.types.ts";
import { defineHarnessTool } from "../../domain/tool.ts";
import type {
  HarnessTool,
  StandardJsonSchema,
  ToolOutput,
} from "../../domain/tool.types.ts";
import { MCP_TOOL_PREFIX } from "./mcp.constants.ts";
import type {
  McpConnection,
  McpContentBlock,
  McpToolDescription,
  McpToolResult,
} from "./mcp.types.ts";

const blockRenderers: Readonly<
  Record<string, (block: McpContentBlock) => string>
> = {
  text: (block) => String(block.text ?? ""),
  image: (block) => `[image omitted: ${String(block.mimeType)}]`,
  audio: (block) => `[audio omitted: ${String(block.mimeType)}]`,
  resource_link: (block) => `[resource ${String(block.uri)}]`,
  resource: (block) => {
    const resource = record(block.resource) ?? {};
    return typeof resource.text === "string"
      ? resource.text
      : `[resource ${String(resource.uri)}]`;
  },
};

export async function mcpTools(
  server: string,
  connection: McpConnection,
  signal: AbortSignal,
  filter: McpToolFilter = {},
): Promise<readonly HarnessTool[]> {
  const descriptions: McpToolDescription[] = [];
  let cursor: string | undefined;
  do {
    const page = record(
      await connection.request("tools/list", cursor ? { cursor } : {}, signal),
    );
    if (!page || !Array.isArray(page.tools))
      throw new OutpostError(
        "response",
        `MCP server ${server} returned an invalid tool list`,
      );
    descriptions.push(...page.tools.map((tool) => description(server, tool)));
    cursor =
      typeof page.nextCursor === "string" && page.nextCursor
        ? page.nextCursor
        : undefined;
  } while (cursor);
  const available = new Set(descriptions.map((tool) => tool.name));
  const missing = (filter.include ?? []).filter((tool) => !available.has(tool));
  if (missing.length)
    throw new OutpostError(
      "configuration",
      `MCP server ${server} has no tool named ${missing.join(", ")}`,
      { server, missing },
    );
  const selected = mcpToolFilter(filter);
  const names = new Set<string>();
  return descriptions
    .filter((tool) => selected(tool.name))
    .map((tool) => {
      const name = toolName(server, tool.name);
      if (names.has(name))
        throw new OutpostError(
          "configuration",
          `MCP server ${server} exposes tools that share the name ${name}`,
        );
      names.add(name);
      return harnessTool(server, name, tool, connection);
    });
}

export function toolName(server: string, tool: string): string {
  const prefix = `${MCP_TOOL_PREFIX}${server}__`;
  const clean = tool.replace(/[^A-Za-z0-9_-]/g, "_");
  const room = 64 - prefix.length;
  if (clean.length <= room) return prefix + clean;
  const digest = createHash("sha256").update(tool).digest("hex").slice(0, 8);
  return `${prefix}${clean.slice(0, room - digest.length - 1)}_${digest}`;
}

export function renderToolResult(value: unknown): ToolOutput {
  const result = (record(value) ?? {}) as McpToolResult;
  const text = (Array.isArray(result.content) ? result.content : [])
    .map((entry) => {
      const block = record(entry) ?? {};
      const render = blockRenderers[String(block.type)];
      return render ? render(block) : JSON.stringify(entry);
    })
    .join("\n");
  return {
    content:
      text || result.structuredContent === undefined
        ? text
        : JSON.stringify(result.structuredContent),
    isError: result.isError === true,
  };
}

function harnessTool(
  server: string,
  name: string,
  tool: McpToolDescription,
  connection: McpConnection,
): HarnessTool {
  const input: StandardJsonSchema<Record<string, unknown>> = {
    "~standard": {
      validate: (value) =>
        record(value)
          ? { value: value as Record<string, unknown> }
          : { issues: [{ message: "Expected an object" }] },
      jsonSchema: { input: () => ({ ...tool.inputSchema, type: "object" }) },
    },
  };
  return defineHarnessTool({
    name,
    description:
      tool.description?.trim() ||
      tool.title?.trim() ||
      `Call ${tool.name} on the ${server} MCP server.`,
    input,
    async execute(argumentsValue, context) {
      try {
        return renderToolResult(
          await connection.request(
            "tools/call",
            { name: tool.name, arguments: argumentsValue },
            context.signal,
          ),
        );
      } catch (error) {
        if (error instanceof OutpostError && error.code === "response")
          return { content: error.message, isError: true };
        throw error;
      }
    },
  }) as HarnessTool;
}

function description(server: string, value: unknown): McpToolDescription {
  const tool = record(value);
  const schema = record(tool?.inputSchema) ?? { type: "object" };
  if (!tool || typeof tool.name !== "string" || !tool.name)
    throw new OutpostError(
      "response",
      `MCP server ${server} returned a tool without a name`,
    );
  return {
    name: tool.name,
    ...(typeof tool.title === "string" ? { title: tool.title } : {}),
    ...(typeof tool.description === "string"
      ? { description: tool.description }
      : {}),
    inputSchema: schema,
  };
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}
