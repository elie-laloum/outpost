// A tiny MCP server, without dependencies: newline-delimited JSON-RPC over stdio.
// It offers tools, a resource and a prompt. TICKETS_TOKEN would authenticate against a real tracker.

import { createInterface } from "node:readline";

const tickets = [
  {
    id: 1,
    title: "Le paiement échoue pour les cartes étrangères",
    status: "open",
  },
  { id: 2, title: "Faute d'orthographe sur la page d'accueil", status: "open" },
  {
    id: 3,
    title: "L'export CSV est vide depuis la mise à jour",
    status: "open",
  },
  { id: 4, title: "Ajouter un mode sombre", status: "closed" },
];

const guidelines = `Un ticket est urgent s'il bloque un paiement ou fait perdre des données.
Tout le reste peut attendre le prochain sprint.`;

const tools = [
  {
    name: "list_tickets",
    description: "List the open tickets.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "delete_ticket",
    description: "Delete a ticket for good.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "number" } },
      required: ["id"],
    },
  },
];

const text = (value) => ({
  content: [{ type: "text", text: JSON.stringify(value) }],
});

const handlers = {
  initialize: () => ({
    protocolVersion: "2025-06-18",
    capabilities: { tools: {}, resources: {}, prompts: {} },
    serverInfo: { name: "tickets", version: "1.0.0" },
  }),

  "tools/list": () => ({ tools }),
  "tools/call": ({ name }) =>
    name === "list_tickets"
      ? text(tickets.filter((ticket) => ticket.status === "open"))
      : text("refusé"),

  "resources/list": () => ({
    resources: [
      {
        uri: "tickets://guidelines",
        name: "guidelines",
        mimeType: "text/plain",
      },
    ],
  }),
  "resources/templates/list": () => ({ resourceTemplates: [] }),
  "resources/read": ({ uri }) => ({
    contents: [{ uri, mimeType: "text/plain", text: guidelines }],
  }),

  "prompts/list": () => ({
    prompts: [
      {
        name: "triage",
        description: "Triage instructions.",
        arguments: [{ name: "team", required: true }],
      },
    ],
  }),
  "prompts/get": ({ arguments: args }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Tu tries les tickets pour l'équipe ${args.team}. Lis d'abord les consignes du serveur tickets.`,
        },
      },
    ],
  }),
};

for await (const line of createInterface({ input: process.stdin })) {
  if (!line.trim()) continue;
  const message = JSON.parse(line);
  if (message.id === undefined) continue; // a notification: no answer

  const handler = handlers[message.method];
  const reply = handler
    ? { result: handler(message.params ?? {}) }
    : { error: { code: -32601, message: `Unknown method ${message.method}` } };
  process.stdout.write(
    JSON.stringify({ jsonrpc: "2.0", id: message.id, ...reply }) + "\n",
  );
}
