import type { McpContentBlock } from "./mcp.types.ts";

const blockRenderers: Readonly<
  Record<string, (block: McpContentBlock) => string>
> = {
  text: (block) => String(block.text ?? ""),
  image: (block) => `[image omitted: ${String(block.mimeType)}]`,
  audio: (block) => `[audio omitted: ${String(block.mimeType)}]`,
  resource_link: (block) => `[resource ${String(block.uri)}]`,
  resource: (block) => renderResourceContents(mcpRecord(block.resource) ?? {}),
};

export function renderContentBlock(value: unknown): string {
  const block = mcpRecord(value) ?? {};
  const render = blockRenderers[String(block.type)];
  return render ? render(block) : JSON.stringify(value);
}

export function renderResourceContents(contents: McpContentBlock): string {
  if (typeof contents.text === "string") return contents.text;
  const type =
    contents.mimeType === undefined ? "" : ` ${String(contents.mimeType)}`;
  return `[resource ${String(contents.uri)}${type}]`;
}

export function mcpRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}
