import { OutpostError } from "../../domain/errors.ts";
import { defineHarnessTool } from "../../domain/tool.ts";
import type { HarnessTool, ToolOutput } from "../../domain/tool.types.ts";
import {
  mcpRecord,
  renderContentBlock,
  renderResourceContents,
} from "./mcp-content.ts";
import { MCP_CAPABILITY_TOOLS } from "./mcp.constants.ts";
import type {
  McpGetPromptInput,
  McpListInput,
  McpReadResourceInput,
  McpSession,
} from "./mcp.types.ts";

export function mcpCapabilityTools(
  sessions: readonly McpSession[],
): readonly HarnessTool[] {
  const resources = capable(sessions, "resources");
  const prompts = capable(sessions, "prompts");
  return [
    ...(resources.size ? resourceTools(resources) : []),
    ...(prompts.size ? promptTools(prompts) : []),
  ];
}

export async function getMcpPrompt(
  sessions: readonly McpSession[],
  server: string,
  name: string,
  promptArguments: Readonly<Record<string, string>>,
  signal: AbortSignal,
): Promise<string> {
  const session = capable(sessions, "prompts").get(server);
  if (!session)
    throw new OutpostError(
      "configuration",
      `MCP server ${server} is not declared on this harness or offers no prompts`,
      { server },
    );
  return renderPrompt(
    await session.connection.request(
      "prompts/get",
      { name, arguments: promptArguments },
      signal,
    ),
  );
}

export function renderPrompt(value: unknown): string {
  const result = mcpRecord(value) ?? {};
  const messages = Array.isArray(result.messages) ? result.messages : [];
  return messages
    .flatMap((entry) => {
      const message = mcpRecord(entry);
      return message && mcpRecord(message.content)
        ? [`${String(message.role)}: ${renderContentBlock(message.content)}`]
        : [];
    })
    .join("\n\n");
}

function resourceTools(sessions: ReadonlyMap<string, McpSession>) {
  const server = serverSchema(sessions);
  return [
    defineHarnessTool({
      name: MCP_CAPABILITY_TOOLS.listResources,
      description:
        "List the resources and resource templates of an MCP server. Pass nextCursor back as cursor for the next page.",
      readOnly: true,
      input: {
        type: "object",
        properties: { server, cursor: { type: "string" } },
        required: ["server"],
        additionalProperties: false,
      },
      execute: (input: McpListInput, context) =>
        call(async () => {
          const connection = sessions.get(input.server)!.connection;
          const params = input.cursor ? { cursor: input.cursor } : {};
          const page = mcpRecord(
            await connection.request("resources/list", params, context.signal),
          );
          const templates = input.cursor
            ? undefined
            : mcpRecord(
                await connection
                  .request("resources/templates/list", {}, context.signal)
                  .catch(unsupported),
              );
          return JSON.stringify({
            resources: page?.resources ?? [],
            ...(templates?.resourceTemplates
              ? { resourceTemplates: templates.resourceTemplates }
              : {}),
            ...(page?.nextCursor ? { nextCursor: page.nextCursor } : {}),
          });
        }),
    }),
    defineHarnessTool({
      name: MCP_CAPABILITY_TOOLS.readResource,
      description:
        "Read a resource of an MCP server by URI, including a URI expanded from a resource template.",
      readOnly: true,
      input: {
        type: "object",
        properties: { server, uri: { type: "string", minLength: 1 } },
        required: ["server", "uri"],
        additionalProperties: false,
      },
      execute: (input: McpReadResourceInput, context) =>
        call(async () => {
          const result = mcpRecord(
            await sessions
              .get(input.server)!
              .connection.request(
                "resources/read",
                { uri: input.uri },
                context.signal,
              ),
          );
          const contents = Array.isArray(result?.contents)
            ? result.contents
            : [];
          return contents
            .map((entry) => renderResourceContents(mcpRecord(entry) ?? {}))
            .join("\n\n");
        }),
    }),
  ];
}

function promptTools(sessions: ReadonlyMap<string, McpSession>) {
  const server = serverSchema(sessions);
  return [
    defineHarnessTool({
      name: MCP_CAPABILITY_TOOLS.listPrompts,
      description:
        "List the prompts of an MCP server with their arguments. Pass nextCursor back as cursor for the next page.",
      readOnly: true,
      input: {
        type: "object",
        properties: { server, cursor: { type: "string" } },
        required: ["server"],
        additionalProperties: false,
      },
      execute: (input: McpListInput, context) =>
        call(async () => {
          const page = mcpRecord(
            await sessions
              .get(input.server)!
              .connection.request(
                "prompts/list",
                input.cursor ? { cursor: input.cursor } : {},
                context.signal,
              ),
          );
          return JSON.stringify({
            prompts: page?.prompts ?? [],
            ...(page?.nextCursor ? { nextCursor: page.nextCursor } : {}),
          });
        }),
    }),
    defineHarnessTool({
      name: MCP_CAPABILITY_TOOLS.getPrompt,
      description:
        "Render a prompt of an MCP server with string arguments and return its messages.",
      readOnly: true,
      input: {
        type: "object",
        properties: {
          server,
          name: { type: "string", minLength: 1 },
          arguments: {
            type: "object",
            additionalProperties: { type: "string" },
          },
        },
        required: ["server", "name"],
        additionalProperties: false,
      },
      execute: (input: McpGetPromptInput, context) =>
        call(async () =>
          renderPrompt(
            await sessions
              .get(input.server)!
              .connection.request(
                "prompts/get",
                { name: input.name, arguments: input.arguments ?? {} },
                context.signal,
              ),
          ),
        ),
    }),
  ];
}

function capable(
  sessions: readonly McpSession[],
  capability: string,
): ReadonlyMap<string, McpSession> {
  return new Map(
    sessions
      .filter((session) => mcpRecord(session.capabilities[capability]))
      .map((session) => [session.name, session]),
  );
}

function serverSchema(sessions: ReadonlyMap<string, McpSession>) {
  return { type: "string", enum: [...sessions.keys()] };
}

// Protocol errors from the server go back to the model like MCP tool errors.
async function call(operation: () => Promise<string>): Promise<ToolOutput> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof OutpostError && error.code === "response")
      return { content: error.message, isError: true };
    throw error;
  }
}

// Servers without templates answer templates/list with a protocol error.
function unsupported(error: unknown): undefined {
  if (error instanceof OutpostError && error.code === "response")
    return undefined;
  throw error;
}
