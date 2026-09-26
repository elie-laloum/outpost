import { invariant } from "./errors.ts";
import { TOOL_NAME_PATTERN } from "./model.constants.ts";
import type { BlockRules } from "./model-messages.types.ts";
import type {
  ModelContentBlock,
  ModelMessage,
  ModelRequest,
  ModelToolSpec,
} from "./model.types.ts";

const text = (value: unknown) => typeof value === "string";
const identifier = (value: unknown) =>
  typeof value === "string" && value.trim() !== "";

const blockRules: BlockRules = {
  text: { role: "any", valid: (block) => text(block.text) },
  "tool-call": {
    role: "assistant",
    valid: (block) =>
      identifier(block.id) &&
      typeof block.name === "string" &&
      TOOL_NAME_PATTERN.test(block.name),
  },
  "tool-result": {
    role: "user",
    valid: (block) =>
      identifier(block.callId) &&
      text(block.content) &&
      (block.isError === undefined || typeof block.isError === "boolean"),
  },
  reasoning: {
    role: "assistant",
    valid: (block) => identifier(block.provider) && identifier(block.model),
  },
};

export function requestMessages(
  request: ModelRequest,
): readonly ModelMessage[] {
  invariant(
    (request.prompt === undefined) !== (request.messages === undefined),
    "Model request requires exactly one of prompt or messages",
  );
  if (request.messages !== undefined) {
    validateMessages(request.messages);
    return request.messages;
  }
  invariant(
    typeof request.prompt === "string" && request.prompt.trim(),
    "Model prompt must be nonempty text",
  );
  return [{ role: "user", content: [{ type: "text", text: request.prompt }] }];
}

export function validateMessages(messages: readonly ModelMessage[]): void {
  invariant(
    Array.isArray(messages) && messages.length > 0,
    "Model messages must be a nonempty array",
  );
  let pending = new Set<string>();
  for (const message of messages) {
    invariant(
      message !== null &&
        typeof message === "object" &&
        (message.role === "user" || message.role === "assistant") &&
        Array.isArray(message.content) &&
        message.content.length > 0,
      "Model messages need a user or assistant role and content blocks",
    );
    const content: readonly ModelContentBlock[] = message.content;
    for (const block of content) validateBlock(block, message.role);
    const results = content.flatMap((block) =>
      block.type === "tool-result" ? [block.callId] : [],
    );
    invariant(
      results.length === pending.size &&
        results.every((id) => pending.has(id)) &&
        new Set(results).size === results.length,
      "Each tool call needs exactly one result in the next user message",
    );
    pending = new Set(
      content.flatMap((block) =>
        block.type === "tool-call" ? [block.id] : [],
      ),
    );
  }
  invariant(
    messages[0]!.role === "user" && messages.at(-1)!.role === "user",
    "Model messages must start and end with a user message",
  );
}

export function validateTools(tools: readonly ModelToolSpec[]): void {
  invariant(Array.isArray(tools), "Model tools must be an array");
  const names = new Set<string>();
  for (const tool of tools) {
    invariant(
      tool !== null &&
        typeof tool === "object" &&
        typeof tool.name === "string" &&
        TOOL_NAME_PATTERN.test(tool.name) &&
        !names.has(tool.name),
      "Model tools need unique names of letters, digits, underscores or hyphens",
    );
    names.add(tool.name);
    invariant(
      typeof tool.description === "string" &&
        tool.inputSchema !== null &&
        typeof tool.inputSchema === "object" &&
        !Array.isArray(tool.inputSchema),
      "Model tools need a description and a JSON Schema object",
    );
  }
}

export function replayable(
  block: ModelContentBlock,
  identity: string,
  model: string,
): boolean {
  return (
    block.type !== "reasoning" ||
    (block.provider === identity && block.model === model)
  );
}

function validateBlock(block: ModelContentBlock, role: ModelMessage["role"]) {
  invariant(
    block !== null &&
      typeof block === "object" &&
      Object.hasOwn(blockRules, block.type),
    "Unsupported model content block",
  );
  const rule = blockRules[block.type];
  invariant(
    (rule.role === "any" || rule.role === role) &&
      rule.valid(block as unknown as Record<string, unknown>),
    `Invalid ${block.type} block in a ${role} message`,
  );
}
