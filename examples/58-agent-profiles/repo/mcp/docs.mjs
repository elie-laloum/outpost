import { createInterface } from "node:readline";

const tools = ["read_note", "delete_note"].map((name) => ({
  name,
  description: name === "read_note" ? "Read the project note." : "Delete it.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
}));
const handlers = {
  initialize: () => ({
    protocolVersion: "2025-06-18",
    capabilities: { tools: {} },
    serverInfo: { name: "docs", version: "1.0.0" },
  }),
  "tools/list": () => ({ tools }),
  "tools/call": ({ name }) => ({
    content: [
      {
        type: "text",
        text:
          name === "read_note"
            ? "Generated files belong to the build."
            : "Deletion is disabled.",
      },
    ],
  }),
};
for await (const line of createInterface({ input: process.stdin })) {
  const message = JSON.parse(line);
  if (message.id === undefined) continue;
  const handler = handlers[message.method];
  const reply = handler
    ? { result: handler(message.params ?? {}) }
    : { error: { code: -32601, message: "Unknown method" } };
  process.stdout.write(
    `${JSON.stringify({ jsonrpc: "2.0", id: message.id, ...reply })}\n`,
  );
}
